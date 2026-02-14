import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAnnonce, createConversation } from "../api/api";

function AnnonceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadAnnonce() {
    try {
      setLoading(true);
      setError(null);

      const data = await getAnnonce(id);

      // 🔎 debug utile: si tu veux voir ce que l’API renvoie
      console.log("Annonce detail API:", data);

      setAnnonce(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger l'annonce.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnonce();
  }, [id]);

  const formatType = (type) => {
    const map = {
      service_offer: "Service proposé",
      service_request: "Service recherché",
      item_sale: "Objet à vendre",
      item_request: "Objet recherché",
      urgent_help: "Aide urgente",
    };
    return map[type] || type || "—";
  };

  const formatStatus = (status) => {
    const map = {
      active: "Active",
      in_progress: "En cours",
      completed: "Terminée",
      cancelled: "Annulée",
    };
    return map[status] || status || "—";
  };

  const handleContact = async () => {
    try {
      const conv = await createConversation(annonce.id);
      navigate(`/chat/${conv.id}`);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Chargement...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!annonce) return null;

  // ✅ robustesse: certains backends renvoient prix/categorie au lieu de price/category
  const description =
    annonce.description ?? annonce.details ?? annonce.content ?? "";

  const category =
    annonce.category ?? annonce.categorie ?? annonce.cat ?? "";

  const price =
    annonce.price ?? annonce.prix ?? annonce.amount ?? null;

  // Auteur robust
  const authorName =
    (annonce.user_first_name || annonce.user_last_name)
      ? `${annonce.user_first_name || ""} ${annonce.user_last_name || ""}`.trim()
      : (annonce.user_name || annonce.user_email || "Utilisateur");

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">{annonce.title || "Annonce"}</h1>

              <div className="flex gap-3 mt-4 flex-wrap">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {formatType(annonce.type)}
                </span>

                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {formatStatus(annonce.status)}
                </span>

                {annonce.is_urgent && (
                  <span className="bg-red-500 px-3 py-1 rounded-full text-sm shadow">
                    URGENT
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
            >
              Retour
            </Link>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* DETAILS */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Détails</h2>

            <div className="p-4 bg-gray-50 rounded-2xl border">
              <p className="text-gray-700 whitespace-pre-line">
                {description?.trim() ? description : "—"}
              </p>

              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Catégorie :</span>{" "}
                  {category?.trim() ? category : "—"}
                </p>

                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Prix :</span>{" "}
                  {price === null || price === undefined || price === ""
                    ? "Non précisé"
                    : `${price} €`}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6">
              {annonce.status === "active" ? (
                <button
                  onClick={handleContact}
                  className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700"
                >
                  Contacter
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 px-8 py-3 rounded-xl font-semibold cursor-not-allowed"
                >
                  Indisponible
                </button>
              )}
            </div>
          </div>

          {/* AUTEUR */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Auteur</h2>

            {annonce.user_id ? (
              <Link
                to={`/users/${annonce.user_id}`}
                className="block p-5 border rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <p className="font-semibold text-lg text-gray-900">
                  {authorName}
                </p>

                <div className="mt-2 flex gap-2 text-sm text-gray-600 flex-wrap">
                  <span>⭐ {Number(annonce.user_score || 0).toFixed(1)} ({annonce.user_total_reviews || 0})</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {annonce.user_badge || "Nouveau"}
                  </span>
                  {annonce.user_is_verified && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Vérifié ✔
                    </span>
                  )}
                </div>

                <p className="text-blue-600 mt-2 text-sm font-semibold">
                  Voir le profil →
                </p>
              </Link>
            ) : (
              <div className="p-5 border rounded-2xl bg-gray-50 text-gray-700">
                Auteur indisponible (user_id manquant dans l’API)
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnnonceDetail;
