const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// CONEXIÓN A SUPABASE (Asegúrate de usar la URL con el puerto 6543 en Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a la base de datos PostgreSQL:', err.stack);
  } else {
    console.log('¡Conexión exitosa a la base de datos de Supabase!');
  }
  if (release) release();
});

// RUTAS DE NAVEGACIÓN (VISTAS HTML)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/mapa', (req, res) => res.sendFile(path.join(__dirname, 'views', 'mapa.html')));
app.get('/relatos', (req, res) => res.sendFile(path.join(__dirname, 'views', 'relatos.html')));
app.get('/catalogo', (req, res) => res.sendFile(path.join(__dirname, 'views', 'catalogo.html')));
app.get('/emprendimiento', (req, res) => res.sendFile(path.join(__dirname, 'views', 'emprendimiento.html')));

// API REST

app.get('/api/puntos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM puntos_interes');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al obtener puntos:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

app.get('/api/relatos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM relatos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al obtener relatos:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

app.post('/api/relatos', async (req, res) => {
  const { titulo, autor, contenido } = req.body;
  if (!titulo || !autor || !contenido) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    const query = 'INSERT INTO relatos (titulo, autor, contenido, tiempo) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [titulo, autor, contenido, 'Hace un momento'];
    const resultado = await pool.query(query, values);
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al guardar relato:', err);
    res.status(500).json({ error: 'Error al guardar el relato' });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

app.post('/api/productos', async (req, res) => {
  const { titulo, artesano, categoria, precio, contacto, claveBorrado } = req.body;
  if (!titulo || !artesano || !categoria || !precio || !contacto || !claveBorrado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    const query = 'INSERT INTO productos (titulo, artesano, categoria, precio, contacto, clave_borrado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [titulo, artesano, categoria, precio, contacto, String(claveBorrado).trim()];
    const resultado = await pool.query(query, values);
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al guardar producto:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  const userKey = req.headers['x-owner-key'];
  const { id } = req.params;
  const CLAVE_ADMIN = "admin123";

  try {
    const productoRes = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (productoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = productoRes.rows[0];

    if (userKey !== producto.clave_borrado && userKey !== CLAVE_ADMIN) {
      return res.status(401).json({ error: 'No autorizado para eliminar' });
    }

    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// INTERCEPTOR DE ERRORES API (Evita que el servidor devuelva HTML en rutas no encontradas)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor de RAS corriendo en el puerto ${PORT}`);
});