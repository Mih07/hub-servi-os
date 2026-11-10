
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function AprovacoesAdmin() {
    const [servicos, setServicos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [processandoId, setProcessandoId] = useState(null);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [aba, setAba] = useState("pendente");

    const [contadores, setContadores] = useState({
        pendente: 0,
        aprovado: 0,
        reprovado: 0
    });

    const navigate = useNavigate();

    useEffect(() => {
        buscarServicos();
        buscarContadores();
    }, [aba]);

    async function buscarServicos() {
        setCarregando(true);
        setErro("");

        const { data, error } = await supabase
            .from("servicos")
            .select("*")
            .eq("status", aba)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar serviços:", error);
            setErro("Não foi possível carregar os negócios.");
        } else {
            setServicos(data || []);
        }

        setCarregando(false);
    }

    async function buscarContadores() {
        const statusList = ["pendente", "aprovado", "reprovado"];

        const resultados = await Promise.all(
            statusList.map(async (status) => {
                const { count, error } = await supabase
                    .from("servicos")
                    .select("id", { count: "exact", head: true })
                    .eq("status", status);

                if (error) {
                    console.error(`Erro ao contar ${status}:`, error);
                    return [status, 0];
                }

                return [status, count || 0];
            })
        );

        setContadores(Object.fromEntries(resultados));
    }

    async function mudarStatusServico(id, statusAtual, novoStatus) {
        setErro("");
        setSucesso("");
        setProcessandoId(id);

        const aprovado = novoStatus === "aprovado";

        const { data, error } = await supabase
            .from("servicos")
            .update({
                status: novoStatus,
                aprovado: aprovado
            })
            .eq("id", id)
            .eq("status", statusAtual)
            .select("id")
            .maybeSingle();

        if (error) {
            console.error("Erro ao atualizar serviço:", error);
            setErro("Não foi possível atualizar o negócio. Verifique as permissões.");
            setProcessandoId(null);
            return;
        }

        if (!data) {
            setErro("Nenhum negócio foi atualizado. Verifique sua permissão de administrador.");
            setProcessandoId(null);
            return;
        }

        const mensagens = {
            aprovado: "Negócio aprovado com sucesso! 🎉",
            reprovado: "Negócio reprovado com sucesso."
        };

        setSucesso(mensagens[novoStatus]);

        await buscarServicos();
        await buscarContadores();

        setProcessandoId(null);
    }

    async function excluirServico(servico) {
        const confirmar = window.confirm(
            `Tem certeza de que deseja excluir o cadastro de "${servico.nome || "este negócio"}"?\\n\\n` +
            "O cadastro será removido definitivamente da tabela de serviços do Hub. Essa ação não pode ser desfeita."
        );

        if (!confirmar) return;

        setErro("");
        setSucesso("");
        setProcessandoId(servico.id);

        const { error } = await supabase
            .from("servicos")
            .delete()
            .eq("id", servico.id)
            .eq("status", "reprovado");

        if (error) {
            console.error("Erro ao excluir serviço reprovado:", error);
            setErro("Não foi possível excluir o negócio. Verifique as permissões do administrador.");
            setProcessandoId(null);
            return;
        }

        setServicos((prev) => prev.filter((item) => item.id !== servico.id));
        setSucesso("Cadastro reprovado excluído com sucesso.");
        await buscarContadores();
        setProcessandoId(null);
    }

    const abas = [
        {
            status: "pendente",
            nome: "Pendentes",
            cor: "warning",
            texto: "Empresas aguardando análise"
        },
        {
            status: "aprovado",
            nome: "Aprovados",
            cor: "success",
            texto: "Negócios liberados no Hub"
        },
        {
            status: "reprovado",
            nome: "Reprovados",
            cor: "danger",
            texto: "Negócios que não foram aprovados"
        }
    ];

    const mensagensVazias = {
        pendente: "Não há cadastros aguardando aprovação.",
        aprovado: "Não há negócios aprovados.",
        reprovado: "Não há negócios reprovados."
    };

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
                    Gerencie os cadastros dos negócios do Hub Serviços.
                </p>
            </div>

            {/* Abas de status */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {abas.map((item) => (
                    <button
                        key={item.status}
                        type="button"
                        className={`btn rounded-3 ${
                            aba === item.status
                                ? `btn-${item.cor}`
                                : `btn-outline-${item.cor}`
                        }`}
                        onClick={() => {
                            setAba(item.status);
                            setSucesso("");
                            setErro("");
                        }}
                    >
                        {item.nome} ({contadores[item.status]})
                    </button>
                ))}
            </div>

            {/* Resumo da aba selecionada */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1">
                                {abas.find((item) => item.status === aba)?.nome}
                            </h5>

                            <p className="text-muted mb-0">
                                {abas.find((item) => item.status === aba)?.texto}
                            </p>
                        </div>

                        <span className={`badge bg-${abas.find((item) => item.status === aba)?.cor} ${aba === "pendente" ? "text-dark" : ""} fs-6`}>
                            {servicos.length} negócios
                        </span>
                    </div>
                </div>
            </div>

            {/* Mensagem de sucesso */}
            {sucesso && (
                <div className="alert alert-success">
                    {sucesso}
                </div>
            )}

            {/* Carregamento */}
            {carregando && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>

                    <p className="mt-3">Carregando negócios...</p>
                </div>
            )}

            {/* Erro */}
            {erro && (
                <div className="alert alert-danger">
                    {erro}
                </div>
            )}

            {/* Lista vazia */}
            {!carregando && !erro && servicos.length === 0 && (
                <div className="alert alert-light border">
                    <h5 className="mb-1">Tudo em dia! 🎉</h5>
                    <p className="mb-0">
                        {mensagensVazias[aba]}
                    </p>
                </div>
            )}

            {/* Cards dos negócios */}
            {!carregando && servicos.length > 0 && (
                <div className="row g-3">
                    {servicos.map((servico) => (
                        <div
                            className="col-12 col-md-6 col-xl-4"
                            key={servico.id}
                        >
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="fw-bold mb-0">
                                            {servico.nome || "Nome não informado"}
                                        </h5>

                                        <span
                                            className={`badge bg-${
                                                aba === "pendente"
                                                    ? "warning text-dark"
                                                    : aba === "aprovado"
                                                    ? "success"
                                                    : "danger"
                                            }`}
                                        >
                                            {aba === "pendente"
                                                ? "Pendente"
                                                : aba === "aprovado"
                                                ? "Aprovado"
                                                : "Reprovado"}
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

                                    <p className="text-muted mb-3">
                                        <strong>ID:</strong> {servico.id}
                                    </p>

                                    {/* Ações de acordo com o status */}
                                    <div className="d-flex gap-2">

                                        {aba === "pendente" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-success w-100 rounded-3"
                                                    disabled={processandoId !== null}
                                                    onClick={() =>
                                                        mudarStatusServico(
                                                            servico.id,
                                                            "pendente",
                                                            "aprovado"
                                                        )
                                                    }
                                                >
                                                    {processandoId === servico.id
                                                        ? "Processando..."
                                                        : "✓ Aprovar"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger w-100 rounded-3"
                                                    disabled={processandoId !== null}
                                                    onClick={() =>
                                                        mudarStatusServico(
                                                            servico.id,
                                                            "pendente",
                                                            "reprovado"
                                                        )
                                                    }
                                                >
                                                    {processandoId === servico.id
                                                        ? "Processando..."
                                                        : "✕ Reprovar"}
                                                </button>
                                            </>
                                        )}

                                        {aba === "aprovado" && (
                                            <button
                                                type="button"
                                                className="btn btn-danger w-100 rounded-3"
                                                disabled={processandoId !== null}
                                                onClick={() =>
                                                    mudarStatusServico(
                                                        servico.id,
                                                        "aprovado",
                                                        "reprovado"
                                                    )
                                                }
                                            >
                                                {processandoId === servico.id
                                                    ? "Processando..."
                                                    : "✕ Reprovar negócio"}
                                            </button>
                                        )}

                                        {aba === "reprovado" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-success w-100 rounded-3"
                                                    disabled={processandoId !== null}
                                                    onClick={() =>
                                                        mudarStatusServico(
                                                            servico.id,
                                                            "reprovado",
                                                            "aprovado"
                                                        )
                                                    }
                                                >
                                                    {processandoId === servico.id
                                                        ? "Processando..."
                                                        : "✓ Reaprovar negócio"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger w-100 rounded-3"
                                                    disabled={processandoId !== null}
                                                    onClick={() => excluirServico(servico)}
                                                >
                                                    {processandoId === servico.id
                                                        ? "Processando..."
                                                        : "🗑 Excluir"}
                                                </button>
                                            </>
                                        )}

                                    </div>
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
