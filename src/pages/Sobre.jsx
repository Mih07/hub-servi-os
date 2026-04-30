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
            O <strong>Hub Serviços</strong> é o guia comercial digital focado em fortalecer o comércio local de <strong>Itupeva, Jundiaí e região</strong>.
          </p>
          <p>
            Nascemos com o propósito de simplificar a busca por serviços e produtos, oferecendo uma vitrine moderna para empresas que desejam expandir sua visibilidade digital. Aqui, o morador encontra catálogos, cardápios e contato direto via WhatsApp com os melhores profissionais da nossa terra.
          </p>
          
          <h2 className="h4 mt-5 fw-bold">Por que anunciar no nosso Guia?</h2>
          <p>
            Em um mundo digital, ser encontrado localmente é fundamental. Nosso foco é o 
            <strong> comércio local</strong>, ajudando pequenas e médias empresas a terem visibilidade 
            digital sem a complexidade de gerenciar um site próprio.
          </p>

          <div className="p-4 bg-light rounded-4 mt-4 border-start border-5" style={{ borderColor: '#d63384' }}>
            <h3 className="h5 fw-bold">Nossa Abrangência</h3>
            <p className="mb-0">Atuamos estrategicamente em Itupeva e cidades vizinhas, conectando catálogos, cardápios e contatos diretos via WhatsApp.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Sobre;