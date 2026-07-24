import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Cardapio from './pages/Cardapio';
import Favoritos from './pages/Favoritos';
import Sobre from './pages/Sobre';

import LoginLojista from './pages/painel/LoginLojista';
import DashboardLojista from './pages/painel/DashboardLojista';
import DashboardAdmin from './pages/painel/DashboardAdmin';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/lojista/:slug" element={<Cardapio />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/favoritos" element={<Favoritos />} />

      <Route path="/login-lojista" element={<LoginLojista />} />
      <Route path="/painel/lojista" element={<DashboardLojista />} />
      <Route path="/painel/admin" element={<DashboardAdmin />} />
    </Routes>
  );
}

export default App;