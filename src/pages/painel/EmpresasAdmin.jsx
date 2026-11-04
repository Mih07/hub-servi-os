
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function EmpresasAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const buscarEmpresas = async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select(`
  id,
  nome,
  slug,
  status,
  aprovado,
  destaque,
  plano,
  created_at,
  categoria,
  outraCategoria,
  regiao,
  bairro,
  endereco,
  descricao,
  whatsapp,
  instagram,
  link,
  imagem,
  imagem2,
  imagem3
`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar empresas:", error);
      } else {
        setEmpresas(data || []);
      }

      setCarregando(false);
    };

    buscarEmpresas();
  }, []);

  
const alternarDestaque = async (empresa) => {
  const novoDestaque = !empresa.destaque;

  const { error } = await supabase
    .from("servicos")
    .update({ destaque: novoDestaque })
    .eq("id", empresa.id);

  if (error) {
    console.error("Erro ao atualizar destaque:", error);
    alert("Não foi possível atualizar o destaque.");
    return;
  }

  setEmpresas((prev) =>
    prev.map((item) =>
      item.id === empresa.id
        ? { ...item, destaque: novoDestaque }
        : item
    )
  );

  if (empresaSelecionada?.id === empresa.id) {
    setEmpresaSelecionada((prev) => ({
      ...prev,
      destaque: novoDestaque
    }));
  }
};


  const empresasFiltradas = empresas.filter((empresa) => {
    const correspondeBusca = empresa.nome
      ?.toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeStatus =
      filtroStatus === "todos" ||
      empresa.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="container">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: "#5d4037" }}>
              🏪 Gerenciamento de Empresas
            </h2>

            <p className="text-secondary mb-0">
              Consulte e gerencie os negócios cadastrados no Hub Serviços.
            </p>
          </div>

          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={() => navigate("/painel/admin")}
          >
            ← Voltar ao painel
          </button>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4">

          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="🔎 Buscar empresa pelo nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select rounded-3"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os status</option>
                <option value="aprovado">Aprovados</option>
                <option value="pendente">Pendentes</option>
                <option value="rejeitado">Rejeitados</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <strong>
              {empresasFiltradas.length} empresa(s) encontrada(s)
            </strong>
          </div>

          {carregando ? (
            <p className="text-center py-4">
              Carregando empresas...
            </p>
          ) : empresasFiltradas.length === 0 ? (
            <p className="text-center text-secondary py-4">
              Nenhuma empresa encontrada.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Empresa</th>
                    <th>Status</th>
                    <th>Plano</th>
                    <th>Destaque</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {empresasFiltradas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="fw-semibold">
                        {empresa.nome}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            empresa.status === "aprovado"
                              ? "bg-success"
                              : empresa.status === "pendente"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {empresa.status}
                        </span>
                      </td>

                    
                    <td>
                    <span
                        className="badge"
                        style={{
                        backgroundColor:
                            empresa.plano === "gold"
                            ? "#d4a017"
                            : empresa.plano === "premium"
                            ? "#d63384"
                            : "#6c757d",
                        color: empresa.plano === "gold" ? "#212529" : "#fff"
                        }}
                    >
                        {empresa.plano || "free"}
                    </span>
                    </td>



                      
                    <td>
                    <button
                        type="button"
                        className={`btn btn-sm rounded-3 ${
                        empresa.destaque
                            ? "btn-warning"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => alternarDestaque(empresa)}
                    >
                        {empresa.destaque ? "⭐ Remover" : "☆ Destacar"}
                    </button>
                    </td>


                      <td>
                        {empresa.created_at
                          ? new Date(empresa.created_at).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>
                      
                        <td>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-3"
                            onClick={() => setEmpresaSelecionada(empresa)}
                        >
                            Ver detalhes
                        </button>
                        </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        
      {/* MODAL DE DETALHES DA EMPRESA */}
      {empresaSelecionada && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow">

              <div
                className="modal-header"
                style={{ backgroundColor: "#d63384", color: "#fff" }}
              >
                <h5 className="modal-title fw-bold">
                  🏪 {empresaSelecionada.nome}
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEmpresaSelecionada(null)}
                ></button>
              </div>

              <div className="modal-body p-4">

                {/* INFORMAÇÕES GERAIS */}
                <h6 className="fw-bold mb-3">📋 Informações gerais</h6>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <strong>ID:</strong> {empresaSelecionada.id}
                  </div>

                  <div className="col-md-6">
                    <strong>Slug:</strong> {empresaSelecionada.slug || "-"}
                  </div>

                  <div className="col-md-6">
                    <strong>Status:</strong> {empresaSelecionada.status || "-"}
                  </div>

                  <div className="col-md-6">
                    <strong>Plano:</strong> {empresaSelecionada.plano || "free"}
                  </div>

                  <div className="col-md-6">
                    <strong>Destaque:</strong>{" "}
                    {empresaSelecionada.destaque ? "⭐ Sim" : "Não"}
                  </div>

                  <div className="col-md-6">
                    <strong>Cadastro:</strong>{" "}
                    {empresaSelecionada.created_at
                      ? new Date(empresaSelecionada.created_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </div>
                </div>

                <hr />

                {/* INFORMAÇÕES COMERCIAIS */}
                <h6 className="fw-bold mb-3">📍 Informações comerciais</h6>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <strong>Categoria:</strong>{" "}
                    {empresaSelecionada.categoria || "-"}
                  </div>

                  <div className="col-md-6">
                    <strong>Outra categoria:</strong>{" "}
                    {empresaSelecionada.outraCategoria || "-"}
                  </div>

                  <div className="col-md-6">
                    <strong>Região:</strong>{" "}
                    {empresaSelecionada.regiao || "-"}
                  </div>

                  <div className="col-md-6">
                    <strong>Bairro:</strong>{" "}
                    {empresaSelecionada.bairro || "-"}
                  </div>

                  <div className="col-12">
                    <strong>Endereço:</strong>{" "}
                    {empresaSelecionada.endereco || "-"}
                  </div>
                </div>

                <hr />

                {/* CONTATO */}
                <h6 className="fw-bold mb-3">📞 Contato</h6>

                
                    <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <strong>WhatsApp:</strong>
                        <div
                        className="text-break text-secondary"
                        style={{ overflowWrap: "anywhere" }}
                        >
                        {empresaSelecionada.whatsapp || "-"}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <strong>Instagram:</strong>
                        <div
                        className="text-break text-secondary"
                        style={{ overflowWrap: "anywhere" }}
                        >
                        {empresaSelecionada.instagram || "-"}
                        </div>
                    </div>

                    <div className="col-12">
                        <strong>Link externo:</strong>
                        <div
                        className="text-break text-secondary"
                        style={{ overflowWrap: "anywhere" }}
                        >
                        {empresaSelecionada.link || "-"}
                        </div>
                    </div>
                    </div>


                <hr />

                {/* DESCRIÇÃO */}
                <h6 className="fw-bold mb-3">📝 Descrição</h6>

                <p className="text-secondary">
                  {empresaSelecionada.descricao || "Nenhuma descrição cadastrada."}
                </p>

                <hr />

                {/* IMAGENS */}
                <h6 className="fw-bold mb-3">🖼️ Imagens cadastradas</h6>

                <div className="row g-3">
                  {[ 
                    empresaSelecionada.imagem,
                    empresaSelecionada.imagem2,
                    empresaSelecionada.imagem3
                  ]
                    .filter(Boolean)
                    .map((imagem, index) => (
                      <div className="col-md-4" key={index}>
                        <img
                          src={imagem}
                          alt={`Imagem ${index + 1} de ${empresaSelecionada.nome}`}
                          className="img-fluid rounded-3 border"
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover"
                          }}
                        />
                      </div>
                    ))}
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn rounded-3"
                  style={{ backgroundColor: "#d63384", color: "#fff" }}
                  onClick={() => setEmpresaSelecionada(null)}
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

export default EmpresasAdmin;
