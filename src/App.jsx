
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Cardapio from './pages/Cardapio';
import Favoritos from './pages/Favoritos';
import Sobre from './pages/Sobre';

import LoginLojista from './pages/painel/LoginLojista';
import DashboardLojista from './pages/painel/DashboardLojista';
import DashboardAdmin from './pages/painel/DashboardAdmin';
import RedefinirSenha from './pages/painel/RedefinirSenha';
import ProtecaoAdmin from './pages/painel/ProtecaoAdmin';
import LoginAdmin from './pages/painel/LoginAdmin';

import { Analytics } from '@vercel/analytics/react';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/lojista/:slug" element={<Cardapio />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/favoritos" element={<Favoritos />} />

        <Route path="/login-lojista" element={<LoginLojista />} />
        <Route path="/painel/lojista" element={<DashboardLojista />} />
        <Route
          path="/painel/admin"
          element={
            <ProtecaoAdmin>
              <DashboardAdmin />
            </ProtecaoAdmin>
          }
        />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
      </Routes>

      <Analytics />
    </>
  );
}

export default App;
