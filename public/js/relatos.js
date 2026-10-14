document.addEventListener('DOMContentLoaded', () => {
  async function cargarRelatos() {
    try {
      const res = await fetch('/api/relatos');
      const relatos = await res.json();
      const contenedor = document.getElementById('contenedor-relatos');

      if (!contenedor) return;

      contenedor.innerHTML = relatos.map(r => `
        <div class="bg-white p-5 rounded-lg shadow border border-stone-200">
          <h4 class="font-bold text-emerald-800">${r.titulo}</h4>
          <p class="text-xs text-stone-400 mb-2">Publicado por: ${r.autor} | ${r.tiempo || 'Reciente'}</p>
          <p class="text-sm text-stone-600">"${r.contenido}"</p>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error al cargar relatos:', err);
    }
  }

  const modal = document.getElementById('modal-relato');
  const btnAbrir = document.getElementById('btn-abrir-modal');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const formRelato = document.getElementById('form-relato');

  if (btnAbrir) {
    btnAbrir.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  if (btnCerrar) {
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
        }
      } catch (err) {
        console.error('Error al guardar relato:', err);
      }
    });
  }

  cargarRelatos();
});