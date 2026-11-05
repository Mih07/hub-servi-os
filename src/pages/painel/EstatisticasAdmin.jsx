
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function EstatisticasAdmin() {
  const [estatisticas, setEstatisticas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [empresas, setEmpresas] = useState([]);

  const navigate = useNavigate();
  
const [modoPeriodo, setModoPeriodo] = useState("mensal");
const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];


  useEffect(() => {
    
const buscarEstatisticas = async () => {
  const [resultadoEstatisticas, resultadoEmpresas] = await Promise.all([
    supabase
      .from("estatisticas")
      .select("id, created_at, loja_id, tipo_clique"),

    supabase
      .from("servicos")
      .select("id, nome")
  ]);

  if (resultadoEstatisticas.error) {
    console.error(
      "Erro ao buscar estatísticas:",
      resultadoEstatisticas.error
    );
  } else {
    setEstatisticas(resultadoEstatisticas.data || []);
  }

  if (resultadoEmpresas.error) {
    console.error(
      "Erro ao buscar empresas:",
      resultadoEmpresas.error
    );
  } else {
    setEmpresas(resultadoEmpresas.data || []);
  }

  setCarregando(false);
};
buscarEstatisticas();

}, []);


const anosDisponiveis = [
  ...new Set([
    ...estatisticas
      .filter((item) => item.created_at)
      .map((item) => new Date(item.created_at).getFullYear()),
    new Date().getFullYear()
  ])
].sort((a, b) => b - a);

const estatisticasFiltradas = estatisticas.filter((item) => {
  if (!item.created_at) return false;

  const data = new Date(item.created_at);

  const correspondeAno =
    data.getFullYear() === Number(anoSelecionado);

  if (modoPeriodo === "anual") {
    return correspondeAno;
  }

  return (
    correspondeAno &&
    data.getMonth() === Number(mesSelecionado)
  );
});



  const totalInteracoes = estatisticasFiltradas.length;

  const totalCatalogo = estatisticasFiltradas.filter(
    (item) => item.tipo_clique === "catalogo"
  ).length;

  const totalWhatsApp = estatisticasFiltradas.filter(
    (item) => item.tipo_clique === "whatsapp"
  ).length;

  const totalInstagram = estatisticasFiltradas.filter(
    (item) => item.tipo_clique === "instagram"
  ).length;

  const totalPerfilPremium = estatisticasFiltradas.filter(
    (item) => item.tipo_clique === "perfil_premium"
  ).length;

  
const desempenhoPorEmpresa = empresas.map((empresa) => {
  const interacoes = estatisticasFiltradas.filter(
    (item) => String(item.loja_id) === String(empresa.id)
  );

  const contar = (tipo) =>
    interacoes.filter((item) => item.tipo_clique === tipo).length;

  return {
    id: empresa.id,
    nome: empresa.nome,
    catalogo: contar("catalogo"),
    whatsapp: contar("whatsapp"),
    instagram: contar("instagram"),
    perfilPremium: contar("perfil_premium"),
    outros: interacoes.filter(
      (item) =>
        !["catalogo", "whatsapp", "instagram", "perfil_premium"]
          .includes(item.tipo_clique)
    ).length,
    total: interacoes.length
  };
})
  .filter((empresa) => empresa.total > 0)
  .sort((a, b) => b.total - a.total);

  
const dadosGrafico = modoPeriodo === "mensal"
  ? Array.from(
      {
        length: new Date(
          Number(anoSelecionado),
          Number(mesSelecionado) + 1,
          0
        ).getDate()
      },
      (_, index) => {
        const dia = index + 1;

        const total = estatisticasFiltradas.filter((item) => {
          const data = new Date(item.created_at);
          return data.getDate() === dia;
        }).length;

        return {
          label: String(dia).padStart(2, "0"),
          total
        };
      }
    )
  : meses.map((mes, index) => {
      const total = estatisticasFiltradas.filter((item) => {
        const data = new Date(item.created_at);
        return data.getMonth() === index;
      }).length;

      return {
        label: mes.substring(0, 3),
        total
      };
    });

const maiorValorGrafico = Math.max(
  ...dadosGrafico.map((item) => item.total),
  1
);


    const maiorDesempenho = Math.max(
      ...desempenhoPorEmpresa.map((empresa) => empresa.total),
      1
    );

    const resumoInteracoes = [
      { nome: "Catálogo", total: totalCatalogo, cor: "#0d6efd" },
      { nome: "WhatsApp", total: totalWhatsApp, cor: "#198754" },
      { nome: "Instagram", total: totalInstagram, cor: "#fd7e14" },
      { nome: "Perfis", total: totalPerfilPremium, cor: "#6f42c1" },
      {
        nome: "Outras interações",
        total: estatisticasFiltradas.filter(
          (item) =>
            !["catalogo", "whatsapp", "instagram", "perfil_premium"]
              .includes(item.tipo_clique)
        ).length,
        cor: "#6c757d"
      }
    ].sort((a, b) => b.total - a.total);

    const maiorTipoInteracao = Math.max(
      ...resumoInteracoes.map((item) => item.total),
      1
    );




  const cards = [
    {
      titulo: "Total de interações",
      total: totalInteracoes,
      icone: "📊",
      cor: "#d63384"
    },
    {
      titulo: "Cliques no catálogo",
      total: totalCatalogo,
      icone: "🛍️",
      cor: "#0d6efd"
    },
    {
      titulo: "Cliques no WhatsApp",
      total: totalWhatsApp,
      icone: "📱",
      cor: "#198754"
    },
    {
      titulo: "Cliques no Instagram",
      total: totalInstagram,
      icone: "📸",
      cor: "#fd7e14"
    },
    {
      titulo: "Cliques nos perfis",
      total: totalPerfilPremium,
      icone: "👤",
      cor: "#6f42c1"
    }
  ];

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="container">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: "#5d4037" }}>
              📊 Estatísticas do Hub
            </h2>

            <p className="text-secondary mb-0">
              Acompanhe as interações dos negócios cadastrados.
            </p>
          </div>

          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={() => navigate("/painel/admin")}
          >
            ← Voltar ao painel
          </button>
        </div>

        
{/* FILTROS DE PERÍODO */}
<div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
    <h5 className="fw-bold mb-0">
      📅 Período de análise
    </h5>

    <div className="btn-group">
      <button
        type="button"
        className={`btn ${
          modoPeriodo === "mensal" ? "btn-danger" : "btn-outline-secondary"
        }`}
        style={modoPeriodo === "mensal" ? { backgroundColor: "#d63384", borderColor: "#d63384" } : {}}
        onClick={() => setModoPeriodo("mensal")}
      >
        Mensal
      </button>

      <button
        type="button"
        className={`btn ${
          modoPeriodo === "anual" ? "btn-danger" : "btn-outline-secondary"
        }`}
        style={modoPeriodo === "anual" ? { backgroundColor: "#d63384", borderColor: "#d63384" } : {}}
        onClick={() => setModoPeriodo("anual")}
      >
        Anual
      </button>
    </div>
  </div>

  <div className="row g-3">
    {modoPeriodo === "mensal" && (
      <div className="col-md-6">
        <label className="form-label fw-semibold">Mês</label>
        <select
          className="form-select rounded-3"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(Number(e.target.value))}
        >
          {meses.map((mes, index) => (
            <option key={index} value={index}>
              {mes}
            </option>
          ))}
        </select>
      </div>
    )}

    <div className="col-md-6">
      <label className="form-label fw-semibold">Ano</label>
      <select
        className="form-select rounded-3"
        value={anoSelecionado}
        onChange={(e) => setAnoSelecionado(Number(e.target.value))}
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


        {carregando ? (
          <div className="text-center py-5">
            <p>Carregando estatísticas...</p>
          </div>
        ) : (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-5 g-4">
              {cards.map((card, index) => (
                <div className="col" key={index}>
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <div className="fs-1 mb-3">
                      {card.icone}
                    </div>

                    <h6 className="text-secondary">
                      {card.titulo}
                    </h6>

                    <h2
                      className="fw-bold"
                      style={{ color: card.cor }}
                    >
                      {card.total}
                    </h2>
                  </div>
                </div>
              ))}
            </div>

            
        {/* GRÁFICO DE EVOLUÇÃO */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                📈 Evolução das interações
              </h5>

              <p className="text-secondary small mb-0">
                {modoPeriodo === "mensal"
                  ? `Movimento diário — ${meses[mesSelecionado]} de ${anoSelecionado}`
                  : `Movimento mensal — Ano de ${anoSelecionado}`}
              </p>
            </div>

            <span className="badge rounded-pill"
              style={{ backgroundColor: "#fce4ef", color: "#d63384" }}>
              {estatisticasFiltradas.length} interações
            </span>
          </div>

          <div className="table-responsive">
            <div
              className="d-flex align-items-end gap-2 pb-2"
              style={{
                minWidth: modoPeriodo === "mensal" ? "850px" : "100%",
                height: "230px",
                borderBottom: "1px solid #dee2e6"
              }}
            >
              {dadosGrafico.map((item, index) => (
                <div
                  key={index}
                  className="d-flex flex-column align-items-center justify-content-end"
                  style={{ flex: "1", minWidth: "20px", height: "100%" }}
                  title={`${item.label}: ${item.total} interações`}
                >

                  <small className="fw-semibold mb-1">
                    {item.total > 0 ? item.total : ""}
                  </small>

                  <div
                    className="w-100 rounded-top"
                    style={{
                      height: `${(item.total / maiorValorGrafico) * 150}px`,
                      minHeight: item.total > 0 ? "4px" : "0",
                      backgroundColor: "#d63384",
                      transition: "height 0.3s ease"
                    }}
                  />

                  <small className="text-secondary mt-2">
                    {item.label}
                  </small>

                </div>
              ))}
            </div>
          </div>

          <div className="text-secondary small mt-3">
            {modoPeriodo === "mensal"
              ? "Cada barra representa um dia do mês."
              : "Cada barra representa um mês do ano."}
          </div>

        </div>

        
{/* RANKING E TIPOS DE INTERAÇÃO */}
<div className="row g-4 mt-1">

  {/* INTERAÇÕES POR TIPO */}
  <div className="col-lg-5">
    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

      <h5 className="fw-bold mb-2">
        📊 Interações por tipo
      </h5>

      <p className="text-secondary small mb-4">
        Quais ações foram mais realizadas no período.
      </p>

      {resumoInteracoes.map((item) => (
        <div key={item.nome} className="mb-3">

          <div className="d-flex justify-content-between mb-1">
            <span className="small fw-semibold">
              {item.nome}
            </span>

            <strong>{item.total}</strong>
          </div>

          <div
            style={{
              height: "12px",
              backgroundColor: "#f0f0f0",
              borderRadius: "20px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${(item.total / maiorTipoInteracao) * 100}%`,
                height: "100%",
                backgroundColor: item.cor,
                borderRadius: "20px",
                transition: "width 0.3s ease"
              }}
            />
          </div>

        </div>
      ))}

    </div>
  </div>

      {/* RANKING POR EMPRESA */}
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

          <h5 className="fw-bold mb-2">
            🏆 Ranking por empresa
          </h5>

          <p className="text-secondary small mb-4">
            Negócios com maior número de interações no período.
          </p>

          {desempenhoPorEmpresa.slice(0, 10).map((empresa, index) => {

            const tipos = [
              { nome: "Catálogo", total: empresa.catalogo, cor: "#0d6efd" },
              { nome: "WhatsApp", total: empresa.whatsapp, cor: "#198754" },
              { nome: "Instagram", total: empresa.instagram, cor: "#fd7e14" },
              { nome: "Perfis", total: empresa.perfilPremium, cor: "#6f42c1" },
              { nome: "Outros", total: empresa.outros, cor: "#6c757d" }
            ];

            return (
              <div key={empresa.id} className="mb-4">

                <div className="d-flex justify-content-between align-items-center mb-2 gap-2">

                  <span className="small fw-semibold">
                    <span style={{ color: "#d63384" }}>
                      {index + 1}º
                    </span>{" "}
                    {empresa.nome}
                  </span>

                  <strong style={{ color: "#d63384" }}>
                    {empresa.total}
                  </strong>

                </div>

                <div
                  style={{
                    height: "16px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "20px",
                    overflow: "hidden"
                  }}
                >

                  <div
                    className="d-flex h-100"
                    style={{
                      width: `${(empresa.total / maiorDesempenho) * 100}%`
                    }}
                  >

                    {tipos.filter((tipo) => tipo.total > 0).map((tipo) => (
                      <div
                        key={tipo.nome}
                        title={`${tipo.nome}: ${tipo.total}`}
                        style={{
                          width: `${(tipo.total / empresa.total) * 100}%`,
                          backgroundColor: tipo.cor,
                          height: "100%"
                        }}
                      />
                    ))}

                  </div>

                </div>

              </div>
            );
          })}

          <div className="d-flex flex-wrap gap-3 mt-2">

            {[
              { nome: "Catálogo", cor: "#0d6efd" },
              { nome: "WhatsApp", cor: "#198754" },
              { nome: "Instagram", cor: "#fd7e14" },
              { nome: "Perfis", cor: "#6f42c1" },
              { nome: "Outros", cor: "#6c757d" }
            ].map((item) => (
              <span key={item.nome} className="small d-flex align-items-center gap-1">
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    backgroundColor: item.cor
                  }}
                />
                {item.nome}
              </span>
            ))}

          </div>

        </div>
      </div>

    </div>



            
            {/* DESEMPENHO POR EMPRESA */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
            <h5 className="fw-bold mb-4">
                🏆 Desempenho por empresa
            </h5>

            <div className="table-responsive">
                <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                    <th>Empresa</th>
                    <th>Catálogo</th>
                    <th>WhatsApp</th>
                    <th>Instagram</th>
                    <th>Perfil Premium</th>
                    <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    {desempenhoPorEmpresa.map((empresa) => (
                    <tr key={empresa.id}>
                        <td className="fw-semibold">{empresa.nome}</td>
                        <td>{empresa.catalogo}</td>
                        <td>{empresa.whatsapp}</td>
                        <td>{empresa.instagram}</td>
                        <td>{empresa.perfilPremium}</td>
                        <td className="fw-bold" style={{ color: "#d63384" }}>
                        {empresa.total}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {desempenhoPorEmpresa.length === 0 && (
                <p className="text-secondary text-center mb-0">
                Ainda não existem interações registradas por empresa.
                </p>
            )}
            </div>


            <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
              <h5 className="fw-bold mb-3">
                📈 Últimas interações
              </h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Empresa</th>
                      <th>Tipo de interação</th>
                      <th>Data</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...estatisticasFiltradas]
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) -
                          new Date(a.created_at)
                      )
                      .slice(0, 10)
                      .map((item) => (
                        <tr key={item.id}>
                          <td>
                            {empresas.find(
                              (empresa) => String(empresa.id) === String(item.loja_id)
                            )?.nome || `ID ${item.loja_id}`}
                          </td>

                          <td>
                            <span className="badge bg-light text-dark">
                              {item.tipo_clique}
                            </span>
                          </td>

                          <td>
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString("pt-BR")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        
      </div>
    </div>
    
  );
}

export default EstatisticasAdmin;
