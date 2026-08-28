import { useState } from "react";
import { supabase } from "../../supabaseClient";

function RedefinirSenha() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();

    setMensagemErro("");
    setMensagemSucesso("");

    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setMensagemErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        console.error("Erro ao atualizar senha:", error);
        setMensagemErro(
          "Não foi possível atualizar a senha. Tente novamente."
        );
        return;
      }

      setMensagemSucesso(
        "Sua senha foi atualizada com sucesso! Você já pode entrar novamente."
      );

      setSenha("");
      setConfirmarSenha("");
    } catch (erro) {
      console.error("Erro inesperado:", erro);
      setMensagemErro(
        "Ocorreu um erro inesperado. Tente novamente em alguns instantes."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4">

            <div className="text-center mb-4">
              <div className="fs-1 mb-2">
                <i className="bi bi-shield-lock"></i>
              </div>

              <h2 className="fw-bold">
                Redefinir senha
              </h2>

              <p className="text-secondary mb-0">
                Crie uma nova senha para acessar sua Central do Lojista.
              </p>
            </div>

            {mensagemErro && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {mensagemErro}
              </div>
            )}

            {mensagemSucesso && (
              <div className="alert alert-success" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {mensagemSucesso}
              </div>
            )}

            <form onSubmit={handleRedefinirSenha}>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Nova senha
                </label>

                <div className="input-group">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    className="form-control"
                    placeholder="Digite sua nova senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setMostrarSenha((valorAtual) => !valorAtual)
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

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Confirmar nova senha
                </label>

                <div className="input-group">
                  <input
                    type={mostrarConfirmacao ? "text" : "password"}
                    className="form-control"
                    placeholder="Repita sua nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setMostrarConfirmacao((valorAtual) => !valorAtual)
                    }
                  >
                    <i
                      className={
                        mostrarConfirmacao
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
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Atualizando...
                  </>
                ) : (
                  <>
                    Atualizar senha
                    <i className="bi bi-check2-circle ms-2"></i>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>
      </div>
    </main>
  );
}

export default RedefinirSenha;