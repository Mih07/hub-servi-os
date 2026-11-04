
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function ModeracaoAvaliacoes() {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        buscarAvaliacoes();
    }, []);

    const buscarAvaliacoes = async () => {
        const { data, error } = await supabase
            .from("avaliacoes")
            .select(`
                id,
                loja_id,
                nome_cliente,
                nota,
                comentario,
                aprovado,
                created_at,
                servicos (
                    nome
                )
            `)
            .eq("aprovado", false)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar avaliações:", error);
            setMensagem("Erro ao carregar avaliações.");
        } else {
            setAvaliacoes(data || []);
        }

        setCarregando(false);
    };

    const moderarAvaliacao = async (id, aprovado) => {
        let error;

        if (aprovado) {
            const resultado = await supabase.rpc("aprovar_avaliacao", {
            p_avaliacao_id: id
            });

            error = resultado.error;
        } else {
            const resultado = await supabase
            .from("avaliacoes")
            .update({ aprovado: false })
            .eq("id", id);

            error = resultado.error;
        }

        if (error) {
            console.error("Erro ao moderar avaliação:", error);
            setMensagem("Não foi possível atualizar a avaliação.");
            return;
        }

        setMensagem(
            aprovado
            ? "Avaliação aprovada e contabilizada com sucesso!"
            : "Avaliação reprovada com sucesso!"
        );

        buscarAvaliacoes();
        };

    return (
        <div className="container mt-5 mb-5">

            <button
                className="btn btn-outline-secondary mb-4"
                onClick={() => navigate("/painel/admin")}
            >
                ← Voltar ao painel administrativo
            </button>

            <h2 className="fw-bold">Moderação de avaliações</h2>

            <p className="text-secondary">
                Gerencie os comentários enviados pelos clientes do Hub Serviços.
            </p>

            {mensagem && (
                <div className="alert alert-info">
                    {mensagem}
                </div>
            )}

            {carregando ? (
                <p>Carregando avaliações...</p>
            ) : avaliacoes.length === 0 ? (
                <div className="alert alert-success">
                    Tudo em dia! 🎉
                    <br />
                    Não há avaliações aguardando moderação.
                </div>
            ) : (
                <>
                    <div className="alert alert-warning">
                        {avaliacoes.length} avaliação(ões) aguardando moderação.
                    </div>

                    <div className="row g-4">
                        {avaliacoes.map((avaliacao) => (
                            <div
                                className="col-12 col-md-6 col-lg-4"
                                key={avaliacao.id}
                            >
                                <div className="card border-0 shadow-sm rounded-4 h-100 p-4">

                                    <h5 className="fw-bold">
                                        {avaliacao.servicos?.nome || "Negócio"}
                                    </h5>

                                    <p className="text-secondary mb-1">
                                        Cliente: {avaliacao.nome_cliente}
                                    </p>

                                    <div className="text-warning mb-2">
                                        {"⭐".repeat(avaliacao.nota)}
                                    </div>

                                    <p className="mb-3">
                                        {avaliacao.comentario}
                                    </p>

                                    <small className="text-secondary mb-3">
                                        {new Date(
                                            avaliacao.created_at
                                        ).toLocaleDateString("pt-BR")}
                                    </small>

                                    <div className="d-flex gap-2 mt-auto">

                                        <button
                                            className="btn btn-success rounded-3 flex-fill"
                                            onClick={() =>
                                                moderarAvaliacao(
                                                    avaliacao.id,
                                                    true
                                                )
                                            }
                                        >
                                            ✓ Aprovar
                                        </button>

                                        <button
                                            className="btn btn-danger rounded-3 flex-fill"
                                            onClick={() =>
                                                moderarAvaliacao(
                                                    avaliacao.id,
                                                    false
                                                )
                                            }
                                        >
                                            ✕ Reprovar
                                        </button>

                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

        </div>
    );
}

export default ModeracaoAvaliacoes;
