import { useNavigate } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";

export default function Favoritos({
  lojas,
  favoritos,
  toggleFavorito,
}) {
  const navigate = useNavigate();

  const lojasFavoritas = lojas.filter((loja) =>
    favoritos.includes(loja.id)
  );

  return (
    <main className="container py-4">
      <h2 className="mb-4 fw-bold">
        <AiFillHeart color="#d63384" /> Meus Favoritos
      </h2>

      {lojasFavoritas.length === 0 ? (
        <p className="text-muted">
          Você ainda não adicionou favoritos.
        </p>
      ) : (
        <div className="row g-3">
          {lojasFavoritas.map((loja) => (
            <div key={loja.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={loja.imagem}
                  className="card-img-top"
                  alt={loja.nome}
                  style={{ height: "180px", objectFit: "cover" }}
                />

                <div className="card-body d-flex flex-column">
                  <h5>{loja.nome}</h5>

                  <p className="text-muted small">
                    {loja.categoria}
                  </p>

                  <div className="mt-auto d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => toggleFavorito(loja.id)}
                    >
                      Remover ❤️
                    </button>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        const slug = loja.slug || loja.id;

                        if (loja.link) {
                            window.open(loja.link, "_blank");
                        } else {
                            navigate(`/lojista/${slug}`);
                        }
                        }}
                    >
                      Ver loja
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}