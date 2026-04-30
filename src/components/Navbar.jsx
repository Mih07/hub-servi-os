import React from 'react';
import { Link } from 'react-router-dom'; // 1. Importação necessária

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-3">
      <div className="container">
        
        {/* Link principal para a Home */}
        <Link className="navbar-brand fw-bold" to="/" style={{ color: '#5d4037' }} title="Página Inicial Hub Serviços Itupeva">
          <span style={{ color: '#d63384' }}>Hub</span> Serviços
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            {/* Link para a nova página Sobre */}
            <li className="nav-item">
              <Link className="nav-link px-3 fw-medium" to="/sobre">Sobre o Guia</Link>
            </li>

            <li className="nav-item">
              <a className="nav-link px-3 fw-medium" href="#contato">Contato</a>
            </li>

            <li className="nav-item ms-lg-3">
              <a 
                href="https://wa.me/5511971128269?text=Olá!%20Gostaria%20de%20anunciar%20minha%20empresa%20no%20Hub%20Serviços%20(Itupeva%20e%20Região)." 
                className="btn rounded-pill px-4 fw-bold" 
                style={{ backgroundColor: '#d63384', color: '#fff', border: 'none' }}
                target='_blank'
                rel="noopener noreferrer"
              >
                Anunciar Empresa
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;