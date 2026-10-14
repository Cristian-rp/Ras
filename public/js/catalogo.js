document.addEventListener('DOMContentLoaded', () => {
  const formProducto = document.getElementById('form-producto');

  if (formProducto) {
    formProducto.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nuevoProducto = {
        titulo: document.getElementById('prod-titulo').value,
        artesano: document.getElementById('prod-artesano').value,
        categoria: document.getElementById('prod-categoria').value,
        precio: document.getElementById('prod-precio').value,
        contacto: document.getElementById('prod-contacto').value
      };

      try {
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoProducto)
        });

        if (res.ok) {
          alert('¡Producto o Taller publicado con éxito en el Catálogo!');
          window.location.href = '/catalogo';
        } else {
          const errData = await res.json();
          alert('Error: ' + (errData.error || 'No se pudo registrar el producto'));
        }
      } catch (err) {
        console.error('Error al conectar con el servidor:', err);
        alert('Ocurrió un error al intentar publicar.');
      }
    });
  }
});