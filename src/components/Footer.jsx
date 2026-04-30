import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contato" className="bg-white border-top mt-5">
      <div className="container py-4"> {/* Diminuí o padding de py-5 para py-4 */}
        <div className="row justify-content-center text-center g-4">
          
          {/* Coluna Centralizada e Estreita */}
          <div className="col-md-6 col-lg-4">
            <h5 className="fw-bold mb-2" style={{ color: '#5d4037' }}>
              <span style={{ color: '#d63384' }}>Hub</span> Serviços
            </h5>
            <p className="text-muted small mb-4">
              O seu guia definitivo de comércio e serviços em Itupeva e região.
            </p>

            <div className="d-flex flex-column align-items-center gap-3">
              <p className="fw-bold mb-0" style={{ color: '#5d4037' }}>Fale Conosco:</p>
              <a 
                href="https://wa.me/5511971128269" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-success rounded-pill px-4 fw-bold shadow-sm btn-sm"
                style={{ backgroundColor: '#25D366', border: 'none' }}
              >
                Chamar no WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Faixa Inferior mais fina */}
      <div className="py-2" style={{ backgroundColor: '#1a1412' }}>
        <div className="container text-center">
          <p className="mb-0" style={{ color: '#8b807a', fontSize: '0.75rem' }}>
            © {currentYear} Hub Serviços. Desenvolvido por <strong>Seu Site, Sua Cara</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;