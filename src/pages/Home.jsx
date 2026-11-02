// Como todos estão agora em src/components/, o caminho é apenas ./
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListaDeLojas from '../components/ListaDeLojas';

import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';

export default function Home() {
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('Tudo');
    const [regiaoSelecionada, setRegiaoSelecionada] = useState('Itupeva, SP');
    
    const [slugLojistaAtivo, setSlugLojistaAtivo] = useState('');
    const [notas, setNotas] = useState({});
    const [hover, setHover] = useState({ lojaId: null, nota: 0 });
    const [categoriasExpandidas, setCategoriasExpandidas] = useState(false);
    // 1. Estado dos favoritos (já iniciando com o que estiver no localStorage)
    const [favoritos, setFavoritos] = useState(() => {
    const salvos = localStorage.getItem('meusFavoritos');
        return salvos ? JSON.parse(salvos) : [];
    });
  
    // 2. Função para alternar o status do favorito
    const toggleFavorito = (id) => {
      setFavoritos(prev => 
        prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
      );
    };
    // 3. Efeito que salva automaticamente no localStorage sempre que o estado mudar
    useEffect(() => {
      localStorage.setItem('meusFavoritos', JSON.stringify(favoritos));
    }, [favoritos]);
  
    // 3. Função para registrar cliques no Supabase
  const registrarClique = async (lojaId, tipo) => {
    try {
      const { error } = await supabase
        .from('estatisticas') // Nome da sua tabela
        .insert([
          { loja_id: lojaId, tipo_clique: tipo }
        ]);
  
      if (error) throw error;
      console.log(`Clique registrado: ${tipo} na loja ${lojaId}`);
    } catch (err) {
      console.error("Erro ao registrar estatística:", err.message);
    }
  };
  
  const registrarAvaliacao = async (lojaId, nota) => {
  try {
    const { error } = await supabase.rpc('adicionar_avaliacao', { 
      p_loja_id: lojaId, 
      p_nova_nota: nota 
    });

    if (error) throw error;

    alert("Avaliação registrada com sucesso!");
    
    // ESTA É A CHAVE: Recarregar os dados do banco para atualizar a tela
    await carregarLojasDoBanco(); 
    
  } catch (err) {
    console.error("Erro:", err);
    alert("Erro ao salvar: " + err.message);
  }
};
  
  
  // Função para montar o link com o rastreador de forma segura
    const montarLinkSeguro = (link) => {
      if (!link) return "#";
      // Se o link já tem '?', usamos '&', se não, usamos '?'
      const conector = link.includes('?') ? '&' : '?';
      return `${link}${conector}utm_source=hubservicos`;
    };
  
    // 3. Efeito que salva automaticamente no localStorage sempre que o estado mudar
    useEffect(() => {
        document.title = "Hub Serviços | Guia de Comércio e Serviços Completo";
      }, []);

      
    // 2. Seus dados locais fixos
    const lojasLocais = [
      
     /* { 
        id: 'local-4',
        nome: 'Seu site, sua cara- Soluções digitais', 
        link: 'https://www.seusitesuacara.com',     
        categoria: 'Soluções Digitais',
        regiao: 'Itupeva, SP',
        endereco: 'Atendimento Online / Home Office',
        imagem: '/logoseusite.png',
        imagem2: '/cardapio.png',
        imagem3: '/site.png',
        plano: 'premium'
      }*/
    ];
  
    const [lojas, setLojas] = useState(lojasLocais);
    const [carregando, setCarregando] = useState(true);
  
    // 3. Buscar do Supabase APENAS quem estiver com 'aprovado' igual a true
    const carregarLojasDoBanco = async () => {
        try {
            setCarregando(true);
            // Exemplo da chamada ao Supabase (ajuste conforme a sua tabela)
            const { data, error } = await supabase
                .from('servicos')
                .select('*')
                .eq('aprovado', true);

            if (error) throw error;
            setLojas(data);
        } catch (err) {
            console.error("Erro ao buscar serviços:", err);
        } finally {
            setCarregando(false);
        }
    };
    useEffect(() => {
      carregarLojasDoBanco();
      }, []);
  
    // 4. Lógica do Filtro Inteligente
      
    const lojasFiltradas = lojas
      .filter((loja) => {
        const termoBusca = busca.trim().toLowerCase();

        const nomeLoja = loja.nome?.toLowerCase() || '';
        const categoriaLoja = loja.categoria?.toLowerCase() || '';
        const outraCategoriaLoja = loja.outraCategoria?.toLowerCase() || '';
        const descricaoLoja = loja.descricao?.toLowerCase() || '';
        const enderecoLoja = loja.endereco?.toLowerCase() || '';
        const regiaoLoja = loja.regiao?.toLowerCase() || '';

        const matchesBusca =
          termoBusca === '' ||
          nomeLoja.includes(termoBusca) ||
          categoriaLoja.includes(termoBusca) ||
          outraCategoriaLoja.includes(termoBusca) ||
          descricaoLoja.includes(termoBusca) ||
          enderecoLoja.includes(termoBusca) ||
          regiaoLoja.includes(termoBusca);

        const matchesCategoria =
          categoriaSelecionada === 'Tudo' ||
          (loja.categoria &&
            loja.categoria.trim().toLowerCase() === categoriaSelecionada.trim().toLowerCase());

        const matchesRegiao =
          regiaoSelecionada === '' ||
          (loja.regiao &&
            loja.regiao.toLowerCase().includes(
              regiaoSelecionada.toLowerCase().split(',')[0].trim()
            ));

        return matchesBusca && matchesCategoria && matchesRegiao;
      });
      const lojasEmDestaque = lojasFiltradas.filter(
        (loja) => loja.destaque === true
      );

      const categorias = [
        { nome: 'Academia', icone: 'bi-heart-pulse' },
        { nome: 'Alimentação', icone: 'bi-cup-hot' },
        { nome: 'Artesanato & Personalização', icone: 'bi-palette' },
        { nome: 'Automotivo', icone: 'bi-car-front' },
        { nome: 'Beleza & Estética', icone: 'bi-stars' },
        { nome: 'Casa & Decoração', icone: 'bi-house-heart' },
        { nome: 'Cosméticos & Perfumaria', icone: 'bi-droplet' },
        { nome: 'Construção & Reformas', icone: 'bi-tools' },
        { nome: 'Doces & Confeitaria', icone: 'bi-cake2' },
        { nome: 'Educação & Cursos', icone: 'bi-mortarboard' },
        { nome: 'Eventos & Entretedimento', icone: 'bi-balloon' },
        { nome: 'Flores & Plantas', icone: 'bi-flower1' },
        { nome: 'Imovéis & Serviços Imobiliários', icone: 'bi-building' },
        { nome: 'Jurídico & Contabilidade', icone: 'bi-briefcase' },
        { nome: 'Logísitca & Entregas', icone: 'bi-truck' },
        { nome: 'Moda e Acessórios', icone: 'bi-handbag' },
        { nome: 'Pet & Animais', icone: 'bi-paw-print' },
        { nome: 'Saúde & Bem Estar', icone: 'bi-activity' },
        { nome: 'Serviços para Casa', icone: 'bi-wrench' },
        { nome: 'Tecnologia & Soluções Digitais', icone: 'bi-laptop' },
        { nome: 'Comércio Geral', icone: 'bi-shop' },
        { nome: 'Outras Categorias', icone: 'bi-grid' }
      ];
  
    return (
  
          <div className="container-fluid py-4 bg-light min-vh-100 d-flex flex-column justify-content-between">
            <div>
              <Navbar />
                  
            <>
              <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container py-4 px-3">
                  <div className="row align-items-start mb-4">
                    <div className="col-lg-8 d-flex align-items-center">
                    
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src="/logo-hub.png"
                        alt="Hub Serviços"
                        style={{
                          maxWidth: '80px',
                          height: 'auto',
                          objectFit: 'cover',
                          borderRadius: '15px'
                        }}
                        className="shadow-sm"
                      />

                      <div>
                        <h1
                          className="fw-bold mb-1"
                          style={{
                            color: '#d63384',
                            fontSize: '1.6rem',
                            letterSpacing: '-0.5px'
                          }}
                        >
                          Hub Serviços
                        </h1>

                        <p
                          className="text-muted mb-0"
                          style={{
                            fontSize: '0.85rem',
                            lineHeight: '1.5',
                            maxWidth: '350px'
                          }}
                        >
                          Tudo o que você procura na sua região, em um só lugar.
                        </p>
                      </div>
                    </div>
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
                          <option value="Campinas, SP">Campinas, SP</option>
                          <option value="Cajamar, SP">Cajamar, SP</option>
                          <option value="Elias Fausto, SP">Elias Fausto, SP</option>
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
  
                      
  
                      
                      {/* CATEGORIAS COLORIDAS */}
                      <div className="w-100 mt-4 mb-4">

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <h5 className="fw-bold mb-1" style={{ color: '#5d4037' }}>
                              Encontre o que você precisa ✨
                            </h5>
                            <p className="text-muted small mb-0">
                              Explore nossos serviços e comércios
                            </p>
                          </div>
                        </div>

                        {(() => {
                          const coresCategorias = [
                            { fundo: '#FFF0F3', icone: '#E75480' },
                            { fundo: '#FFF3E0', icone: '#F39C12' },
                            { fundo: '#F3E8FF', icone: '#9B59B6' },
                            { fundo: '#E3F2FD', icone: '#3498DB' },
                            { fundo: '#E8F5E9', icone: '#27AE60' },
                            { fundo: '#FFF8E1', icone: '#F1C40F' },
                            { fundo: '#FCE4EC', icone: '#EC407A' },
                            { fundo: '#E0F7FA', icone: '#00ACC1' },
                            { fundo: '#FBE9E7', icone: '#FF7043' },
                            { fundo: '#EDE7F6', icone: '#7E57C2' },
                            { fundo: '#F1F8E9', icone: '#8BC34A' },
                            { fundo: '#E8EAF6', icone: '#5C6BC0' }
                          ];

                          const categoriasVisiveis = categoriasExpandidas
                            ? categorias
                            : categorias.slice(0, 6);

                          return (
                            <>
                              <div
                                className="d-grid gap-2"
                                style={{
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 2fr))'
                                }}
                              >
                                {categoriasVisiveis.map((categoria, index) => {
                                  const cores = coresCategorias[index % coresCategorias.length];
                                  const selecionada =
                                    categoriaSelecionada === categoria.nome;

                                  return (
                                    <button
                                      key={categoria.nome}
                                      type="button"
                                      onClick={() =>
                                        setCategoriaSelecionada(categoria.nome)
                                      }
                                      className="border-0 d-flex flex-column align-items-center justify-content-center"
                                      style={{
                                        backgroundColor: selecionada
                                          ? cores.icone
                                          : cores.fundo,
                                        color: selecionada ? '#fff' : '#5d4037',
                                        borderRadius: '18px',
                                        padding: '10px 5px',
                                        minHeight: '85px',
                                        boxShadow: selecionada
                                          ? '0 4px 12px rgba(0,0,0,0.15)'
                                          : '0 2px 6px rgba(0,0,0,0.04)',
                                        transition: 'all 0.25s ease',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {categoria.nome === 'Pet & Animais' ? (
                                        <svg
                                          width="34"
                                          height="34"
                                          viewBox="0 0 64 64"
                                          style={{ marginBottom: '9px' }}
                                        >
                                          <g
                                            fill={selecionada ? '#fff' : cores.icone}
                                            stroke={selecionada ? '#fff' : cores.icone}
                                            strokeWidth="1.5"
                                          >
                                            <ellipse cx="14" cy="25" rx="7" ry="9" />
                                            <ellipse cx="27" cy="15" rx="7" ry="9" />
                                            <ellipse cx="40" cy="15" rx="7" ry="9" />
                                            <ellipse cx="51" cy="25" rx="7" ry="9" />

                                            <path
                                              d="M32 30
                                                C25 30 19 39 19 46
                                                C19 53 25 56 32 56
                                                C39 56 45 53 45 46
                                                C45 39 39 30 32 30 Z"
                                              strokeLinejoin="round"
                                            />
                                          </g>
                                        </svg>
                                      ) : (
                                        <i
                                          className={`bi ${categoria.icone}`}
                                          style={{
                                            fontSize: '1.5rem',
                                            marginBottom: '6px',
                                            color: selecionada ? '#fff' : cores.icone
                                          }}
                                        ></i>
                                      )}

                                      <span
                                        className="text-center fw-semibold"
                                        style={{
                                          fontSize: '0.72rem',
                                          lineHeight: '1.25'
                                        }}
                                      >
                                        {categoria.nome}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {categorias.length > 6 && (
                                <div className="text-center mt-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCategoriasExpandidas(!categoriasExpandidas)
                                    }
                                    className="btn rounded-pill px-4 py-2"
                                    style={{
                                      backgroundColor: '#FFF0F6',
                                      color: '#D63384',
                                      border: '1px solid #F8C8DE',
                                      fontWeight: '600'
                                    }}
                                  >
                                    {categoriasExpandidas ? (
                                      <>
                                        <i className="bi bi-chevron-up me-2"></i>
                                        Ver menos
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-three-dots me-2"></i>
                                        Ver mais categorias
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                    </div>
                  </div>
                </div>
              
              </header>
  
              <div className="container px-3 mb-4">
                <div className="rounded-4 p-4 text-center border-0 shadow-sm" style={{ backgroundColor: '#fff0f6', border: '1px dashed #d63384' }}>
                  <h4 className="fw-bold text-dark mb-2">Sua empresa ainda não está no <strong>HubServiços?</strong></h4>
                  <p className="text-muted mb-3">Escolha entre nosso <strong>Plano Gratuito</strong> ou potencialize sua marca com o <strong>Plano Premium ou Gold</strong>!</p>
                  <button 
                    onClick={() => navigate('/cadastro')} 
                    className="btn px-4 py-2 rounded-pill fw-bold border-0 shadow-sm" 
                    style={{ backgroundColor: '#d63384', color: '#fff' }}
                  >
                    Quero cadastrar minha empresa
                  </button>
                  <small className="d-block text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                    *Os cadastros passam por análise de conteúdo e são liberados em até 24 hours pela administração.
                  </small>
                </div>
              </div>
              
  
          
  
  {/* Seção de Favoritos Rápidos */}
  
  {favoritos.length > 0 && (
    <section className="container mb-4">
      {/* Título e Ícone de Favoritos (Não clicável) */}
      <div className="container mt-4 mb-2">
        <div className="d-flex align-items-center">
          <i 
            className="bi bi-heart-fill" 
            style={{ color: '#d63384', fontSize: '1.2rem' }}
          ></i>
          <h5 className="fw-bold mb-0 ms-2" style={{ color: '#d63384' }}>
            Favoritos
          </h5>
        </div>
      </div>
  
  {/* Abaixo daqui começa o seu .map que lista as logos */}
      <div className="d-flex gap-3 overflow-auto pb-2">
        {lojasFiltradas
          .filter(loja => favoritos.includes(loja.id))
          .map(loja => (
            <a 
              key={loja.id}
              href={`#${loja.id}`} 
              className="d-flex flex-column align-items-center text-decoration-none"
              style={{ width: '90px' }} // Define uma largura fixa para o ícone
            >
              <div className="rounded-circle shadow-sm overflow-hidden border" style={{ width: '80px', height: '80px' }}>
                <img 
                  src={loja.imagem} 
                  alt={loja.nome} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <span className="small text-truncate mt-1" style={{ fontSize: '0.85rem', color: '#333', maxWidth: '90px' }}>
                {loja.nome}
              </span>
            </a>
          ))
        }
      </div>
    </section>
  )}

  <ListaDeLojas
      lojasFiltradas={lojasFiltradas}
      lojasEmDestaque={lojasEmDestaque}
      carregando={carregando}
      favoritos={favoritos}
      toggleFavorito={toggleFavorito}
      hover={hover}
      setHover={setHover}
      notas={notas}
      setNotas={setNotas}
      registrarAvaliacao={registrarAvaliacao}
      registrarClique={registrarClique}
      montarLinkSeguro={montarLinkSeguro}
      navigate={navigate}
      setSlugLojistaAtivo={setSlugLojistaAtivo}
    />
  
         {!carregando && lojasFiltradas.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">Ainda não temos parceiros em {regiaoSelecionada} nesta categoria. 🧐</p>
                </div>
              )}
            </>
        </div>
        <Footer/>
      </div> 
  )};
  