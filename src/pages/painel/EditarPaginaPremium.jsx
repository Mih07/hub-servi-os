
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function EditarPaginaPremium() {
  const navigate = useNavigate();

  const [lojista, setLojista] = useState(null);
  const [userId, setUserId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    regiao: "",
    endereco: "",
    bairro: "",
    formas_atendimento: [],
    descricao: "",
    whatsapp: "",
    instagram: "",
    link: "",
  });

  const [servicosDestaque, setServicosDestaque] = useState([
    { nome: "", descricao: "" },
    { nome: "", descricao: "" },
    { nome: "", descricao: "" },
    { nome: "", descricao: "" },
  ]);


  const [logoFile, setLogoFile] = useState(null);
  const [foto1File, setFoto1File] = useState(null);
  const [foto2File, setFoto2File] = useState(null);
  const [foto3File, setFoto3File] = useState(null);
  const [foto4File, setFoto4File] = useState(null);
  const [removerFoto1, setRemoverFoto1] = useState(false);
  const [removerFoto2, setRemoverFoto2] = useState(false);
  const [removerFoto3, setRemoverFoto3] = useState(false);
  const [removerFoto4, setRemoverFoto4] = useState(false);

  // Recupera o telefone salvo no formato de link do WhatsApp
  const extrairTelefone = (valor) => {
    if (!valor) return "";

    try {
      if (valor.startsWith("http")) {
        return new URL(valor).pathname.replace(/\D/g, "").replace(/^55/, "");
      }
    } catch {
      return valor.replace(/\D/g, "");
    }

    return valor.replace(/\D/g, "");
  };

  // Recupera o nome de usuário do Instagram
  const extrairInstagram = (valor) => {
    if (!valor) return "";

    return valor
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .split(/[/?#]/)[0];
  };

  // Busca o estabelecimento vinculado ao usuário logado
  useEffect(() => {
    const buscarCadastro = async () => {
      try {
        const { data: { user }, error: erroUsuario } =
          await supabase.auth.getUser();

        if (erroUsuario || !user) {
          setErro("Faça login para acessar a edição da sua página.");
          return;
        }

        setUserId(user.id);

        const { data, error } = await supabase
          .from("servicos")
          .select("*")
          .eq("user_id", user.id)
          .eq("plano", "premium")
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setErro("Não encontramos uma página Premium vinculada a esta conta.");
          return;
        }

        setLojista(data);

        setFormData({
          nome: data.nome || "",
          categoria: data.categoria || "",
          regiao: data.regiao || "",
          endereco: data.endereco || "",
          bairro: data.bairro || "",
          formas_atendimento: data.formas_atendimento || [],
          descricao: data.descricao || "",
          whatsapp: extrairTelefone(data.whatsapp),
          instagram: extrairInstagram(data.instagram),
          link: data.link || "",
        });

        const servicosSalvos = Array.isArray(data.servicos_destaque)
          ? data.servicos_destaque
          : [];

        setServicosDestaque(
          Array.from({ length: 4 }, (_, index) => ({
            nome: servicosSalvos[index]?.nome || "",
            descricao: servicosSalvos[index]?.descricao || "",
          }))
        );

      } catch (error) {
        console.error("Erro ao carregar página:", error);
        setErro("Não foi possível carregar os dados do estabelecimento.");
      } finally {
        setCarregando(false);
      }
    };

    buscarCadastro();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "descricao" && value.length > 200) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Envia uma imagem para o Storage do Supabase
  const enviarImagem = async (arquivo) => {
    if (!arquivo) return null;

    if (!arquivo.type.startsWith("image/")) {
      throw new Error("Selecione um arquivo de imagem válido.");
    }

    const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const caminho = `${userId}/${Date.now()}-${nomeSeguro}`;

    const { error } = await supabase.storage
      .from("imagens")
      .upload(caminho, arquivo);

    if (error) throw error;

    const { data } = supabase.storage
      .from("imagens")
      .getPublicUrl(caminho);

    return data.publicUrl;
  };

  const gerarLinkWhatsApp = (telefone) => {
    if (!telefone.trim()) return null;

    let numero = telefone.replace(/\D/g, "");

    if (!numero.startsWith("55")) {
      numero = `55${numero}`;
    }

    const mensagemWhatsApp =
      "Olá! Vim pelo Hub Serviços e gostaria de mais informações.";

    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemWhatsApp)}`;
  };

  const gerarLinkInstagram = (perfil) => {
    if (!perfil.trim()) return null;

    const usuario = perfil
      .trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .split(/[/?#]/)[0];

    return usuario
      ? `https://www.instagram.com/${usuario}/`
      : null;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();

    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      const atualizacoes = {
        nome: formData.nome.trim(),
        categoria: formData.categoria,
        regiao: formData.regiao.trim(),
        endereco: formData.endereco.trim(),
        bairro: formData.bairro.trim(),
        formas_atendimento: formData.formas_atendimento,
        descricao: formData.descricao.trim(),
        whatsapp: gerarLinkWhatsApp(formData.whatsapp),
        instagram: gerarLinkInstagram(formData.instagram),
        link: formData.link.trim() || null,
        servicos_destaque: servicosDestaque
        .filter((servico) => servico.nome.trim() !== "")
        .map((servico) => ({
          nome: servico.nome.trim(),
          descricao: servico.descricao.trim(),
        })),
      };

      // Remover fotos selecionadas
      if (removerFoto1) atualizacoes.imagem2 = null;
      if (removerFoto2) atualizacoes.imagem3 = null;
      if (removerFoto3) atualizacoes.imagem4 = null;
      if (removerFoto4) atualizacoes.imagem5 = null;

      if (logoFile) {
        atualizacoes.imagem = await enviarImagem(logoFile);
      }

      if (foto1File) {
        atualizacoes.imagem2 = await enviarImagem(foto1File);
      }

      if (foto2File) {
        atualizacoes.imagem3 = await enviarImagem(foto2File);
      }

      if (foto3File) {
        atualizacoes.imagem4 = await enviarImagem(foto3File);
      }

      if (foto4File) {
        atualizacoes.imagem5 = await enviarImagem(foto4File);
      }

      console.log("ID do lojista:", lojista.id);
      console.log("ID do usuário logado:", userId);
      console.log("Dados que serão atualizados:", atualizacoes);

      
    const { data: atualizado, error } = await supabase
      .from("servicos")
      .update(atualizacoes)
      .eq("id", lojista.id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!atualizado) {
      throw new Error(
        "Nenhum registro foi atualizado. Verifique as permissões do Supabase."
      );
    }

    setLojista(atualizado);


      
      setLogoFile(null);
      setFoto1File(null);
      setFoto2File(null);
      setFoto3File(null);
      setFoto4File(null);
      setRemoverFoto1(false);
      setRemoverFoto2(false);
      setRemoverFoto3(false);
      setRemoverFoto4(false);

      setMensagem("Sua página Premium foi atualizada com sucesso!");

    } catch (error) {
      console.error("Erro ao salvar página:", error);
      setErro(error.message || "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" style={{ color: "#d63384" }} />
        <p className="mt-3 text-secondary">Carregando seus dados...</p>
      </div>
    );
  }

  if (erro && !lojista) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold" style={{ color: "#5d4037" }}>
          Não foi possível abrir a edição
        </h4>
        <p className="text-secondary">{erro}</p>
        <button
          className="btn rounded-pill px-4"
          style={{ backgroundColor: "#d63384", color: "#fff" }}
          onClick={() => navigate("/painel/lojista")}
        >
          Voltar à Central
        </button>
      </div>
    );
  }

  return (
    <main className="container py-4" style={{ maxWidth: "900px" }}>
      <button
        type="button"
        className="btn btn-outline-secondary rounded-pill mb-4"
        onClick={() => navigate("/painel/lojista")}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Voltar à Central
      </button>

      <div
        className="rounded-4 p-4 mb-4 text-white"
        style={{
          background: "linear-gradient(115deg, #d63384, #ed75aa, #f4c45e)",
        }}
      >
        <span className="badge bg-light text-dark mb-2">✦ PREMIUM</span>
        <h2 className="fw-bold mb-1">Editar minha página</h2>
        <p className="mb-0">
          Mantenha as informações do seu negócio atualizadas no Hub.
        </p>
      </div>

      {mensagem && (
        <div className="alert alert-success">{mensagem}</div>
      )}

      {erro && (
        <div className="alert alert-danger">{erro}</div>
      )}

      <form onSubmit={handleSalvar}>
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3" style={{ color: "#d63384" }}>
            <i className="bi bi-shop me-2"></i>
            Dados do estabelecimento
          </h5>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Nome do estabelecimento
            </label>
            <input
              className="form-control rounded-3"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Categoria</label>
            <input
              className="form-control rounded-3"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Descrição do negócio
            </label>
            <textarea
              className="form-control rounded-3"
              name="descricao"
              rows="4"
              maxLength={200}
              value={formData.descricao}
              onChange={handleChange}
            />
            <small className="text-secondary">
              {formData.descricao.length}/200 caracteres
            </small>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3" style={{ color: "#d63384" }}>
            <i className="bi bi-geo-alt me-2"></i>
            Localização
          </h5>

          <div className="mb-3">
            <label className="form-label fw-semibold">Cidade / Região</label>
            <input
              className="form-control rounded-3"
              name="regiao"
              value={formData.regiao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Endereço</label>
            <input
              className="form-control rounded-3"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Bairro</label>
            <input
              className="form-control rounded-3"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
            />
          </div>

            <div className="mt-4">
              <label className="form-label fw-semibold">
                Forma de atendimento
              </label>

              <p className="text-secondary small">
                Selecione como seu negócio atende os clientes.
              </p>

              {[
                "Presencial no estabelecimento",
                "Atendimento no endereço do cliente",
                "Agendamento",
                "Home Office",
                "Online / Remoto",
              ].map((forma) => (
                <div className="form-check mb-2" key={forma}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`atendimento-${forma}`}
                    checked={formData.formas_atendimento.includes(forma)}
                    onChange={(e) => {
                      const selecionadas = e.target.checked
                        ? [...formData.formas_atendimento, forma]
                        : formData.formas_atendimento.filter(
                            (item) => item !== forma
                          );

                      setFormData((prev) => ({
                        ...prev,
                        formas_atendimento: selecionadas,
                      }));
                    }}
                  />

                  <label
                    className="form-check-label"
                    htmlFor={`atendimento-${forma}`}
                  >
                    {forma}
                  </label>
                </div>
              ))}
            </div>

        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-2" style={{ color: "#d63384" }}>
            <i className="bi bi-briefcase me-2"></i>
            Serviços em destaque
          </h5>

          <p className="text-secondary small">
            Apresente até 4 serviços oferecidos pelo seu negócio.
            Preencha apenas os que deseja exibir na sua página.
          </p>

          {servicosDestaque.map((servico, index) => (
            <div
              key={index}
              className="rounded-4 p-3 mb-3"
              style={{ backgroundColor: "#fff5f9" }}
            >
              <h6 className="fw-bold mb-3" style={{ color: "#5d4037" }}>
                Serviço {index + 1}
              </h6>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Nome do serviço
                </label>

                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Ex.: Criação de sites"
                  maxLength={60}
                  value={servico.nome}
                  onChange={(e) =>
                    setServicosDestaque((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, nome: e.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>

              <div>
                <label className="form-label fw-semibold">
                  Descrição
                </label>

                <textarea
                  className="form-control rounded-3"
                  rows="2"
                  placeholder="Descreva brevemente este serviço..."
                  maxLength={150}
                  value={servico.descricao}
                  onChange={(e) =>
                    setServicosDestaque((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, descricao: e.target.value }
                          : item
                      )
                    )
                  }
                />

                <small className="text-secondary">
                  {servico.descricao.length}/150 caracteres
                </small>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3" style={{ color: "#d63384" }}>
            <i className="bi bi-camera me-2"></i>
            Identidade visual e fotos
          </h5>

          <p className="text-secondary small">
            As imagens atuais serão mantidas quando você não selecionar uma nova.
          </p>

          <div className="mb-3">
            <label className="form-label fw-semibold">Logo principal</label>
            {lojista.imagem && (
              <img
                src={lojista.imagem}
                alt="Logo atual"
                className="d-block rounded-3 mb-2"
                style={{ width: "110px", height: "110px", objectFit: "cover" }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Foto da galeria 1</label>
            {lojista.imagem2 && (
              <div className="mb-2">
                <img
                  src={lojista.imagem2}
                  alt="Foto atual 1"
                  className="d-block rounded-3 mb-2"
                  style={{ width: "150px", height: "100px", objectFit: "cover" }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setRemoverFoto1(!removerFoto1)}
                >
                  {removerFoto1 ? "Cancelar remoção" : "Remover foto"}
                </button>

                {removerFoto1 && (
                  <small className="d-block text-danger mt-1">
                    A foto será removida ao salvar.
                  </small>
                )}
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setFoto1File(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Foto da galeria 2</label>
            {lojista.imagem3 && (
              <div className="mb-2">
                <img
                  src={lojista.imagem3}
                  alt="Foto atual 2"
                  className="d-block rounded-3 mb-2"
                  style={{ width: "150px", height: "100px", objectFit: "cover" }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setRemoverFoto2(!removerFoto2)}
                >
                  {removerFoto2 ? "Cancelar remoção" : "Remover foto"}
                </button>

                {removerFoto2 && (
                  <small className="d-block text-danger mt-1">
                    A foto será removida ao salvar.
                  </small>
                )}
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setFoto2File(e.target.files?.[0] || null)}
            />
          </div>

                    <div className="mb-3">
            <label className="form-label fw-semibold">
              Foto da galeria 3
            </label>

            {lojista.imagem4 && (
              <div className="mb-2">
                <img
                  src={lojista.imagem4}
                  alt="Foto atual 3"
                  className="d-block rounded-3 mb-2"
                  style={{ width: "150px", height: "100px", objectFit: "cover" }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setRemoverFoto3(!removerFoto3)}
                >
                  {removerFoto3 ? "Cancelar remoção" : "Remover foto"}
                </button>

                {removerFoto3 && (
                  <small className="d-block text-danger mt-1">
                    A foto será removida ao salvar.
                  </small>
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setFoto3File(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              Foto da galeria 4
            </label>

            {lojista.imagem5 && (
              <div className="mb-2">
                <img
                  src={lojista.imagem5}
                  alt="Foto atual 4"
                  className="d-block rounded-3 mb-2"
                  style={{ width: "150px", height: "100px", objectFit: "cover" }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setRemoverFoto4(!removerFoto4)}
                >
                  {removerFoto4 ? "Cancelar remoção" : "Remover foto"}
                </button>

                {removerFoto4 && (
                  <small className="d-block text-danger mt-1">
                    A foto será removida ao salvar.
                  </small>
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setFoto4File(e.target.files?.[0] || null)}
            />
          </div>

        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3" style={{ color: "#d63384" }}>
            <i className="bi bi-link-45deg me-2"></i>
            Contatos e site externo
          </h5>

          <div className="mb-3">
            <label className="form-label fw-semibold">WhatsApp com DDD</label>
            <input
              type="tel"
              className="form-control rounded-3"
              name="whatsapp"
              placeholder="(11) 99999-9999"
              value={formData.whatsapp}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Instagram</label>
            <input
              className="form-control rounded-3"
              name="instagram"
              placeholder="@nomedaloja"
              value={formData.instagram}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              Site ou catálogo externo
            </label>
            <input
              type="url"
              className="form-control rounded-3"
              name="link"
              placeholder="https://www.seusite.com.br"
              value={formData.link}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-between mb-5">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={() =>
                navigate(`/lojista-premium/${lojista.slug}?origem=edicao`)
            }
          >
            <i className="bi bi-eye me-2"></i>
            Visualizar página
          </button>

          <button
            type="submit"
            className="btn rounded-pill px-5 fw-bold"
            disabled={salvando}
            style={{ backgroundColor: "#d63384", color: "#fff" }}
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditarPaginaPremium;
