import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMessages,
  sendMessage,
  getConversation,
  acceptReservation,
  rejectReservation,
} from "../api/api";
import { useToast } from "../ui/Toast";

function Messages() {
  const { id } = useParams();
  const toast = useToast();

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [pageErr, setPageErr] = useState(null);

  const [sending, setSending] = useState(false);

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
      setPageErr("Impossible de charger la conversation.");
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
      setPageErr("Impossible de charger les messages.");
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setLoading(true);
        setPageErr(null);
        await Promise.all([loadConversation(), loadMessages()]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [loadConversation, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     SEND MESSAGE
  ========================= */
  const handleSend = useCallback(async () => {
    const txt = (content || "").trim();
    if (!txt) {
      toast.info("Écrivez un message avant d’envoyer.");
      return;
    }
    if (sending) return;

    try {
      setSending(true);
      await sendMessage(id, txt);
      setContent("");
      await loadMessages();
      toast.success("Message envoyé ✅");
    } catch (error) {
      console.error("Erreur envoi message:", error);
      toast.error("Erreur : message non envoyé.");
    } finally {
      setSending(false);
    }
  }, [content, id, loadMessages, sending, toast]);

  const handleKeyDown = (e) => {
    // Enter => envoyer, Shift+Enter => nouvelle ligne
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* =========================
     FORMAT NAME
  ========================= */
  const formatName = useCallback(() => {
    if (!conversation?.other_user) return `Conversation #${id}`;

    const { first_name, last_name } = conversation.other_user;

    if (!first_name) return `Conversation #${id}`;

    const initial = last_name ? `${last_name[0].toUpperCase()}.` : "";
    return `${first_name} ${initial}`.trim();
  }, [conversation, id]);

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
      toast.success("Réservation acceptée ✅");
      await loadConversation();
    } catch (e) {
      const m = e?.message || "Erreur lors de l’acceptation.";
      setActionErr(m);
      toast.error(m);
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
      setActionMsg("Réservation refusée ❌");
      toast.info("Réservation refusée.");
      await loadConversation();
    } catch (e) {
      const m = e?.message || "Erreur lors du refus.";
      setActionErr(m);
      toast.error(m);
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
      const cleaned = text.replace(/\[AVIS:\d+\]/g, "").trim();

      return (
        <div className="space-y-3">
          <div className="text-base leading-relaxed">
            {renderPlainTextWithBreaks(cleaned)}
          </div>

          <Link
            to={`/annonces/${annonceId}`}
            className="inline-flex w-full items-center justify-center gap-2 px-5 py-4 rounded-2xl font-extrabold text-lg bg-yellow-500 text-white hover:bg-yellow-600 transition focus:outline-none focus:ring-4 focus:ring-yellow-200"
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
            className="underline font-extrabold"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return <span key={idx}>{renderPlainTextWithBreaks(part)}</span>;
    });
  };

  /* =========================
     STATES
  ========================= */
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
        ⏳ Chargement de la conversation...
      </div>
    );
  }

  if (pageErr) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 p-6 rounded-3xl text-center text-lg senior-card">
        ❌ {pageErr}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white rounded-3xl shadow overflow-hidden senior-card border border-gray-100">
      {/* HEADER */}
      <div className="bg-blue-600 text-white px-6 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-extrabold">{formatName()}</h2>

          {annonce?.id && (
            <Link
              to={`/annonces/${annonce.id}`}
              className="bg-white text-blue-700 px-5 py-3 rounded-2xl font-extrabold hover:bg-blue-50 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              🧾 Voir l’annonce
            </Link>
          )}
        </div>

        {showOwnerDecisionButtons && (
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <button
              onClick={handleAccept}
              disabled={actionBusy}
              className={`px-5 py-3 rounded-2xl font-extrabold text-white focus:outline-none focus:ring-4 focus:ring-green-200 ${
                actionBusy ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {actionBusy ? "..." : "✅ Accepter la réservation"}
            </button>

            <button
              onClick={handleReject}
              disabled={actionBusy}
              className={`px-5 py-3 rounded-2xl font-extrabold text-white focus:outline-none focus:ring-4 focus:ring-red-200 ${
                actionBusy ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionBusy ? "..." : "❌ Refuser"}
            </button>

            {(actionErr || actionMsg) && (
              <span className={`text-base font-semibold ${actionErr ? "text-red-100" : "text-green-100"}`}>
                {actionErr || actionMsg}
              </span>
            )}
          </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-700 text-center text-lg">
            Aucun message pour le moment.
          </p>
        )}

        {messages.map((m) => {
          const isMe = m.sender_email === currentUserEmail;

          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-3xl shadow-sm relative text-base leading-relaxed ${
                  isMe
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                {!isMe && (
                  <p className="text-sm font-extrabold text-gray-600 mb-2">
                    {formatName()}
                  </p>
                )}

                <div className="text-base">{renderMessageContent(m.content)}</div>

                {m.created_at && (
                  <p
                    className={`text-sm mt-3 ${
                      isMe ? "text-blue-100" : "text-gray-500"
                    } text-right font-semibold`}
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
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Écrire un message… (Entrée = envoyer, Shift+Entrée = nouvelle ligne)"
            className="flex-1 border-2 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 min-h-[64px]"
          />

          <button
            onClick={handleSend}
            disabled={sending}
            className={`px-6 py-4 rounded-3xl font-extrabold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 ${
              sending ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            {sending ? "Envoi…" : "📨 Envoyer"}
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-600 font-semibold">
          Astuce : si vous voulez écrire sur plusieurs lignes, faites <b>Shift + Entrée</b>.
        </p>
      </div>
    </div>
  );
}

export default Messages;
