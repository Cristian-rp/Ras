document.addEventListener('DOMContentLoaded', () => {
  async function cargarProductos() {
    try {
      const res = await fetch('/api/productos');
      const contenedor = document.getElementById('contenedor-productos');

      if (!contenedor) return;

      if (!res.ok) {
        console.error('Error del servidor:', res.status);
        return; 
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         console.error("Formato incorrecto: El servidor no devolvió JSON en /api/productos.");
         return;
      }

      const productos = await res.json();

      if (!Array.isArray(productos) || productos.length === 0) {
        contenedor.innerHTML = `
          <div class="col-span-full text-center py-12 text-stone-500">
            <p class="text-lg font-bold">No hay publicaciones en el catálogo en este momento.</p>
            <a href="/emprendimiento" class="mt-2 inline-block text-emerald-700 underline font-semibold">
              Sé el primero en publicar un producto o taller
            </a>
          </div>
        `;
        return;
      }

      contenedor.innerHTML = productos.map(p => `
        <div class="bg-white rounded-lg shadow border border-stone-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div class="h-40 bg-stone-200 flex items-center justify-center text-stone-500 font-bold">[Muestra de Producto]</div>
            <div class="p-4">
              <span class="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">${p.categoria}</span>
              <h4 class="font-bold text-lg mt-1">${p.titulo}</h4>
              <p class="text-xs text-stone-500">Por: ${p.artesano}</p>
            </div>
          </div>
          <div class="p-4 pt-0">
            <div class="mt-2 flex justify-between items-center border-t pt-3">
              <span class="font-bold text-emerald-900 text-sm">$ ${p.precio}</span>
              <div class="flex space-x-2">
                <a href="https://wa.me/${p.contacto}?text=Hola,%20estoy%20interesado%20en%20el%20producto:%20${encodeURIComponent(p.titulo)}" 
                   target="_blank" 
                   class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5 rounded transition">
                   Contactar
                </a>
                <button onclick="eliminarProducto(${p.id})" 
                        class="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-2 py-1.5 rounded font-bold transition">
                   Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error al cargar el catálogo:', err);
    }
  }

  window.eliminarProducto = async (id) => {
    const clave = prompt('Para eliminar esta publicación, ingresa tu clave personal de autor o admin:');
    if (!clave) return;

    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'x-owner-key': clave
        }
      });

      if (res.ok) {
        alert('Publicación eliminada correctamente.');
        cargarProductos();
      } else {
        const errorData = await res.json();
        alert('Error: ' + (errorData.error || 'No se pudo eliminar la publicación'));
      }
    } catch (err) {
      console.error('Error al intentar eliminar el producto:', err);
      alert('Ocurrió un error al conectar con el servidor.');
    }
  };

  cargarProductos();
});