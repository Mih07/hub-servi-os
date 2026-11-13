import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function EmpresasAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroArquivamento, setFiltroArquivamento] = useState("ativos");
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [editandoEmpresa, setEditandoEmpresa] = useState(false);
  const [dadosEditados, setDadosEditados] = useState({});
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
  const [arquivandoEmpresaId, setArquivandoEmpresaId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const buscarEmpresas = async () => {
      setCarregando(true);

      const { data, error } = await supabase
        .from("servicos")
        .select(`
          id,
          user_id,
          nome,
          slug,
          status,
          aprovado,
          destaque,
          arquivado,
          plano,
          created_at,
          categoria,
          outraCategoria,
          regiao,
          bairro,
          endereco,
          formas_atendimento,
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
        alert("Não foi possível carregar as empresas.");
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
        destaque: novoDestaque,
      }));
    }
  };

  const iniciarEdicaoEmpresa = () => {
    setDadosEditados({
      nome: empresaSelecionada.nome || "",
      categoria: empresaSelecionada.categoria || "",
      outraCategoria: empresaSelecionada.outraCategoria || "",
      regiao: empresaSelecionada.regiao || "",
      bairro: empresaSelecionada.bairro || "",
      endereco: empresaSelecionada.endereco || "",
      whatsapp: empresaSelecionada.whatsapp || "",
      instagram: empresaSelecionada.instagram || "",
      link: empresaSelecionada.link || "",
      descricao: empresaSelecionada.descricao || "",
    });

    setEditandoEmpresa(true);
  };

  const atualizarCampo = (campo, valor) => {
    setDadosEditados((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const salvarEmpresa = async () => {
    const nome = (dadosEditados.nome || "").trim();

    if (!nome) {
      alert("O nome da empresa é obrigatório.");
      return;
    }

    setSalvandoEmpresa(true);

    const atualizacoes = {
      nome,
      categoria: (dadosEditados.categoria || "").trim(),
      outraCategoria: (dadosEditados.outraCategoria || "").trim(),
      regiao: (dadosEditados.regiao || "").trim(),
      bairro: (dadosEditados.bairro || "").trim(),
      endereco: (dadosEditados.endereco || "").trim(),
      whatsapp: (dadosEditados.whatsapp || "").trim(),
      instagram: (dadosEditados.instagram || "").trim(),
      link: (dadosEditados.link || "").trim(),
      descricao: (dadosEditados.descricao || "").trim(),
    };

    try {
      const { error } = await supabase
        .from("servicos")
        .update(atualizacoes)
        .eq("id", empresaSelecionada.id);

      if (error) throw error;

      const empresaAtualizada = {
        ...empresaSelecionada,
        ...atualizacoes,
      };

      setEmpresas((prev) =>
        prev.map((empresa) =>
          empresa.id === empresaSelecionada.id
            ? { ...empresa, ...atualizacoes }
            : empresa
        )
      );

      setEmpresaSelecionada(empresaAtualizada);
      setEditandoEmpresa(false);

      alert("Empresa atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      alert(error.message || "Não foi possível atualizar a empresa.");
    } finally {
      setSalvandoEmpresa(false);
    }
  };

  const arquivarEmpresa = async (empresa) => {
  const novoEstado = !empresa.arquivado;

  const confirmar = window.confirm(
    novoEstado
      ? `Deseja arquivar "${empresa.nome}"?\n\nO cadastro ficará oculto do público, mas todos os dados e o histórico financeiro serão preservados.`
      : `Deseja restaurar "${empresa.nome}"?\n\nO cadastro voltará a ficar disponível conforme seu status de aprovação.`
  );

  if (!confirmar) return;

  setArquivandoEmpresaId(empresa.id);

  try {
    const { data, error } = await supabase
      .from("servicos")
      .update({ arquivado: novoEstado })
      .eq("id", empresa.id)
      .select("id, arquivado")
      .single();

    if (error) throw error;

    setEmpresas((prev) =>
      prev.map((item) =>
        item.id === empresa.id
          ? { ...item, arquivado: data.arquivado }
          : item
      )
    );

    if (empresaSelecionada?.id === empresa.id) {
      setEmpresaSelecionada((prev) => ({
        ...prev,
        arquivado: data.arquivado,
      }));
    }

    alert(
      novoEstado
        ? "Cadastro arquivado com sucesso!"
        : "Cadastro restaurado com sucesso!"
    );

  } catch (error) {
    console.error("Erro ao arquivar/restaurar cadastro:", error);
    alert(error.message || "Não foi possível atualizar o cadastro.");
  } finally {
    setArquivandoEmpresaId(null);
  }
};

  const fecharModal = () => {
    if (salvandoEmpresa) return;

    setEmpresaSelecionada(null);
    setEditandoEmpresa(false);
    setDadosEditados({});
  };

  const empresasFiltradas = empresas.filter((empresa) => {
  const nomeEmpresa = (empresa.nome || "").toLowerCase();
  const termoBusca = busca.toLowerCase();

  const correspondeBusca = nomeEmpresa.includes(termoBusca);

  const correspondeStatus =
    filtroStatus === "todos" ||
    empresa.status === filtroStatus ||
    (filtroStatus === "rejeitado" && empresa.status === "reprovado");

  const correspondeArquivamento =
    filtroArquivamento === "todos"
      ? true
      : filtroArquivamento === "arquivados"
      ? empresa.arquivado === true
      : empresa.arquivado !== true;

  return (
    correspondeBusca &&
    correspondeStatus &&
    correspondeArquivamento
  );
});

  const campoEditavel = (label, campo, tipo = "text") => (
    <div className="col-md-6" key={campo}>
      <label className="form-label fw-semibold">{label}</label>
      <input
        type={tipo}
        className="form-control rounded-3"
        value={dadosEditados[campo] ?? ""}
        onChange={(e) => atualizarCampo(campo, e.target.value)}
      />
    </div>
  );

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

            <div className="col-md-6">
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="🔎 Buscar empresa pelo nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select rounded-3"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os status</option>
                <option value="aprovado">Aprovados</option>
                <option value="pendente">Pendentes</option>
                <option value="rejeitado">Rejeitados / Reprovados</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select rounded-3"
                value={filtroArquivamento}
                onChange={(e) => setFiltroArquivamento(e.target.value)}
              >
                <option value="ativos">Cadastros ativos</option>
                <option value="arquivados">Cadastros arquivados</option>
                <option value="todos">Todos os cadastros</option>
              </select>
            </div>

          </div>

          <div className="mb-3">
            <strong>{empresasFiltradas.length} empresa(s) encontrada(s)</strong>
          </div>

          {carregando ? (
            <p className="text-center py-4">Carregando empresas...</p>
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
                      <td className="fw-semibold">{empresa.nome}</td>

                      <td>
                        <div className="d-flex flex-column align-items-start gap-1">
                          <span
                            className={`badge ${
                              empresa.status === "aprovado"
                                ? "bg-success"
                                : empresa.status === "pendente"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}
                          >
                            {empresa.status || "-"}
                          </span>

                          {empresa.arquivado && (
                            <span className="badge bg-secondary">
                              Arquivado
                            </span>
                          )}
                        </div>
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
                            color: empresa.plano === "gold" ? "#212529" : "#fff",
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
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-3"
                            onClick={() => {
                              setEmpresaSelecionada(empresa);
                              setEditandoEmpresa(false);
                              setDadosEditados({});
                            }}
                          >
                            Ver detalhes
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm rounded-3 ${
                              empresa.arquivado
                                ? "btn-outline-success"
                                : "btn-outline-danger"
                            }`}
                            onClick={() => arquivarEmpresa(empresa)}
                            disabled={arquivandoEmpresaId === empresa.id}
                          >
                            {arquivandoEmpresaId === empresa.id
                              ? "Salvando..."
                              : empresa.arquivado
                              ? "Restaurar"
                              : "Arquivar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL DE DETALHES / EDIÇÃO DA EMPRESA */}
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
                    🏪 {editandoEmpresa
                      ? `Editando: ${empresaSelecionada.nome}`
                      : empresaSelecionada.nome}
                  </h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={fecharModal}
                    disabled={salvandoEmpresa}
                  />
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
                    {editandoEmpresa ? (
                      <>
                        {campoEditavel("Nome do estabelecimento", "nome")}
                        {campoEditavel("Categoria", "categoria")}
                        {campoEditavel("Outra categoria", "outraCategoria")}
                        {campoEditavel("Região / Cidade", "regiao")}
                        {campoEditavel("Bairro", "bairro")}
                        {campoEditavel("Endereço", "endereco")}
                      </>
                    ) : (
                      <>
                        <div className="col-md-6">
                          <strong>Nome:</strong> {empresaSelecionada.nome || "-"}
                        </div>

                        <div className="col-md-6">
                          <strong>Categoria:</strong> {empresaSelecionada.categoria || "-"}
                        </div>

                        <div className="col-md-6">
                          <strong>Outra categoria:</strong>{" "}
                          {empresaSelecionada.outraCategoria || "-"}
                        </div>

                        <div className="col-md-6">
                          <strong>Região:</strong> {empresaSelecionada.regiao || "-"}
                        </div>

                        <div className="col-md-6">
                          <strong>Bairro:</strong> {empresaSelecionada.bairro || "-"}
                        </div>

                        <div className="col-12">
                          <strong>Endereço:</strong> {empresaSelecionada.endereco || "-"}
                        </div>
                      </>
                    )}
                  </div>

                  <hr />

                  {/* CONTATO */}
                  <h6 className="fw-bold mb-3">📞 Contato</h6>

                  <div className="row g-3 mb-4">
                    {editandoEmpresa ? (
                      <>
                        {campoEditavel("WhatsApp", "whatsapp")}
                        {campoEditavel("Instagram", "instagram")}
                        {campoEditavel("Link externo / Site", "link")}
                      </>
                    ) : (
                      <>
                        <div className="col-md-6">
                          <strong>WhatsApp:</strong>
                          <div className="text-break text-secondary" style={{ overflowWrap: "anywhere" }}>
                            {empresaSelecionada.whatsapp || "-"}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <strong>Instagram:</strong>
                          <div className="text-break text-secondary" style={{ overflowWrap: "anywhere" }}>
                            {empresaSelecionada.instagram || "-"}
                          </div>
                        </div>

                        <div className="col-12">
                          <strong>Link externo / Site:</strong>
                          <div className="text-break text-secondary" style={{ overflowWrap: "anywhere" }}>
                            {empresaSelecionada.link || "-"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <hr />

                  {/* DESCRIÇÃO */}
                  <h6 className="fw-bold mb-3">📝 Descrição</h6>

                  {editandoEmpresa ? (
                    <textarea
                      className="form-control rounded-3"
                      rows={5}
                      value={dadosEditados.descricao ?? ""}
                      onChange={(e) => atualizarCampo("descricao", e.target.value)}
                    />
                  ) : (
                    <p className="text-secondary">
                      {empresaSelecionada.descricao || "Nenhuma descrição cadastrada."}
                    </p>
                  )}

                  <hr />

                  {/* FORMAS DE ATENDIMENTO - VISUALIZAÇÃO */}
                  <h6 className="fw-bold mb-3">🗓️ Formas de atendimento</h6>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {Array.isArray(empresaSelecionada.formas_atendimento) &&
                    empresaSelecionada.formas_atendimento.length > 0 ? (
                      empresaSelecionada.formas_atendimento.map((forma, index) => (
                        <span className="badge rounded-pill bg-light text-dark border" key={index}>
                          {forma}
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary">Não informado.</span>
                    )}
                  </div>

                  <hr />

                  {/* IMAGENS - MANTIDAS SEM EDIÇÃO NESTA ETAPA */}
                  <h6 className="fw-bold mb-3">🖼️ Imagens cadastradas</h6>

                  <div className="row g-3">
                    {[
                      empresaSelecionada.imagem,
                      empresaSelecionada.imagem2,
                      empresaSelecionada.imagem3,
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
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className="modal-footer">
                  {editandoEmpresa ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-3"
                        onClick={() => {
                          setEditandoEmpresa(false);
                          setDadosEditados({});
                        }}
                        disabled={salvandoEmpresa}
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="btn rounded-3"
                        style={{ backgroundColor: "#d63384", color: "#fff" }}
                        onClick={salvarEmpresa}
                        disabled={salvandoEmpresa}
                      >
                        {salvandoEmpresa ? "Salvando..." : "Salvar alterações"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-primary rounded-3"
                        onClick={iniciarEdicaoEmpresa}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Editar empresa
                      </button>

                      <button
                        type="button"
                        className="btn rounded-3"
                        style={{ backgroundColor: "#d63384", color: "#fff" }}
                        onClick={fecharModal}
                      >
                        Fechar
                      </button>
                    </>
                  )}
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
