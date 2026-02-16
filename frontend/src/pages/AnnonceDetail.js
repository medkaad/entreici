import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getAnnonce,
  createConversation,
  createReview,
  requestReservation,
  acceptReservation,
  rejectReservation,
} from "../api/api";
import { useToast } from "../ui/Toast";

function AnnonceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const currentUserEmail = localStorage.getItem("user_email");

  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Actions réservation
  const [actionMsg, setActionMsg] = useState(null);
  const [actionErr, setActionErr] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Avis
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState(null);
  const [reviewErr, setReviewErr] = useState(null);
  const [sendingReview, setSendingReview] = useState(false);

  async function loadAnnonce() {
    try {
      setLoading(true);
      setError(null);

      const data = await getAnnonce(id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = useMemo(() => {
    if (!annonce) return false;
    return annonce.user_email && currentUserEmail
      ? annonce.user_email === currentUserEmail
      : false;
  }, [annonce, currentUserEmail]);

  const isRequester = useMemo(() => {
    if (!annonce) return false;
    return annonce.reservation_requester_email && currentUserEmail
      ? annonce.reservation_requester_email === currentUserEmail
      : false;
  }, [annonce, currentUserEmail]);

  const reservationStatus = annonce?.reservation_status || "none";

  const canRequestReservation =
    annonce &&
    !isOwner &&
    annonce.status === "active" &&
    (reservationStatus === "none" || reservationStatus === "rejected") &&
    !annonce.reservation_requester_id;

  const canOwnerAcceptReject =
    annonce &&
    isOwner &&
    reservationStatus === "pending" &&
    annonce.reservation_requester_id;

  const canChat =
    annonce &&
    (annonce.status === "active" || annonce.status === "in_progress");

  const canLeaveReview =
    annonce &&
    annonce.status === "completed" &&
    annonce.reservation_status === "accepted" &&
    isRequester;

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
      active: { label: "Active", cls: "bg-green-50 text-green-800 border border-green-200" },
      in_progress: { label: "En cours", cls: "bg-yellow-50 text-yellow-900 border border-yellow-200" },
      completed: { label: "Terminée", cls: "bg-blue-50 text-blue-800 border border-blue-200" },
      cancelled: { label: "Annulée", cls: "bg-red-50 text-red-800 border border-red-200" },
    };
    return map[status] || { label: status || "—", cls: "bg-gray-50 text-gray-800 border border-gray-200" };
  };

  const formatReservation = (st) => {
    const map = {
      none: { label: "Aucune réservation", cls: "bg-gray-50 text-gray-800 border border-gray-200" },
      pending: { label: "Réservation en attente", cls: "bg-yellow-50 text-yellow-900 border border-yellow-200" },
      accepted: { label: "Réservation acceptée", cls: "bg-green-50 text-green-900 border border-green-200" },
      rejected: { label: "Réservation refusée", cls: "bg-red-50 text-red-900 border border-red-200" },
    };
    return map[st] || map.none;
  };

  const statusCfg = formatStatus(annonce?.status);
  const reservCfg = formatReservation(reservationStatus);

  const authorName =
    annonce && (annonce.user_first_name || annonce.user_last_name)
      ? `${annonce.user_first_name || ""} ${annonce.user_last_name || ""}`.trim()
      : (annonce?.user_email || "Utilisateur");

  const requesterName =
    annonce && annonce.reservation_requester_email
      ? (annonce.reservation_requester_email || "Demandeur")
      : null;

  const handleContact = async () => {
    try {
      const conv = await createConversation(annonce.id);
      toast.success("Conversation ouverte ✅");
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Impossible d’ouvrir la conversation.");
    }
  };

  async function handleReservationRequest() {
    setActionMsg(null);
    setActionErr(null);

    try {
      setActionLoading(true);
      await requestReservation(annonce.id);
      setActionMsg("Demande envoyée ✅");
      toast.success("Demande de réservation envoyée ✅");
      await loadAnnonce();
    } catch (err) {
      console.error(err);
      const m = err?.message || "Erreur lors de la demande.";
      setActionErr(m);
      toast.error(m);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAccept() {
    setActionMsg(null);
    setActionErr(null);

    try {
      setActionLoading(true);
      await acceptReservation(annonce.id);
      setActionMsg("Réservation acceptée ✅");
      toast.success("Réservation acceptée ✅");
      await loadAnnonce();
    } catch (err) {
      console.error(err);
      const m = err?.message || "Erreur lors de l’acceptation.";
      setActionErr(m);
      toast.error(m);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    setActionMsg(null);
    setActionErr(null);

    try {
      setActionLoading(true);
      await rejectReservation(annonce.id);
      setActionMsg("Réservation refusée ❌");
      toast.info("Réservation refusée.");
      await loadAnnonce();
    } catch (err) {
      console.error(err);
      const m = err?.message || "Erreur lors du refus.";
      setActionErr(m);
      toast.error(m);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitReview() {
    setReviewMsg(null);
    setReviewErr(null);

    if (!canLeaveReview) {
      const m =
        "Avis autorisé uniquement si : réservation acceptée + annonce terminée + tu es le demandeur.";
      setReviewErr(m);
      toast.info("Avis non disponible pour le moment.");
      return;
    }

    if (!comment.trim()) {
      setReviewErr("Merci d’écrire un commentaire.");
      toast.info("Ajoutez un commentaire avant d’envoyer.");
      return;
    }

    try {
      setSendingReview(true);
      await createReview(annonce.id, { rating, comment });
      setReviewMsg("Avis envoyé ✅ Merci !");
      toast.success("Avis envoyé ✅");
      setComment("");
      await loadAnnonce(); // met à jour score/badge
    } catch (err) {
      console.error(err);
      const m = err?.message || "Erreur lors de l’envoi de l’avis.";
      setReviewErr(m);
      toast.error(m);
    } finally {
      setSendingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
        ⏳ Chargement de l’annonce...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 p-6 rounded-3xl text-center text-lg senior-card">
        ❌ {error}
      </div>
    );
  }

  if (!annonce) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden senior-card">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold break-words">
                {annonce.title || "Annonce"}
              </h1>

              <div className="flex gap-3 mt-5 flex-wrap items-center">
                <span className="text-base bg-white/20 px-4 py-2 rounded-full font-extrabold">
                  {formatType(annonce.type)}
                </span>

                <span className={`text-base px-4 py-2 rounded-full font-extrabold ${statusCfg.cls}`}>
                  {statusCfg.label}
                </span>

                <span className={`text-base px-4 py-2 rounded-full font-extrabold ${reservCfg.cls}`}>
                  {reservCfg.label}
                </span>

                {annonce.is_urgent && (
                  <span className="text-base bg-red-500 px-4 py-2 rounded-full shadow font-extrabold">
                    ⚠ URGENT
                  </span>
                )}
              </div>

              <div className="mt-5 text-blue-100 text-base font-semibold flex flex-wrap gap-6">
                <span>
                  Catégorie :{" "}
                  <span className="font-extrabold">{annonce.category || "—"}</span>
                </span>
                <span>
                  Prix :{" "}
                  <span className="font-extrabold">
                    {annonce.price === null || annonce.price === undefined || annonce.price === ""
                      ? "Non précisé"
                      : `${annonce.price} €`}
                  </span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white text-blue-700 px-6 py-4 rounded-3xl font-extrabold shrink-0 hover:bg-blue-50 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              ↩ Retour
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* DETAILS */}
          <div>
            <h2 className="text-2xl font-extrabold mb-3 text-gray-900">
              Détails
            </h2>

            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 senior-card">
              <p className="text-gray-900 whitespace-pre-line text-base leading-relaxed">
                {annonce.description?.trim() ? annonce.description : "—"}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {/* Chat */}
              {canChat && !isOwner && (
                <button
                  onClick={handleContact}
                  className="w-full bg-blue-700 text-white py-5 rounded-3xl font-extrabold text-lg hover:bg-blue-800 transition shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  💬 Contacter
                </button>
              )}

              {/* Demande réservation */}
              {canRequestReservation && (
                <button
                  onClick={handleReservationRequest}
                  disabled={actionLoading}
                  className={`w-full py-5 rounded-3xl font-extrabold text-lg text-white transition shadow-md focus:outline-none focus:ring-4 focus:ring-green-200 ${
                    actionLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionLoading ? "Envoi..." : "✅ Demander la réservation"}
                </button>
              )}

              {/* Etat réservation pour demandeur */}
              {isRequester && reservationStatus === "pending" && (
                <div className="p-5 rounded-3xl border bg-yellow-50 text-yellow-900 text-base font-semibold senior-card">
                  ⏳ Ta demande de réservation est en attente de validation.
                </div>
              )}

              {isRequester && reservationStatus === "accepted" && (
                <div className="p-5 rounded-3xl border bg-green-50 text-green-900 text-base font-semibold senior-card">
                  ✅ Ta réservation a été acceptée.
                </div>
              )}

              {isRequester && reservationStatus === "rejected" && (
                <div className="p-5 rounded-3xl border bg-red-50 text-red-900 text-base font-semibold senior-card">
                  ❌ Ta réservation a été refusée.
                </div>
              )}

              {/* Owner voit le demandeur */}
              {isOwner && reservationStatus === "pending" && requesterName && (
                <div className="p-5 rounded-3xl border bg-gray-50 text-gray-900 senior-card">
                  <div className="text-base text-gray-700 font-semibold">
                    Demande de réservation par
                  </div>
                  <div className="font-extrabold text-lg mt-1">{requesterName}</div>
                </div>
              )}

              {/* Owner accepte/refuse */}
              {canOwnerAcceptReject && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className={`py-5 rounded-3xl font-extrabold text-lg text-white focus:outline-none focus:ring-4 focus:ring-green-200 ${
                      actionLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    ✅ Accepter
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className={`py-5 rounded-3xl font-extrabold text-lg text-white focus:outline-none focus:ring-4 focus:ring-red-200 ${
                      actionLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    ❌ Refuser
                  </button>
                </div>
              )}

              {(actionErr || actionMsg) && (
                <div className="text-base font-semibold">
                  {actionErr && <span className="text-red-700">{actionErr}</span>}
                  {actionMsg && <span className="text-green-700">{actionMsg}</span>}
                </div>
              )}
            </div>
          </div>

          {/* AUTEUR */}
          <div>
            <h2 className="text-2xl font-extrabold mb-3 text-gray-900">
              Auteur
            </h2>

            {annonce.user_id ? (
              <Link
                to={`/users/${annonce.user_id}`}
                className="block p-6 border border-gray-100 rounded-3xl hover:bg-blue-50 hover:border-blue-200 transition senior-card focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <p className="font-extrabold text-xl text-gray-900">{authorName}</p>

                <div className="mt-3 flex items-center gap-2 text-base text-gray-700 flex-wrap">
                  <span className="bg-gray-100 px-4 py-2 rounded-full font-extrabold">
                    ⭐ {Number(annonce.user_score || 0).toFixed(1)} ({annonce.user_total_reviews || 0})
                  </span>

                  <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-800 border border-blue-100 font-extrabold">
                    {annonce.user_badge || "Nouveau"}
                  </span>

                  {annonce.user_is_verified && (
                    <span className="px-4 py-2 rounded-full bg-green-100 text-green-800 border border-green-200 font-extrabold">
                      Vérifié ✔
                    </span>
                  )}
                </div>

                <p className="text-blue-700 mt-3 text-base font-extrabold">
                  Voir le profil →
                </p>
              </Link>
            ) : (
              <div className="p-6 border border-gray-100 rounded-3xl bg-gray-50 text-gray-800 senior-card">
                Auteur indisponible (user_id manquant dans l’API)
              </div>
            )}

            {/* Bloc réservation accepté */}
            {reservationStatus === "accepted" && annonce.reservation_requester_email && (
              <div className="mt-4 p-6 border border-gray-100 rounded-3xl bg-green-50 text-green-900 senior-card">
                <div className="text-base text-green-800 font-semibold">Réservé par</div>
                <div className="font-extrabold text-lg mt-1">
                  {annonce.reservation_requester_email}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AVIS */}
        <div className="p-8 border-t">
          <h3 className="text-2xl font-extrabold mb-3 text-gray-900">
            ⭐ Laisser un avis
          </h3>
          <p className="text-base text-gray-700 mb-5">
            Avis autorisé uniquement si la réservation est <b>acceptée</b> et l’annonce <b>terminée</b>.
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-base font-extrabold text-gray-800 mb-2">Note</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="p-4 bg-gray-100 rounded-3xl w-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ⭐
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-base font-extrabold text-gray-800 mb-2">
                Commentaire
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="p-4 bg-gray-100 rounded-3xl w-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                placeholder="Décris ton expérience..."
              />
            </div>

            <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-base font-semibold">
                {!canLeaveReview && (
                  <span className="text-gray-600">
                    (Le bouton s’activera quand l’annonce sera terminée.)
                  </span>
                )}
                {reviewErr && <div className="text-red-700 mt-2">❌ {reviewErr}</div>}
                {reviewMsg && <div className="text-green-700 mt-2">✅ {reviewMsg}</div>}
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={sendingReview || !canLeaveReview}
                className={`px-7 py-4 rounded-3xl font-extrabold text-lg text-white focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                  sendingReview || !canLeaveReview
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-700 hover:bg-blue-800"
                }`}
              >
                {sendingReview ? "Envoi..." : "📨 Envoyer l’avis"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnnonceDetail;
