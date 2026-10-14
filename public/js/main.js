document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([4.5794, -74.2168], 13);

  // Mapa Esri libre de marcas
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }).addTo(map);

  async function cargarPuntosMapa() {
    try {
      const res = await fetch('/api/puntos');
      const puntos = await res.json();
      puntos.forEach(punto => {
        const marker = L.marker(punto.coords).addTo(map);
        marker.bindPopup(`<b>${punto.nombre}</b><br><span class="text-xs text-stone-500">${punto.categoria}</span>`);
        marker.on('click', () => {
          document.getElementById('sitio-nombre').innerText = punto.nombre;
          document.getElementById('sitio-categoria').innerText = punto.categoria;
          document.getElementById('sitio-descripcion').innerText = punto.descripcion;
        });
      });
    } catch (err) { console.error(err); }
  }

  async function cargarRelatos() {
    try {
      const res = await fetch('/api/relatos');
      const relatos = await res.json();
      document.getElementById('contenedor-relatos').innerHTML = relatos.map(r => `
        <div class="bg-white p-5 rounded-lg shadow border border-stone-200">
          <h4 class="font-bold text-emerald-800">${r.titulo}</h4>
          <p class="text-xs text-stone-400 mb-2">Publicado por: ${r.autor} | ${r.tiempo || 'Reciente'}</p>
          <p class="text-sm text-stone-600">"${r.contenido}"</p>
        </div>
      `).join('');
    } catch (err) { console.error(err); }
  }

  async function cargarProductos() {
    try {
      const res = await fetch('/api/productos');
      const productos = await res.json();
      document.getElementById('contenedor-productos').innerHTML = productos.map(p => `
        <div class="bg-white rounded-lg shadow border border-stone-200 overflow-hidden">
          <div class="h-40 bg-stone-200 flex items-center justify-center text-stone-500 font-bold">[Muestra de Producto]</div>
          <div class="p-4">
            <span class="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">${p.categoria}</span>
            <h4 class="font-bold text-lg mt-1">${p.titulo}</h4>
            <p class="text-xs text-stone-500">Por: ${p.artesano}</p>
            <div class="mt-4 flex justify-between items-center">
              <span class="font-bold text-emerald-900">$ ${p.precio}</span>
              <a href="https://wa.me/${p.contacto}?text=Hola,%20interesado%20en:%20${encodeURIComponent(p.titulo)}" target="_blank" class="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded">Contactar Directo</a>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) { console.error(err); }
  }

  const modal = document.getElementById('modal-relato');
  document.getElementById('btn-abrir-modal').addEventListener('click', () => modal.classList.replace('hidden', 'flex'));
  document.getElementById('btn-cerrar-modal').addEventListener('click', () => modal.classList.replace('flex', 'hidden'));

  document.getElementById('form-relato').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('relato-titulo').value;
    const autor = document.getElementById('relato-autor').value;
    const contenido = document.getElementById('relato-contenido').value;

    const res = await fetch('/api/relatos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, autor, contenido })
    });

    if (res.ok) {
      document.getElementById('form-relato').reset();
      modal.classList.replace('flex', 'hidden');
      cargarRelatos();
    }
  });

  cargarPuntosMapa();
  cargarRelatos();
  cargarProductos();
});