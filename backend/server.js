const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Para subir archivos
const path = require('path');     // Para manejar rutas de archivos
const authController = require('./controllers/authController'); // Importas el controlador
const pokemonController = require('./controllers/pokemonController'); // Importas el controlador

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
// Middleware para servir las imágenes que se suban
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Configuración de Multer para guardar archivos ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardan las imágenes
  },
  filename: function (req, file, cb) {
    // Nombre de archivo único para evitar que se sobreescriban
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/api/pokemones', pokemonController.getPokemons);
app.post('/api/pokemon', upload.fields([
    { name: 'pokemonImage', maxCount: 1 },
    { name: 'locationImage', maxCount: 1 }
]), pokemonController.createPokemons
);

// Endpoints para favoritos
app.post('/api/favorites/toggle', pokemonController.toggleFavorite);
app.get('/api/favorites/:userId', pokemonController.getFavorites);

app.post('/api/register', authController.register); 
app.post('/api/login', authController.login);  


app.listen(5000, () => console.log('Servidor corriendo en http://localhost:5000'));