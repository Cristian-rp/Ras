const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVIR ARCHIVOS ESTÁTICOS CORRECTAMENTE
app.use(express.static(path.join(__dirname, 'public')));

// --- BASE DE DATOS EN MEMORIA ---
const puntosInteres = [
  { id: 1, nombre: "Sua Cha - Zona Arqueológica", categoria: "Patrimonio Cultural", coords: [4.5794, -74.2168], descripcion: "Espacio de alto valor histórico para la memoria ancestral Muysca y arte rupestre." },
  { id: 2, nombre: "Humedal Neuta", categoria: "Reserva Ambiental", coords: [4.5880, -74.2250], descripcion: "Ecosistema estratégico de biodiversidad y espacio sagrado de conexión ambiental." },
  { id: 3, nombre: "Pictogramas de San Mateo", categoria: "Arte Rupestre", coords: [4.5720, -74.2050], descripcion: "Vestigios arqueológicos en rocas con notación pictórica ancestral." }
];

const relatos = [
  { id: 1, titulo: "Cuidado del Humedal Neuta", autor: "Colectivo Ambiental", tiempo: "Hace 2 días", contenido: "El humedal no solo es un refugio de biodiversidad, sino un espacio de conexión ancestral que debemos salvaguardar." },
  { id: 2, titulo: "Tradición Tejendera en Soacha", autor: "Comunidad Muysca", tiempo: "Hace 5 días", contenido: "Nuestra abuela nos enseñó el tejido como una forma de plasmar el pensamiento y la memoria del territorio." }
];

let productos = [
  { id: 1, titulo: "Vasija de Cerámica Ancestral", artesano: "Artesanos de Soacha", categoria: "Artesanía", precio: "35.000 COP", contacto: "573000000000" },
  { id: 2, titulo: "Tejido en Lana de Oveja", artesano: "Tejedoras Muyscas", categoria: "Textil", precio: "50.000 COP", contacto: "573000000000" }
];

// --- RUTAS DE NAVEGACIÓN ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/mapa', (req, res) => res.sendFile(path.join(__dirname, 'views', 'mapa.html')));
app.get('/relatos', (req, res) => res.sendFile(path.join(__dirname, 'views', 'relatos.html')));
app.get('/catalogo', (req, res) => res.sendFile(path.join(__dirname, 'views', 'catalogo.html')));
app.get('/emprendimiento', (req, res) => res.sendFile(path.join(__dirname, 'views', 'emprendimiento.html')));

// --- RUTAS DE LA API REST ---
app.get('/api/puntos', (req, res) => res.json(puntosInteres));

app.get('/api/relatos', (req, res) => res.json(relatos));
app.post('/api/relatos', (req, res) => {
  const { titulo, autor, contenido } = req.body;
  if (!titulo || !autor || !contenido) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const nuevoRelato = {
    id: relatos.length + 1,
    titulo,
    autor,
    tiempo: "Hace un momento",
    contenido
  };
  relatos.unshift(nuevoRelato);
  res.status(201).json(nuevoRelato);
});

app.get('/api/productos', (req, res) => res.json(productos));

app.post('/api/productos', (req, res) => {
  const { titulo, artesano, categoria, precio, contacto } = req.body;
  if (!titulo || !artesano || !categoria || !precio || !contacto) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados' });
  }
  const nuevoProducto = {
    id: Date.now(),
    titulo,
    artesano,
    categoria,
    precio,
    contacto
  };
  productos.unshift(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

app.delete('/api/productos/:id', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const CLAVE_SECRETA = "admin123";

  if (adminKey !== CLAVE_SECRETA) {
    return res.status(401).json({ error: 'Acceso no autorizado. Clave de administrador incorrecta.' });
  }

  const { id } = req.params;
  const idNumerico = parseInt(id, 10);

  const existe = productos.some(p => p.id === idNumerico);
  if (!existe) {
    return res.status(404).json({ error: 'El producto a eliminar no existe.' });
  }

  productos = productos.filter(p => p.id !== idNumerico);
  res.json({ mensaje: 'Producto eliminado correctamente', id: idNumerico });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de RAS escuchando en el puerto ${PORT}`);
});