document.addEventListener('DOMContentLoaded', () => {
  async function cargarProductos() {
    try {
      const res = await fetch('/api/productos');
      const productos = await res.json();
      const contenedor = document.getElementById('contenedor-productos');

      if (!contenedor) return;

      contenedor.innerHTML = productos.map(p => `
        <div class="bg-white rounded-lg shadow border border-stone-200 overflow-hidden">
          <div class="h-40 bg-stone-200 flex items-center justify-center text-stone-500 font-bold">[Muestra de Producto]</div>
          <div class="p-4">
            <span class="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">${p.categoria}</span>
            <h4 class="font-bold text-lg mt-1">${p.titulo}</h4>
            <p class="text-xs text-stone-500">Por: ${p.artesano}</p>
            <div class="mt-4 flex justify-between items-center">
              <span class="font-bold text-emerald-900">$ ${p.precio}</span>
              <a href="https://wa.me/${p.contacto}?text=Hola,%20estoy%20interesado%20en%20el%20producto:%20${encodeURIComponent(p.titulo)}" 
                 target="_blank" 
                 class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded transition">
                 Contactar Directo
              </a>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error al cargar el catálogo:', err);
    }
  }

  cargarProductos();
});