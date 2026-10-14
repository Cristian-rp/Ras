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

// --- CONEXIÓN A POSTGRESQL EN LA NUBE ---
// La variable process.env.DATABASE_URL se configura en el panel de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:contrasena@localhost:5432/ras_db',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// --- RUTAS DE NAVEGACIÓN ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/mapa', (req, res) => res.sendFile(path.join(__dirname, 'views', 'mapa.html')));
app.get('/relatos', (req, res) => res.sendFile(path.join(__dirname, 'views', 'relatos.html')));
app.get('/catalogo', (req, res) => res.sendFile(path.join(__dirname, 'views', 'catalogo.html')));
app.get('/emprendimiento', (req, res) => res.sendFile(path.join(__dirname, 'views', 'emprendimiento.html')));

// --- API REST CONECTADA A BASE DE DATOS ---

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al consultar productos:', err);
    res.status(500).json({ error: 'Error interno al consultar productos' });
  }
});

// Crear un nuevo producto
app.post('/api/productos', async (req, res) => {
  const { usuario_id, titulo, artesano, categoria, precio, contacto } = req.body;
  
  // Asignamos un usuario por defecto (1) si aún no está implementado el login en el cliente
  const idAutor = usuario_id || 1;

  if (!titulo || !artesano || !categoria || !precio || !contacto) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados' });
  }

  try {
    const query = `
      INSERT INTO productos (usuario_id, titulo, artesano, categoria, precio, contacto)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const valores = [idAutor, titulo, artesano, categoria, precio, contacto];
    const nuevoProducto = await pool.query(query, valores);

    res.status(201).json(nuevoProducto.rows[0]);
  } catch (err) {
    console.error('Error al guardar producto:', err);
    res.status(500).json({ error: 'Error al registrar el producto en la base de datos' });
  }
});

// Eliminar un producto (Validando propiedad del usuario)
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.headers['x-user-id'] || 1; // ID del usuario que solicita la eliminación

  try {
    const borrado = await pool.query(
      'DELETE FROM productos WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId]
    );

    if (borrado.rowCount === 0) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este producto o no existe' });
    }

    res.json({ mensaje: 'Producto eliminado con éxito', producto: borrado.rows[0] });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error interno al eliminar el producto' });
  }
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`Servidor de RAS escuchando en el puerto ${PORT}`);
});