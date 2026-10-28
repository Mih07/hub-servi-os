
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function ProtecaoAdmin({ children }) {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificarAcesso() {
      try {
        const { data: { user }, error: erroUsuario } =
          await supabase.auth.getUser();

        if (erroUsuario || !user) {
          if (ativo) setAutorizado(false);
          return;
        }

        const { data, error } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (ativo) {
          setAutorizado(!error && !!data);
        }
      } catch (erro) {
        console.error("Erro ao verificar acesso administrativo:", erro);
        if (ativo) setAutorizado(false);
      } finally {
        if (ativo) setVerificando(false);
      }
    }

    verificarAcesso();

    return () => {
      ativo = false;
    };
  }, []);

  if (verificando) {
    return (
      <div className="container py-5 text-center">
        Verificando acesso administrativo...
      </div>
    );
  }

  if (!autorizado) {
    return <Navigate to="/login-admin" replace />;
  }

  return children;
}

export default ProtecaoAdmin;
