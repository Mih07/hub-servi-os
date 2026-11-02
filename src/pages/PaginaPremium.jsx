import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function PaginaPremium() {
  const { slug } = useParams();

  const [loja, setLoja] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("sobre");

  const [avaliacoes, setAvaliacoes] = useState([]);
const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false);

const [nomeCliente, setNomeCliente] = useState("");
const [notaSelecionada, setNotaSelecionada] = useState(0);
const [comentario, setComentario] = useState("");

const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
const [mensagemAvaliacao, setMensagemAvaliacao] = useState("");

  useEffect(() => {
    const buscarLoja = async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .eq("slug", slug)
        .eq("plano", "premium")
        .eq("aprovado", true)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar estabelecimento:", error);
        setErro(true);
      } else if (!data) {
        setErro(true);
      } else {
        setLoja(data);
      }

      setCarregando(false);
    };

    buscarLoja();
  }, [slug]);

  // BUSCAR AVALIAÇÕES APROVADAS
    useEffect(() => {
    if (!loja?.id) return;

    const buscarAvaliacoes = async () => {
        setCarregandoAvaliacoes(true);

        const { data, error } = await supabase
        .from("avaliacoes")
        .select("id, nome_cliente, nota, comentario, created_at")
        .eq("loja_id", loja.id)
        .eq("aprovado", true)
        .order("created_at", { ascending: false });

        if (error) {
        console.error("Erro ao buscar avaliações:", error);
        setAvaliacoes([]);
        } else {
        setAvaliacoes(data || []);
        }

        setCarregandoAvaliacoes(false);
    };

    buscarAvaliacoes();
    }, [loja?.id]);

  // ENVIAR AVALIAÇÃO DO CLIENTE
const enviarAvaliacao = async (e) => {
  e.preventDefault();

  if (!nomeCliente.trim() || notaSelecionada === 0 || !comentario.trim()) {
    setMensagemAvaliacao(
      "Preencha seu nome, escolha as estrelas e escreva seu comentário."
    );
    return;
  }

  setEnviandoAvaliacao(true);
  setMensagemAvaliacao("");

  try {
    const { error } = await supabase
      .from("avaliacoes")
      .insert({
        loja_id: loja.id,
        nome_cliente: nomeCliente.trim(),
        nota: notaSelecionada,
        comentario: comentario.trim(),
      });

    if (error) throw error;

    setMensagemAvaliacao(
      "Sua avaliação foi enviada! Ela aparecerá após aprovação."
    );

    setNomeCliente("");
    setNotaSelecionada(0);
    setComentario("");

  } catch (error) {
    console.error("Erro ao enviar avaliação:", error);
    setMensagemAvaliacao(
      "Não foi possível enviar sua avaliação. Tente novamente."
    );
  } finally {
    setEnviandoAvaliacao(false);
  }
};

// VERIFICAÇÃO DE CARREGAMENTO
if (carregando) {
  return <p className="text-center mt-5">Carregando página...</p>;
}

  if (erro || !loja) {
    return (
      <div className="container text-center mt-5">
        <h3>Estabelecimento não encontrado</h3>
        <p>Esta página pode não estar disponível.</p>
      </div>
    );
  }

  const configuracoesServicos = {
  loja: {
    titulo: "Nossos produtos",
    descricao: "Conheça nossos produtos e novidades.",
  },
  restaurante: {
    titulo: "Nosso cardápio",
    descricao: "Confira nossas opções e especialidades.",
  },
  prestador: {
    titulo: "Serviços oferecidos",
    descricao: "Conheça os serviços que oferecemos.",
  },
  profissional: {
    titulo: "Áreas de atuação",
    descricao: "Conheça nossas especialidades e áreas de atuação.",
  },
};

const configuracao =
  configuracoesServicos[loja.tipo_negocio] || {
    titulo: "Serviços e produtos",
    descricao: "Conheça nossas opções.",
  };

 return (
  <main className="container py-4 py-md-5">
    <div className="mb-3">
        <Link
            to="/"
            className="btn rounded-pill px-3"
            style={{
            color: "#d63384",
            border: "1px solid #d63384",
            backgroundColor: "#fff",
            }}
        >
            <i className="bi bi-arrow-left me-2"></i>
            Voltar ao Hub Serviços
        </Link>
        </div>

    <section
      className="card border-0 shadow-sm overflow-hidden"
      style={{ borderRadius: "24px" }}
    >

      {/* CAPA COM A IDENTIDADE DO HUB */}
      <div
        className="p-4 p-md-5 text-white"
        style={{
          background: "linear-gradient(115deg, #d63384, #ed75aa, #f4c45e)",
          minHeight: "145px",
        }}
      >
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-1">Hub Serviços</h5>
            <small>Guia de Serviços e Comércio Local</small>
          </div>

          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              fontSize: "0.8rem",
            }}
          >
            ✦ PERFIL PREMIUM
          </span>
        </div>
      </div>

      {/* IDENTIDADE DO ESTABELECIMENTO */}
      <div className="p-3 p-md-4">

        <div className="d-flex align-items-end gap-3 flex-wrap">

          {loja.imagem ? (
            <img
              src={loja.imagem}
              alt={`Logo de ${loja.nome}`}
              className="shadow-sm"
              style={{
                width: "105px",
                height: "105px",
                objectFit: "cover",
                borderRadius: "22px",
                border: "4px solid white",
                marginTop: "-65px",
                backgroundColor: "#fff",
              }}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: "105px",
                height: "105px",
                borderRadius: "22px",
                border: "4px solid white",
                marginTop: "-65px",
                backgroundColor: "#fce4ef",
                color: "#d63384",
                fontSize: "2.5rem",
              }}
            >
              <i className="bi bi-shop"></i>
            </div>
          )}

          <div className="flex-grow-1 pb-1">
            <h2
              className="fw-bold mb-1"
              style={{ color: "#5d4037" }}
            >
              {loja.nome}
            </h2>

            <p className="text-secondary mb-0">
              {loja.categoria} • {loja.regiao}
            </p>
          </div>

        </div>

        {/* DESCRIÇÃO */}
        {loja.descricao && (
          <p className="text-secondary mt-3 mb-3">
            {loja.descricao}
          </p>
        )}

        {/* CONTATOS */}
        <div className="d-flex flex-wrap gap-2 mt-3">

          {loja.whatsapp && (
            <a
              href={loja.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn rounded-pill px-4"
              style={{
                backgroundColor: "#25D366",
                color: "#fff",
              }}
            >
              <i className="bi bi-whatsapp me-2"></i>
              WhatsApp
            </a>
          )}

          {loja.instagram && (
            <a
              href={loja.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn rounded-pill px-4"
              style={{
                border: "1px solid #d63384",
                color: "#d63384",
              }}
            >
              <i className="bi bi-instagram me-2"></i>
              Instagram
            </a>
          )}

          {loja.link && (
            <a
              href={loja.link}
              target="_blank"
              rel="noreferrer"
              className="btn rounded-pill px-4"
              style={{
                border: "1px solid #d63384",
                color: "#d63384",
              }}
            >
              <i className="bi bi-globe me-2"></i>
              Visitar site
            </a>
          )}

        </div>

      </div>
    </section>

    {/* MENU DE ABAS */}
    <div className="mt-4 mb-3">

    <style>{`
        .pagina-premium-tabs {
        scrollbar-width: none;
        -ms-overflow-style: none;
        }

        .pagina-premium-tabs::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
        }
    `}</style>

    <div
        className="pagina-premium-tabs d-flex flex-nowrap gap-2 border-bottom"
        style={{
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        WebkitOverflowScrolling: "touch",
        }}
    >

        {[
        { id: "sobre", nome: "Sobre", icone: "bi-house" },
        { id: "servicos", nome: "Serviços", icone: "bi-briefcase" },
        { id: "fotos", nome: "Fotos", icone: "bi-images" },
        { id: "avaliacoes", nome: "Avaliações", icone: "bi-star" },
        { id: "informacoes", nome: "Informações", icone: "bi-info-circle" },
        { id: "contato", nome: "Contato", icone: "bi-telephone" },
        ].map((aba) => (
        <button
            key={aba.id}
            type="button"
            onClick={() => setAbaAtiva(aba.id)}
            className="btn rounded-0 px-3 py-3 flex-shrink-0"
            style={{
            color: abaAtiva === aba.id ? "#d63384" : "#5d4037",
            borderBottom:
                abaAtiva === aba.id
                ? "3px solid #d63384"
                : "3px solid transparent",
            fontWeight: abaAtiva === aba.id ? "bold" : "normal",
            }}
        >
            <i className={`bi ${aba.icone} me-2`}></i>
            {aba.nome}
        </button>
        ))}

    </div>
    </div>

    {/* CONTEÚDO DA ABA SOBRE */}
    {abaAtiva === "sobre" && (
    <section className="card border-0 shadow-sm rounded-4 p-4 mt-3">

        <h4 className="fw-bold mb-3" style={{ color: "#d63384" }}>
        <i className="bi bi-shop me-2"></i>
        Sobre o negócio
        </h4>

        <p className="text-secondary mb-3" style={{ lineHeight: "1.7" }}>
        {loja.descricao || "Este estabelecimento ainda não adicionou uma descrição."}
        </p>

        <div className="d-flex align-items-center gap-2 text-secondary">
        <i className="bi bi-geo-alt-fill" style={{ color: "#d63384" }}></i>
        {loja.regiao}
        </div>

        <div className="d-flex align-items-center gap-2 text-secondary mt-2">
        <i className="bi bi-tag-fill" style={{ color: "#d63384" }}></i>
        {loja.categoria}
        </div>

    </section>
    )}

    {/* CONTEÚDO DA ABA SERVIÇOS */}
{abaAtiva === "servicos" && (
  <section className="card border-0 shadow-sm rounded-4 p-4 mt-3">

    <h4 className="fw-bold mb-2" style={{ color: "#d63384" }}>
      <i
        className={`bi ${
          loja.tipo_negocio === "loja"
            ? "bi-bag"
            : loja.tipo_negocio === "restaurante"
            ? "bi-egg-fried"
            : loja.tipo_negocio === "profissional"
            ? "bi-person-workspace"
            : "bi-briefcase"
        } me-2`}
      ></i>

      {loja.slug === "camomila-sabonetes-artesanais"
        ? "Produtos artesanais"
        : configuracao.titulo}
    </h4>

    <p className="text-secondary">
      {loja.slug === "camomila-sabonetes-artesanais"
        ? "Conheça algumas das nossas criações artesanais."
        : configuracao.descricao}
    </p>

    {/* VITRINE DEMONSTRATIVA DA CAMOMILA */}
    {loja.slug === "camomila-sabonetes-artesanais" ? (

      <>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="fw-semibold" style={{ color: "#5d4037" }}>
            Nossa vitrine
          </span>

          <span
            className="badge rounded-pill"
            style={{
              backgroundColor: "#fce4ef",
              color: "#d63384",
            }}
          >
            Artesanato
          </span>
        </div>

        <div className="row g-3">

          {[
            {
              nome: "Sabonete artesanal",
              descricao:
                "Uma criação artesanal para o cuidado diário com a pele.",
              imagem: loja.imagem2,
            },
            {
              nome: "Kit de sabonetes artesanais",
              descricao:
                "Uma opção especial para presentear ou cuidar de você.",
              imagem: loja.imagem3,
            },
          ].map((produto, index) => (

            <div className="col-12 col-sm-6" key={index}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">

                {produto.imagem ? (
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    style={{
                      width: "100%",
                      height: "190px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      height: "190px",
                      backgroundColor: "#fff0f6",
                      color: "#d63384",
                      fontSize: "3rem",
                    }}
                  >
                    <i className="bi bi-flower1"></i>
                  </div>
                )}

                <div className="card-body">

                  <h6 className="fw-bold" style={{ color: "#5d4037" }}>
                    {produto.nome}
                  </h6>

                  <p className="text-secondary small mb-2">
                    {produto.descricao}
                  </p>

                  <span className="small" style={{ color: "#d63384" }}>
                    <i className="bi bi-heart me-1"></i>
                    Produto artesanal
                  </span>

                </div>
              </div>
            </div>

          ))}

        </div>
      </>

    ) : (

      /* APRESENTAÇÃO DOS DEMAIS ESTABELECIMENTOS */
      <div
        className="text-center p-4 rounded-4"
        style={{ backgroundColor: "#fff5f9" }}
      >

        <span
          className="badge rounded-pill mb-3 px-3 py-2"
          style={{
            backgroundColor: "#fce4ef",
            color: "#d63384",
          }}
        >
          {loja.categoria}
        </span>

        <div>
          <i
            className="bi bi-stars"
            style={{
              fontSize: "2.8rem",
              color: "#d63384",
            }}
          ></i>
        </div>

        <h5 className="fw-bold mt-3" style={{ color: "#5d4037" }}>
          {loja.tipo_negocio === "loja"
            ? "Conheça nossos produtos"
            : loja.tipo_negocio === "restaurante"
            ? "Conheça nosso cardápio"
            : loja.tipo_negocio === "profissional"
            ? "Conheça nossas especialidades"
            : "Conheça nossos serviços"}
        </h5>

        <p className="text-secondary mb-3">
          {configuracao.descricao}
        </p>

        <p className="small text-secondary mb-0">
          Conheça melhor o trabalho e as opções deste estabelecimento.
        </p>

        {loja.link && (
          <a
            href={loja.link}
            target="_blank"
            rel="noreferrer"
            className="btn rounded-pill px-4 mt-3"
            style={{
              backgroundColor: "#d63384",
              color: "#fff",
            }}
          >
            <i className="bi bi-globe me-2"></i>
            Acessar site ou catálogo
          </a>
        )}

      </div>

    )}

    {/* LINK PARA O CATÁLOGO DA CAMOMILA */}
    {loja.slug === "camomila-sabonetes-artesanais" && loja.link && (
      <div className="text-center mt-4">
        <a
          href={loja.link}
          target="_blank"
          rel="noreferrer"
          className="btn rounded-pill px-4"
          style={{
            backgroundColor: "#d63384",
            color: "#fff",
          }}
        >
          <i className="bi bi-shop me-2"></i>
          Conhecer catálogo completo
        </a>
      </div>
    )}

  </section>
)}

{/* CONTEÚDO DA ABA FOTOS */}
{abaAtiva === "fotos" && (
  <section className="card border-0 shadow-sm rounded-4 p-4 mt-3">

    <h4 className="fw-bold mb-2" style={{ color: "#d63384" }}>
      <i className="bi bi-images me-2"></i>
      Galeria de fotos
    </h4>

    <p className="text-secondary mb-4">
      Conheça um pouco mais sobre nosso trabalho.
    </p>

    <div className="row g-3">

      {[loja.imagem2, loja.imagem3]
        .filter(Boolean)
        .map((foto, index) => (
          <div className="col-12 col-sm-6 col-md-4" key={index}>

            <div
              className="overflow-hidden rounded-4 shadow-sm"
              style={{ height: "220px" }}
            >
              <img
                src={foto}
                alt={`Foto ${index + 1} de ${loja.nome}`}
                className="w-100 h-100"
                style={{
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>

          </div>
        ))}

    </div>

    {!loja.imagem2 && !loja.imagem3 && (
      <div
        className="text-center py-5 rounded-4"
        style={{ backgroundColor: "#fff5f9" }}
      >
        <i
          className="bi bi-camera"
          style={{ fontSize: "3rem", color: "#d63384" }}
        ></i>

        <h5 className="fw-bold mt-3" style={{ color: "#5d4037" }}>
          Ainda não há fotos disponíveis
        </h5>

        <p className="text-secondary mb-0">
          Em breve, este estabelecimento poderá apresentar suas fotos aqui.
        </p>
      </div>
    )}

  </section>
)}

{/* CONTEÚDO DA ABA AVALIAÇÕES */}
{abaAtiva === "avaliacoes" && (
  <section className="card border-0 shadow-sm rounded-4 p-4 mt-3">

    <h4 className="fw-bold mb-3" style={{ color: "#d63384" }}>
      <i className="bi bi-star me-2"></i>
      Avaliações dos clientes
    </h4>

    {/* RESUMO DAS AVALIAÇÕES */}
    <div
      className="rounded-4 p-4 mb-4"
      style={{ backgroundColor: "#fff5f9" }}
    >
      <div className="d-flex align-items-center gap-3">

        <h2 className="fw-bold mb-0" style={{ color: "#5d4037" }}>
          {Number(loja.nota_media || 0).toFixed(1).replace(".", ",")}
        </h2>

        <div>
          <div className="text-warning fs-5">
            {[1, 2, 3, 4, 5].map((estrela) => (
              <i
                key={estrela}
                className={`bi ${
                  estrela <= Math.round(Number(loja.nota_media || 0))
                    ? "bi-star-fill"
                    : "bi-star"
                } me-1`}
              ></i>
            ))}
          </div>

          <small className="text-secondary">
            {loja.total_avaliacoes || 0} avaliações
          </small>
        </div>

      </div>
    </div>

    {/* COMENTÁRIOS PUBLICADOS */}
    <h5 className="fw-bold mb-3" style={{ color: "#5d4037" }}>
      O que nossos clientes dizem
    </h5>

    {carregandoAvaliacoes ? (
      <p className="text-secondary">Carregando avaliações...</p>
    ) : avaliacoes.length > 0 ? (

      <div className="d-flex flex-column gap-3 mb-4">

        {avaliacoes.map((avaliacao) => (
          <div
            key={avaliacao.id}
            className="border rounded-4 p-3"
          >
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">

              <strong style={{ color: "#5d4037" }}>
                {avaliacao.nome_cliente}
              </strong>

              <small className="text-secondary">
                {new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
              </small>

            </div>

            <div className="text-warning my-2">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <i
                  key={estrela}
                  className={`bi ${
                    estrela <= avaliacao.nota
                      ? "bi-star-fill"
                      : "bi-star"
                  } me-1`}
                ></i>
              ))}
            </div>

            <p className="text-secondary mb-0">
              {avaliacao.comentario}
            </p>

          </div>
        ))}

      </div>

    ) : (
      <div
        className="text-center py-4 rounded-4 mb-4"
        style={{ backgroundColor: "#fff5f9" }}
      >
        <i
          className="bi bi-chat-heart"
          style={{ fontSize: "2.5rem", color: "#d63384" }}
        ></i>

        <p className="text-secondary mt-2 mb-0">
          Este estabelecimento ainda não possui comentários publicados.
        </p>
      </div>
    )}

    {/* FORMULÁRIO DE AVALIAÇÃO */}
    <div className="border-top pt-4">

      <h5 className="fw-bold mb-2" style={{ color: "#5d4037" }}>
        Avalie sua experiência!
      </h5>

      <p className="text-secondary small">
        Sua opinião ajuda outras pessoas a conhecerem este estabelecimento.
      </p>

      <form onSubmit={enviarAvaliacao}>

        <div className="mb-3">

          <label className="form-label fw-semibold">
            Seu nome
          </label>

          <input
            type="text"
            className="form-control rounded-3"
            placeholder="Digite seu nome"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            maxLength={80}
            required
          />

        </div>

        <div className="mb-3">

          <label className="form-label fw-semibold d-block">
            Sua avaliação
          </label>

          <div className="d-flex gap-2">

            {[1, 2, 3, 4, 5].map((estrela) => (
              <button
                key={estrela}
                type="button"
                onClick={() => setNotaSelecionada(estrela)}
                className="btn p-0 border-0"
                style={{
                  color: estrela <= notaSelecionada ? "#f5b301" : "#ccc",
                  fontSize: "2rem",
                }}
                aria-label={`${estrela} estrelas`}
              >
                <i
                  className={`bi ${
                    estrela <= notaSelecionada
                      ? "bi-star-fill"
                      : "bi-star"
                  }`}
                ></i>
              </button>
            ))}

          </div>

        </div>

        <div className="mb-3">

          <label className="form-label fw-semibold">
            Conte como foi sua experiência
          </label>

          <textarea
            className="form-control rounded-3"
            rows="4"
            placeholder="Escreva seu comentário..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={1000}
            required
          ></textarea>

          <small className="text-secondary">
            {comentario.length}/1000 caracteres
          </small>

        </div>

        {mensagemAvaliacao && (
          <div className="alert alert-info py-2">
            {mensagemAvaliacao}
          </div>
        )}

        <button
          type="submit"
          className="btn rounded-pill px-4 py-2 fw-semibold"
          disabled={enviandoAvaliacao || notaSelecionada === 0}
          style={{
            backgroundColor: "#d63384",
            color: "#fff",
          }}
        >
          {enviandoAvaliacao ? (
            "Enviando..."
          ) : (
            <>
              <i className="bi bi-send me-2"></i>
              Enviar avaliação
            </>
          )}
        </button>

      </form>

      <small className="text-secondary d-block mt-3">
        As avaliações passam por aprovação antes de serem publicadas.
      </small>

    </div>

  </section>
)}


{/* CONTEÚDO DA ABA INFORMAÇÕES */}
{abaAtiva === "informacoes" && (
  <section className="card border-0 shadow-sm rounded-4 p-4 mt-3">

    <h4 className="fw-bold mb-4" style={{ color: "#d63384" }}>
      <i className="bi bi-info-circle me-2"></i>
      Informações do estabelecimento
    </h4>

    {/* LOCALIZAÇÃO */}
    <div className="mb-4">
      <h5 className="fw-bold mb-3" style={{ color: "#5d4037" }}>
        <i className="bi bi-geo-alt-fill me-2" style={{ color: "#d63384" }}></i>
        Localização
      </h5>

      <div className="p-3 rounded-4" style={{ backgroundColor: "#fff5f9" }}>

        {loja.endereco && (
          <p className="mb-2 text-secondary">
            <strong>
        {/vendas online|encomendas|atendimento online/i.test(loja.endereco)
            ? "Atendimento:"
            : "Endereço:"}
        </strong>{" "}
        {loja.endereco}
          </p>
        )}

        {loja.bairro && (
          <p className="mb-2 text-secondary">
            <strong>Bairro:</strong> {loja.bairro}
          </p>
        )}

        {loja.regiao && (
          <p className="mb-0 text-secondary">
            <strong>Cidade:</strong> {loja.regiao}
          </p>
        )}

        {!loja.endereco && !loja.bairro && !loja.regiao && (
          <p className="text-secondary mb-0">
            Endereço ainda não informado.
          </p>
        )}

      </div>

      {loja.endereco &&
        !/vendas online|encomendas|atendimento online/i.test(loja.endereco) && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [loja.endereco, loja.bairro, loja.regiao].filter(Boolean).join(", ")
          )}`}
          target="_blank"
          rel="noreferrer"
          className="btn rounded-pill mt-3 px-4"
          style={{
            border: "1px solid #d63384",
            color: "#d63384",
          }}
        >
          <i className="bi bi-map me-2"></i>
          Ver localização no mapa
        </a>
      )}
    </div>

    {/* CATEGORIA E ATIVIDADE */}
    <div className="mb-3">
      <h5 className="fw-bold mb-3" style={{ color: "#5d4037" }}>
        <i className="bi bi-shop me-2" style={{ color: "#d63384" }}></i>
        Atividade do estabelecimento
      </h5>

      <div className="d-flex flex-wrap gap-2">
        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            backgroundColor: "#fce4ef",
            color: "#d63384",
          }}
        >
          {loja.categoria}
        </span>

        {loja.tipo_negocio && (
          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              backgroundColor: "#fff0db",
              color: "#8a5a25",
            }}
          >
            {loja.tipo_negocio}
          </span>
        )}
      </div>
    </div>

  </section>
)}

{/* CONTEÚDO DA ABA CONTATO */}
{abaAtiva === "contato" && (
  <section className="card border-0 shadow-sm rounded-4 p-4 mt-3">

    <h4 className="fw-bold mb-2" style={{ color: "#d63384" }}>
      <i className="bi bi-telephone me-2"></i>
      Entre em contato
    </h4>

    <p className="text-secondary mb-4">
      Fale diretamente com {loja.nome}.
    </p>

    {/* WHATSAPP */}
    {loja.whatsapp && (
      <a
        href={
          loja.whatsapp.startsWith("http")
            ? loja.whatsapp
            : `https://wa.me/${loja.whatsapp.replace(/\D/g, "")}`
        }
        target="_blank"
        rel="noreferrer"
        className="btn rounded-4 p-3 mb-3 text-white d-flex align-items-center gap-3"
        style={{ backgroundColor: "#25D366" }}
      >
        <i className="bi bi-whatsapp fs-3"></i>
        <span className="fw-semibold">Conversar pelo WhatsApp</span>
      </a>
    )}

    {/* INSTAGRAM */}
    {loja.instagram && (
      <a
        href={
          loja.instagram.startsWith("http")
            ? loja.instagram
            : `https://instagram.com/${loja.instagram.replace("@", "")}`
        }
        target="_blank"
        rel="noreferrer"
        className="btn rounded-4 p-3 mb-3 text-white d-flex align-items-center gap-3"
        style={{
          background: "linear-gradient(45deg, #f09433, #dc2743, #bc1888)",
        }}
      >
        <i className="bi bi-instagram fs-3"></i>
        <span className="fw-semibold">Acompanhar no Instagram</span>
      </a>
    )}

    {/* SITE EXTERNO */}
    {loja.link && (
      <a
        href={loja.link}
        target="_blank"
        rel="noreferrer"
        className="btn rounded-4 p-3 mb-3 d-flex align-items-center gap-3"
        style={{
          border: "1px solid #d63384",
          color: "#d63384",
        }}
      >
        <i className="bi bi-globe fs-3"></i>
        <span className="fw-semibold">Visitar site ou catálogo</span>
      </a>
    )}

    {/* COMPARTILHAMENTO */}
    <div
      className="rounded-4 p-4 mt-3"
      style={{ backgroundColor: "#fff5f9" }}
    >
      <div className="text-center">

        <i
          className="bi bi-share"
          style={{ fontSize: "2.5rem", color: "#d63384" }}
        ></i>

        <h5 className="fw-bold mt-2" style={{ color: "#5d4037" }}>
          Compartilhe esta página
        </h5>

        <p className="text-secondary small">
          Divulgue {loja.nome} para outras pessoas.
        </p>

        <button
          type="button"
          className="btn rounded-pill px-4"
          style={{
            backgroundColor: "#d63384",
            color: "#fff",
          }}
          onClick={async () => {
            const url = window.location.href;

            try {
              if (navigator.share) {
                await navigator.share({
                  title: loja.nome,
                  text: `Conheça ${loja.nome} no Hub Serviços!`,
                  url,
                });
              } else {
                await navigator.clipboard.writeText(url);
                alert("Link copiado com sucesso!");
              }
            } catch (error) {
              if (error.name !== "AbortError") {
                console.error("Erro ao compartilhar:", error);
                alert("Não foi possível compartilhar o link.");
              }
            }
          }}
        >
          <i className="bi bi-share me-2"></i>
          Compartilhar página
        </button>

      </div>
    </div>

    {!loja.whatsapp && !loja.instagram && !loja.link && (
      <p className="text-secondary small text-center mt-3">
        Os canais de contato ainda não foram cadastrados.
      </p>
    )}

  </section>
)}

  </main>
);

}

export default PaginaPremium;