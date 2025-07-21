# Pokédex 2.0 Final

## Integrantes

- Tomás Gómez Cardona - togomezc@unal.edu.co
- Julian Camilo Ossa Zapata - jossaz@unal.edu.co
- Daniel Bermudez Aranguren - dbermudeza@unal.edu.co
- Sebastian Ocampo Galvis - seocampog@unal.edu.co

## Descripción

Una aplicación web de Pokédex completa con backend y frontend que permite gestionar y visualizar información de Pokémon. El proyecto incluye autenticación de usuarios, gestión de favoritos, y la capacidad de agregar nuevos Pokémon con imágenes.

## Características

- **Backend con Node.js y Express**: API REST para gestionar Pokémon, usuarios y favoritos
- **Frontend con React**: Interfaz interactiva con vistas clásica y detalles de Pokémon
- **Base de datos SQLite**: Almacenamiento persistente de datos
- **Autenticación de usuarios**: Sistema de login y registro
- **Gestión de favoritos**: Marcar/desmarcar Pokémon como favoritos

## Instalación y Uso

### Instalación Rápida (Recomendado)

Desde la carpeta raíz del proyecto:

```bash
# Instalar todas las dependencias (backend y frontend)
npm install

# Iniciar ambos servidores (backend y frontend)
npm start
```

Esto iniciará:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Instalación Manual

Si prefieres instalar y ejecutar por separado:

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../client
npm install

# Iniciar backend (en una terminal)
cd ../backend
npm start

# Iniciar frontend (en otra terminal)
cd ../client
npm start
```
- **Subida de imágenes**: Cargar imágenes de Pokémon y ubicaciones
- **Filtros y búsqueda**: Buscar por nombre, tipo y favoritos
- **Responsive**: Adaptado para dispositivos móviles

## Estructura del Proyecto

```
Pokedex-2.0-final/
├── backend/              # Servidor Node.js/Express
│   ├── controllers/      # Controladores de la API
│   ├── models/          # Modelos de base de datos
│   ├── uploads/         # Imágenes subidas
│   └── db/             # Base de datos SQLite
├── client/              # Aplicación React
│   ├── src/
│   │   ├── pages/       # Páginas principales
│   │   ├── components/  # Componentes reutilizables
│   │   ├── services/    # Servicios para API calls
│   │   └── context/     # Context de React
│   └── public/         # Archivos estáticos
└── .vscode/            # Configuración de VS Code
```

## Instalación y Configuración

### Prerequisitos

- Node.js (v16 o superior recomendado)
- npm (v8 o superior recomendado)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Pokedex-2.0-final
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../client
npm install
```

### 4. Iniciar los servidores

#### Opción A: Manualmente

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
El backend estará disponible en: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
El frontend estará disponible en: http://localhost:3000

#### Opción B: Usando VS Code Tasks

1. Abre el proyecto en VS Code
2. Presiona `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
3. Ejecuta "Tasks: Run Task"
4. Selecciona "Start Both Servers"

## API Endpoints

### Pokémon
- `GET /api/pokemones` - Obtener todos los Pokémon
- `GET /api/pokemones?userId=:id` - Obtener Pokémon (incluyendo favoritos para usuario)
- `GET /api/usuarios/:userId/pokemones` - Obtener Pokémon de un usuario específico
- `POST /api/pokemon` - Crear nuevo Pokémon (con imágenes)

### Autenticación
- `POST /api/register` - Registrar nuevo usuario
- `POST /api/login` - Iniciar sesión

### Favoritos
- `POST /api/favorites/toggle` - Alternar estado de favorito
- `GET /api/favorites/:userId` - Obtener favoritos de un usuario

## Uso de la Aplicación

### Navegación
- **Vista Clásica** (`/clasica`): Lista principal de Pokémon con filtros y búsqueda
- **Detalles** (`/clasica/detalles/:id`): Información detallada de cada Pokémon (3 páginas)

### Funcionalidades Principales

1. **Búsqueda**: Buscar Pokémon por nombre en tiempo real
2. **Filtros**: Filtrar por tipo de Pokémon (Fuego, Agua, Planta, etc.)
3. **Ordenamiento**: Ordenar por ID o nombre (ascendente/descendente)
4. **Favoritos**: Marcar/desmarcar favoritos (requiere autenticación)
5. **Agregar Pokémon**: Crear nuevos Pokémon con imágenes (requiere autenticación)

### Sistema de Usuarios
- Registro e inicio de sesión con validación
- Cada usuario puede agregar sus propios Pokémon
- Sistema de favoritos personalizado por usuario
- Contador de Pokédex personal

## Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **SQLite3** (better-sqlite3) - Base de datos
- **Multer** - Manejo de subida de archivos
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **CORS** - Manejo de políticas de origen cruzado

### Frontend
- **React 19.1.0** - Biblioteca de interfaz de usuario
- **React Router DOM** - Enrutamiento
- **Material-UI** - Componentes de interfaz
- **CSS personalizado** - Estilos temáticos de Pokémon

## Estructura de la Base de Datos

- **usuarios**: Información de usuarios registrados
- **pokemon**: Datos de Pokémon (nombre, descripción, stats, imágenes)
- **tipo**: Tipos de Pokémon (Fuego, Agua, etc.)
- **pokemon_tipo**: Relación muchos a muchos entre Pokémon y tipos
- **favorito**: Relación de favoritos por usuario

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Solución de Problemas

### Backend no se conecta
- Verificar que el puerto 5000 esté libre
- Comprobar que todas las dependencias estén instaladas

### Frontend no carga datos
- Asegurar que el backend esté ejecutándose en puerto 5000
- Verificar la consola del navegador para errores de CORS

### Imágenes no se muestran
- Confirmar que las rutas de imágenes en la base de datos sean correctas
- Verificar que el middleware de archivos estáticos esté funcionando

## Licencia

Este proyecto está bajo la Licencia ISC.
   ```bash
   git clone <URL-del-repositorio>
   cd PKDEX2.0-Segunda-Entrega

2. Instala las dependencias:
    npm install

3. Si los íconos de Material UI no se ven correctamente, instala también:
    npm install @mui/icons-material @mui/material @emotion/react @emotion/styled

## Comandos útiles

    -Iniciar la aplicación en modo desarrollo:
        npm start   
        Abre http://localhost:3000 en tu navegador.

    Construir la aplicación para producción:
        npm run build

## Estructura principal
    pages — Vistas principales (GeneralView, ClassicView, PokemonDetail, etc.)
    components — Componentes reutilizables (Header, SearchBar, MobileMenu, etc.)
    data — Datos de Pokémon y usuarios
    context — Contextos globales (por ejemplo, AuthContext)
    assets — Imágenes y recursos estáticos
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
