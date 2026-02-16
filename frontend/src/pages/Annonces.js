import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAnnonces, createConversation, getMe } from "../api/api";
import CreateAnnonce from "../components/CreateAnnonce";
import Filtres from "../components/Filtres";
import { useToast } from "../ui/Toast";

function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  // Seniors UX
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Optional: profil
  const [me, setMe] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("user_email");

  // Charger mon profil
  useEffect(() => {
    async function loadMe() {
      try {
        const data = await getMe();
        setMe(data);
      } catch (e) {
        console.error("Erreur getMe:", e);
      }
    }
    loadMe();
  }, []);

  // ✅ chargement annonces
  const loadAnnonces = useCallback(
    async (filters = {}, { silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
          setPageError(null);
        }

        const data = await getAnnonces(filters);
        const allAnnonces = Array.isArray(data) ? data : data.results || [];

        // retirer mes annonces + celles "completed"
        const autresAnnonces = allAnnonces
          .filter((a) => a.user_email !== currentUserEmail)
          .filter((a) => a.status !== "completed");

        setAnnonces(autresAnnonces);

        if (!silent) toast.success("Annonces mises à jour ✅");
      } catch (error) {
        console.error("Erreur chargement annonces:", error);
        setPageError("Impossible de charger les annonces. Réessaie.");
        if (!silent) toast.error("Erreur : annonces non chargées.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentUserEmail, toast]
  );

  useEffect(() => {
    loadAnnonces({}, { silent: true }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAnnonces]);

  // ✅ contact
  const handleContact = async (annonceId) => {
    try {
      const conversation = await createConversation(annonceId);
      navigate(`/chat/${conversation.id}`);
      toast.success("Conversation ouverte ✅");
    } catch (error) {
      console.error("Erreur création conversation:", error);
      toast.error(error?.message || "Impossible d’ouvrir la conversation.");
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
    return map[type] || "Annonce";
  };

  const formatStatus = (status) => {
    const map = {
      active: {
        label: "Active",
        color: "bg-green-50 text-green-800 border border-green-200",
      },
      in_progress: {
        label: "En cours",
        color: "bg-yellow-50 text-yellow-900 border border-yellow-200",
      },
      cancelled: {
        label: "Annulée",
        color: "bg-red-50 text-red-800 border border-red-200",
      },
      completed: {
        label: "Terminée",
        color: "bg-blue-50 text-blue-800 border border-blue-200",
      },
    };

    const config = map[status] || {
      label: status || "—",
      color: "bg-gray-50 text-gray-800 border border-gray-200",
    };

    return (
      <span className={`text-base px-4 py-2 rounded-full font-extrabold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const annoncesFiltrees = useMemo(() => {
    return activeOnly ? annonces.filter((a) => a.status === "active") : annonces;
  }, [annonces, activeOnly]);

  const pageTitleVille = me?.ville ? `🧾 Annonces - ${me.ville}` : "🧾 Annonces";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {pageTitleVille}
          </h2>
          <p className="text-gray-700 text-lg mt-2">
            Trouvez un service ou un objet près de chez vous.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => loadAnnonces({}, { silent: false })}
            className="bg-gray-900 text-white px-6 py-4 rounded-3xl font-extrabold hover:bg-black transition focus:outline-none focus:ring-4 focus:ring-gray-200"
            title="Rafraîchir"
          >
            ↻ Actualiser
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-700 text-white px-7 py-4 rounded-3xl font-extrabold hover:bg-blue-800 transition shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            ➕ Créer une annonce
          </button>
        </div>
      </div>

      {/* ERREUR PAGE */}
      {pageError && (
        <div className="mb-6 bg-red-50 text-red-700 border border-red-200 p-5 rounded-3xl text-lg senior-card">
          ❌ {pageError}
        </div>
      )}

      {/* FILTRES BACKEND */}
      <div className="mb-6">
        <Filtres onFilter={(filters) => loadAnnonces(filters, { silent: false })} />
      </div>

      {/* FILTRE FRONTEND (SIMPLE) */}
      <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 senior-card">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={() => setActiveOnly(!activeOnly)}
          className="w-7 h-7"
          id="activeOnly"
        />
        <label htmlFor="activeOnly" className="text-lg font-extrabold text-gray-900">
          Afficher uniquement les annonces actives
        </label>
      </div>

      {/* LOADING / EMPTY / GRID */}
      {loading ? (
        <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
          ⏳ Chargement des annonces...
        </div>
      ) : annoncesFiltrees.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
          Aucune annonce disponible.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {annoncesFiltrees.map((a) => (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/annonces/${a.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/annonces/${a.id}`);
                }
              }}
              className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 cursor-pointer senior-card focus:outline-none focus:ring-4 focus:ring-blue-200"
              aria-label={`Ouvrir l’annonce ${a.title}`}
            >
              {/* AUTEUR */}
              {a.user_id ? (
                <Link
                  to={`/users/${a.user_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between mb-4 p-4 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition"
                  title="Voir le profil"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-extrabold text-xl">
                      {(a.user_first_name?.[0] || a.user_email?.[0] || "?").toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-extrabold text-gray-900 truncate">
                        {a.user_first_name || a.user_last_name
                          ? `${a.user_first_name || ""} ${a.user_last_name || ""}`.trim()
                          : a.user_email || "Utilisateur"}
                      </p>

                      <div className="flex items-center gap-2 text-base text-gray-700 flex-wrap mt-2">
                        <span className="bg-gray-100 px-3 py-2 rounded-full font-extrabold">
                          ⭐ {Number(a.user_score || 0).toFixed(1)} ({a.user_total_reviews || 0})
                        </span>

                        <span className="px-3 py-2 rounded-full bg-blue-50 text-blue-800 border border-blue-100 font-extrabold">
                          {a.user_badge || "Nouveau"}
                        </span>

                        {a.user_is_verified && (
                          <span className="px-3 py-2 rounded-full bg-green-100 text-green-800 border border-green-200 font-extrabold">
                            Vérifié ✔
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-base font-extrabold text-blue-700">Profil →</span>
                </Link>
              ) : (
                <div
                  className="flex items-center gap-4 mb-4 p-4 rounded-3xl border border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-300 text-white flex items-center justify-center font-extrabold text-xl">
                    {(a.user_email?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold text-gray-900 truncate">
                      {a.user_email || "Utilisateur"}
                    </p>
                    <p className="text-base text-gray-600">Profil indisponible</p>
                  </div>
                </div>
              )}

              {/* TYPE + STATUS */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span
                  className="text-base bg-gray-100 px-4 py-2 rounded-full font-extrabold"
                  onClick={(e) => e.stopPropagation()}
                >
                  {formatType(a.type)}
                </span>

                {formatStatus(a.status)}
              </div>

              {/* URGENT */}
              {a.is_urgent && (
                <div
                  className="mt-4 inline-flex items-center gap-2 text-base font-extrabold bg-red-600 text-white px-4 py-2 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  ⚠ URGENT
                </div>
              )}

              {/* TITRE */}
              <h3 className="font-extrabold text-2xl mt-5 mb-2 text-gray-900">
                {a.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-gray-800 text-base leading-relaxed mb-4 line-clamp-4">
                {a.description}
              </p>

              {/* INFOS */}
              <div className="text-base text-gray-800 space-y-1">
                <p>
                  <span className="font-extrabold">Catégorie :</span> {a.category || "—"}
                </p>
                <p>
                  <span className="font-extrabold">Prix :</span>{" "}
                  {a.price === null || a.price === undefined ? "Non précisé" : `${a.price} €`}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-6 space-y-3">
                {a.status === "active" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact(a.id);
                    }}
                    className="w-full bg-blue-700 text-white py-5 rounded-3xl font-extrabold text-lg hover:bg-blue-800 transition shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    💬 Contacter
                  </button>
                ) : (
                  <button
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-gray-200 text-gray-700 py-5 rounded-3xl font-extrabold text-lg cursor-not-allowed"
                  >
                    Indisponible
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/annonces/${a.id}`);
                  }}
                  className="w-full bg-white border-2 border-gray-300 text-gray-900 py-5 rounded-3xl font-extrabold text-lg hover:bg-gray-50 transition focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  👁 Voir le détail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE CREATION */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 z-10 senior-card border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Créer une annonce"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <h3 className="text-2xl font-extrabold text-gray-900">
                ➕ Créer une annonce
              </h3>

              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Fermer
              </button>
            </div>

            <CreateAnnonce
              onCreated={() => {
                loadAnnonces({}, { silent: true });
                toast.success("Annonce créée ✅");
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
