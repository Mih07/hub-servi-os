import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShareAlt,
} from "react-icons/ai";

export default function ListaDeLojas({
  lojasFiltradas,
  carregando,
  favoritos,
  toggleFavorito,
  hover,
  setHover,
  notas,
  setNotas,
  registrarAvaliacao,
  registrarClique,
  montarLinkSeguro,
  navigate,
}) {
  return (
    <main className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-3 mx-auto" style={{ maxWidth: '1300px' }}>
            {carregando ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border" role="status" style={{ color: '#d63384' }}></div>
                <p className="text-muted mt-2">Sincronizando guia com o servidor...</p>
              </div>
            ) : (
        lojasFiltradas.map((loja) => {
          const isPremium = loja.plano === 'premium';
          const isGold = loja.plano === 'gold';
          const isDestaque = isPremium || isGold;
          const idCarrossel = `carousel-${loja.nome ? loja.nome.replace(/[^a-zA-Z0-9]/g, '') : 'id'}`;
          return (
            <article key={loja.id || loja.nome} id={loja.id} className="col">
              <div 
                className={`card h-100 shadow-sm overflow-hidden position-relative ${isDestaque ? 'border border-warning-subtle' : 'border-0'}`} 
                style={{ borderRadius: '18px', backgroundColor: '#fff', transform: isDestaque ? 'scale(1.01)' : 'none' }}
              >
                {isDestaque && (
                  <div style={{
                    position: 'absolute', top: '15px', right: '15px', 
                    backgroundColor: isGold ? '#ff7b00' : '#ffc107', // Ouro para Gold, Amarelo para Premium
                    color: '#000', fontWeight: 'bold', fontSize: '0.75rem', padding: '4px 12px',
                    borderRadius: '50px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: '10'
                  }}>
                    {isGold ? '⭐ PLANO GOLD' : '⭐ PREMIUM'}
                  </div>
                )}
                
                {isDestaque && (loja.imagem2 || loja.imagem3) ? (
                  <div id={idCarrossel} className="carousel slide" data-bs-ride="carousel" style={{ height: '180px' }}>
                    <div className="carousel-inner h-100">
                      <div className="carousel-item active h-100" style={{ backgroundColor: '#f3d5f5' }}>
                        <img src={loja.imagem} alt={loja.nome} className="w-100 h-100" style={{ objectFit: 'contain', padding: '15px' }} />
                      </div>
                      {loja.imagem2 && <div className="carousel-item h-100" style={{ backgroundColor: '#f3d5f5' }}><img src={loja.imagem2} alt="Extra" className="w-100 h-100" style={{ objectFit: 'cover' }} /></div>}
                      {loja.imagem3 && <div className="carousel-item h-100" style={{ backgroundColor: '#f3d5f5' }}><img src={loja.imagem3} alt="Extra" className="w-100 h-100" style={{ objectFit: 'cover' }} /></div>}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target={`#${idCarrossel}`} data-bs-slide="prev"><span className="carousel-control-prev-icon"></span></button>
                    <button className="carousel-control-next" type="button" data-bs-target={`#${idCarrossel}`} data-bs-slide="next"><span className="carousel-control-next-icon"></span></button>
                  </div>
                ) : (
                  <div style={{ overflow: 'hidden', backgroundColor: '#f3d5f5', height: '180px' }}>
                    {loja.imagem ? <img src={loja.imagem} alt={loja.nome} className="w-100 h-100" style={{ objectFit: 'contain', padding: '15px' }} loading="lazy" /> : <div className="d-flex align-items-center justify-content-center h-100"><span className="fw-bold text-secondary opacity-75">{loja.categoria}</span></div>}
                  </div>
                )}
                <div className="card-body p-4 d-flex flex-column">
                  <h3 className="h5 fw-bold text-dark mb-1">{loja.nome}</h3>
                  
                 
        <div className="mb-2">
            {[1, 2, 3, 4, 5].map((estrela) => (
              <i 
                key={estrela} 
                className={`bi ${estrela <= ((hover.lojaId === loja.id ? hover.nota : 0) || notas[loja.id] || 0) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                style={{ 
                  fontSize: '1.2rem', 
                  marginRight: '4px', 
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onClick={() => {
                  // 1. Atualiza o estado visual instantaneamente para o usuário
                  setNotas(prev => ({ ...prev, [loja.id]: estrela }));
                  // 2. Chama a função que envia para o Supabase
                  registrarAvaliacao(loja.id, estrela);
                }}
                onMouseEnter={() => setHover({ lojaId: loja.id, nota: estrela })}
                onMouseLeave={() => setHover({ lojaId: null, nota: 0 })}
              ></i>
            ))}
            <span className="text-muted small ms-1">
                {loja.nota_media > 0 
                ? `(${parseFloat(loja.nota_media).toFixed(1)} estrelas)` 
                : '(Avalie)'}
            </span>
          </div>
                  <p className="text-muted small mb-2">{loja.categoria} • {loja.regiao}</p>
                  {loja.endereco && (
                    <p className="text-muted small mb-2">
                      <i className="bi bi-geo-alt-fill me-1"></i> {loja.endereco}
                    </p>
                  )}
                  {loja.bairro && (
                    <p className="text-muted small mb-2">
                      <i className="bi bi-house-door-fill me-1"></i> {loja.bairro}
                    </p>
                  )}
                  
                  {loja.descricao && (
                    <p className="text-secondary small bg-light p-2 rounded-3 mb-2 border-start border-3" style={{ fontStyle: 'italic', fontSize: '0.85rem', lineHeight: '1.3', borderLeftColor: '#d63384' }}>
                      "{loja.descricao}"
                    </p>
                  )}
                  
                  <div className="d-flex gap-2 mb-3">
                    <button onClick={() => toggleFavorito(loja.id)} className="btn btn-sm btn-outline-secondary rounded-circle border-0" style={{ width: '35px', height: '35px', color: favoritos.includes(loja.id) ? '#d63384' : '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {favoritos.includes(loja.id) ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copiado!"); }} className="btn btn-sm btn-outline-secondary rounded-circle border-0" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AiOutlineShareAlt size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-auto d-flex align-items-center justify-content-between pt-2 border-top">
                    {isDestaque ? (
                      <button 
                        onClick={() => { 
                          // Esta linha abaixo é a que envia o dado para o Supabase
                          if (loja.link) {
                            window.open(loja.link, '_blank');
                            } else {
                            registrarClique(loja.id, 'catalogo');
                            navigate(`/lojista/${loja.slug || loja.id}`);
                            }
                        }} 
                        className="btn btn-sm btn-primary rounded-pill px-4 fw-bold w-100" 
                        style={{ fontSize: '0.85rem', backgroundColor: '#d63384', borderColor: '#d63384' }}
                      >
                        Ver Catálogo ➔
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                          {loja.whatsapp && (
                            <a 
                              href={montarLinkSeguro(loja.whatsapp)} // <--- AQUI
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={() => registrarClique(loja.id, 'whatsapp')}
                              className="d-flex align-items-center justify-content-center text-decoration-none text-white shadow-sm" 
                              style={{ width: '36px', height: '36px', backgroundColor: '#25D366', borderRadius: '50%', fontSize: '1.1rem' }}
                            >
                              <i className="bi bi-whatsapp"></i>
                            </a>
                          )}
                          {loja.instagram && (
                            <a 
                              href={montarLinkSeguro(loja.instagram)} // <--- AQUI
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={() => registrarClique(loja.id, 'instagram')}
                              className="d-flex align-items-center justify-content-center text-decoration-none text-white shadow-sm" 
                              style={{ width: '36px', height: '36px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '50%', fontSize: '1.1rem' }}
                            >
                              <i className="bi bi-instagram"></i>
                            </a>
                          )}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })
      )}
    </main>
)}