
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "../../styles/login.css";

function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

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

      if (error || !data?.user) {
        setMensagemErro("E-mail ou senha incorretos.");
        return;
      }

      const { data: admin, error: erroAdmin } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (erroAdmin || !admin) {
        await supabase.auth.signOut();
        setMensagemErro(
          "Esta conta não possui autorização para acessar a Central Administrativa."
        );
        return;
      }

      navigate("/painel/admin", { replace: true });
    } catch (erro) {
      console.error("Erro no login administrativo:", erro);
      setMensagemErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-lojista-pagina py-4 py-lg-5">
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
                    Central Administrativa
                  </span>

                  <h1 className="mt-4 mb-3">
                    Gerencie o Hub Serviços em um só lugar
                  </h1>

                  <p className="login-lojista-texto">
                    Acesse a área administrativa para gerenciar empresas,
                    aprovações, destaques e planos da plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="login-lojista-area-formulario h-100 p-4 p-md-5">
                <div className="login-lojista-card mx-auto">
                  <div className="login-lojista-cabecalho text-center mb-4">
                    <div className="login-lojista-icone mx-auto mb-3">
                      <i className="bi bi-shield-lock"></i>
                    </div>

                    <h2 className="fw-bold mb-2">
                      Acesso administrativo
                    </h2>

                    <p className="text-secondary mb-0">
                      Entre com sua conta autorizada.
                    </p>
                  </div>

                  {mensagemErro && (
                    <div className="alert alert-danger" role="alert">
                      {mensagemErro}
                    </div>
                  )}

                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="email-admin" className="form-label fw-semibold">
                        E-mail
                      </label>

                      <input
                        id="email-admin"
                        type="email"
                        className="form-control"
                        placeholder="Seu e-mail administrativo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="senha-admin" className="form-label fw-semibold">
                        Senha
                      </label>

                      <div className="input-group">
                        <input
                          id="senha-admin"
                          type={mostrarSenha ? "text" : "password"}
                          className="form-control"
                          placeholder="Digite sua senha"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          autoComplete="current-password"
                          disabled={loading}
                          required
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setMostrarSenha((valor) => !valor)}
                          aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        >
                          <i className={mostrarSenha ? "bi bi-eye-slash" : "bi bi-eye"} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn botao-principal w-100 py-3 fw-bold"
                      disabled={loading}
                    >
                      {loading ? "Verificando acesso..." : "Entrar na Central Administrativa"}
                    </button>
                  </form>

                  <Link
                    to="/"
                    className="login-lojista-voltar d-flex justify-content-center align-items-center gap-2 mt-4"
                  >
                    <i className="bi bi-arrow-left" />
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

export default LoginAdmin;
