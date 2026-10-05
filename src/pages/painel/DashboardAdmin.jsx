import {useEffect, useState} from "react";
import { supabase } from "../../supabaseClient";

function DashboardAdmin() {
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [totalPendentes, setTotalPendentes] = useState(0);


  useEffect(() => {
    const buscarTotalEmpresas = async () => {
      const {count, error} = await supabase
        .from("servicos")
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error("Erro ao buscar total de empresas:", error);
        return;
      }

      setTotalEmpresas(count || 0);
    };
    const buscarTotalPendentes = async () => {
    const { count, error } = await supabase
      .from("servicos")
      .select("*", { count: "exact", head: true })
      .eq("aprovado", false);

    if (error) {
      console.error("Erro ao buscar empresas pendentes:", error);
      return;
    }

    setTotalPendentes(count || 0);
  };

    buscarTotalEmpresas();
    buscarTotalPendentes();
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

        <h4 className="fw-bold mb-4">
          Visão geral
        </h4>

        <div className="row g-4">

          {/* EMPRESAS */}
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
              <div className="fs-1 mb-3">
                🏪
              </div>

              <p className="text-secondary mb-1">
                Empresas cadastradas
              </p>

              <h2 className="fw-bold mb-0">
                {totalEmpresas}
              </h2>
            </div>
          </div>


          {/* PENDENTES */}
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
              <div className="fs-1 mb-3">
                ⏳
              </div>

              <p className="text-secondary mb-1">
                Pendentes
              </p>

              <h2 className="fw-bold mb-0">
                {totalPendentes}
              </h2>
            </div>
          </div>


          {/* DESTAQUES */}
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
              <div className="fs-1 mb-3">
                ⭐
              </div>

              <p className="text-secondary mb-1">
                Destaques
              </p>

              <h2 className="fw-bold mb-0">
                4
              </h2>
            </div>
          </div>


          {/* PLANOS */}
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
              <div className="fs-1 mb-3">
                💎
              </div>

              <p className="text-secondary mb-1">
                Planos pagos
              </p>

              <h2 className="fw-bold mb-0">
                8
              </h2>
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
              >
                Ver pendentes
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
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Sair
        </button>

      </div>

    </div>
  );
}

export default DashboardAdmin;