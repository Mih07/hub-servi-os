import { useState } from 'react';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  // 1. Estados
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Tudo');
  const [regiaoSelecionada, setRegiaoSelecionada] = useState('Itupeva, SP');

  // Lista de lojas atualizada com novos clientes, endereços e níveis de plano
  const lojas = [
    { 
      nome: 'Marciano Coiffeur', 
      link: '', 
      categoria: 'Beleza',
      regiao: 'Itupeva, SP', 
      endereco: 'Rua Alfredo Carlos São José, 109 - Jd Europa - CEP: 13296-124',
      imagem: '/marciano.png',
      plano: 'free',
      whatsapp: 'https://wa.me/qr/YFF6REAHSJ2OD1',
      instagram: 'https://www.instagram.com/marcianocoiffeur?utm_source=qr&igsh=Z3F4c2FwdXA1YTBk'
    },
    { 
      nome: 'Camomila Sabonetes Artesanais', 
      link: 'https://catalogo-camomila.vercel.app/?ref=JUELISIA2026', 
      categoria: 'Artesanato',
      regiao: 'Itupeva, SP',
      endereco: 'Vendas Online / Encomendas',
      imagem: '/camomila.png',
      plano: 'premium'
    },
    { 
      nome: 'Seu site, suacara- Soluções digitais', 
      link: 'https://www.seusitesuacara.com',    
      categoria: 'Soluções Digitais',
      regiao: 'Itupeva, SP',
      endereco: 'Atendimento Online / Home Office',
      imagem: '/logoseusite.png',
      plano: 'premium'
    },
    { 
      nome: 'Mk Fitness Academia', 
      link: 'https://www.mkfitnessacademia.com.br',    
      categoria: 'Academia',
      regiao: 'Itupeva, SP',
      endereco: 'Av. Itália, 581 - Centro',
      imagem: '/academia.png',
      plano: 'premium'
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

      {/* Banner de Cadastro Atualizado para o Fluxo Freemium com sua validação posterior */}
      <div className="container px-3 mb-4">
        <div className="rounded-4 p-4 text-center border-0 shadow-sm" 
             style={{ backgroundColor: '#fff0f6', border: '1px dashed #d63384' }}>
          <h4 className="fw-bold text-dark mb-2">Sua empresa ainda não está no Guia?</h4>
          <p className="text-muted mb-3">Escolha entre nosso <strong>Plano Gratuito</strong> ou potencialize sua marca com o <strong>Plano Premium</strong>!</p>
          <a href="/cadastro-plano" 
             className="btn px-4 py-2 rounded-pill fw-bold" 
             style={{ backgroundColor: '#d63384', color: '#fff' }}>
              Quero Anunciar Grátis ou Premium
          </a>
          <small className="d-block text-muted mt-2" style={{ fontSize: '0.8rem' }}>
            *Os cadastros passam por análise de conteúdo e são liberados em até 24 horas pela administração.
          </small>
        </div>
      </div>

      {/* GRID DE CARDS */}
      {/* GRID DE CARDS PADRONIZADO COM BOOTSTRAP ICONS */}
      <main className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-3 mx-auto" style={{ maxWidth: '1300px' }}>
        {lojasFiltradas.map((loja) => {
          // VARIÁVEIS DE CONTROLE DE PLANO (Definidas certinho para o código abaixo ler)
          const isPremium = loja.plano === 'premium';
          const temCatalogo = isPremium && loja.link;

          return (
            <article key={loja.nome} className="col">
              <div 
                className="card h-100 shadow-sm border-0 overflow-hidden position-relative" 
                style={{ borderRadius: '18px', transition: '0.3s', backgroundColor: '#fff' }}
              >
                {/* Faixa Premium */}
                {isPremium && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    zIndex: '2'
                  }}>
                    ⭐ PREMIUM
                  </div>
                )}

                {/* IMAGEM FIXA (NÃO CLICÁVEL) */}
                <div style={{ overflow: 'hidden', backgroundColor: '#f3d5f5', height: '180px' }}>
                  {loja.imagem ? (
                    <img 
                      src={loja.imagem} 
                      alt={`Logotipo de ${loja.nome}`} 
                      className="w-100 h-100" 
                      style={{ objectFit: 'contain', padding: '15px' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="fw-bold text-secondary opacity-75">{loja.categoria}</span>
                    </div>
                  )}
                </div>

                {/* CORPO DO CARD */}
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    {/* TÍTULO CONDICIONAL */}
                    {temCatalogo ? (
                      <a href={loja.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark">
                        <h3 className="h5 fw-bold mb-1" style={{ cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'} onMouseOut={(e) => e.currentTarget.style.color = '#212529'}>
                          {loja.nome}
                        </h3>
                      </a>
                    ) : (
                      <h3 className="h5 fw-bold text-dark mb-1">
                        {loja.nome}
                      </h3>
                    )}
                    
                    <p className="text-muted small mb-2">
                      {loja.categoria} • {loja.regiao}
                    </p>
                    <p className="text-secondary small mb-3" style={{ fontSize: '0.85rem' }}>
                      📍 <em>{loja.endereco}</em>
                    </p>
                  </div>

                  {/* AÇÕES: REDES SOCIAIS E BOTÃO DE CATÁLOGO */}
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top" style={{ minHeight: '45px' }}>
                    
                    {/* Se for PREMIUM: Mostra apenas o botão de ver o Catálogo/Site */}
                    {isPremium ? (
                      <>
                        <span className="text-primary small fw-bold">Conteúdo Exclusivo</span>
                        <a 
                          href={loja.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary rounded-pill px-4 fw-bold"
                          style={{ fontSize: '0.85rem' }}
                        >
                          Ver Catálogo ➔
                        </a>
                      </>
                    ) : (
                      /* Se for FREE: Mostra as redes dinâmicas do cliente */
                      <>
                        <div className="d-flex gap-2">
                          {/* Botão WhatsApp Dinâmico */}
                          {loja.whatsapp && (
                            <a
                              href={loja.whatsapp} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="d-flex align-items-center justify-content-center text-decoration-none text-white shadow-sm"
                              style={{ width: '36px', height: '36px', backgroundColor: '#25D366', borderRadius: '50%', fontSize: '1.1rem', transition: '0.2s' }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.backgroundColor = '#1ea851';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = '#25D366';
                              }}
                              title="Chamar no WhatsApp"
                            >
                              <i className="bi bi-whatsapp"></i>
                            </a>
                          )}

                          {/* Botão Instagram Dinâmico */}
                          {loja.instagram && (
                            <a
                              href={loja.instagram} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="d-flex align-items-center justify-content-center text-decoration-none text-white shadow-sm"
                              style={{ width: '36px', height: '36px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '50%', fontSize: '1.1rem', transition: '0.2s' }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              title="Visitar Instagram"
                            >
                              <i className="bi bi-instagram"></i>
                            </a>
                          )}
                        </div>
                        <span className="text-muted small">Contato Direto</span>
                      </>
                    )}

                  </div>

                </div>
              </div>
            </article>
          );
        })}
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