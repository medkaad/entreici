import { useEffect, useState } from "react";
import { getConversations } from "../api/api";
import { useNavigate } from "react-router-dom";

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4">

      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Mes conversations
      </h2>

      {conversations.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow text-gray-500 text-center">
          Aucune conversation pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((c) => {

            const firstName = c.other_user?.first_name || "";
            const lastName = c.other_user?.last_name || "";
            const initial = lastName ? lastName.charAt(0).toUpperCase() + "." : "";

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/chat/${c.id}`)}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex justify-between items-center"
              >
                <div>
                  {/* Nom de l'autre utilisateur */}
                  <h4 className="font-semibold text-gray-800">
                    {firstName
                      ? `${firstName} ${initial}`
                      : "Utilisateur"}
                  </h4>

                  {/* Titre annonce */}
                  <p className="text-sm text-gray-500 mt-1">
                    {c.annonce_title}
                  </p>

                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Date */}
                  {c.created_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Conversations;
