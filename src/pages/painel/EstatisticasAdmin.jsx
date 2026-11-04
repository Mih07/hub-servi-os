
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function EstatisticasAdmin() {
  const [estatisticas, setEstatisticas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [empresas, setEmpresas] = useState([]);

  const navigate = useNavigate();

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


  const totalInteracoes = estatisticas.length;

  const totalCatalogo = estatisticas.filter(
    (item) => item.tipo_clique === "catalogo"
  ).length;

  const totalWhatsApp = estatisticas.filter(
    (item) => item.tipo_clique === "whatsapp"
  ).length;

  const totalInstagram = estatisticas.filter(
    (item) => item.tipo_clique === "instagram"
  ).length;

  
const desempenhoPorEmpresa = empresas.map((empresa) => {
  const interacoes = estatisticas.filter(
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

        {carregando ? (
          <div className="text-center py-5">
            <p>Carregando estatísticas...</p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {cards.map((card, index) => (
                <div className="col-md-6 col-lg-3" key={index}>
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
                      <th>Negócio (ID)</th>
                      <th>Tipo de interação</th>
                      <th>Data</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...estatisticas]
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) -
                          new Date(a.created_at)
                      )
                      .slice(0, 10)
                      .map((item) => (
                        <tr key={item.id}>
                          <td>{item.loja_id}</td>

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
