import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMessages,
  sendMessage,
  getConversation,
  acceptReservation,
  rejectReservation,
} from "../api/api";

function Messages() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [content, setContent] = useState("");

  const [actionMsg, setActionMsg] = useState(null);
  const [actionErr, setActionErr] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

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
    if (e.key === "Enter") handleSend();
  };

  /* =========================
     FORMAT NAME
  ========================= */

  const formatName = () => {
    if (!conversation?.other_user) return `Conversation #${id}`;

    const { first_name, last_name } = conversation.other_user;

    if (!first_name) return `Conversation #${id}`;

    const initial = last_name ? `${last_name[0].toUpperCase()}.` : "";

    return `${first_name} ${initial}`;
  };

  /* =========================
     ANNONCE + RESERVATION (optionnel)
  ========================= */
  const annonce = conversation?.annonce || null;

  const isOwner = useMemo(() => {
    if (!annonce) return false;
    return Boolean(currentUserEmail && annonce.user_email === currentUserEmail);
  }, [annonce, currentUserEmail]);

  const showOwnerDecisionButtons =
    isOwner && annonce?.reservation_status === "pending";

  async function handleAccept() {
    if (!annonce?.id) return;
    setActionMsg(null);
    setActionErr(null);
    setActionBusy(true);
    try {
      await acceptReservation(annonce.id);
      setActionMsg("Réservation acceptée ✅");
      await loadConversation();
    } catch (e) {
      setActionErr(e.message || "Erreur lors de l’acceptation.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReject() {
    if (!annonce?.id) return;
    setActionMsg(null);
    setActionErr(null);
    setActionBusy(true);
    try {
      await rejectReservation(annonce.id);
      setActionMsg("Réservation refusée ✅");
      await loadConversation();
    } catch (e) {
      setActionErr(e.message || "Erreur lors du refus.");
    } finally {
      setActionBusy(false);
    }
  }

  /* =========================
     UI RENDER MESSAGE
     - si [AVIS:17] => bouton ⭐
     - sinon linkify /annonces/ID et /users/ID
  ========================= */

  const renderPlainTextWithBreaks = (txt) => {
    const lines = (txt || "").split("\n");
    return (
      <>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </>
    );
  };

  const renderMessageContent = (text) => {
    if (!text) return null;

    // ✅ détecter le tag avis [AVIS:17]
    const avisMatch = text.match(/\[AVIS:(\d+)\]/);
    if (avisMatch) {
      const annonceId = avisMatch[1];

      // enlever le tag du texte affiché
      const cleaned = text.replace(/\[AVIS:\d+\]/g, "").trim();

      return (
        <div className="space-y-3">
          <div className="text-sm">
            {renderPlainTextWithBreaks(cleaned)}
          </div>

          <Link
            to={`/annonces/${annonceId}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold bg-yellow-500 text-white hover:bg-yellow-600 transition"
            onClick={(e) => e.stopPropagation()}
          >
            ⭐ Laisser un avis
          </Link>
        </div>
      );
    }

    // ✅ linkify chemins simples
    const regex = /(\/annonces\/\d+|\/users\/\d+)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (regex.test(part)) {
        return (
          <Link
            key={idx}
            to={part}
            className="underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return (
        <span key={idx}>
          {renderPlainTextWithBreaks(part)}
        </span>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white rounded-2xl shadow overflow-hidden">
      {/* HEADER */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{formatName()}</h2>

          {annonce?.id && (
            <Link
              to={`/annonces/${annonce.id}`}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
            >
              Voir l’annonce
            </Link>
          )}
        </div>

        {showOwnerDecisionButtons && (
          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <button
              onClick={handleAccept}
              disabled={actionBusy}
              className={`px-4 py-2 rounded-lg font-semibold text-white ${
                actionBusy ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {actionBusy ? "..." : "Accepter la réservation"}
            </button>

            <button
              onClick={handleReject}
              disabled={actionBusy}
              className={`px-4 py-2 rounded-lg font-semibold text-white ${
                actionBusy ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionBusy ? "..." : "Refuser"}
            </button>

            {(actionErr || actionMsg) && (
              <span className={`text-xs ${actionErr ? "text-red-200" : "text-green-200"}`}>
                {actionErr || actionMsg}
              </span>
            )}
          </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">Aucun message pour le moment.</p>
        )}

        {messages.map((m) => {
          const isMe = m.sender_email === currentUserEmail;

          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
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

                <div className="text-sm">
                  {renderMessageContent(m.content)}
                </div>

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
