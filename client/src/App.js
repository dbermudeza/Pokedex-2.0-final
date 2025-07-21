import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClassicView from './pages/ClassicView';
import PokemonDetail from './pages/PokemonDetail';
import GeneralDetail from './pages/GeneralDetail';
import GeneralView from './pages/GeneralView';
import Login from './pages/Login';
import Register from './pages/Register';
import AddPokemon from'./pages/AddPokemon.jsx'
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/general" element={<GeneralView />} />  {/* <- YA NO PROTEGIDA */}
      <Route path="/clasica" element={<ClassicView />} /> {}
      <Route path="/addPokemon" element={
        <ProtectedRoute>
          <AddPokemon />
        </ProtectedRoute>
      } />
      <Route path="/clasica/detalles/:id" element={<PokemonDetail />} /> {}
      <Route path="/general/detalles/:id" element={<GeneralDetail/>} />
      <Route path="/" element={<Navigate to="/general" replace />} />
      <Route path="*" element={<Navigate to="/general" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;