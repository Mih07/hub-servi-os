
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function PlanosAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [assinaturaEditando, setAssinaturaEditando] = useState(null);
  const [pagamentoRegistrando, setPagamentoRegistrando] = useState(null);
  const [formPagamento, setFormPagamento] = useState({
    valor: "",
    dataPagamento: new Date().toISOString().slice(0, 10),
    formaPagamento: "pix",
    observacoes: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth()
  );
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );

  const [filtroCobranca, setFiltroCobranca] = useState("todos");

  const navigate = useNavigate();

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  useEffect(() => {
    const buscarDadosFinanceiros = async () => {
      setCarregando(true);

      const [resultadoEmpresas, resultadoAssinaturas, resultadoPagamentos] =
        await Promise.all([
          supabase
            .from("servicos")
            .select("id, nome, plano, status, aprovado"),

          supabase
            .from("assinaturas")
            .select("*")
            .order("created_at", { ascending: false }),

          supabase
            .from("pagamentos")
            .select("*")
            .order("vencimento_em", { ascending: false })
        ]);

      const erros = [
        resultadoEmpresas.error,
        resultadoAssinaturas.error,
        resultadoPagamentos.error
      ].filter(Boolean);

      if (erros.length > 0) {
        console.error("Erro ao buscar dados financeiros:", erros);
        setErro(erros.map((item) => item.message).join(" | "));
      }

      setEmpresas(resultadoEmpresas.data || []);
      setAssinaturas(resultadoAssinaturas.data || []);
      setPagamentos(resultadoPagamentos.data || []);

      setCarregando(false);
    };

    buscarDadosFinanceiros();
  }, []);

  const formatarMoeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  const abrirEdicao = (assinatura) => {
    setMensagem("");
    setAssinaturaEditando({ ...assinatura });
  };

  const abrirRegistroPagamento = (assinatura) => {
    setMensagem("");
    setPagamentoRegistrando(assinatura);
    setFormPagamento({
      valor: String(assinatura.valor_ciclo || ""),
      dataPagamento: new Date().toISOString().slice(0, 10),
      formaPagamento: "pix",
      observacoes: ""
    });
  };

  const registrarPagamento = async (e) => {
    e.preventDefault();
    if (!pagamentoRegistrando) return;

    setSalvando(true);
    setMensagem("");

    const dataPagamento = formPagamento.dataPagamento;
    const competencia = `${dataPagamento.slice(0, 7)}-01`;
    const dadosPagamento = {
      assinatura_id: pagamentoRegistrando.id,
      competencia,
      valor: Number(formPagamento.valor || 0),
      pago_em: new Date(`${dataPagamento}T12:00:00`).toISOString(),
      status: "pago",
      forma_pagamento: formPagamento.formaPagamento,
      observacoes: formPagamento.observacoes.trim() || null
    };

    // Se a cobrança da assinatura para essa competência já existe,
    // atualizamos a linha existente em vez de inserir uma duplicada.
    const { data: cobrancaExistente, error: erroBusca } = await supabase
      .from("pagamentos")
      .select("id, vencimento_em")
      .eq("assinatura_id", pagamentoRegistrando.id)
      .eq("competencia", competencia)
      .maybeSingle();

    if (erroBusca) {
      console.error("Erro ao localizar cobrança existente:", erroBusca);
      setMensagem(`Não foi possível localizar a cobrança: ${erroBusca.message}`);
      setSalvando(false);
      return;
    }

    // Preserva vencimento original, se a cobrança já havia sido gerada.
    if (cobrancaExistente?.vencimento_em) {
      dadosPagamento.vencimento_em = cobrancaExistente.vencimento_em;
    } else {
      dadosPagamento.vencimento_em = dataPagamento;
    }

    const consultaSalvar = cobrancaExistente
      ? supabase
          .from("pagamentos")
          .update(dadosPagamento)
          .eq("id", cobrancaExistente.id)
          .select()
          .single()
      : supabase
          .from("pagamentos")
          .insert(dadosPagamento)
          .select()
          .single();

    const { data, error } = await consultaSalvar;

    if (error) {
      console.error("Erro ao registrar pagamento:", error);
      setMensagem(`Não foi possível registrar o pagamento: ${error.message}`);
      setSalvando(false);
      return;
    }

    setPagamentos((anteriores) => {
      const jaExiste = anteriores.some((item) => String(item.id) === String(data.id));
      return jaExiste
        ? anteriores.map((item) => String(item.id) === String(data.id) ? data : item)
        : [data, ...anteriores];
    });
    setPagamentoRegistrando(null);
    setMensagem("Pagamento registrado com sucesso!");
    setSalvando(false);
  };

  // AÇÕES ADMINISTRATIVAS DE COBRANÇA
  const excluirRegistroPagamento = async (item) => {
    const nomeEmpresa = item.empresa?.nome || `Empresa ID ${item.assinatura?.loja_id || "—"}`;
    const confirmado = window.confirm(
      `Excluir definitivamente o registro de ${formatarMoeda(item.valor)} de ${nomeEmpresa}?\n\nEsta ação é indicada para limpar pagamentos de teste e não pode ser desfeita.`
    );
    if (!confirmado) return;

    setMensagem("");
    const { error } = await supabase.from("pagamentos").delete().eq("id", item.id);
    if (error) {
      console.error("Erro ao excluir registro de pagamento:", error);
      setMensagem(`Não foi possível excluir o registro: ${error.message}`);
      return;
    }

    setPagamentos((anteriores) => anteriores.filter((registro) => String(registro.id) !== String(item.id)));
    setMensagem("Registro financeiro excluído. Os totais foram atualizados.");
  };

  const cancelarCobranca = async (item) => {
    const confirmado = window.confirm(
      `Cancelar a cobrança de ${formatarMoeda(item.valor)} para ${item.empresa?.nome || "esta empresa"}?\n\nA cobrança será mantida no histórico como cancelada e deixará de contar como valor em aberto.`
    );
    if (!confirmado) return;

    setMensagem("");
    const { data, error } = await supabase
      .from("pagamentos")
      .update({ status: "cancelado" })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao cancelar cobrança:", error);
      setMensagem(`Não foi possível cancelar a cobrança: ${error.message}`);
      return;
    }

    setPagamentos((anteriores) => anteriores.map((registro) => String(registro.id) === String(data.id) ? data : registro));
    setMensagem("Cobrança cancelada. Os totais foram atualizados.");
  };

  const estornarPagamento = async (item) => {
    const confirmado = window.confirm(
      `Estornar o pagamento de ${formatarMoeda(item.valor)} de ${item.empresa?.nome || "esta empresa"}?\n\nO registro será preservado no histórico, mas deixará de contar como recebido.`
    );
    if (!confirmado) return;

    const observacaoAnterior = String(item.observacoes || "").trim();
    const notaEstorno = `ESTORNO: pagamento revertido pela administradora em ${new Date().toLocaleDateString("pt-BR")}`;
    const observacoes = observacaoAnterior
      ? `${observacaoAnterior}\n${notaEstorno}`
      : notaEstorno;

    setMensagem("");
    const { data, error } = await supabase
      .from("pagamentos")
      .update({ status: "cancelado", observacoes })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao estornar pagamento:", error);
      setMensagem(`Não foi possível estornar o pagamento: ${error.message}`);
      return;
    }

    setPagamentos((anteriores) => anteriores.map((registro) => String(registro.id) === String(data.id) ? data : registro));
    setMensagem("Pagamento estornado. O histórico foi preservado e os totais foram atualizados.");
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    if (!assinaturaEditando) return;

    setSalvando(true);
    setMensagem("");

    // O plano Free não gera cobrança.
    const planoSelecionado = assinaturaEditando.plano;
    const dadosAtualizados = {
      plano: planoSelecionado,
      periodicidade: assinaturaEditando.periodicidade,
      dia_vencimento: Number(assinaturaEditando.dia_vencimento || 8),
      tipo_contrato:
        planoSelecionado === "free"
          ? "demonstrativo"
          : assinaturaEditando.tipo_contrato,
      valor_ciclo:
        planoSelecionado === "free"
          ? 0
          : Number(assinaturaEditando.valor_ciclo || 0),
      status: assinaturaEditando.status,
      observacoes: assinaturaEditando.observacoes || null
    };

    // Atualiza o plano da empresa na tabela servicos, que é usada pelo Hub.
    const { error: erroEmpresa } = await supabase
      .from("servicos")
      .update({ plano: planoSelecionado })
      .eq("id", assinaturaEditando.loja_id);

    if (erroEmpresa) {
      console.error("Erro ao atualizar plano da empresa:", erroEmpresa);
      setMensagem(`Não foi possível atualizar o plano da empresa: ${erroEmpresa.message}`);
      setSalvando(false);
      return;
    }

    // Atualiza os detalhes da assinatura financeira.
    const { error } = await supabase
      .from("assinaturas")
      .update(dadosAtualizados)
      .eq("id", assinaturaEditando.id);

    if (error) {
      console.error("Erro ao atualizar assinatura:", error);
      setMensagem(
        `O plano da empresa foi atualizado, mas houve um erro ao salvar a assinatura: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    // Atualiza também as cobranças ainda não pagas dessa assinatura para o novo dia escolhido.
    const cobrançasAjustar = pagamentos.filter(
      (pagamento) =>
        String(pagamento.assinatura_id) === String(assinaturaEditando.id) &&
        (pagamento.status === "pendente" || pagamento.status === "atrasado")
    );

    const atualizacoesCobrancas = await Promise.all(
      cobrançasAjustar.map(async (pagamento) => {
        const competencia = String(pagamento.competencia || "").slice(0, 10);
        if (!competencia) return { data: null, error: null, id: pagamento.id };
        const [ano, mes] = competencia.split("-").map(Number);
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dia = Math.min(Number(dadosAtualizados.dia_vencimento), ultimoDia);
        const vencimento = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        const statusCobranca = vencimento < new Date().toLocaleDateString("en-CA") ? "atrasado" : "pendente";
        const { data, error: erroPagamento } = await supabase
          .from("pagamentos")
          .update({ vencimento_em: vencimento, status: statusCobranca })
          .eq("id", pagamento.id)
          .select()
          .single();
        return { data, error: erroPagamento, id: pagamento.id };
      })
    );

    const errosCobrancas = atualizacoesCobrancas.filter((resultado) => resultado.error);
    setPagamentos((anteriores) =>
      anteriores.map((pagamento) => {
        const atualizacao = atualizacoesCobrancas.find(
          (resultado) => String(resultado.id) === String(pagamento.id) && resultado.data
        );
        return atualizacao ? { ...pagamento, ...atualizacao.data } : pagamento;
      })
    );

    setEmpresas((anteriores) =>
      anteriores.map((empresa) =>
        String(empresa.id) === String(assinaturaEditando.loja_id)
          ? { ...empresa, plano: planoSelecionado }
          : empresa
      )
    );

    setAssinaturas((anteriores) =>
      anteriores.map((item) =>
        item.id === assinaturaEditando.id
          ? { ...item, ...dadosAtualizados }
          : item
      )
    );

    setAssinaturaEditando(null);
    setMensagem(
      errosCobrancas.length > 0
        ? "Assinatura atualizada, mas houve falha ao ajustar uma ou mais cobranças pendentes."
        : "Plano, assinatura e vencimentos das cobranças em aberto atualizados com sucesso!"
    );
    setSalvando(false);
  };

  const anoAtual = new Date().getFullYear();
  // Permite consultar anos anteriores e planejar os próximos anos,
  // além de incluir anos que já apareçam nos registros financeiros.
  const anosDisponiveis = [
    ...new Set([
      ...Array.from({ length: 11 }, (_, indice) => anoAtual - 5 + indice),
      ...pagamentos.flatMap((item) => {
        const anos = [];
        if (item.pago_em) anos.push(new Date(item.pago_em).getFullYear());
        if (item.competencia) anos.push(Number(String(item.competencia).slice(0, 4)));
        return anos.filter((ano) => Number.isFinite(ano));
      })
    ])
  ].sort((a, b) => b - a);

  // EMPRESAS APROVADAS
const empresasAprovadas = empresas.filter(
  (empresa) =>
    empresa.status === "aprovado" &&
    empresa.aprovado === true
);

// QUANTIDADE DE EMPRESAS POR PLANO
const totalFree = empresasAprovadas.filter(
  (empresa) => !empresa.plano || empresa.plano === "free"
).length;

const totalPremium = empresasAprovadas.filter(
  (empresa) => empresa.plano === "premium"
).length;

const totalGold = empresasAprovadas.filter(
  (empresa) => empresa.plano === "gold"
).length;

// CADASTROS AGUARDANDO APROVAÇÃO
const totalPendentes = empresas.filter(
  (empresa) => empresa.status === "pendente"
).length;
  

  // ASSINATURAS POR TIPO
  const assinaturasAtivas = assinaturas.filter(
    (item) => item.status === "active" || item.status === "ativa"
  );

  const totalPagas = assinaturasAtivas.filter(
    (item) => item.tipo_contrato === "pago"
  ).length;

  const totalBonificadas = assinaturasAtivas.filter(
    (item) => item.tipo_contrato === "bonificado"
  ).length;

  const totalDemonstrativas = assinaturasAtivas.filter(
    (item) => item.tipo_contrato === "demonstrativo"
  ).length;

  // RECEITA MENSAL RECORRENTE ESTIMADA
  const receitaMensalPrevista = assinaturasAtivas
    .filter((item) => item.tipo_contrato === "pago")
    .reduce((total, item) => {
      const valor = Number(item.valor_ciclo || 0);

      return total + (
        item.periodicidade === "anual"
          ? valor / 12
          : valor
      );
    }, 0);

  // PAGAMENTOS DO MÊS SELECIONADO
  const pagamentosDoMes = pagamentos.filter((item) => {
    if (!item.pago_em || item.status !== "pago") {
      return false;
    }

    const data = new Date(item.pago_em);

    return (
      data.getMonth() === Number(mesSelecionado) &&
      data.getFullYear() === Number(anoSelecionado)
    );
  });

  const totalRecebido = pagamentosDoMes.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  // FECHAMENTO FINANCEIRO DO ANO SELECIONADO
  const pagamentosRecebidosNoAno = pagamentos.filter((item) => {
    if (!item.pago_em || item.status !== "pago") return false;
    return new Date(item.pago_em).getFullYear() === Number(anoSelecionado);
  });

  const totalRecebidoNoAno = pagamentosRecebidosNoAno.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  // RECEITA RECEBIDA POR MÊS (PARA O GRÁFICO ANUAL)
  const receitaPorMes = meses.map((nomeMes, indiceMes) => {
    const totalMes = pagamentos.filter((item) => {
      if (!item.pago_em || item.status !== "pago") return false;
      const dataPagamento = new Date(item.pago_em);
      return (
        dataPagamento.getMonth() === indiceMes &&
        dataPagamento.getFullYear() === Number(anoSelecionado)
      );
    }).reduce((total, item) => total + Number(item.valor || 0), 0);

    return { nome: nomeMes.slice(0, 3), total: totalMes };
  });

  const maiorReceitaMensal = Math.max(
    ...receitaPorMes.map((item) => item.total),
    1
  );

  const cobrancasDoAno = pagamentos.filter((item) => {
    const competencia = item.competencia ? String(item.competencia).slice(0, 10) : "";
    return competencia.startsWith(`${anoSelecionado}-`);
  });

  const totalCobradoNoAno = cobrancasDoAno.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const totalEmAbertoNoAno = cobrancasDoAno
    .filter((item) => {
      if (item.status === "pago" || item.status === "cancelado" || item.status === "cancelada") return false;
      const vencimento = item.vencimento_em ? String(item.vencimento_em).slice(0, 10) : "";
      return true;
    })
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  // VALORES EM ABERTO
  const pagamentosPendentes = pagamentos.filter(
    (item) =>
      item.status === "pendente" ||
      item.status === "atrasado"
  );

  const totalEmAberto = pagamentosPendentes.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  // CONTROLE INDIVIDUAL DE COBRANÇAS DO MÊS SELECIONADO
  const hojeISO = new Date().toLocaleDateString("en-CA");

  const cobrancasDoMes = pagamentos
    .filter((item) => {
      const competencia = item.competencia ? String(item.competencia).slice(0, 10) : "";
      return competencia.startsWith(`${anoSelecionado}-${String(Number(mesSelecionado) + 1).padStart(2, "0")}`);
    })
    .map((pagamento) => {
      const assinatura = assinaturas.find(
        (item) => String(item.id) === String(pagamento.assinatura_id)
      );
      const empresa = empresas.find(
        (loja) => String(loja.id) === String(assinatura?.loja_id)
      );
      const vencimento = pagamento.vencimento_em
        ? String(pagamento.vencimento_em).slice(0, 10)
        : "";
      const situacao = pagamento.status === "pago"
        ? "pago"
        : (pagamento.status === "cancelado" || pagamento.status === "cancelada")
          ? (String(pagamento.observacoes || "").includes("ESTORNO:") ? "estornado" : "cancelado")
          : (vencimento && vencimento < hojeISO)
            ? "atrasado"
            : "pendente";

      return { ...pagamento, assinatura, empresa, situacao, vencimento };
    });

  const cobrancasFiltradas = cobrancasDoMes.filter((item) =>
    filtroCobranca === "todos" ? true : item.situacao === filtroCobranca
  );

  const quantidadeCobrancas = (situacao) =>
    cobrancasDoMes.filter((item) => item.situacao === situacao).length;

  const valorCobrancas = (situacao) =>
    cobrancasDoMes
      .filter((item) => item.situacao === situacao)
      .reduce((total, item) => total + Number(item.valor || 0), 0);

  const planos = [
    {
      nome: "Free",
      quantidade: totalFree,
      valor: "R$ 0,00",
      cor: "#6c757d",
      icone: "🆓"
    },
    {
      nome: "Premium",
      quantidade: totalPremium,
      valor: "R$ 39,90/mês",
      cor: "#d63384",
      icone: "💗"
    },
    {
      nome: "Gold",
      quantidade: totalGold,
      valor: "R$ 89,90/mês",
      cor: "#b58a16",
      icone: "💎"
    }
  ];

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="container">

        {/* CABEÇALHO */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: "#5d4037" }}>
              💰 Financeiro e Planos
            </h2>

            <p className="text-secondary mb-0">
              Gerencie assinaturas e acompanhe a receita do Hub Serviços.
            </p>
          </div>

          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={() => navigate("/painel/admin")}
          >
            ← Voltar ao painel
          </button>
        </div>

        {carregando ? (
          <div className="text-center py-5">
            Carregando dados financeiros...
          </div>
        ) : (
          <>
            {erro && (
              <div className="alert alert-danger rounded-3">
                Não foi possível carregar todos os dados financeiros:
                <br />
                {erro}
              </div>
            )}

            {/* PLANOS */}
            <h5 className="fw-bold mb-3">
              💎 Distribuição dos planos
            </h5>

            <div className="row g-4 mb-4">
              {planos.map((plano) => (
                <div className="col-md-4" key={plano.nome}>
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                    <div className="fs-1 mb-3">
                      {plano.icone}
                    </div>

                    <h5
                      className="fw-bold"
                      style={{ color: plano.cor }}
                    >
                      {plano.nome}
                    </h5>

                    <h2 className="fw-bold">
                      {plano.quantidade}
                    </h2>

                    <p className="text-secondary mb-0">
                      Empresa(s) aprovada(s)
                    </p>

                    <span className="small mt-2">
                      Valor comercial: {plano.valor}
                    </span>

                  </div>
                </div>
              ))}
            </div>

            {/* RESUMO DE ASSINATURAS */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3">
                📋 Situação das assinaturas
              </h5>

              <div className="row g-3">
                <div className="col-md-4">
                  <h3 className="text-success fw-bold">
                    {totalPagas}
                  </h3>
                  <span className="text-secondary">
                    Assinaturas pagas
                  </span>
                </div>

                <div className="col-md-4">
                  <h3 className="text-primary fw-bold">
                    {totalBonificadas}
                  </h3>
                  <span className="text-secondary">
                    Assinaturas bonificadas
                  </span>
                </div>

                <div className="col-md-4">
                  <h3 className="fw-bold" style={{ color: "#b58a16" }}>
                    {totalDemonstrativas}
                  </h3>
                  <span className="text-secondary">
                    Demonstrativas
                  </span>
                </div>
              </div>
            </div>

            {/* FILTRO FINANCEIRO */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3">
                📅 Período financeiro
              </h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Mês
                  </label>

                  <select
                    className="form-select rounded-3"
                    value={mesSelecionado}
                    onChange={(e) =>
                      setMesSelecionado(Number(e.target.value))
                    }
                  >
                    {meses.map((mes, index) => (
                      <option key={index} value={index}>
                        {mes}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Ano
                  </label>

                  <select
                    className="form-select rounded-3"
                    value={anoSelecionado}
                    onChange={(e) =>
                      setAnoSelecionado(Number(e.target.value))
                    }
                  >
                    {anosDisponiveis.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* INDICADORES FINANCEIROS */}
            <div className="row g-4 mb-4">

              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <span className="fs-2">📈</span>
                  <p className="text-secondary mb-1 mt-2">
                    Receita mensal recorrente estimada
                  </p>
                  <h3 className="fw-bold text-success">
                    {formatarMoeda(receitaMensalPrevista)}
                  </h3>
                  <small className="text-secondary">
                    Assinaturas pagas ativas
                  </small>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <span className="fs-2">💵</span>
                  <p className="text-secondary mb-1 mt-2">
                    Recebido em {meses[mesSelecionado]}
                  </p>
                  <h3 className="fw-bold text-success">
                    {formatarMoeda(totalRecebido)}
                  </h3>
                  <small className="text-secondary">
                    Pagamentos confirmados no período
                  </small>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <span className="fs-2">⏳</span>
                  <p className="text-secondary mb-1 mt-2">
                    Valores em aberto
                  </p>
                  <h3 className="fw-bold text-danger">
                    {formatarMoeda(totalEmAberto)}
                  </h3>
                  <small className="text-secondary">
                    Cobranças pendentes e atrasadas
                  </small>
                </div>
              </div>

            </div>

            {/* FECHAMENTO FINANCEIRO ANUAL */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0">📅 Balanço financeiro de {anoSelecionado}</h5>
                <span className="badge bg-secondary">Ano selecionado</span>
              </div>
              <div className="row g-3">
                <div className="col-md-4"><div className="bg-success bg-opacity-10 rounded-3 p-3 h-100"><small className="text-success">Total recebido no ano</small><h4 className="fw-bold text-success mb-0">{formatarMoeda(totalRecebidoNoAno)}</h4><small className="text-secondary">Pagamentos confirmados</small></div></div>
                <div className="col-md-4"><div className="bg-primary bg-opacity-10 rounded-3 p-3 h-100"><small className="text-primary">Total cobrado no ano</small><h4 className="fw-bold mb-0">{formatarMoeda(totalCobradoNoAno)}</h4><small className="text-secondary">Cobranças registradas na competência</small></div></div>
                <div className="col-md-4"><div className="bg-warning bg-opacity-10 rounded-3 p-3 h-100"><small className="text-warning-emphasis">Em aberto no ano</small><h4 className="fw-bold mb-0">{formatarMoeda(totalEmAbertoNoAno)}</h4><small className="text-secondary">Pendentes ou atrasadas, sem contar canceladas</small></div></div>
              </div>
              <small className="text-secondary d-block mt-3">Este balanço considera os pagamentos e cobranças registrados no Supabase para o ano selecionado. Não inclui despesas da empresa.</small>
            </div>

            {/* GRÁFICO DE EVOLUÇÃO DA RECEITA ANUAL */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0">📈 Evolução da receita — {anoSelecionado}</h5>
                <span className="badge bg-success">Pagamentos confirmados</span>
              </div>

              <div className="d-flex align-items-end gap-2 gap-md-3 border-bottom pb-2"
                   style={{ height: "240px", overflowX: "auto" }}>
                {receitaPorMes.map((item, indice) => {
                  const altura = item.total > 0
                    ? Math.max((item.total / maiorReceitaMensal) * 165, 8)
                    : 3;

                  return (
                    <div
                      key={indice}
                      className="d-flex flex-column align-items-center justify-content-end flex-grow-1"
                      style={{ minWidth: "34px", height: "100%" }}
                      title={`${meses[indice]}: ${formatarMoeda(item.total)}`}
                    >
                      <small className="text-secondary text-center mb-1"
                             style={{ fontSize: "10px", whiteSpace: "nowrap" }}>
                        {item.total > 0 ? formatarMoeda(item.total) : ""}
                      </small>
                      <div
                        className="bg-success rounded-top"
                        style={{
                          height: `${altura}px`,
                          width: "100%",
                          maxWidth: "42px",
                          minHeight: "3px",
                          opacity: item.total > 0 ? 1 : 0.25
                        }}
                      />
                      <small className="text-secondary mt-2">{item.nome}</small>
                    </div>
                  );
                })}
              </div>
              <small className="text-secondary d-block mt-3">
                O gráfico mostra os valores efetivamente recebidos em cada mês do ano selecionado.
              </small>
            </div>

            {mensagem && (
              <div className={`alert ${mensagem.startsWith("Não") ? "alert-danger" : "alert-success"} rounded-3`}>
                {mensagem}
              </div>
            )}

            {/* CONTROLE INDIVIDUAL DE COBRANÇAS */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0">📊 Controle de cobranças — {meses[mesSelecionado]} de {anoSelecionado}</h5>
                <span className="badge bg-secondary">{cobrancasDoMes.length} cobrança(s)</span>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {[
                  { valor: "todos", label: `Todos (${cobrancasDoMes.length})`, classe: "btn-outline-secondary" },
                  { valor: "pago", label: `Pagos (${quantidadeCobrancas("pago")})`, classe: "btn-outline-success" },
                  { valor: "pendente", label: `Pendentes (${quantidadeCobrancas("pendente")})`, classe: "btn-outline-warning" },
                  { valor: "atrasado", label: `Atrasados (${quantidadeCobrancas("atrasado")})`, classe: "btn-outline-danger" }
                ].map((filtro) => (
                  <button
                    key={filtro.valor}
                    type="button"
                    className={`btn btn-sm rounded-3 ${filtroCobranca === filtro.valor ? filtro.classe.replace("outline-", "") : filtro.classe}`}
                    onClick={() => setFiltroCobranca(filtro.valor)}
                  >
                    {filtro.label}
                  </button>
                ))}
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-4"><div className="bg-success bg-opacity-10 rounded-3 p-3"><small className="text-success">Total pago</small><div className="fw-bold text-success">{formatarMoeda(valorCobrancas("pago"))}</div></div></div>
                <div className="col-md-4"><div className="bg-warning bg-opacity-10 rounded-3 p-3"><small className="text-warning-emphasis">Total pendente</small><div className="fw-bold">{formatarMoeda(valorCobrancas("pendente"))}</div></div></div>
                <div className="col-md-4"><div className="bg-danger bg-opacity-10 rounded-3 p-3"><small className="text-danger">Total atrasado</small><div className="fw-bold text-danger">{formatarMoeda(valorCobrancas("atrasado"))}</div></div></div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light"><tr><th>Empresa</th><th>Plano</th><th>Valor</th><th>Vencimento</th><th>Data do pagamento</th><th>Forma de pagamento</th><th>Situação</th><th>Ação</th></tr></thead>
                  <tbody>
                    {cobrancasFiltradas.map((item) => {
                      const dataPagamento = item.pago_em ? new Date(item.pago_em).toLocaleDateString("pt-BR") : "—";
                      const badgeClasse = item.situacao === "pago" ? "bg-success" : item.situacao === "atrasado" ? "bg-danger" : (item.situacao === "cancelado" || item.situacao === "estornado") ? "bg-secondary" : "bg-warning text-dark";
                      return (
                        <tr key={item.id}>
                          <td className="fw-semibold">{item.empresa?.nome || `Empresa ID ${item.assinatura?.loja_id || "—"}`}</td>
                          <td>{item.assinatura?.plano || "—"}</td>
                          <td>{formatarMoeda(item.valor)}</td>
                          <td>{item.vencimento ? new Date(`${item.vencimento}T12:00:00`).toLocaleDateString("pt-BR") : "—"}</td>
                          <td>{dataPagamento}</td>
                          <td>{item.forma_pagamento || "—"}</td>
                          <td><span className={`badge ${badgeClasse}`}>{item.situacao === "pago" ? "Pago ✓" : item.situacao === "atrasado" ? "Atrasado" : item.situacao === "estornado" ? "Estornado" : item.situacao === "cancelado" ? "Cancelado" : "Pendente"}</span></td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {item.situacao !== "pago" && item.situacao !== "cancelado" && item.situacao !== "estornado" && item.assinatura?.tipo_contrato === "pago" && (
                                <button type="button" className="btn btn-sm btn-outline-success rounded-3" onClick={() => abrirRegistroPagamento(item.assinatura)}>💵 Registrar pagamento</button>
                              )}
                              {(item.situacao === "pendente" || item.situacao === "atrasado") && (
                                <button type="button" className="btn btn-sm btn-outline-secondary rounded-3" onClick={() => cancelarCobranca(item)}>Cancelar cobrança</button>
                              )}
                              {item.situacao === "pago" && (
                                <button type="button" className="btn btn-sm btn-outline-warning rounded-3" onClick={() => estornarPagamento(item)}>↩️ Estornar</button>
                              )}
                              <button type="button" className="btn btn-sm btn-outline-danger rounded-3" onClick={() => excluirRegistroPagamento(item)}>🗑️ Excluir</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {cobrancasFiltradas.length === 0 && <div className="text-center text-secondary py-3">Nenhuma cobrança encontrada para este filtro neste mês.</div>}
            </div>

            {/* LISTAGEM DE ASSINATURAS */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3">
                🧾 Assinaturas cadastradas
              </h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Cadastro do contrato</th>
                      <th>Empresa</th>
                      <th>Plano</th>
                      <th>Modalidade</th>
                      <th>Tipo</th>
                      <th>Valor do ciclo</th>
                      <th>Status</th>
                      <th>Ação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assinaturas.map((item) => {
                      const empresa = empresas.find(
                        (loja) =>
                          String(loja.id) === String(item.loja_id)
                      );

                      return (
                        <tr key={item.id}>
                          <td className="fw-semibold">
                            {empresa?.nome || `Empresa ID ${item.loja_id}`}
                          </td>

                          <td>
                            {item.plano}
                          </td>

                          <td>
                            {item.periodicidade}
                          </td>

                          <td>
                            {item.tipo_contrato}
                          </td>

                          <td>
                            {item.created_at
                              ? new Date(
                                  `${String(item.created_at).slice(0, 10)}T12:00:00`
                                ).toLocaleDateString("pt-BR")
                              : "—"}
                          </td>

                          <td>
                            <span className={`badge ${
                              (item.status === "active" || item.status === "ativa")
                                ? "bg-success"
                                : (item.status === "suspended" || item.status === "suspensa")
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}>
                              {item.status === "active" ? "ativa" : item.status === "suspended" ? "suspensa" : item.status}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary rounded-3"
                                onClick={() => abrirEdicao(item)}
                              >
                                ✏️ Editar
                              </button>
                              {item.tipo_contrato === "pago" && (item.status === "active" || item.status === "ativa") && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success rounded-3"
                                  onClick={() => abrirRegistroPagamento(item)}
                                >
                                  💵 Registrar pagamento
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {assinaturas.length === 0 && (
                <div className="text-center text-secondary py-4">
                  Ainda não existem assinaturas cadastradas.
                  <br />
                  <small>
                    Os planos atuais dos lojistas não são automaticamente
                    considerados contratos pagos.
                  </small>
                </div>
              )}

            </div>

            {/* MODAL DE EDIÇÃO DA ASSINATURA */}
            {assinaturaEditando && (
              <div
                className="modal d-block"
                tabIndex="-1"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                role="dialog"
                aria-modal="true"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 rounded-4 shadow">
                    <form onSubmit={salvarEdicao}>
                      <div className="modal-header">
                        <h5 className="modal-title fw-bold">✏️ Editar assinatura</h5>
                        <button
                          type="button"
                          className="btn-close"
                          aria-label="Fechar"
                          onClick={() => setAssinaturaEditando(null)}
                          disabled={salvando}
                        />
                      </div>

                      <div className="modal-body">
                        <div className="alert alert-light border rounded-3">
                          <small className="text-secondary">Empresa ID: {assinaturaEditando.loja_id}</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Plano</label>
                          <select
                            className="form-select rounded-3"
                            value={assinaturaEditando.plano}
                            onChange={(e) => {
                              const novoPlano = e.target.value;
                              setAssinaturaEditando({
                                ...assinaturaEditando,
                                plano: novoPlano,
                                ...(novoPlano === "free"
                                  ? { tipo_contrato: "demonstrativo", valor_ciclo: 0 }
                                  : {})
                              });
                            }}
                            required
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="gold">Gold</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Tipo de contrato</label>
                          <select
                            className="form-select rounded-3"
                            value={assinaturaEditando.tipo_contrato}
                            onChange={(e) => setAssinaturaEditando({ ...assinaturaEditando, tipo_contrato: e.target.value })}
                            required
                          >
                            <option value="pago">Pago</option>
                            <option value="bonificado">Bonificado</option>
                            <option value="demonstrativo">Demonstrativo</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Periodicidade</label>
                          <select
                            className="form-select rounded-3"
                            value={assinaturaEditando.periodicidade}
                            onChange={(e) => setAssinaturaEditando({ ...assinaturaEditando, periodicidade: e.target.value })}
                            required
                          >
                            <option value="mensal">Mensal</option>
                            <option value="anual">Anual</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Dia de vencimento</label>
                          <select
                            className="form-select rounded-3"
                            value={Number(assinaturaEditando.dia_vencimento || 8)}
                            onChange={(e) => setAssinaturaEditando({ ...assinaturaEditando, dia_vencimento: Number(e.target.value) })}
                            required
                          >
                            <option value={1}>Dia 1</option>
                            <option value={5}>Dia 5</option>
                            <option value={8}>Dia 8 (limite)</option>
                          </select>
                          <small className="text-secondary">O dia escolhido será usado nas próximas cobranças automáticas.</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Valor do ciclo (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control rounded-3"
                            value={assinaturaEditando.valor_ciclo ?? ""}
                            onChange={(e) => setAssinaturaEditando({ ...assinaturaEditando, valor_ciclo: e.target.value })}
                            required
                          />
                          <small className="text-secondary">
                            {assinaturaEditando.plano === "free"
                              ? "O plano Free não gera cobrança. O sistema ajusta o valor para R$ 0,00 e o tipo para demonstrativo."
                              : "Informe o valor cobrado no ciclo escolhido (mensal ou anual)."}
                          </small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Status da assinatura</label>
                          <select
                            className="form-select rounded-3"
                            value={assinaturaEditando.status}
                            onChange={(e) => setAssinaturaEditando({ ...assinaturaEditando, status: e.target.value })}
                            required
                          >
                            <option value="active">Ativa</option>
                            <option value="suspended">Suspensa</option>
                            <option value="cancelled">Cancelada</option>
                            <option value="ended">Encerrada</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Observações / motivo</label>
                          <textarea
                            className="form-control rounded-3"
                            rows="3"
                            value={assinaturaEditando.observacoes || ""}
                            onChange={(e) => setAssinaturaEditando({ ...assinaturaEditando, observacoes: e.target.value })}
                            placeholder="Ex.: parceria bonificada, desconto anual, período de demonstração..."
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-3"
                          onClick={() => setAssinaturaEditando(null)}
                          disabled={salvando}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary rounded-3" disabled={salvando}>
                          {salvando ? "Salvando..." : "Salvar alterações"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL DE REGISTRO MANUAL DE PAGAMENTO */}
            {pagamentoRegistrando && (
              <div
                className="modal d-block"
                tabIndex="-1"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                role="dialog"
                aria-modal="true"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 rounded-4 shadow">
                    <form onSubmit={registrarPagamento}>
                      <div className="modal-header">
                        <h5 className="modal-title fw-bold">💵 Registrar pagamento</h5>
                        <button
                          type="button"
                          className="btn-close"
                          aria-label="Fechar"
                          onClick={() => setPagamentoRegistrando(null)}
                          disabled={salvando}
                        />
                      </div>

                      <div className="modal-body">
                        <div className="alert alert-light border rounded-3">
                          <div className="fw-semibold">
                            {empresas.find((loja) => String(loja.id) === String(pagamentoRegistrando.loja_id))?.nome
                              || `Empresa ID ${pagamentoRegistrando.loja_id}`}
                          </div>
                          <small className="text-secondary">
                            Plano {pagamentoRegistrando.plano} · {pagamentoRegistrando.periodicidade}
                          </small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Valor recebido (R$)</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="form-control rounded-3"
                            value={formPagamento.valor}
                            onChange={(e) => setFormPagamento({ ...formPagamento, valor: e.target.value })}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Data do pagamento</label>
                          <input
                            type="date"
                            className="form-control rounded-3"
                            value={formPagamento.dataPagamento}
                            onChange={(e) => setFormPagamento({ ...formPagamento, dataPagamento: e.target.value })}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Forma de pagamento</label>
                          <select
                            className="form-select rounded-3"
                            value={formPagamento.formaPagamento}
                            onChange={(e) => setFormPagamento({ ...formPagamento, formaPagamento: e.target.value })}
                            required
                          >
                            <option value="pix">Pix</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="transferencia">Transferência</option>
                            <option value="cartao">Cartão</option>
                            <option value="boleto">Boleto</option>
                            <option value="outro">Outro</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Observações (opcional)</label>
                          <textarea
                            className="form-control rounded-3"
                            rows="2"
                            value={formPagamento.observacoes}
                            onChange={(e) => setFormPagamento({ ...formPagamento, observacoes: e.target.value })}
                            placeholder="Ex.: Pix confirmado pela administradora"
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-3"
                          onClick={() => setPagamentoRegistrando(null)}
                          disabled={salvando}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn btn-success rounded-3"
                          disabled={salvando || Number(formPagamento.valor) <= 0 || !formPagamento.dataPagamento}
                        >
                          {salvando ? "Registrando..." : "Confirmar pagamento"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default PlanosAdmin;
