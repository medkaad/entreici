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

function AnnonceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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
      active: { label: "Active", cls: "bg-green-50 text-green-600 border border-green-200" },
      in_progress: { label: "En cours", cls: "bg-yellow-50 text-yellow-600 border border-yellow-200" },
      completed: { label: "Terminée", cls: "bg-blue-50 text-blue-600 border border-blue-200" },
      cancelled: { label: "Annulée", cls: "bg-red-50 text-red-600 border border-red-200" },
    };
    return map[status] || { label: status || "—", cls: "bg-gray-50 text-gray-500 border border-gray-200" };
  };

  const formatReservation = (st) => {
    const map = {
      none: { label: "Aucune réservation", cls: "bg-gray-50 text-gray-600 border border-gray-200" },
      pending: { label: "Réservation en attente", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
      accepted: { label: "Réservation acceptée", cls: "bg-green-50 text-green-700 border border-green-200" },
      rejected: { label: "Réservation refusée", cls: "bg-red-50 text-red-700 border border-red-200" },
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
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  async function handleReservationRequest() {
    setActionMsg(null);
    setActionErr(null);

    try {
      setActionLoading(true);
      await requestReservation(annonce.id);
      setActionMsg("Demande envoyée ✅");
      await loadAnnonce();
    } catch (err) {
      console.error(err);
      setActionErr(err.message || "Erreur lors de la demande.");
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
      await loadAnnonce();
    } catch (err) {
      console.error(err);
      setActionErr(err.message || "Erreur lors de l’acceptation.");
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
      await loadAnnonce();
    } catch (err) {
      console.error(err);
      setActionErr(err.message || "Erreur lors du refus.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitReview() {
    setReviewMsg(null);
    setReviewErr(null);

    if (!canLeaveReview) {
      setReviewErr(
        "Avis autorisé uniquement si : réservation acceptée + annonce terminée + tu es le demandeur."
      );
      return;
    }

    try {
      setSendingReview(true);
      await createReview(annonce.id, { rating, comment });
      setReviewMsg("Avis envoyé ✅ Merci !");
      setComment("");
      await loadAnnonce(); // met à jour score/badge
    } catch (err) {
      console.error(err);
      setReviewErr(err.message || "Erreur lors de l’envoi de l’avis.");
    } finally {
      setSendingReview(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Chargement...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>;
  }

  if (!annonce) return null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold break-words">
                {annonce.title || "Annonce"}
              </h1>

              <div className="flex gap-3 mt-4 flex-wrap items-center">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  {formatType(annonce.type)}
                </span>

                <span className={`text-xs px-3 py-1 rounded-full border ${statusCfg.cls}`}>
                  {statusCfg.label}
                </span>

                <span className={`text-xs px-3 py-1 rounded-full ${reservCfg.cls}`}>
                  {reservCfg.label}
                </span>

                {annonce.is_urgent && (
                  <span className="text-xs bg-red-500 px-3 py-1 rounded-full shadow">
                    URGENT
                  </span>
                )}
              </div>

              <div className="mt-4 text-blue-100 text-sm">
                <span className="mr-4">
                  Catégorie :{" "}
                  <span className="font-semibold">{annonce.category || "—"}</span>
                </span>
                <span>
                  Prix :{" "}
                  <span className="font-semibold">
                    {annonce.price === null || annonce.price === undefined || annonce.price === ""
                      ? "Non précisé"
                      : `${annonce.price} €`}
                  </span>
                </span>
              </div>
            </div>

            <Link
              to="/"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold shrink-0"
            >
              Retour
            </Link>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* DETAILS */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Détails</h2>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-700 whitespace-pre-line">
                {annonce.description?.trim() ? annonce.description : "—"}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {/* Chat (par annonce) */}
              {canChat && !isOwner && (
                <button
                  onClick={handleContact}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition shadow-md"
                >
                  Contacter
                </button>
              )}

              {/* Demande réservation */}
              {canRequestReservation && (
                <button
                  onClick={handleReservationRequest}
                  disabled={actionLoading}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition shadow-md ${
                    actionLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionLoading ? "Envoi..." : "Demander la réservation"}
                </button>
              )}

              {/* Etat réservation pour demandeur */}
              {isRequester && reservationStatus === "pending" && (
                <div className="p-4 rounded-2xl border bg-yellow-50 text-yellow-800">
                  Ta demande de réservation est en attente de validation.
                </div>
              )}

              {isRequester && reservationStatus === "accepted" && (
                <div className="p-4 rounded-2xl border bg-green-50 text-green-800">
                  Ta réservation a été acceptée ✅
                </div>
              )}

              {isRequester && reservationStatus === "rejected" && (
                <div className="p-4 rounded-2xl border bg-red-50 text-red-800">
                  Ta réservation a été refusée ❌
                </div>
              )}

              {/* Owner voit le demandeur */}
              {isOwner && reservationStatus === "pending" && requesterName && (
                <div className="p-4 rounded-2xl border bg-gray-50 text-gray-800">
                  <div className="text-sm text-gray-600">Demande de réservation par</div>
                  <div className="font-semibold">{requesterName}</div>
                </div>
              )}

              {/* Owner accepte/refuse */}
              {canOwnerAcceptReject && (
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white ${
                      actionLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Accepter
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white ${
                      actionLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Refuser
                  </button>
                </div>
              )}

              {(actionErr || actionMsg) && (
                <div className="text-sm">
                  {actionErr && <span className="text-red-600">{actionErr}</span>}
                  {actionMsg && <span className="text-green-600">{actionMsg}</span>}
                </div>
              )}
            </div>
          </div>

          {/* AUTEUR */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Auteur</h2>

            {annonce.user_id ? (
              <Link
                to={`/users/${annonce.user_id}`}
                className="block p-5 border border-gray-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <p className="font-semibold text-lg text-gray-900">{authorName}</p>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <span>
                    ⭐ {Number(annonce.user_score || 0).toFixed(1)} ({annonce.user_total_reviews || 0})
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {annonce.user_badge || "Nouveau"}
                  </span>

                  {annonce.user_is_verified && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Vérifié ✔
                    </span>
                  )}
                </div>

                <p className="text-blue-600 mt-2 text-sm font-semibold">Voir le profil →</p>
              </Link>
            ) : (
              <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50 text-gray-700">
                Auteur indisponible (user_id manquant dans l’API)
              </div>
            )}

            {/* Bloc réservation accepté */}
            {reservationStatus === "accepted" && annonce.reservation_requester_email && (
              <div className="mt-4 p-5 border border-gray-100 rounded-2xl bg-green-50 text-green-900">
                <div className="text-sm text-green-800">Réservé par</div>
                <div className="font-semibold">{annonce.reservation_requester_email}</div>
              </div>
            )}
          </div>
        </div>

        {/* AVIS */}
        <div className="p-8 border-t">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Laisser un avis</h3>
          <p className="text-sm text-gray-600 mb-4">
            Avis autorisé uniquement si la réservation est <b>acceptée</b> et l’annonce <b>terminée</b>.
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Note</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="p-3 bg-gray-100 rounded-lg w-full"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ⭐
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Commentaire</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="p-3 bg-gray-100 rounded-lg w-full"
                placeholder="Décris ton expérience..."
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4">
              <div className="text-sm">
                {!canLeaveReview && (
                  <span className="text-gray-500">
                    (Le bouton s’activera quand l’annonce sera terminée.)
                  </span>
                )}
                {reviewErr && <span className="text-red-600">{reviewErr}</span>}
                {reviewMsg && <span className="text-green-600">{reviewMsg}</span>}
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={sendingReview || !canLeaveReview}
                className={`px-6 py-3 rounded-lg font-semibold text-white ${
                  sendingReview || !canLeaveReview
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {sendingReview ? "Envoi..." : "Envoyer l’avis"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnonceDetail;
