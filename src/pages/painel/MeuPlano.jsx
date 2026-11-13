import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function MeuPlano() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [lojista, setLojista] = useState(null);
  const [assinatura, setAssinatura] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [planoDesejado, setPlanoDesejado] = useState("");

  useEffect(() => {
    const buscarDadosFinanceiros = async () => {
      try {
        const {
          data: { user },
          error: erroUsuario
        } = await supabase.auth.getUser();

        if (erroUsuario || !user) {
          throw new Error("Faça login para consultar suas informações.");
        }

        // BUSCAR ESTABELECIMENTO DO USUÁRIO
        const { data: negocio, error: erroNegocio } = await supabase
          .from("servicos")
          .select("id, nome, plano")
          .eq("user_id", user.id)
          .maybeSingle();

        if (erroNegocio) throw erroNegocio;

        if (!negocio) {
          throw new Error("Não encontramos seu estabelecimento.");
        }

        setLojista(negocio);

        // BUSCAR ASSINATURAS DO ESTABELECIMENTO
        const { data: assinaturas, error: erroAssinaturas } =
          await supabase
            .from("assinaturas")
            .select(`
              id,
              loja_id,
              plano,
              periodicidade,
              tipo_contrato,
              valor_ciclo,
              status,
              inicio_contrato,
              fim_em,
              observacoes,
              dia_vencimento,
              created_at
            `)
            .eq("loja_id", negocio.id)
            .order("created_at", { ascending: false });

        if (erroAssinaturas) throw erroAssinaturas;

        const listaAssinaturas = assinaturas || [];

        // PRIORIZAR ASSINATURA ATIVA
        const assinaturaAtual =
          listaAssinaturas.find(
            (item) =>
              item.status === "active" ||
              item.status === "ativa"
          ) || listaAssinaturas[0] || null;

        setAssinatura(assinaturaAtual);

        // BUSCAR HISTÓRICO DE PAGAMENTOS
        if (listaAssinaturas.length > 0) {
          const idsAssinaturas = listaAssinaturas.map(
            (item) => item.id
          );

          const { data: historico, error: erroPagamentos } =
            await supabase
              .from("pagamentos")
              .select(`
                id,
                assinatura_id,
                competencia,
                valor,
                vencimento_em,
                pago_em,
                status,
                forma_pagamento,
                referencia,
                observacoes
              `)
              .in("assinatura_id", idsAssinaturas)
              .order("competencia", { ascending: false });

          if (erroPagamentos) throw erroPagamentos;

          setPagamentos(historico || []);
        }

      } catch (error) {
        console.error("Erro ao consultar plano:", error);
        setErro(error.message || "Não foi possível carregar os dados.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosFinanceiros();
  }, []);

  const formatarMoeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  const formatarData = (valor) => {
    if (!valor) return "Não informado";

    const data =
      String(valor).length === 10
        ? new Date(`${valor}T12:00:00`)
        : new Date(valor);

    if (Number.isNaN(data.getTime())) return "Não informado";

    return data.toLocaleDateString("pt-BR");
  };

  const nomePlano = (plano) => {
  const nomes = {
    free: "Básico gratuito",
    premium: "Premium",
    gold: "Gold"
  };

  return nomes[plano] || plano || "Não informado";
};

const solicitarMudancaPlano = () => {
  if (!planoDesejado || !lojista) return;

  const planos = {
    free: "Free (gratuito)",
    premium: "Premium - R$ 39,90/mês",
    gold: "Gold - R$ 89,90/mês"
  };

  const planoAtual = nomePlano(lojista.plano);
  const novoPlano = planos[planoDesejado];

  const mensagem = `
Olá! Gostaria de solicitar uma mudança de plano no Hub Serviços.

Estabelecimento: ${lojista.nome}
Plano atual: ${planoAtual}
Plano desejado: ${novoPlano}

Aguardo orientações sobre a alteração.
  `;

  const url = `https://wa.me/5511971128269?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank", "noopener,noreferrer");
};



  const nomeStatus = (status) => {
    const nomes = {
      active: "Ativa",
      ativa: "Ativa",
      suspended: "Suspensa",
      suspensa: "Suspensa",
      cancelled: "Cancelada",
      cancelled_by_user: "Cancelada",
      ended: "Encerrada",
      pago: "Pago",
      pendente: "Pendente",
      atrasado: "Atrasado",
      cancelado: "Cancelado",
      cancelada: "Cancelado"
    };

    return nomes[status] || status || "Não informado";
  };

  const statusPagamento = (pagamento) => {
    if (
      pagamento.status === "pendente" &&
      pagamento.vencimento_em
    ) {
      const vencimento = new Date(
        `${pagamento.vencimento_em}T23:59:59`
      );

      if (vencimento < new Date()) {
        return "atrasado";
      }
    }

    return pagamento.status;
  };

  const classeStatus = (status) => {
    if (status === "pago" || status === "active" || status === "ativa") {
      return "bg-success";
    }

    if (status === "atrasado") {
      return "bg-danger";
    }

    if (status === "pendente" || status === "suspended") {
      return "bg-warning text-dark";
    }

    return "bg-secondary";
  };

  const cobrancaAberta = pagamentos
    .filter(
      (item) =>
        item.status === "pendente" ||
        item.status === "atrasado"
    )
    .filter((item) => item.vencimento_em)
    .sort(
      (a, b) =>
        new Date(a.vencimento_em) -
        new Date(b.vencimento_em)
    )[0];

  if (carregando) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border"
          style={{ color: "#d63384" }}
        />
        <p className="mt-3 text-secondary">
          Carregando suas informações financeiras...
        </p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          {erro}
        </div>

        <button
          className="btn btn-outline-secondary rounded-pill"
          onClick={() => navigate("/painel/lojista")}
        >
          Voltar à Central
        </button>
      </div>
    );
  }

  return (
    <main className="container py-4" style={{ maxWidth: "1000px" }}>

      <button
        type="button"
        className="btn btn-outline-secondary rounded-pill mb-4"
        onClick={() => navigate("/painel/lojista")}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Voltar à Central
      </button>

      {/* CABEÇALHO */}
      <div
        className="rounded-4 p-4 p-md-5 text-white mb-4"
        style={{
          background: "linear-gradient(115deg, #d63384, #ed75aa, #f4c45e)"
        }}
      >
        <span className="badge bg-light text-dark mb-2">
          ÁREA FINANCEIRA
        </span>

        <h2 className="fw-bold mb-2">
          Meu Plano e Investimento
        </h2>

        <p className="mb-0">
          Acompanhe seu plano, pagamentos e vencimentos no Hub Serviços.
        </p>
      </div>

      {/* PLANO ATUAL */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">

        <h5 className="fw-bold mb-3" style={{ color: "#d63384" }}>
          <i className="bi bi-gem me-2"></i>
          Meu plano atual
        </h5>

        <h3 className="fw-bold" style={{ color: "#5d4037" }}>
          {nomePlano(lojista.plano)}
        </h3>

        <p className="text-secondary mb-0">
          Estabelecimento: {lojista.nome}
        </p>

        {assinatura ? (
          <div className="mt-4">

            <div className="row g-3">

              <div className="col-md-4">
                <small className="text-secondary">
                  Valor do contrato
                </small>
                <h5 className="fw-bold mb-0">
                  {formatarMoeda(assinatura.valor_ciclo)}
                </h5>
              </div>

              <div className="col-md-4">
                <small className="text-secondary">
                  Periodicidade
                </small>
                <h5 className="fw-bold mb-0 text-capitalize">
                  {assinatura.periodicidade}
                </h5>
              </div>

              <div className="col-md-4">
                <small className="text-secondary">
                  Tipo de contrato
                </small>
                <h5 className="fw-bold mb-0 text-capitalize">
                  {assinatura.tipo_contrato}
                </h5>
              </div>

              <div className="col-md-4">
                <small className="text-secondary">
                  Situação
                </small>
                <div>
                  <span
                    className={`badge ${classeStatus(assinatura.status)}`}
                  >
                    {nomeStatus(assinatura.status)}
                  </span>
                </div>
              </div>

              <div className="col-md-4">
                <small className="text-secondary">
                  Início do contrato
                </small>
                <h6 className="fw-bold">
                  {formatarData(assinatura.inicio_contrato)}
                </h6>
              </div>

              <div className="col-md-4">
                <small className="text-secondary">
                  Fim do contrato
                </small>
                <h6 className="fw-bold">
                  {formatarData(assinatura.fim_em)}
                </h6>
              </div>

            </div>
          </div>
        ) : (
          <div className="alert alert-light border mt-3 mb-0">
            Seu plano está cadastrado no Hub, mas ainda não existe
            um contrato financeiro registrado para este estabelecimento.
            <p className="small text-secondary mb-0 mt-2">
              Em caso de cortesia ou contratação anterior,
              consulte a administração.
            </p>
          </div>
        )}
      </div>

      {/* PRÓXIMO VENCIMENTO */}
      {assinatura && cobrancaAberta && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">

          <h5 className="fw-bold mb-3" style={{ color: "#d63384" }}>
            <i className="bi bi-calendar-event me-2"></i>
            Próxima cobrança registrada
          </h5>

          <h3 className="fw-bold">
            {formatarMoeda(cobrancaAberta.valor)}
          </h3>

          <p className="text-secondary mb-2">
            Vencimento: {formatarData(cobrancaAberta.vencimento_em)}
          </p>

          <span
            className={`badge ${classeStatus(
              statusPagamento(cobrancaAberta)
            )}`}
          >
            {nomeStatus(statusPagamento(cobrancaAberta))}
          </span>

        </div>
      )}

      {/* HISTÓRICO DE PAGAMENTOS */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">

        <h5 className="fw-bold mb-3" style={{ color: "#d63384" }}>
          <i className="bi bi-receipt me-2"></i>
          Histórico de pagamentos
        </h5>

        {pagamentos.length > 0 ? (

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>Competência</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Forma</th>
                  <th>Situação</th>
                </tr>
              </thead>

              <tbody>
                {pagamentos.map((item) => (
                  <tr key={item.id}>

                    <td>
                      {formatarData(item.competencia)}
                    </td>

                    <td className="fw-semibold">
                      {formatarMoeda(item.valor)}
                    </td>

                    <td>
                      {formatarData(item.vencimento_em)}
                    </td>

                    <td>
                      {formatarData(item.pago_em)}
                    </td>

                    <td className="text-capitalize">
                      {item.forma_pagamento || "—"}
                    </td>

                    <td>
                      <span
                        className={`badge ${classeStatus(
                          statusPagamento(item)
                        )}`}
                      >
                        {nomeStatus(statusPagamento(item))}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        ) : (
          <div className="text-center py-4">
            <i
              className="bi bi-receipt"
              style={{ fontSize: "2.5rem", color: "#d63384" }}
            ></i>

            <p className="text-secondary mt-2 mb-0">
              Ainda não existem pagamentos registrados.
            </p>
          </div>
        )}

      </div>

      
    {/* SOLICITAÇÃO DE MUDANÇA DE PLANO */}
    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
    <h5 className="fw-bold mb-2" style={{ color: "#d63384" }}>
        <i className="bi bi-arrow-left-right me-2"></i>
        Quer mudar de plano?
    </h5>

    <p className="text-secondary">
        Escolha o plano que melhor atende às necessidades do seu negócio.
        Sua solicitação será enviada diretamente à administração do Hub Serviços.
    </p>

    <div className="mb-3">
        <label className="form-label fw-semibold">
        Selecione o plano desejado
        </label>

        <select
        className="form-select rounded-3"
        value={planoDesejado}
        onChange={(e) => setPlanoDesejado(e.target.value)}
        >
        <option value="">Escolha um plano...</option>
        <option value="free">Free — Gratuito</option>
        <option value="premium">Premium — R$ 39,90/mês</option>
        <option value="gold">Gold — R$ 89,90/mês</option>
        </select>
    </div>

    {planoDesejado && (
        <div className="alert alert-light border rounded-3">
        <strong>Plano atual:</strong> {nomePlano(lojista.plano)}
        <br />
        <strong>Plano desejado:</strong>{" "}
        {planoDesejado === "free"
            ? "Free (gratuito)"
            : planoDesejado === "premium"
            ? "Premium"
            : "Gold"}
        </div>
    )}

    <button
        type="button"
        className="btn rounded-3 fw-semibold text-white"
        style={{ backgroundColor: "#25D366" }}
        onClick={solicitarMudancaPlano}
        disabled={!planoDesejado || planoDesejado === lojista.plano}
    >
        <i className="bi bi-whatsapp me-2"></i>
        Solicitar mudança pelo WhatsApp
    </button>

    <small className="text-secondary mt-3">
        A mudança não será automática. A administração entrará em contato
        para confirmar a solicitação e realizar a atualização.
    </small>
    </div>


    </main>
  );
}

export default MeuPlano;