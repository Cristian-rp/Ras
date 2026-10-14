document.addEventListener('DOMContentLoaded', () => {
  async function cargarRelatos() {
    try {
      const res = await fetch('/api/relatos');
      const contenedor = document.getElementById('contenedor-relatos');

      if (!contenedor) return;

      if (!res.ok) {
        console.error('Error del servidor:', res.status);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         console.error("Formato incorrecto: El servidor no devolvió JSON en /api/relatos.");
         return;
      }

      const relatos = await res.json();

      if (!Array.isArray(relatos) || relatos.length === 0) {
        contenedor.innerHTML = `<p class="col-span-full text-center text-stone-500 py-8">Aún no hay relatos publicados.</p>`;
        return;
      }

      contenedor.innerHTML = relatos.map(r => `
        <div class="bg-white p-5 rounded-lg shadow border border-stone-200">
          <h4 class="font-bold text-emerald-800">${r.titulo}</h4>
          <p class="text-xs text-stone-400 mb-2">Publicado por: ${r.autor} | ${r.tiempo || 'Reciente'}</p>
          <p class="text-sm text-stone-600">"${r.contenido}"</p>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error de conexión al cargar relatos:', err);
    }
  }

  const modal = document.getElementById('modal-relato');
  const btnAbrir = document.getElementById('btn-abrir-modal');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const formRelato = document.getElementById('form-relato');

  if (btnAbrir && modal) {
    btnAbrir.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  if (btnCerrar && modal) {
    btnCerrar.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  if (formRelato) {
    formRelato.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = document.getElementById('relato-titulo').value;
      const autor = document.getElementById('relato-autor').value;
      const contenido = document.getElementById('relato-contenido').value;

      try {
        const res = await fetch('/api/relatos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, autor, contenido })
        });

        if (res.ok) {
          formRelato.reset();
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          cargarRelatos();
        } else {
          alert('No se pudo guardar el relato. Intenta nuevamente.');
        }
      } catch (err) {
        console.error('Error de conexión al guardar relato:', err);
      }
    });
  }

  cargarRelatos();
});