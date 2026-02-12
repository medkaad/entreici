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
    <div className="max-w-3xl mx-auto">

      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Mes conversations
      </h2>

      {conversations.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow text-gray-500 text-center">
          Aucune conversation pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/chat/${c.id}`)}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold text-gray-800">
                  {c.annonce_title}
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  Conversation #{c.id}
                </p>

                {/* Placeholder dernier message */}
                {c.last_message && (
                  <p className="text-sm text-gray-400 mt-1 truncate max-w-md">
                    {c.last_message}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Placeholder date */}
                {c.updated_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(c.updated_at).toLocaleDateString()}
                  </span>
                )}

                {/* Placeholder unread */}
                {c.unread_count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                    {c.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Conversations;
