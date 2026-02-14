import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAnnonces, createConversation } from "../api/api";
import CreateAnnonce from "../components/CreateAnnonce";
import Filtres from "../components/Filtres";

function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("user_email");

  // ✅ chargement annonces
  const loadAnnonces = useCallback(
    async (filters = {}) => {
      try {
        const data = await getAnnonces(filters);
        const allAnnonces = Array.isArray(data) ? data : data.results || [];

        const autresAnnonces = allAnnonces
          .filter((a) => a.user_email !== currentUserEmail)
          .filter((a) => a.status !== "completed");

        setAnnonces(autresAnnonces);
      } catch (error) {
        console.error("Erreur chargement annonces:", error);
      }
    },
    [currentUserEmail]
  );

  useEffect(() => {
    loadAnnonces();
  }, [loadAnnonces]);

  // ✅ contact
  const handleContact = async (annonceId) => {
    try {
      const conversation = await createConversation(annonceId);
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Erreur création conversation:", error);
      alert(error.message);
    }
  };

  // helpers
  const formatType = (type) => {
    const map = {
      service_offer: "Service proposé",
      service_request: "Service recherché",
      item_sale: "Objet à vendre",
      item_request: "Objet recherché",
      urgent_help: "Aide urgente",
    };
    return map[type] || type;
  };

  const formatStatus = (status) => {
    const map = {
      active: {
        label: "Active",
        color: "bg-green-50 text-green-600 border border-green-200",
      },
      in_progress: {
        label: "En cours",
        color: "bg-yellow-50 text-yellow-600 border border-yellow-200",
      },
      cancelled: {
        label: "Annulée",
        color: "bg-red-50 text-red-600 border border-red-200",
      },
    };

    const config = map[status] || {
      label: status,
      color: "bg-gray-50 text-gray-500 border border-gray-200",
    };

    return (
      <span className={`text-xs px-3 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const annoncesFiltrees = activeOnly
    ? annonces.filter((a) => a.status === "active")
    : annonces;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
          Annonces - Villemomble
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-2xl hover:scale-105 transform transition duration-200 shadow-md"
        >
          + Créer une annonce
        </button>
      </div>

      {/* FILTRES BACKEND */}
      <div className="mb-6">
        <Filtres onFilter={loadAnnonces} />
      </div>

      {/* FILTRE FRONTEND */}
      <div className="mb-8 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={() => setActiveOnly(!activeOnly)}
          className="w-4 h-4"
        />
        <label className="text-sm font-medium text-gray-700">
          Afficher uniquement les annonces actives
        </label>
      </div>

      {/* LISTE */}
      {annoncesFiltrees.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-500">
          Aucune annonce disponible.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {annoncesFiltrees.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 relative group"
            >
              {/* AUTEUR (clic vers profil public) */}
              {/* nécessite user_id dans l'API */}
              {a.user_id ? (
                <Link
                  to={`/users/${a.user_id}`}
                  className="flex items-center justify-between mb-4 p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition"
                  title="Voir le profil"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {(a.user_first_name?.[0] || a.user_email?.[0] || "?").toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {a.user_first_name || a.user_last_name
                          ? `${a.user_first_name || ""} ${a.user_last_name || ""}`.trim()
                          : a.user_email || "Utilisateur"}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span>
                          ⭐ {Number(a.user_score || 0).toFixed(1)} ({a.user_total_reviews || 0})
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {a.user_badge || "Nouveau"}
                        </span>

                        {a.user_is_verified && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Vérifié ✔
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-600">Voir →</span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">
                    {(a.user_email?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {a.user_email || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500">
                      (ID profil manquant dans l’API)
                    </p>
                  </div>
                </div>
              )}

              {/* Type */}
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                {formatType(a.type)}
              </span>

              {/* Urgent */}
              {a.is_urgent && (
                <span className="absolute top-5 right-5 text-xs bg-red-500 text-white px-3 py-1 rounded-full shadow">
                  URGENT
                </span>
              )}

              <h3 className="font-semibold text-lg mt-4 mb-2 text-gray-800 group-hover:text-blue-600 transition">
                {a.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {a.description}
              </p>

              <p className="text-sm text-gray-500">
                Catégorie : {a.category}
              </p>

              <p className="text-sm font-semibold text-gray-800 mt-1">
                Prix : {a.price ?? "Non précisé"} €
              </p>

              <div className="flex justify-between items-center mt-4">
                {formatStatus(a.status)}
              </div>

              {a.status === "active" ? (
                <button
                  onClick={() => handleContact(a.id)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-xl hover:scale-105 transform transition duration-200 shadow-md"
                >
                  Contacter
                </button>
              ) : (
                <button
                  disabled
                  className="w-full mt-6 bg-gray-200 text-gray-500 py-2 rounded-xl cursor-not-allowed"
                >
                  Indisponible
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODALE CREATION */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 z-10 animate-fadeIn">
            <CreateAnnonce
              onCreated={() => {
                loadAnnonces();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Annonces;
