require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de conexión a PostgreSQL (Neon Database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Probar conexión a la base de datos al arrancar
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a la base de datos Neon:', err.stack);
  } else {
    console.log('¡Conexión exitosa a la base de datos PostgreSQL en Neon!');
    release();
  }
});

// ==========================================
// RUTAS DE VISTAS HTML
// ==========================================
// Redirección inicial obligatoria al Login
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/inicio', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/mapa', (req, res) => res.sendFile(path.join(__dirname, 'views', 'mapa.html')));
app.get('/relatos', (req, res) => res.sendFile(path.join(__dirname, 'views', 'relatos.html')));
app.get('/catalogo', (req, res) => res.sendFile(path.join(__dirname, 'views', 'catalogo.html')));
app.get('/emprendimiento', (req, res) => res.sendFile(path.join(__dirname, 'views', 'emprendimiento.html')));
app.get('/perfil', (req, res) => res.sendFile(path.join(__dirname, 'views', 'perfil.html')));

// ==========================================
// 1. RUTAS DE AUTENTICACIÓN Y USUARIOS
// ==========================================

// Registro de usuarios
app.post('/api/auth/registro', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }

  try {
    const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const tipoRol = rol === 'emprendedor' ? 'emprendedor' : 'usuario';
    const query = `
      INSERT INTO usuarios (nombre, email, password, rol) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, nombre, email, rol;
    `;
    const resultado = await pool.query(query, [nombre, email, password, tipoRol]);

    res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario: resultado.rows[0]
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error interno en el servidor al registrar' });
  }
});

// Inicio de sesión (Login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = resultado.rows[0];
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: usuario
    });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error interno en el servidor al iniciar sesión' });
  }
});

// Consultar perfil del usuario (Muro tipo Red Social)
app.get('/api/usuario/:id/publicaciones', async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioRes = await pool.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [id]);
    if (usuarioRes.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const relatosRes = await pool.query('SELECT * FROM relatos WHERE usuario_id = $1 ORDER BY id DESC', [id]);
    const productosRes = await pool.query('SELECT * FROM productos WHERE usuario_id = $1 ORDER BY id DESC', [id]);

    res.json({
      usuario: usuarioRes.rows[0],
      relatos: relatosRes.rows,
      productos: productosRes.rows
    });
  } catch (err) {
    console.error('Error al consultar perfil del usuario:', err);
    res.status(500).json({ error: 'Error interno al consultar perfil' });
  }
});

// ==========================================
// 2. RUTAS DE MAPA (MÓDULO 1)
// ==========================================
app.get('/api/puntos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM puntos_interes ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al obtener puntos del mapa:', err);
    res.status(500).json({ error: 'Error al consultar puntos del mapa' });
  }
});

// ==========================================
// 3. RUTAS DE RELATOS Y MEMORIA (MÓDULO 2)
// ==========================================
app.get('/api/relatos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM relatos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al consultar relatos:', err);
    res.status(500).json({ error: 'Error al obtener los relatos' });
  }
});

app.post('/api/relatos', async (req, res) => {
  const { titulo, autor, contenido, usuario_id } = req.body;

  if (!titulo || !autor || !contenido) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const query = `
      INSERT INTO relatos (titulo, autor, contenido, tiempo, usuario_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const resultado = await pool.query(query, [
      titulo,
      autor,
      contenido,
      'Hace un momento',
      usuario_id || null
    ]);

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al guardar relato:', err);
    res.status(500).json({ error: 'Error al guardar el relato' });
  }
});

app.delete('/api/relatos/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  try {
    const check = await pool.query('SELECT * FROM relatos WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Relato no encontrado' });
    }

    if (check.rows[0].usuario_id && check.rows[0].usuario_id !== parseInt(usuario_id)) {
      return res.status(403).json({ error: 'No tienes permiso para borrar este relato' });
    }

    await pool.query('DELETE FROM relatos WHERE id = $1', [id]);
    res.json({ mensaje: 'Relato eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar relato:', err);
    res.status(500).json({ error: 'Error al eliminar el relato' });
  }
});

// ==========================================
// 4. RUTAS DE PRODUCTOS Y CATÁLOGO (MÓDULO 3)
// ==========================================
app.get('/api/productos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al consultar productos:', err);
    res.status(500).json({ error: 'Error al obtener los productos del catálogo' });
  }
});

app.post('/api/productos', async (req, res) => {
  const { titulo, artesano, categoria, precio, contacto, imagen_url, claveBorrado, usuario_id } = req.body;

  if (!titulo || !artesano || !categoria || !precio || !contacto) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben diligenciarse' });
  }

  try {
    const query = `
      INSERT INTO productos (titulo, artesano, categoria, precio, contacto, imagen_url, clave_borrado, usuario_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *;
    `;
    const resultado = await pool.query(query, [
      titulo,
      artesano,
      categoria,
      precio,
      contacto,
      imagen_url || null,
      claveBorrado || '1234',
      usuario_id || null
    ]);

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al guardar producto:', err);
    res.status(500).json({ error: 'Error al registrar el producto' });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  try {
    const check = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (check.rows[0].usuario_id && check.rows[0].usuario_id !== parseInt(usuario_id)) {
      return res.status(403).json({ error: 'No tienes permiso para borrar este producto' });
    }

    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

// Captura de rutas API no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de RAS corriendo en el puerto ${PORT}`);
});