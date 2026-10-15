document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formRegistro = document.getElementById('form-registro');
  const seccionAuth = document.getElementById('seccion-auth');
  const seccionPerfil = document.getElementById('seccion-perfil');
  const btnLogout = document.getElementById('btn-logout');

  // 1. Verificar si hay usuario en localStorage
  function cargarSesion() {
    const usuarioGuardado = localStorage.getItem('usuarioRAS');

    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      seccionAuth.classList.add('hidden');
      seccionPerfil.classList.remove('hidden');

      document.getElementById('perfil-nombre').innerText = usuario.nombre;
      document.getElementById('perfil-email').innerText = usuario.email;
      document.getElementById('perfil-badge').innerText = usuario.rol === 'emprendedor' ? 'Emprendedor / Artesano' : 'Usuario General';

      cargarPublicacionesUsuario(usuario);
    } else {
      seccionAuth.classList.remove('hidden');
      seccionPerfil.classList.add('hidden');
    }
  }

  // 2. Iniciar Sesión
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('usuarioRAS', JSON.stringify(data.usuario));
          cargarSesion();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        console.error('Error en login:', err);
        alert('Ocurrió un error al conectar con el servidor.');
      }
    });
  }

  // 3. Registro
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('reg-nombre').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const rol = document.getElementById('reg-rol').value;

      try {
        const res = await fetch('/api/auth/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, password, rol })
        });

        const data = await res.json();

        if (res.ok) {
          alert('Registro exitoso. ¡Inicia sesión ahora!');
          formRegistro.reset();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        console.error('Error en registro:', err);
        alert('Ocurrió un error al conectar con el servidor.');
      }
    });
  }

  // 4. Cerrar Sesión
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('usuarioRAS');
      cargarSesion();
    });
  }

  // 5. Cargar Publicaciones Propias en el Muro
  async function cargarPublicacionesUsuario(usuario) {
    try {
      const res = await fetch(`/api/usuario/${usuario.id}/publicaciones`);
      if (!res.ok) return;

      const data = await res.json();

      // Renderizar Relatos
      const misRelatos = document.getElementById('mis-relatos');
      if (data.relatos.length === 0) {
        misRelatos.innerHTML = `<p class="text-stone-500 text-xs">No has publicado relatos aún.</p>`;
      } else {
        misRelatos.innerHTML = data.relatos.map(r => `
          <div class="p-4 border border-stone-200 rounded-lg bg-stone-50 flex justify-between items-start">
            <div>
              <h4 class="font-bold text-emerald-900 text-sm">${r.titulo}</h4>
              <p class="text-xs text-stone-600 mt-1">"${r.contenido}"</p>
            </div>
            <button onclick="eliminarMiRelato(${r.id})" class="text-red-600 hover:text-red-800 text-xs font-bold ml-2">Eliminar</button>
          </div>
        `).join('');
      }

      // Renderizar Productos (Si es Emprendedor)
      const boxProductos = document.getElementById('box-mis-productos');
      const misProductos = document.getElementById('mis-productos');

      if (usuario.rol === 'emprendedor') {
        boxProductos.classList.remove('hidden');
        if (data.productos.length === 0) {
          misProductos.innerHTML = `<p class="text-stone-500 text-xs col-span-full">No has publicado productos en el catálogo aún.</p>`;
        } else {
          misProductos.innerHTML = data.productos.map(p => `
            <div class="p-3 border border-stone-200 rounded-lg bg-stone-50 flex flex-col justify-between">
              <div>
                <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">${p.categoria}</span>
                <h4 class="font-bold text-stone-800 text-xs mt-1">${p.titulo}</h4>
                <p class="font-bold text-emerald-900 text-xs mt-1">$ ${p.precio}</p>
              </div>
              <button onclick="eliminarMiProducto(${p.id})" class="mt-3 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold py-1 px-2 rounded w-full">
                Eliminar
              </button>
            </div>
          `).join('');
        }
      } else {
        boxProductos.classList.add('hidden');
      }

    } catch (err) {
      console.error('Error al cargar publicaciones del perfil:', err);
    }
  }

  // Funciones Globales para Eliminar
  window.eliminarMiRelato = async (id) => {
    const usuario = JSON.parse(localStorage.getItem('usuarioRAS'));
    if (!confirm('¿Deseas borrar este relato?')) return;

    try {
      const res = await fetch(`/api/relatos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });

      if (res.ok) {
        cargarPublicacionesUsuario(usuario);
      } else {
        alert('No pudiste eliminar este relato.');
      }
    } catch (err) {
      console.error('Error al eliminar relato:', err);
    }
  };

  window.eliminarMiProducto = async (id) => {
    const usuario = JSON.parse(localStorage.getItem('usuarioRAS'));
    if (!confirm('¿Deseas borrar este producto?')) return;

    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });

      if (res.ok) {
        cargarPublicacionesUsuario(usuario);
      } else {
        alert('No pudiste eliminar este producto.');
      }
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
  };

  cargarSesion();
});