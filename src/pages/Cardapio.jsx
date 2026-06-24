import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Cardapio({ slugLojista, setTelaAtual }) {
  const [lojista, setLojista] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const isGold = lojista?.plano === 'gold';

  // Estados para o Checkout Avançado
  const [verCheckout, setVerCheckout] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [metodoEnvio, setMetodoEnvio] = useState('entrega'); // 'entrega' ou 'retirada'
  
  // Estados Individuais para o Endereço Detalhado
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Itupeva - SP'); // Cidade padrão definida
  const [complemento, setComplemento] = useState('');

  // Estados para Pagamento
  const [formaPagamento, setFormaPagamento] = useState('');
  const [trocoPara, setTrocoPara] = useState('');

  // 1. Puxar dados do Lojista e os Produtos do Supabase baseados no slug
  useEffect(() => {
    async function carregarDados() {
  try {
    setCarregando(true);
    
    // 1. Busca os dados do lojista na tabela única 'servicos'
        
    const { data: dadosLojista, error: errLojista } = await supabase
      .from('servicos') 
      .select('*')
      .eq('slug', slugLojista)
      .order('id', { ascending: false }) // Pega o último cadastro feito (que deve ser o mais atualizado)
      .limit(1) // Garante que virá apenas uma linha, mesmo que existam várias
      .maybeSingle(); // O maybeSingle é mais seguro que o .single()

    if (errLojista) throw errLojista;
    setLojista(dadosLojista);

    // 2. Busca os produtos relacionados
    const { data: dadosProdutos, error: errProdutos } = await supabase
      .from('produtos')
      .select('*')
      .eq('slug_lojista', slugLojista); // Mantém o elo pelo slug

    if (errProdutos) throw errProdutos;
    setProdutos(dadosProdutos || []);

  } catch (error) {
    console.error('Erro ao carregar:', error.message);
  } finally {
    setCarregando(false);
  }
}

    if (slugLojista) {
      carregarDados();
    } else {
      setCarregando(false);
    }
  }, [slugLojista]);

  // 2. Funções de controle do Carrinho de Compras
  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);
    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
  };

  const removerDoCarrinho = (id) => {
    const itemExistente = carrinho.find(item => item.id === id);
    if (!itemExistente) return;

    if (itemExistente.quantidade === 1) {
      setCarrinho(carrinho.filter(item => item.id !== id));
    } else {
      setCarrinho(carrinho.map(item => 
        item.id === id ? { ...item, quantidade: item.quantidade - 1 } : item
      ));
    }
  };

  const excluirItemDoCarrinho = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  // 3. Montar a mensagem de texto profissional e abrir o WhatsApp
  const finalizarPedidoNoWhats = (e) => {
    if (e) e.preventDefault();
    if (carrinho.length === 0 || !lojista) return;

    // Validações básicas antes de enviar
    if (!nomeCliente.trim()) {
      alert('Por favor, informe seu nome para o pedido.');
      return;
    }
    if (metodoEnvio === 'entrega' && (!rua.trim() || !numero.trim() || !bairro.trim() || !cidade.trim())) {
      alert('Por favor, preencha todos os campos obrigatórios do endereço.');
      return;
    }
    if (!formaPagamento) {
      alert('Por favor, selecione a forma de pagamento.');
      return;
    }

    let textoPedido = `*🛍️ NOVO PEDIDO - ${lojista.nome_comercio || 'Cardápio'}*\n`;
    textoPedido += `---------------------------------------\n`;
    textoPedido += `*Cliente:* ${nomeCliente.trim()}\n`;
    textoPedido += `---------------------------------------\n\n`;
    
    textoPedido += `*📋 ITENS DO PEDIDO:*\n`;
    carrinho.forEach(item => {
      textoPedido += `• *${item.quantidade}x* ${item.nome} (R$ ${(item.preco * item.quantidade).toFixed(2)})\n`;
    });

    textoPedido += `\n---------------------------------------\n`;
    textoPedido += `*Subtotal:* R$ ${calcularTotal().toFixed(2)}\n`;
    textoPedido += `---------------------------------------\n\n`;
    
    textoPedido += `*🛵 FORMA DE ENVIO:*\n`;
    if (metodoEnvio === 'entrega') {
      textoPedido += `• *Entrega no Endereço:*\n`;
      textoPedido += `  ${rua.trim()}, Nº ${numero.trim()}\n`;
      textoPedido += `  Bairro: ${bairro.trim()} - ${cidade.trim()}\n`;
      if (complemento.trim()) {
        textoPedido += `  Ref/Comp: ${complemento.trim()}\n`;
      }
    } else {
      textoPedido += `• *Retirada no Local*\n`;
    }

    textoPedido += `\n*💳 PAGAMENTO:*\n`;
    textoPedido += `• Opção: ${formaPagamento}\n`;
    if (formaPagamento === 'Dinheiro' && trocoPara) {
      textoPedido += `• Levar troco para: R$ ${parseFloat(trocoPara).toFixed(2)}\n`;
    }

    textoPedido += `\n---------------------------------------\n`;
    textoPedido += `✅ *Pedido realizado via Hub Serviços*`;
    textoPedido += `\n_Olá! Acabei de enviar o meu pedido pelo Hub Serviços. Fico no aguardo da confirmação!_`;

    const numeroWhats = lojista.whatsapp ? lojista.whatsapp.replace(/\D/g, '') : '';
    const linkWhats = `https://wa.me/55${numeroWhats}?text=${encodeURIComponent(textoPedido)}`;
    window.open(linkWhats, '_blank');
  };

  const categoriesUnicas = [...new Set(produtos.filter(p => p.categoria).map(p => p.categoria))];

  if (carregando) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
      <p className="text-muted mt-2">Carregando catálogo...</p>
    </div>
  );
}

if (!lojista) {
  return (
    <div className="text-center py-5 container">
      <h3 className="fw-bold">Nenhum Cardápio Selecionado 🧐</h3>
      <p className="text-muted small">
        Escolha uma loja no guia.
      </p>
      <button
        className="btn btn-primary rounded-pill mt-2 px-4"
        style={{ backgroundColor: '#d63384', borderColor: '#d63384' }}
        onClick={() => setTelaAtual('')}
      >
        Voltar
      </button>
    </div>
  );
}

if (lojista.plano !== 'gold') {
  return (
    <div className="text-center py-5 container">
      <h3 className="fw-bold">🔒 Catálogo exclusivo</h3>
      <p className="text-muted small">
        Apenas planos Gold têm acesso ao Mini iFood.
      </p>

      <button
        className="btn btn-primary rounded-pill mt-2 px-4"
        style={{ backgroundColor: '#d63384', borderColor: '#d63384' }}
        onClick={() => setTelaAtual('')}
      >
        Voltar
      </button>
    </div>
  );
}

  return (
    <div className="container py-3 mx-auto shadow-sm" style={{ maxWidth: '600px', backgroundColor: '#fff', minHeight: '100vh', borderRadius: '12px' }}>
      
      {/* Botão de Voltar */}
      <div className="text-start mb-3">
        <button className="btn btn-sm btn-light rounded-pill border px-3 fw-bold text-secondary" onClick={() => {
          if (verCheckout) {
            setVerCheckout(false);
          } else {
            setTelaAtual('');
          }
        }}>
          ⬅ {verCheckout ? 'Voltar para o Menu' : 'Voltar para o Hub'}
        </button>
      </div>

      {/* Cabeçalho da Loja */}
      <header className="text-center pb-4 border-bottom mb-4 bg-white">
          {/* Logo da Loja */}
          {lojista.logo_url && (
            <div className="mb-3">
              <img 
                src={lojista.logo_url} 
                alt={lojista.nome_comercio} 
                className="rounded-circle shadow-sm border border-light" 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
              />
            </div>
          )}
          {/* Status de Loja */}
          
          {/* Nome do Comércio */}
          <h1 className="fw-bold h2 mb-1" style={{ color: '#2d3436' }}>{lojista.nome_comercio}</h1>
          
          {/* Badge de Verificação Hub */}
          <div className="mb-3">
            <span className="badge rounded-pill" style={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontSize: '0.75rem' }}>
              ✓ Loja oficial Hub Serviços
            </span>
          </div>

          {/* Informações de Contato/Localização */}
          <div className="d-flex flex-column align-items-center gap-1 text-muted small">
            {lojista.endereco_loja && (
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill me-1"></i>
                <span>{lojista.endereco_loja}</span>
              </div>
            )}
            
            {lojista.horario_funcionamento && (
              <div className="d-flex align-items-center">
                <i className="bi bi-clock-fill me-1"></i>
                <span>{lojista.horario_funcionamento}</span>
              </div>
            )}
            <div className="my-2">
            <span className={`badge rounded-pill ${lojista.esta_aberto ? 'bg-success' : 'bg-danger'}`}>
              {lojista.esta_aberto ? '🟢 Aberto Agora' : '🔴 Loja Fechada'}
            </span>
          </div>
          </div>
        </header>


      {!verCheckout ? (
        <main className="pb-5 mb-5">{categoriesUnicas.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>Nenhum produto cadastrado para este lojista ainda. 📋</p>
            </div>
          ) : (
            categoriesUnicas.map(categoria => (
              <div key={categoria} className="mb-4">
                <h2 className="h6 fw-bold text-uppercase text-secondary border-start border-3 px-2 mb-3" style={{ borderColor: '#d63384', letterSpacing: '0.5px' }}>
                  {categoria}
                </h2>

                <div className="d-flex flex-column gap-3">
                  {produtos.filter(p => p.categoria === categoria).map(produto => {
                  const itemNoCarrinho = carrinho.find(item => item.id === produto.id);

                  return (
                    <div key={produto.id} className="card border border-light-subtle shadow-sm p-3 d-flex flex-row align-items-center justify-content-between" style={{ borderRadius: '15px', backgroundColor: '#fdfdfd' }}>
                      
                      {/* Informações do Produto (Clique abre o Modal) */}
                      <div 
                        className="flex-grow-1 me-2 text-start" 
                        onClick={() => setProdutoSelecionado(produto)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <h3 className="h6 fw-bold mb-1 text-dark" style={{ fontSize: '0.95rem' }}>{produto.nome}</h3>
                        
                        {produto.descricao && (
                          <p className="text-muted mb-1" style={{ fontSize: '0.9rem', lineHeight: '1.4', fontWeight: '500' }}>
                            {produto.descricao}
                          </p>
                        )}
                        
                        <p className="fw-bold mb-0" style={{ color: '#d63384', fontSize: '0.9rem' }}>
                          R$ {typeof produto.preco === 'number' ? produto.preco.toFixed(2) : parseFloat(produto.preco || 0).toFixed(2)}
                        </p>
                      </div>

                      {/* Imagem e Botão */}
                      <div className="d-flex align-items-center gap-2">
                        {produto.imagem_url && (
                          <img 
                            src={produto.imagem_url} 
                            alt={produto.nome} 
                            className="rounded-3" 
                            style={{ width: '65px', height: '65px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setProdutoSelecionado(produto)}
                          />
                        )}
                        
                        <div className="d-flex align-items-center bg-light rounded-pill p-1 border">
                          {itemNoCarrinho ? (
                            <>
                              <button onClick={() => removerDoCarrinho(produto.id)} className="btn btn-sm btn-light rounded-circle fw-bold lh-1 p-1 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>-</button>
                              <span className="px-2 fw-bold small" style={{ minWidth: '20px', textAlign: 'center' }}>{itemNoCarrinho.quantidade}</span>
                              <button onClick={() => adicionarAoCarrinho(produto)} className="btn btn-sm btn-light rounded-circle fw-bold lh-1 p-1 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>+</button>
                            </>
                          ) : (
                            <button onClick={() => adicionarAoCarrinho(produto)} className="btn btn-sm btn-primary rounded-pill px-3 fw-bold small" style={{ backgroundColor: '#d63384', borderColor: '#d63384', fontSize: '0.8rem' }}>
                              Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                })}
              </div>
            </div>
            ))
          )}
        </main>
        
      ) : (

        /* FLUXO 2: TELA DE CONFERÊNCIA E FORMULÁRIO DE CHECKOUT */
        <main className="pb-5 mb-5 text-start">
          <h2 className="h5 fw-bold mb-3 text-dark">📋 Confirme seu Pedido</h2>
          
          {/* Listagem de itens na revisão */}
          <div className="card p-3 mb-4 shadow-sm border-0 bg-light" style={{ borderRadius: '12px' }}>
            {carrinho.map(item => (
              <div key={item.id} className="d-flex align-items-center justify-content-between py-2 border-bottom border-light-subtle last-border-0">
                <div>
                  <span className="fw-bold text-secondary me-2">{item.quantidade}x</span>
                  <span className="text-dark fw-medium">{item.nome}</span>
                  <div className="small text-muted">R$ ${(item.preco * item.quantidade).toFixed(2)}</div>
                </div>
                
                <div className="d-flex align-items-center gap-2">
                  <div
                        className="d-flex align-items-center bg-white rounded-pill border p-1"
                        style={{ transform: 'scale(0.9)' }}
                      >
                    <button onClick={() => removerDoCarrinho(item.id)} className="btn btn-sm btn-light rounded-circle fw-bold p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>-</button>
                    <span className="px-2 small fw-bold">{item.quantidade}</span>
                    <button onClick={() => adicionarAoCarrinho(item)} className="btn btn-sm btn-light rounded-circle fw-bold p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>+</button>
                  </div>
                  <button onClick={() => excluirItemDoCarrinho(item.id)} className="btn btn-sm btn-outline-danger rounded-circle border-0 p-1" title="Remover item">
                    ❌
                  </button> 
                </div>
              </div>
            ))}
            
            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <span className="fw-bold text-dark">Total dos Produtos:</span>
              <span className="fw-bold text-success h5 mb-0">R$ {calcularTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Formulário de Finalização */}
          <form onSubmit={finalizarPedidoNoWhats}>
            <div className="mb-3">
              <label className="form-label fw-bold text-secondary small">Seu Nome *</label>
              <input type="text" className="form-control rounded-3" placeholder="Digite seu nome completo" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-secondary small">Como prefere receber? *</label>
              <div className="d-flex gap-3">
                <div className="form-check flex-fill p-2 border rounded-3 text-center bg-white">
                  <input className="form-check-input ms-1" type="radio" name="metodoEnvio" id="envioEntrega" checked={metodoEnvio === 'entrega'} onChange={() => setMetodoEnvio('entrega')} />
                  <label className="form-check-label fw-medium ms-1" htmlFor="envioEntrega">🛵 Entrega</label>
                </div>
                <div className="form-check flex-fill p-2 border rounded-3 text-center bg-white">
                  <input className="form-check-input ms-1" type="radio" name="metodoEnvio" id="envioRetirada" checked={metodoEnvio === 'retirada'} onChange={() => setMetodoEnvio('retirada')} />
                  <label className="form-check-label fw-medium ms-1" htmlFor="envioRetirada">🛍️ Retirada</label>
                </div>
              </div>
            </div>

            {/* Condicional para Endereço Separado por Campos */}
            {metodoEnvio === 'entrega' && (
              <div className="p-3 mb-3 border rounded-3 bg-light animate__animated animate__fadeIn">
                <h3 className="h6 fw-bold text-dark mb-3">📍 Dados de Entrega</h3>
                
                <div className="mb-2">
                  <label className="form-label text-muted small mb-1">Endereço (Rua/Avenida) *</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm rounded-2" 
                    placeholder="Ex: Rua das Flores" 
                    value={rua} 
                    onChange={(e) => setRua(e.target.value)} 
                    required={metodoEnvio === 'entrega'} 
                  />
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-4">
                    <label className="form-label text-muted small mb-1">Número *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm rounded-2" 
                      placeholder="Nº 123" 
                      value={numero} 
                      onChange={(e) => setNumero(e.target.value)} 
                      required={metodoEnvio === 'entrega'} 
                    />
                  </div>
                  <div className="col-8">
                    <label className="form-label text-muted small mb-1">Bairro *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm rounded-2" 
                      placeholder="Ex: Centro" 
                      value={bairro} 
                      onChange={(e) => setBairro(e.target.value)} 
                      required={metodoEnvio === 'entrega'} 
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label text-muted small mb-1">Cidade *</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm rounded-2" 
                    value={cidade} 
                    onChange={(e) => setCidade(e.target.value)} 
                    required={metodoEnvio === 'entrega'} 
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label text-muted small mb-1">Complemento / Referência</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm rounded-2" 
                    placeholder="Ex: Ap 42, próximo ao mercado" 
                    value={complemento} 
                    onChange={(e) => setComplemento(e.target.value)} 
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label fw-bold text-secondary small">Forma de Pagamento *</label>
              <select className="form-select rounded-3 mb-2" value={formaPagamento} onChange={(e) => {
                setFormaPagamento(e.target.value);
                if (e.target.value !== 'Dinheiro') setTrocoPara('');
              }} required>
                <option value="">Selecione...</option>
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro (Espécie)</option>
              </select>

              {formaPagamento === 'Dinheiro' && (
                <div className="mt-2 p-2 border rounded-3 bg-light animate__animated animate__fadeIn">
                  <label className="form-label small text-muted mb-1">Precisa de troco para quanto?</label>
                  <input type="number" className="form-control form-control-sm rounded-3" placeholder="Ex: 50.00 (Deixe em branco se não precisar)" value={trocoPara} onChange={(e) => setTrocoPara(e.target.value)} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-success w-100 py-3 rounded-4 fw-bold shadow border-0" style={{ backgroundColor: '#25D366' }}>
              Confirmar e Enviar para o WhatsApp ➔
            </button>
          </form>
        </main>
      )} 

      {/* BARRA INFERIOR (Apenas visível se houver itens e não estiver no checkout) */}
      {carrinho.length > 0 && !verCheckout && (
        <div className="fixed-bottom bg-white border-top p-3 shadow-lg mx-auto" style={{ maxWidth: '600px', zIndex: 1050, borderRadius: '16px 16px 0 0' }}>
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <span className="text-muted small fw-bold">Subtotal do Pedido:</span>
            <span className="fw-bold h5 mb-0 text-success">R$ {calcularTotal().toFixed(2)}</span>
          </div>
          <button onClick={() => setVerCheckout(true)} className="btn btn-primary w-100 py-3 rounded-4 fw-bold d-flex justify-content-between align-items-center px-4 shadow border-0" style={{ backgroundColor: '#d63384' }}>
            <span>🛒 Conferir Sacola ({carrinho.reduce((a, b) => a + b.quantidade, 0)} itens)</span>
            <span>Avançar ➔</span>
          </button>
        </div>
      )}
{/* MODAL DE DETALHES */}
{produtoSelecionado && (
  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content rounded-4 border-0">
        <div className="modal-body p-4 text-center">
          <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setProdutoSelecionado(null)}></button>
          
          {produtoSelecionado.imagem_url && (
            <img src={produtoSelecionado.imagem_url} className="img-fluid rounded-4 mb-3 shadow" alt={produtoSelecionado.nome} />
          )}
          
          <h2 className="fw-bold">{produtoSelecionado.nome}</h2>
          <p className="text-muted fs-5">{produtoSelecionado.descricao}</p>
          <p className="h3 text-success fw-bold">R$ {parseFloat(produtoSelecionado.preco).toFixed(2)}</p>
          
          <button className="btn btn-primary w-100 rounded-pill py-2 mt-3" onClick={() => {
            adicionarAoCarrinho(produtoSelecionado);
            setProdutoSelecionado(null);
          }}>
            Adicionar ao Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Cardapio;