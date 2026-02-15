import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMessages, sendMessage, getConversation } from "../api/api";

function Messages() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [content, setContent] = useState("");

  const messagesEndRef = useRef(null);

  const currentUserEmail = localStorage.getItem("user_email");

  /* =========================
     LOAD CONVERSATION
  ========================= */

  const loadConversation = useCallback(async () => {
    try {
      const data = await getConversation(id);
      setConversation(data);
    } catch (error) {
      console.error("Erreur chargement conversation:", error);
    }
  }, [id]);

  /* =========================
     LOAD MESSAGES
  ========================= */

  const loadMessages = useCallback(async () => {
    try {
      const data = await getMessages(id);
      setMessages(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  }, [id]);

  useEffect(() => {
    loadConversation();
    loadMessages();
  }, [loadConversation, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     SEND MESSAGE
  ========================= */

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      await sendMessage(id, content);
      setContent("");
      loadMessages();
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  /* =========================
     FORMAT NAME
  ========================= */

  const formatName = () => {
    if (!conversation?.other_user) return `Conversation #${id}`;

    const { first_name, last_name } = conversation.other_user;

    if (!first_name) return `Conversation #${id}`;

    const initial = last_name
      ? `${last_name[0].toUpperCase()}.`
      : "";

    return `${first_name} ${initial}`;
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white rounded-2xl shadow overflow-hidden">

      {/* HEADER */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <h2 className="text-lg font-semibold">
          {formatName()}
        </h2>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">
            Aucun message pour le moment.
          </p>
        )}

        {messages.map((m) => {
          const isMe = m.sender_email === currentUserEmail;

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm relative ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    {formatName()}
                  </p>
                )}

                <p className="text-sm">{m.content}</p>

                {m.created_at && (
                  <p
                    className={`text-[10px] mt-2 ${
                      isMe ? "text-blue-100" : "text-gray-400"
                    } text-right`}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t bg-white flex items-center gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Écrire un message..."
          className="flex-1 border rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default Messages;
