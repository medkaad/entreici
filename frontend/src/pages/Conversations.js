import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../api/api";
import { useToast } from "../ui/Toast";

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageErr, setPageErr] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  const loadConversations = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setPageErr(null);
      }

      const data = await getConversations();
      const list = Array.isArray(data) ? data : data.results || [];
      setConversations(list);

      if (!silent) toast.success("Conversations mises à jour ✅");
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
      setPageErr("Impossible de charger les conversations. Réessaie.");
      if (!silent) toast.error("Erreur : conversations non chargées.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations({ silent: true }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatUserName = (c) => {
    const firstName = c?.other_user?.first_name || "";
    const lastName = c?.other_user?.last_name || "";
    const initial = lastName ? `${lastName.charAt(0).toUpperCase()}.` : "";
    return firstName ? `${firstName} ${initial}`.trim() : "Utilisateur";
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const openConversation = (cid) => {
    navigate(`/chat/${cid}`);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
          ⏳ Chargement des conversations...
        </div>
      </div>
    );
  }

  if (pageErr) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-red-50 text-red-700 border border-red-200 p-6 rounded-3xl text-center text-lg senior-card">
          ❌ {pageErr}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => loadConversations({ silent: false })}
            className="px-6 py-4 rounded-3xl bg-gray-900 text-white font-extrabold hover:bg-black transition focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            ↻ Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            💬 Mes conversations
          </h2>
          <p className="text-gray-700 text-lg mt-2">
            Cliquez sur une conversation pour ouvrir le chat.
          </p>
        </div>

        <button
          onClick={() => loadConversations({ silent: false })}
          className="px-6 py-4 rounded-3xl bg-gray-900 text-white font-extrabold hover:bg-black transition focus:outline-none focus:ring-4 focus:ring-gray-200"
          title="Rafraîchir"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* EMPTY */}
      {conversations.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl shadow text-gray-700 text-center text-lg senior-card">
          Aucune conversation pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => openConversation(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openConversation(c.id);
                }
              }}
              className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer border border-gray-100 senior-card focus:outline-none focus:ring-4 focus:ring-blue-200"
              aria-label={`Ouvrir la conversation avec ${formatUserName(c)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-xl font-extrabold text-gray-900 truncate">
                    {formatUserName(c)}
                  </h4>

                  <p className="text-gray-700 mt-2 text-base">
                    <span className="font-extrabold">Annonce :</span>{" "}
                    {c.annonce_title || "—"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-base font-extrabold text-gray-700">
                    {formatDate(c.created_at)}
                  </div>
                  <div className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 font-extrabold border border-blue-100">
                    Ouvrir →
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

export default Conversations;
