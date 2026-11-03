
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";


function AprovacoesAdmin() {
    const [servicos, setServicos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        buscarServicosPendentes();
    }, []);

    async function buscarServicosPendentes() {
        setCarregando(true);
        setErro("");

        const { data, error } = await supabase
            .from("servicos")
            .select("*")
            .eq("aprovado", false)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar serviços:", error);
            setErro("Não foi possível carregar os cadastros pendentes.");
        } else {
            setServicos(data || []);
        }

        setCarregando(false);
    }

    return (
        <div className="container py-4">
            
            <button
                type="button"
                className="btn btn-outline-secondary rounded-3 mb-4"
                onClick={() => navigate("/painel/admin")}
            >
                ← Voltar ao painel administrativo
            </button>

            <div className="mb-4">
                <h2 className="fw-bold">Aprovações</h2>
                <p className="text-muted">
                    Confira os negócios que aguardam aprovação para aparecer no Hub.
                </p>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1">Cadastros pendentes</h5>
                            <p className="text-muted mb-0">
                                Empresas aguardando análise
                            </p>
                        </div>

                        <span className="badge bg-warning text-dark fs-6">
                            {servicos.length} pendentes
                        </span>
                    </div>
                </div>
            </div>

            {carregando && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3">Carregando cadastros...</p>
                </div>
            )}

            {erro && (
                <div className="alert alert-danger">
                    {erro}
                </div>
            )}

            {!carregando && !erro && servicos.length === 0 && (
                <div className="alert alert-success">
                    <h5 className="mb-1">Tudo em dia! 🎉</h5>
                    <p className="mb-0">
                        Não há cadastros aguardando aprovação.
                    </p>
                </div>
            )}

            {!carregando && !erro && servicos.length > 0 && (
                <div className="row g-3">
                    {servicos.map((servico) => (
                        <div className="col-12 col-md-6 col-xl-4" key={servico.id}>
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="fw-bold mb-0">
                                            {servico.nome || "Nome não informado"}
                                        </h5>

                                        <span className="badge bg-warning text-dark">
                                            Pendente
                                        </span>
                                    </div>

                                    <p className="text-muted mb-2">
                                        <strong>Categoria:</strong>{" "}
                                        {servico.categoria || "Não informada"}
                                    </p>

                                    <p className="text-muted mb-2">
                                        <strong>Região:</strong>{" "}
                                        {servico.regiao || "Não informada"}
                                    </p>

                                    <p className="text-muted mb-2">
                                        <strong>Plano:</strong>{" "}
                                        {servico.plano || "Não informado"}
                                    </p>

                                    <p className="text-muted mb-0">
                                        <strong>ID:</strong> {servico.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AprovacoesAdmin;
