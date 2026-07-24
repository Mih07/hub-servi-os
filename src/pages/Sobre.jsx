import React from 'react';
import Navbar from '../components/Navbar'; // Recomendo extrair sua Nav para um componente
import Footer from '../components/Footer';

const Sobre = () => {
  return (
    <>
      <Navbar /> 
      <main className="container py-5">
        <h1 className="fw-bold" style={{ color: '#d63384' }}>
          Hub Serviços: Conectando Itupeva e Região
        </h1>
        
        <section className="mt-4">
          <p className="lead">
            O <strong>Hub  Serviços</strong> é uma plataforma digital criada para conectar empresas, profissionais e consumidores de <strong>Itupeva, Jundiaí e região</strong>.
          </p>
          <p>
            Nascemos com o propósito de simplificar a busca por serviços e produtos, oferecendo uma vitrine moderna para empresas que desejam expandir sua visibilidade digital. Aqui, o consumidor encontra empresas, produtos, catálogos e formas de contato em um só lugar.
          </p>
          
          <h2 className="h4 mt-5 fw-bold">Por que fazer parte do Hub Serviços?</h2>
          <p>
            Em um mundo digital, ser encontrado localmente é fundamental. <strong>Hub Serviços </strong>
            amplia a visibilidade de empresas e profissionais, facilitando o acesso dos consumidores a produtos, serviços e negócios de diferentes segmentos.
          </p>

          <div className="p-4 bg-light rounded-4 mt-4 border-start border-5" style={{ borderColor: '#d63384' }}>
            <h3 className="h5 fw-bold">Nossa Abrangência</h3>
            <p className="mb-0">Começamos por Itupeva e região, com uma plataforma preparada para expandir gradualmente para novas cidades e alcançar cada vez mais negócios e consumidores</p>
          </div>

          {/* Planos */}
          <div className="mt-5">
            <div className="text-center mb-4">
              <h2 className="h3 fw-bold">
                Escolha como sua empresa quer participar
              </h2>

              <p className="text-muted">
                Do básico para ser encontrado até uma presença mais completa dentro do
                Hub Serviços. Escolha o plano que combina com o seu negócio.
              </p>
            </div>

            <div className="row g-4">

              {/* GRATUITO */}
              <div className="col-12 col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <h3 className="h5 fw-bold">Gratuito</h3>

                    <p className="text-muted">
                      Para quem quer começar a fazer parte do Hub.
                    </p>

                    <p>
                      Presença na plataforma com informações da empresa e canais
                      de contato.
                    </p>
                  </div>
                </div>
              </div>

              {/* PREMIUM */}
              <div className="col-12 col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <h3 className="h5 fw-bold">Premium</h3>

                    <p className="text-muted">
                      Para quem busca mais visibilidade.
                    </p>

                    <p>
                      Mais espaço para apresentar sua empresa, imagens, destaque
                      e recursos adicionais.
                    </p>
                  </div>
                </div>
              </div>

              {/* GOLD */}
              <div className="col-12 col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <h3 className="h5 fw-bold">Gold</h3>

                    <p className="text-muted">
                      Para quem quer vender diretamente pelo Hub.
                    </p>

                    <p>
                      Tenha sua própria vitrine dentro da plataforma para apresentar produtos, serviços ou cardápios, organizar itens e receber pedidos.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Sobre;