import { useState, useEffect } from 'react';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cadastro from './pages/Cadastro';
import Cardapio from './pages/Cardapio'; 
import { supabase } from './supabaseClient'; // Conexão do Supabase

function App() {
  // 1. Estados Existentes
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Tudo');
  const [regiaoSelecionada, setRegiaoSelecionada] = useState('Itupeva, SP');
  
  // Voltamos para string vazia '' para a Tela Principal (Guia) ser a primeira a carregar!
  const [telaAtual, setTelaAtual] = useState(''); 
  const [slugLojistaAtivo, setSlugLojistaAtivo] = useState(''); // Para controlar qual catálogo mostrar

  // 2. Seus dados locais fixos
  const lojasLocais = [
    { 
      id: 'local-1',
      nome: 'Marciano Coiffeur', 
      link: '', 
      categoria: 'Salão de Beleza',
      regiao: 'Itupeva, SP', 
      endereco: 'Rua Alfredo Carlos São José, 109 - Jd Europa - Itupeva/SP',
      imagem: '/marciano.png',
      plano: 'free',
      whatsapp: 'https://wa.me/qr/YFF6REAHSJ2OD1',
      instagram: 'https://www.instagram.com/marcianocoiffeur?utm_source=qr&igsh=Z3F4c2FwdXA1YTBk'
    },
    { 
      id: 'local-2',
      nome: 'Faby Brando Hair', 
      link: '', 
      categoria: 'Salão de Beleza',
      regiao: 'Itupeva, SP', 
      endereco: 'Rua Prefeito José Carlos, 514 - Ana Luiza',
      imagem: '/fabihair.png',
      plano: 'free',
      whatsapp: 'https://wa.me/qr/57KQ6S4MRHCXA1',
      instagram: 'https://www.instagram.com/fabybrandohair?utm_source=qr&igsh=MTBiNjgyazdtamZqaw=='
    },
    { 
      id: 'local-3',
      nome: 'Camomila Sabonetes Artesanais', 
      link: 'https://catalogo-camomila.vercel.app/?ref=JUELISIA2026', 
      categoria: 'Artesanato',
      regiao: 'Itupeva, SP',
      endereco: 'Vendas Online / Encomendas',
      descricao: 'Sabonetes artesanais e fitoterápicos feitos com amor para cuidar da sua pele. Fragrâncias exclusivas e hidratação natural!',
      imagem: '/camomila.png',
      imagem2: '/sabonete-arruda.jpg', 
      imagem3: '/kit-energetico.jpg', 
      plano: 'premium'
    },
    { 
      id: 'local-4',
      nome: 'Seu site, suacara- Soluções digitais', 
      link: 'https://www.seusitesuacara.com',     
      categoria: 'Soluções Digitais',
      regiao: 'Itupeva, SP',
      endereco: 'Atendimento Online / Home Office',
      imagem: '/logoseusite.png',
      plano: 'premium'
    },
    { 
  id: 'marmitaria-da-deia', // O ID ou nome que será passado como slug
  nome: 'Catálogo Demonstrativo (Em desenvolvimento)', 
  link: '', // Deixando vazio, o Hub vai abrir a página interna do Cardápio!
  categoria: 'Comida',
  regiao: 'Itupeva, SP',
  endereco: 'Rua do Teste, 123',
  descricao: 'Testando o layout do cardápio inteligente por dentro da plataforma.',
  imagem: '/placeholder.png', // Ou qualquer imagem que você tiver
  plano: 'premium'
},
    { 
      id: 'local-5',
      nome: 'Mk Fitness Academia', 
      link: 'https://www.mkfitnessacademia.com.br',     
      categoria: 'Academia',
      regiao: 'Itupeva, SP',
      endereco: 'Av. Itália, 581 - Centro',
      imagem: '/academia.png',
      plano: 'premium'
    }
  ];

  const [lojas, setLojas] = useState(lojasLocais);
  const [carregando, setCarregando] = useState(true);

  // 3. Buscar do Supabase APENAS quem estiver com 'aprovado' igual a true
  useEffect(() => {
    async function carregarLojasDoBanco() {
      try {
        setCarregando(true);
        const { data, error } = await supabase
          .from('servicos')
          .select('*')
          .eq('aprovado', true);

        if (error) throw error;

        if (data && data.length > 0) {
          setLojas([...lojasLocais, ...data]);
        } else {
          setLojas(lojasLocais);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do Supabase:', error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarLojasDoBanco();
  }, [telaAtual]);

  // 4. Lógica do Filtro Inteligente
  const lojasFiltradas = lojas.filter((loja) => {
  const termoBusca = busca.trim().toLowerCase();

  const nomeLoja = loja.nome?.toLowerCase() || '';
  const categoriaLoja = loja.categoria?.toLowerCase() || '';
  const descricaoLoja = loja.descricao?.toLowerCase() || '';
  const enderecoLoja = loja.endereco?.toLowerCase() || '';
  const regiaoLoja = loja.regiao?.toLowerCase() || '';

  const matchesBusca =
    termoBusca === '' ||
    nomeLoja.includes(termoBusca) ||
    categoriaLoja.includes(termoBusca) ||
    descricaoLoja.includes(termoBusca) ||
    enderecoLoja.includes(termoBusca);

  const matchesCategoria =
    categoriaSelecionada === 'Tudo' ||
    loja.categoria === categoriaSelecionada;

  const matchesRegiao =
    regiaoSelecionada === '' ||
    regiaoLoja.includes(regiaoSelecionada.toLowerCase().split(',')[0]);

  return matchesBusca && matchesCategoria && matchesRegiao;
});

  return (
    <div className="container-fluid py-4 bg-light min-vh-100 d-flex flex-column justify-content-between">
      <div>
        <Navbar setTelaAtual={setTelaAtual} />
            
        {/* GERENCIAMENTO DE TELAS INTELIGENTE */}
        {telaAtual === 'cadastro' && (
          <Cadastro setTelaAtual={setTelaAtual} />
        )}

        {telaAtual === 'cardapio' && (
          <Cardapio setTelaAtual={setTelaAtual} slugLojista={slugLojistaAtivo} />
        )}

        {telaAtual === '' && (
          <>
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
                        <option value="Louveira, SP">Louveira, SP</option>
                        <option value="Cabreúva, SP">Cabreúva, SP</option>
                        <option value="Indaiatuba, SP">Indaiatuba, SP</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className="input-group rounded-pill border overflow-hidden shadow-sm mb-3 bg-white">
                      <span className="input-group-text bg-white border-0 ps-3" aria-hidden="true">
                        🔍
                      </span>

                      <input
                        type="text"
                        className="form-control border-0 shadow-none py-2"
                        placeholder="O que você precisa hoje?"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        aria-label="Campo de busca por nome ou categoria"
                      />
                    </div>

                    

                    <div className="d-flex justify-content-center mb-5 px-3"></div>
                                
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
                          {['Tudo', 'Academia', 'Artesanato', 'Comida', 'Doces', 'Esmalteria', 'Pet', 'Salão de Beleza',  'Saúde', 'Soluções Digitais'].map((cat) => (
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

            <div className="container px-3 mb-4">
              <div className="rounded-4 p-4 text-center border-0 shadow-sm" style={{ backgroundColor: '#fff0f6', border: '1px dashed #d63384' }}>
                <h4 className="fw-bold text-dark mb-2">Sua empresa ainda não está no Guia?</h4>
                <p className="text-muted mb-3">Escolha entre nosso <strong>Plano Gratuito</strong> ou potencialize sua marca com o <strong>Plano Premium</strong>!</p>
                <button 
                  onClick={() => setTelaAtual('cadastro')} 
                  className="btn px-4 py-2 rounded-pill fw-bold border-0 shadow-sm" 
                  style={{ backgroundColor: '#d63384', color: '#fff' }}
                >
                  Quero Anunciar Grátis ou Premium
                </button>
                <small className="d-block text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                  *Os cadastros passam por análise de conteúdo e são liberados em até 24 hours pela administração.
                </small>
              </div>
            </div>
            

            {/* GRID DE CARDS COM FEEDBACK DE CARREGAMENTO */}
            <div className="container mb-3">
              <p className="text-muted">
                Resultados encontrados: {lojasFiltradas.length}
              </p>
            </div>
            <main className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-3 mx-auto" style={{ maxWidth: '1300px' }}>
              {carregando ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: '#d63384' }}></div>
                  <p className="text-muted mt-2">Sincronizando guia com o servidor...</p>
                </div>
              ) : (
                lojasFiltradas.map((loja) => {
                  const isPremium = loja.plano === 'premium';
                  const idCarrossel = `carousel-${loja.nome ? loja.nome.replace(/[^a-zA-Z0-9]/g, '') : 'id'}`;

                  return (
                    <article key={loja.id || loja.nome} className="col">
                      <div 
                        className={`card h-100 shadow-sm overflow-hidden position-relative ${isPremium ? 'border border-warning-subtle' : 'border-0'}`} 
                        style={{ 
                          borderRadius: '18px', 
                          backgroundColor: '#fff',
                          transform: isPremium ? 'scale(1.01)' : 'none'
                        }}
                      >
                        {isPremium && (
                          <div style={{
                            position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ffc107',
                            color: '#000', fontWeight: 'bold', fontSize: '0.75rem', padding: '4px 12px',
                            borderRadius: '50px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: '10'
                          }}>
                            ⭐ PREMIUM
                          </div>
                        )}

                        {isPremium && (loja.imagem2 || loja.imagem3) ? (
                          <div id={idCarrossel} className="carousel slide" data-bs-ride="carousel" style={{ height: '180px' }}>
                            <div className="carousel-inner h-100">
                              <div className="carousel-item active h-100" style={{ backgroundColor: '#f3d5f5' }}>
                                <img src={loja.imagem} alt={loja.nome} className="w-100 h-100" style={{ objectFit: 'contain', padding: '15px' }} />
                              </div>
                              {loja.imagem2 && (
                                <div className="carousel-item h-100" style={{ backgroundColor: '#f3d5f5' }}>
                                  <img src={loja.imagem2} alt="Extra" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                </div>
                              )}
                              {loja.imagem3 && (
                                <div className="carousel-item h-100" style={{ backgroundColor: '#f3d5f5' }}>
                                  <img src={loja.imagem3} alt="Extra" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                </div>
                              )}
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target={`#${idCarrossel}`} data-bs-slide="prev">
                              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target={`#${idCarrossel}`} data-bs-slide="next">
                              <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            </button>
                          </div>
                        ) : (
                          <div style={{ overflow: 'hidden', backgroundColor: '#f3d5f5', height: '180px' }}>
                            {loja.imagem ? (
                              <img src={loja.imagem} alt={loja.nome} className="w-100 h-100" style={{ objectFit: 'contain', padding: '15px' }} loading="lazy" />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center h-100">
                                <span className="fw-bold text-secondary opacity-75">{loja.categoria}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                          <div>
                            <h3 className="h5 fw-bold text-dark mb-1">{loja.nome}</h3>
                            <p className="text-muted small mb-2">{loja.categoria} • {loja.regiao}</p>

                            {loja.descricao && (
                              <p className="text-secondary small bg-light p-2 rounded-3 mb-2 border-start border-3" style={{ fontStyle: 'italic', fontSize: '0.85rem', lineHeight: '1.3', borderLeftColor: '#d63384' }}>
                                "{loja.descricao}"
                              </p>
                            )}

                            <p className="text-secondary small mb-3" style={{ fontSize: '0.85rem' }}>
                              📍 <em>{loja.endereco}</em>
                            </p>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top" style={{ minHeight: '45px' }}>
                            {isPremium ? (
                              <>
                                <span className="text-primary small fw-bold">Conteúdo Exclusivo</span>
                                {/* Condicional inteligente para links externos particulares ou cardápio interno */}
                                <button 
                                  onClick={() => {
                                    if (loja.link) {
                                      window.open(loja.link, '_blank');
                                    } else {
                                      setSlugLojistaAtivo(loja.id || loja.nome);
                                      setTelaAtual('cardapio');
                                    }
                                  }} 
                                  className="btn btn-sm btn-primary rounded-pill px-4 fw-bold" 
                                  style={{ fontSize: '0.85rem', backgroundColor: '#d63384', borderColor: '#d63384' }}
                                >
                                  Ver Catálogo ➔
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="d-flex gap-2">
                                  {loja.whatsapp && (
                                    <a href={loja.whatsapp} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center justify-content-center text-decoration-none text-white shadow-sm" style={{ width: '36px', height: '36px', backgroundColor: '#25D366', borderRadius: '50%', fontSize: '1.1rem' }}>
                                      <i className="bi bi-whatsapp"></i>
                                    </a>
                                  )}
                                  {loja.instagram && (
                                    <a href={loja.instagram} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center justify-content-center text-decoration-none text-white shadow-sm" style={{ width: '36px', height: '36px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '50%', fontSize: '1.1rem' }}>
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
                })
              )}
            </main>

            {!carregando && lojasFiltradas.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">Ainda não temos parceiros em {regiaoSelecionada} nesta categoria. 🧐</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;