import { useState } from 'react';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  // 1. Estados
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Tudo');
  const [regiaoSelecionada, setRegiaoSelecionada] = useState('Itupeva, SP');

  const lojas = [
    { 
      nome: 'Marmitaria da Déia', 
      link: 'https://marmitaria-two.vercel.app/', 
      categoria: 'Comida',
      regiao: 'Itupeva, SP', 
      imagem: '/marmitaria-deia.png' 
    },
    { 
      nome: 'Camomila Sabonetes Artesanais', 
      link: 'https://seusitesuacara.com/camomila/?ref=JUELISIA2026', 
      categoria: 'Artesanato',
      regiao: 'Itupeva, SP',
      imagem: '/camomila.png'
    },
    { 
      nome: 'Seu site, suacara- Soluções digitais', 
      link: 'https://www.seusitesuacara.com',    
      categoria: 'Soluções Digitais',
      regiao: 'Itupeva, SP',
      imagem: '/logoseusite.png'
    },
    { 
      nome: 'Mk Fitness Academia', 
      link: 'https://www.mkfitnessacademia.com.br',    
      categoria: 'Academia',
      regiao: 'Itupeva, SP',
      imagem: '/academia.png'
    }
  ];

  // 3. Lógica do Filtro Inteligente
  const lojasFiltradas = lojas.filter((loja) => {
    const termoBusca = busca.toLowerCase();
    
    const matchesBusca = 
      loja.nome.toLowerCase().includes(termoBusca) || 
      loja.categoria.toLowerCase().includes(termoBusca);

    const matchesCategoria = 
      categoriaSelecionada === 'Tudo' || 
      loja.categoria === categoriaSelecionada;

    const matchesRegiao = loja.regiao === regiaoSelecionada;

    return matchesBusca && matchesCategoria && matchesRegiao;
  });

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <Navbar/>
          
      <header className="bg-white border-bottom shadow-sm mb-4">
        <div className="container py-4 px-3">
          <div className="row align-items-start mb-4">
            <div className="col-lg-8 text-start">
              <h1 className="fw-bold mb-2" style={{ color: '#5d4037', fontSize: '2.2rem', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                Guia de Serviços e Comércio Local | <span className="fw-bolder ms-2" style={{color: '#d63384', fontWeight: 900}}>Hub Serviços</span>
              </h1>
              <p className="text-muted mt-4" style={{ maxWidth: '550px', fontSize: '1.05rem' }}>
                Encontre os melhores profissionais e lojas da região. 
                Clique no banner para acessar <strong>catálogos, cardápios e contatos diretos.</strong>
              </p>
            </div>
            
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <div className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill border shadow-sm" style={{ backgroundColor: '#fff9e6', borderColor: '#ffe69c' }}>
                <span className="me-2" aria-hidden="true">📍</span>
                <select 
                  className="border-0 bg-transparent fw-bold text-dark outline-none shadow-none" 
                  style={{ cursor: 'pointer' }}
                  value={regiaoSelecionada}
                  onChange={(e) => setRegiaoSelecionada(e.target.value)}
                  aria-label="Selecionar região"
                >
                  <option value="Itupeva, SP">Itupeva, SP</option>
                  <option value="Jundiaí, SP">Jundiaí, SP</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="input-group rounded-pill border overflow-hidden shadow-sm mb-3 bg-white">
                <span className="input-group-text bg-white border-0 ps-3" aria-hidden="true">🔍</span>
                <input 
                  type="text" 
                  className="form-control border-0 shadow-none py-2" 
                  placeholder="O que você precisa hoje?" 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Campo de busca por nome ou categoria"
                />
              </div>
                          
              <div className="d-flex justify-content-center mb-5 px-3">
                <div className="dropdown w-100" style={{ maxWidth: '400px' }}>
                  <button 
                    className="btn d-flex align-items-center justify-content-between w-100 border-0" 
                    type="button" 
                    id="dropdownMenuButton" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    style={{
                      borderBottom: '1px solid #333', 
                      borderRadius: '0',
                      padding: '12px 5px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      letterSpacing: '0px',
                      color: '#000',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <span className="text-uppercase">
                      {categoriaSelecionada === 'Tudo' ? 'CATEGORIAS' : categoriaSelecionada}
                    </span>
                    <span style={{ fontSize: '0.7rem' }} aria-hidden="true">▼</span>
                  </button>

                  <ul className="dropdown-menu shadow-lg border-0 w-100 mt-2" aria-labelledby="dropdownMenuButton" style={{ borderRadius: '12px', padding: '10px' }}>
                    {['Tudo', 'Comida', 'Academia', 'Artesanato', 'Doces', 'Soluções Digitais', 'Beleza', 'Pet', 'Saúde'].map((cat) => (
                      <li key={cat}>
                        <button 
                          className="dropdown-item py-3 px-3" 
                          type="button" 
                          onClick={() => setCategoriaSelecionada(cat)}
                          style={{ 
                            fontSize: '1rem',
                            borderRadius: '6px',
                            color: categoriaSelecionada === cat ? '#a91b60' : '#212529',
                            fontWeight: categoriaSelecionada === cat ? '800' : '500',
                            backgroundColor: categoriaSelecionada === cat ? '#ffd6e7 ' : 'transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Cadastro: Delicado, mas visível */}
<div className="container px-3 mb-4">
  <div className="rounded-4 p-4 text-center border-0 shadow-sm" 
       style={{ backgroundColor: '#fff0f6', border: '1px dashed #d63384' }}>
    <h4 className="fw-bold text-dark mb-2">Sua empresa ainda não está aqui?</h4>
    <p className="text-muted mb-3">Aumente sua visibilidade em Itupeva. Cadastre-se agora!</p>
    <a href="/seu-link-de-cadastro" 
       className="btn px-4 py-2 rounded-pill fw-bold" 
       style={{ backgroundColor: '#d63384', color: '#fff' }}>
       Quero anunciar minha empresa
    </a>
  </div>
</div>


      {/* GRID AJUSTADA: row-cols-lg-3 para cards maiores no desktop */}
      <main className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-3 mx-auto" style={{ maxWidth: '1300px' }}>
        {lojasFiltradas.map((loja) => (
          <article key={loja.nome} className="col">
            <a 
              href={loja.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card h-100 shadow-sm border-0 text-decoration-none overflow-hidden" 
              style={{ borderRadius: '18px', transition: '0.3s', display: 'block' }}
              aria-label={`Visitar catálogo de ${loja.nome} - Categoria ${loja.categoria}`}
            >
              {/* Container da Imagem aumentado para 180px */}
              <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f3d5f5' }}>
                {loja.imagem ? (
                  <img 
                    src={loja.imagem} 
                    alt={`Logotipo da loja ${loja.nome}`} 
                    className="w-100 h-100" 
                    style={{ objectFit: 'contain', padding: '15px', transition: '0.5s' }}
                    loading="lazy"
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100" aria-hidden="true">
                    <span className="fw-bold text-secondary opacity-75">{loja.categoria}</span>
                  </div>
                )}
              </div>

              {/* Corpo do Card com padding maior (p-4) */}
              <div className="card-body p-4">
                <h3 className="h5 fw-bold text-dark mb-2">
                  {loja.nome}
                </h3>
                <p className="text-muted small mb-3">
                  {loja.categoria} • {loja.regiao}
                </p>
                <p className="card-text text-primary fw-bold mb-0">
                  Ver Catálogo <span aria-hidden="true">➔</span>
                </p>
              </div>
            </a>
          </article>
        ))}
      </main>
      
      {lojasFiltradas.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">Ainda não temos parceiros em {regiaoSelecionada} nesta categoria. 🧐</p>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;