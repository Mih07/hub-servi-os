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
    // 1. Define o peso de cada plano para a ordenação
    const pesos = { 'gold': 1, 'premium': 2, 'free': 3 };
  
    const lojasFiltradas = lojas
      .filter((loja) => {
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
          (loja.categoria && loja.categoria.trim().toLowerCase() === categoriaSelecionada.trim().toLowerCase());
  
        const matchesRegiao =
        regiaoSelecionada === '' || // Se nada estiver selecionado
        (loja.regiao && loja.regiao.toLowerCase().includes(regiaoSelecionada.toLowerCase().split(',')[0].trim()));
      
        return matchesBusca && matchesCategoria && matchesRegiao;
      })
      .sort((a, b) => {
        // Ordena de acordo com o peso definido acima. 
        // Se a loja não tiver um plano mapeado, ganha peso 99 (vai para o fim)
        return (pesos[a.plano] || 99) - (pesos[b.plano] || 99);
      });
  
    return (
  
          <div className="container-fluid py-4 bg-light min-vh-100 d-flex flex-column justify-content-between">
            <div>
              <Navbar />
                  
            <>
              <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container py-4 px-3">
                  <div className="row align-items-start mb-4">
                    <div className="col-lg-8 d-flex align-items-center">
                      <div className="mb-2">
                        <img 
                          src="/logo-hub.png" 
                          alt="Hub Serviços" 
                          style={{ maxWidth: '80px', height: 'auto', objectFit: 'cover', borderRadius: '15px' }} 
                          className="me-3 shadow-sm"
                        />
                      </div>
                      <h1 className="fw-bold mb-2" style={{ color: '#5d4037', fontSize: '1.9rem', letterSpacing: '-1.0px', }}>
                        Serviços, comércios e negócios da sua região | <span className="fw-bolder ms-2" style={{color: '#d63384', fontWeight: 900}}>Hub Serviços</span>
                      </h1>
                    </div>
                    <p className="text-muted mt-4" style={{ maxWidth: '450px', fontSize: '1.05rem' }}>
                        Encontre serviços, comércios e negócios da sua região. 
                        Clique no banner para acessar <strong>catálogos, cardápios e contatos diretos </strong>em um só lugar.
                    </p>
  
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
                            {['Tudo', 'Academia', 'Artesanato', 'Comida', 'Doces', 'Esmalteria', 'Estética', 'Jurídico', 'Pet', 'Salão de Beleza',  'Saúde', 'Soluções Digitais'].map((cat) => (
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
              
  
              {/* GRID DE CARDS COM FEEDBACK DE CARREGAMENTO */}
              <div className="container mb-3">
                <p className="text-muted">
                  Resultados encontrados: {lojasFiltradas.length}
                </p>
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
  