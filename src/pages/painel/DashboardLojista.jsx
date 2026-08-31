import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function DashboardLojista() {
    const [lojista, setLojista] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
    const buscarLojista = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        console.log("ID do usuário:", user?.id);
        console.log("E-mail do usuário:", user?.email);

        const { data: cadastro, error } = await supabase
            .from("servicos")
            .select("nome, plano, tipo_negocio, aprovado")
            .eq("user_id", user.id)
            .single();

        console.log("Cadastro encontrado:", cadastro);
        console.log("Erro ao buscar cadastro:", error);
        setLojista(cadastro);
    };

    buscarLojista();
}, []);

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Erro ao sair:", error);
        return;
    }

    navigate("/login-lojista");
};


    return (
        <div className="container mt-5">
            {/* CABEÇALHO */}
        <div className="mb-5">
            <h2 className="fw-bold">Olá, {lojista?.nome}! 👋
            </h2>

            <p className="text-secondary fs-5 mb-0">
                Bem-vindo à sua Central do Lojista.
            </p>
        </div>

        {/* INFORMAÇÕES DO LOJISTA */}
        <div className="row g-4 mb-5">

            {/* PLANO */}
            <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                    <div className="d-flex align-items-center">
                        <div className="fs-1 me-3">
                            ⭐
                        </div>

                        <div>
                            <p className="text-secondary mb-1">
                                Meu plano
                            </p>

                            <h4 className="fw-bold mb-0">
                                {lojista?.plano}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATUS */}
            <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                    <div className="d-flex align-items-center">
                        <div className="fs-1 me-3">
                            {lojista?.aprovado ? "✅" : "⏳"}
                        </div>

                        <div>
                            <p className="text-secondary mb-1">
                                Status do cadastro
                            </p>

                            <h4 className="fw-bold mb-0">
                                {lojista?.aprovado
                                    ? "Aprovado"
                                    : "Aguardando aprovação"}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* RECURSOS DA CENTRAL */}
        <div className="mb-5">
            <h3 className="fw-bold mb-4">
                O que você quer fazer?
            </h3>
        </div>

        <div className="row g-4 mb-5">
        {/* MEU NEGÓCIO */}
        <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                <div className="fs-1 mb-3">
                    🏪
                </div>

                <h5 className="fw-bold">
                    Meu negócio
                </h5>

                <p className="text-secondary mb-3">
                    Visualize e edite as informações do seu negócio.
                </p>

                <button
                    type="button"
                    className="btn btn-primary rounded-3"
                >
                    Gerenciar
                </button>
            </div>
        </div>

        {/* MINHA PÁGINA */}
        <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                <div className="fs-1 mb-3">
                    👁️
                </div>

                <h5 className="fw-bold">
                    Minha página
                </h5>

                <p className="text-secondary mb-3">
                    Veja como seu negócio aparece para os clientes no Hub.
                </p>

                <button
                    type="button"
                    className="btn btn-primary rounded-3"
                >
                    Ver minha página
                </button>
            </div>
        </div>

        {/* RESULTADOS */}
        <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                <div className="fs-1 mb-3">
                    📊
                </div>
                <h5 className="fw-bold">Resultados</h5>
                <p className="text-secondary mb-3">
                    Acompanhe o desempenho do seu negócio no Hub.
                </p>
                <button
                    type="button"
                    className="btn btn-primary rounded-3"
                >
                    Ver resultados
                </button>
            </div>
        </div>

        {/* DIVULGAÇÃO */}
        <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                <div className="fs-1 mb-3">
                    📣
                </div>

                <h5 className="fw-bold">
                    Divulgação
                </h5>

                <p className="text-secondary mb-3">
                    Destaque seu negócio e alcance mais clientes no Hub.
                </p>

                <button
                    type="button"
                    className="btn btn-primary rounded-3"
                >
                    Divulgar meu negócio
                </button>
            </div>
        </div>
        {/* CONFIGURAÇÕES */}
        <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                <div className="fs-1 mb-3">
                    ⚙️
                </div>

                <h5 className="fw-bold">
                    Configurações
                </h5>

                <p className="text-secondary mb-3">
                    Ajuste as configurações da sua Central e do seu negócio.
                </p>

                <button
                    type="button"
                    className="btn btn-primary rounded-3"
                >
                    Configurar
                </button>
            </div>
        </div>
    </div>
       

            <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Sair
            </button>
        </div>
    );
       
}
export default DashboardLojista;