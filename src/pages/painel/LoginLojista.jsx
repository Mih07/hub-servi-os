import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "../../styles/login.css";

function LoginLojista() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

   // Tema da página (marca, copa, natal, etc.)
  const tema = "";

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setMensagemErro("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        console.error("Erro do Supabase:", error);

        if (error.message === "Invalid login credentials") {
          setMensagemErro("E-mail ou senha incorretos.");
        } else if (error.message === "Email not confirmed") {
          setMensagemErro("Este e-mail ainda não foi confirmado.");
        } else {
          setMensagemErro(
            "Não foi possível entrar no painel. Verifique os dados e tente novamente."
          );
        }

        return;
      }

      if (!data?.user) {
        setMensagemErro("Não foi possível identificar o usuário.");
        return;
      }

      console.log("Login realizado:", data.user);

      navigate("/painel/lojista");
    } catch (erro) {
      console.error("Erro inesperado no login:", erro);

      setMensagemErro(
        "Ocorreu um erro inesperado. Tente novamente em alguns instantes."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-lojista-pagina py-4 py-lg-5" data-tema= "">
      <div className="container">
        <section className="login-lojista-container overflow-hidden">
          <div className="row g-0">
            <div className="col-12 col-lg-6">
              <div className="login-lojista-apresentacao h-100 p-4 p-md-5">
                <Link to="/" className="login-lojista-marca">
                  <span>Hub</span> Serviços
                </Link>

                <div className="login-lojista-apresentacao-conteudo my-auto">
                  <span className="login-lojista-etiqueta">
                    Central do Lojista
                  </span>

                  <h1 className="mt-4 mb-3">
                    Gerencie sua empresa em um só lugar
                  </h1>

                  <p className="login-lojista-texto">
                    Acesse seu painel para atualizar sua empresa, organizar
                    produtos, acompanhar seus resultados e aproveitar os
                    recursos do seu plano.
                  </p>

                  <div className="login-lojista-beneficios d-none d-md-flex flex-column gap-3 mt-4">
                    <div className="d-flex align-items-start gap-3">
                      <div className="login-lojista-beneficio-icone">
                        <i className="bi bi-shop"></i>
                      </div>

                      <div>
                        <strong className="d-block">Minha empresa</strong>
                        <span>
                          Atualize as informações do seu negócio.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="login-lojista-beneficio-icone">
                        <i className="bi bi-box-seam"></i>
                      </div>

                      <div>
                        <strong className="d-block">
                          Produtos e serviços
                        </strong>
                        <span>
                          Organize tudo o que aparece no seu catálogo.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="login-lojista-beneficio-icone">
                        <i className="bi bi-graph-up-arrow"></i>
                      </div>

                      <div>
                        <strong className="d-block">Resultados</strong>
                        <span>
                          Acompanhe acessos, cliques e pedidos.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="login-lojista-area-formulario h-100 p-4 p-md-5">
                <div className="login-lojista-card mx-auto">
                  <div className="login-lojista-cabecalho text-center mb-4">
                    <div className="login-lojista-icone mx-auto mb-3">
                      <i className="bi bi-person-circle"></i>
                    </div>

                    <h2 className="fw-bold mb-2">Entrar no painel</h2>

                    <p className="text-secondary mb-0">
                      Informe os dados cadastrados para acessar sua conta.
                    </p>
                  </div>

                  {mensagemErro && (
                    <div
                      className="alert alert-danger d-flex align-items-center gap-2"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-circle-fill"></i>
                      <span>{mensagemErro}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label
                        htmlFor="email"
                        className="form-label fw-semibold"
                      >
                        E-mail
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-envelope"></i>
                        </span>

                        <input
                          id="email"
                          type="email"
                          className="form-control"
                          placeholder="seuemail@exemplo.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setMensagemErro("");
                          }}
                          autoComplete="email"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="senha"
                        className="form-label fw-semibold"
                      >
                        Senha
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-lock"></i>
                        </span>

                        <input
                          id="senha"
                          type={mostrarSenha ? "text" : "password"}
                          className="form-control"
                          placeholder="Digite sua senha"
                          value={senha}
                          onChange={(e) => {
                            setSenha(e.target.value);
                            setMensagemErro("");
                          }}
                          autoComplete="current-password"
                          disabled={loading}
                          required
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setMostrarSenha((valorAtual) => !valorAtual)
                          }
                          aria-label={
                            mostrarSenha
                              ? "Ocultar senha"
                              : "Mostrar senha"
                          }
                        >
                          <i
                            className={
                              mostrarSenha
                                ? "bi bi-eye-slash"
                                : "bi bi-eye"
                            }
                          ></i>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn botao-principal w-100 py-3 fw-bold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          ></span>
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar na Central do Lojista
                          <i className="bi bi-arrow-right ms-2"></i>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="login-lojista-ajuda mt-4 p-3 text-center">
                    <i className="bi bi-headset fs-4"></i>

                    <p className="mb-3">
                      <strong className="d-block mb-1">
                        Central de Suporte
                      </strong>

                      Se você ainda não possui acesso à Central do Lojista
                      ou está com dificuldades para entrar, nossa equipe
                      pode ajudar.
                    </p>

                    <a
                      href="https://wa.me/5511971128269?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20para%20acessar%20a%20Central%20do%20Lojista%20do%20Hub%20Servi%C3%A7os."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn login-lojista-whatsapp w-100"
                    >
                      <i className="bi bi-whatsapp me-2"></i>
                      Falar pelo WhatsApp
                    </a>
                  </div>

                  <Link
                    to="/"
                    className="login-lojista-voltar d-flex justify-content-center align-items-center gap-2 mt-4"
                  >
                    <i className="bi bi-arrow-left"></i>
                    Voltar para o Hub Serviços
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginLojista;