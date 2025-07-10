import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClassicView from './pages/ClassicView';
import PokemonDetail from './pages/PokemonDetail';
import GeneralDetail from './pages/GeneralDetail';
import GeneralView from './pages/GeneralView';
import Login from './pages/Login';
import Register from './pages/Register';
import AddPokemon from'./pages/AddPokemon.jsx'
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/general" element={<GeneralView />} />
        <Route path="/clasica" element={<ClassicView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/addPokemon" element={<AddPokemon />} />
        <Route path="/clasica/detalles/:id" element={<PokemonDetail />} />
        <Route path="/general/detalles/:id" element={<GeneralDetail />} />
        <Route path="*" element={<Navigate to="/clasica" replace />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;