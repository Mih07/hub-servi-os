import {useEffect, useState} from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function DashboardAdmin() {
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [totalNaoArquivadas, setTotalNaoArquivadas] = useState(0);
  const [totalArquivadas, setTotalArquivadas] = useState(0);
  const [totalPendentes, setTotalPendentes] = useState(0);
  const [totalAvaliacoesPendentes, setTotalAvaliacoesPendentes] = useState(0);
  const [totalDestaques, setTotalDestaques] = useState(0);

  const [totalPlanosPagos, setTotalPlanosPagos] = useState(0);
  const [totalBonificados, setTotalBonificados] = useState(0);
  const [totalDemonstrativos, setTotalDemonstrativos] = useState(0);
  const navigate = useNavigate();

  const sair = async () => {
  await supabase.auth.signOut();
  navigate("/");
};


  useEffect(() => {
  const buscarIndicadores = async () => {
    const [
      resultadoEmpresas,
      resultadoAssinaturas,
      resultadoAvaliacoes
    ] = await Promise.all([

      supabase
        .from("servicos")
        .select("id, status, destaque, arquivado"),

      supabase
        .from("assinaturas")
        .select("id, tipo_contrato, status"),

      supabase
        .from("avaliacoes")
        .select("id", { count: "exact", head: true })
        .eq("aprovado", false)
    ]);

    const erros = [
      resultadoEmpresas.error,
      resultadoAssinaturas.error,
      resultadoAvaliacoes.error
    ].filter(Boolean);

    if (erros.length > 0) {
      console.error("Erro ao buscar indicadores:", erros);
    }

    // CADASTROS
    const empresas = resultadoEmpresas.data || [];

    setTotalEmpresas(empresas.length);

    setTotalArquivadas(
      empresas.filter((empresa) => empresa.arquivado === true).length
    );

    setTotalNaoArquivadas(
      empresas.filter((empresa) => empresa.arquivado !== true).length
    );

    setTotalPendentes(
      empresas.filter(
        (empresa) =>
          empresa.arquivado !== true &&
          empresa.status === "pendente"
      ).length
    );

    setTotalDestaques(
      empresas.filter(
        (empresa) =>
          empresa.arquivado !== true &&
          empresa.destaque === true
      ).length
    );

    // CONTRATOS ATIVOS
    const contratosAtivos = (resultadoAssinaturas.data || []).filter(
      (item) => item.status === "active" || item.status === "ativa"
    );

    setTotalPlanosPagos(
      contratosAtivos.filter(
        (item) => item.tipo_contrato === "pago"
      ).length
    );

    setTotalBonificados(
      contratosAtivos.filter(
        (item) => item.tipo_contrato === "bonificado"
      ).length
    );

    setTotalDemonstrativos(
      contratosAtivos.filter(
        (item) => item.tipo_contrato === "demonstrativo"
      ).length
    );

    // AVALIAÇÕES PENDENTES
    setTotalAvaliacoesPendentes(
      resultadoAvaliacoes.count || 0
    );
  };

  buscarIndicadores();
}, []);




  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* CABEÇALHO */}
      <div className="container mb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

          <div>
            <h1 className="fw-bold mb-1" style={{ color: '#5d4037' }}>
              🔐 Central Administrativa
            </h1>

            <p className="text-secondary mb-0 fs-5">
              Gerencie o Hub Serviços
            </p>
          </div>

          <div
            className="px-4 py-2 rounded-pill bg-white shadow-sm border"
          >
            <span className="fw-semibold">
              🛠️ Administrador
            </span>
          </div>

        </div>
      </div>
      


      {/* RESUMO */}
      <div className="container mb-5">

        {/* ALERTA ADMINISTRATIVO */}
        {(totalPendentes > 0 || totalAvaliacoesPendentes > 0) && (
          <div className="container mb-4">
            <div className="alert alert-warning border-0 shadow-sm rounded-4 d-flex justify-content-between align-items-center flex-wrap gap-3">

              <div>
                <h5 className="fw-bold mb-1">
                  🔔 Você tem tarefas aguardando sua atenção!
                </h5>

                <p className="mb-0">
                  {totalPendentes} negócio(s) aguardando aprovação e{" "}
                  {totalAvaliacoesPendentes} avaliação(ões) aguardando moderação.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-dark rounded-3"
                onClick={() => navigate("/painel/admin/aprovacoes")}
              >
                Analisar cadastros
              </button>

            </div>
          </div>
        )}

        <h4 className="fw-bold mb-4">
          Visão geral
        </h4>

        
<div className="row g-4">

  {/* TOTAL DE EMPRESAS */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">🏪</div>
      <p className="text-secondary mb-1">Empresas cadastradas</p>
      <h2 className="fw-bold mb-0">{totalEmpresas}</h2>
    </div>
  </div>

  {/* NÃO ARQUIVADAS */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">✅</div>
      <p className="text-secondary mb-1">Não arquivadas</p>
      <h2 className="fw-bold mb-0">{totalNaoArquivadas}</h2>
    </div>
  </div>

  {/* ARQUIVADAS */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">📦</div>
      <p className="text-secondary mb-1">Arquivadas</p>
      <h2 className="fw-bold mb-0">{totalArquivadas}</h2>
    </div>
  </div>

  {/* PENDENTES */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">⏳</div>
      <p className="text-secondary mb-1">Pendentes</p>
      <h2 className="fw-bold mb-0">{totalPendentes}</h2>
    </div>
  </div>

  {/* DESTAQUES */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">⭐</div>
      <p className="text-secondary mb-1">Destaques</p>
      <h2 className="fw-bold mb-0">{totalDestaques}</h2>
    </div>
  </div>

  {/* CONTRATOS PAGOS */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">💎</div>
      <p className="text-secondary mb-1">Contratos pagos</p>
      <h2 className="fw-bold mb-0">{totalPlanosPagos}</h2>
    </div>
  </div>

  {/* BONIFICADOS */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">🎁</div>
      <p className="text-secondary mb-1">Bonificados</p>
      <h2 className="fw-bold mb-0">{totalBonificados}</h2>
    </div>
  </div>

  {/* DEMONSTRATIVOS */}
  <div className="col-md-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
      <div className="fs-1 mb-3">📋</div>
      <p className="text-secondary mb-1">Demonstrativos</p>
      <h2 className="fw-bold mb-0">{totalDemonstrativos}</h2>
    </div>
  </div>

</div>

      </div>


      {/* GERENCIAMENTO */}
      <div className="container mb-5">

        <h4 className="fw-bold mb-4">
          ⚙️ Gerenciamento
        </h4>

        <div className="row g-4">


          {/* EMPRESAS */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

              <div className="fs-1 mb-3">
                🏪
              </div>

              <h5 className="fw-bold">
                Empresas
              </h5>

              <p className="text-secondary mb-4">
                Visualize e gerencie todos os negócios cadastrados no Hub.
              </p>

              <button
                type="button"
                className="btn rounded-3 fw-semibold"
                style={{
                  backgroundColor: '#d63384',
                  color: '#fff'
                }}
                onClick={() => navigate("/painel/admin/empresas")}
              >
                Gerenciar empresas
              </button>

            </div>
          </div>


          {/* APROVAÇÕES */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

              <div className="fs-1 mb-3">
                ⏳
              </div>

              <h5 className="fw-bold">
                Aprovações
              </h5>

              <p className="text-secondary mb-4">
                Analise os cadastros que estão aguardando aprovação.
              </p>

              
          <button
              type="button"
              className="btn rounded-3 fw-semibold"
              style={{
                  backgroundColor: '#d63384',
                  color: '#fff'
              }}
              onClick={() => navigate("/painel/admin/aprovacoes")}
          >
              Ver pendentes
          </button>


            </div>
          </div>

        {/* MODERAÇÃO DE AVALIAÇÕES */}
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

            <div className="fs-1 mb-3">
              💬
            </div>

            <h5 className="fw-bold">
              Moderação de Avaliações
            </h5>

            <p className="text-secondary mb-2">
              Analise os comentários enviados pelos clientes do Hub Serviços.
            </p>

            <p className="fw-semibold mb-4">
              {totalAvaliacoesPendentes} avaliação(ões) pendente(s)
            </p>

            <button
              type="button"
              className="btn rounded-3 fw-semibold"
              style={{
                backgroundColor: "#d63384",
                color: "#fff"
              }}
              onClick={() =>
                navigate("/painel/admin/moderacao-avaliacoes")
              }
            >
              Moderar avaliações
            </button>

          </div>
        </div>  


          {/* DESTAQUES */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

              <div className="fs-1 mb-3">
                ⭐
              </div>

              <h5 className="fw-bold">
                Destaques
              </h5>

              <p className="text-secondary mb-4">
                Escolha quais negócios aparecerão no Top do Hub.
              </p>              
              <button
                type="button"
                className="btn rounded-3 fw-semibold"
                style={{
                  backgroundColor: '#d63384',
                  color: '#fff'
                }}
                onClick={() => navigate("/painel/admin/empresas")}
              >
                Gerenciar destaques
              </button>


            </div>
          </div>
          


          {/* PLANOS */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

              <div className="fs-1 mb-3">
                💎
              </div>

              <h5 className="fw-bold">
                Planos
              </h5>

              <p className="text-secondary mb-4">
                Visualize e gerencie os planos Free, Premium e Gold.
              </p>

              
            <button
              type="button"
              className="btn rounded-3 fw-semibold"
              style={{
                backgroundColor: '#d63384',
                color: '#fff'
              }}
              onClick={() => navigate("/painel/admin/planos")}
            >
              Gerenciar planos
            </button>


            </div>
          </div>


          {/* ESTATÍSTICAS */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

              <div className="fs-1 mb-3">
                📊
              </div>

              <h5 className="fw-bold">
                Estatísticas
              </h5>

              <p className="text-secondary mb-4">
                Acompanhe os acessos e interações dos negócios.
              </p>

              
            <button
              type="button"
              className="btn rounded-3 fw-semibold"
              style={{
                backgroundColor: '#d63384',
                color: '#fff'
              }}
              onClick={() => navigate("/painel/admin/estatisticas")}
            >
              Ver estatísticas
            </button>


            </div>
          </div>


          {/* CIDADES */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

              <div className="fs-1 mb-3">
                📍
              </div>

              <h5 className="fw-bold">
                Cidades
              </h5>

              <p className="text-secondary mb-4">
                Acompanhe a distribuição dos negócios por região.
              </p>

              <button
                type="button"
                className="btn rounded-3 fw-semibold"
                style={{
                  backgroundColor: '#d63384',
                  color: '#fff'
                }}
              >
                Ver cidades
              </button>

            </div>
          </div>

        </div>
      </div>


      {/* ATIVIDADE RECENTE */}
      <div className="container mb-5">

        <div className="card border-0 shadow-sm rounded-4 p-4">

          <h4 className="fw-bold mb-4">
            🕐 Atividade recente
          </h4>

          <div className="d-flex flex-column gap-3">

            <div className="d-flex align-items-center border-bottom pb-3">
              <span className="fs-4 me-3">🏪</span>
              <div>
                <strong>Lalá Bolos</strong>
                <p className="text-secondary mb-0 small">
                  Empresa cadastrada no Hub
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center border-bottom pb-3">
              <span className="fs-4 me-3">⭐</span>
              <div>
                <strong>Negócio em destaque</strong>
                <p className="text-secondary mb-0 small">
                  Um negócio foi adicionado ao Top do Hub
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <span className="fs-4 me-3">✅</span>
              <div>
                <strong>Cadastro aprovado</strong>
                <p className="text-secondary mb-0 small">
                  Novo negócio aprovado pela administração
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>


      
    {/* RODAPÉ / SAIR */}
    <div className="container text-end">
      <button
        type="button"
        className="btn btn-outline-danger rounded-3"
        onClick={sair}
      >
        <i className="bi bi-box-arrow-right me-2"></i>
        Sair
      </button>
    </div>


    </div>
  );
}

export default DashboardAdmin;