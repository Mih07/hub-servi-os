import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Cardapio from './pages/Cardapio';
import Favoritos from './pages/Favoritos';
import Sobre from './pages/Sobre';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/lojista/:slug" element={<Cardapio />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/favoritos" element={<Favoritos />} />
      </Routes>
  );
}

export default App;