import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyAnnonces,
  deleteAnnonce,
  updateAnnonce,
  acceptReservation,
  rejectReservation,
} from "../api/api";

function MesAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // 📝 Edition
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });

  const [reservationBusyId, setReservationBusyId] = useState(null);

  // 🔔 Notifications (bannière)
  const [notif, setNotif] = useState(null); // { count, annonceId }
  const lastPendingIdsRef = useRef(new Set()); // pour détecter nouveaux pending sans rerender

  const navigate = useNavigate();

  // 🔐 Workflow identique backend
  const allowedTransitions = {
    active: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  const allStatuses = ["active", "in_progress", "completed", "cancelled"];

  // ---------- helpers ----------
  const isAllowed = (current, target) => {
    if (current === target) return true;
    return allowedTransitions[current]?.includes(target);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "completed":
        return "bg-gray-200 text-gray-700 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const getReservationBadge = (rStatus) => {
    const map = {
      none: { label: "Aucune", cls: "bg-gray-50 text-gray-600 border-gray-200" },
      pending: { label: "En attente", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      accepted: { label: "Acceptée", cls: "bg-green-50 text-green-700 border-green-200" },
      rejected: { label: "Refusée", cls: "bg-red-50 text-red-700 border-red-200" },
    };
    const c = map[rStatus || "none"] || map.none;
    return (
      <span className={`text-xs px-3 py-1 rounded-full border ${c.cls}`}>
        Réservation : {c.label}
      </span>
    );
  };

  // ---------- Notification navigateur (optionnel) ----------
  async function maybeBrowserNotify(title, body) {
    try {
      if (!("Notification" in window)) return;

      if (Notification.permission === "default") {
        // demande permission au premier "vrai" événement
        await Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
    } catch {
      // ignore
    }
  }

  // ---------- Load + detect new pending ----------
  async function loadAnnonces({ silent = false } = {}) {
    try {
      const data = await getMyAnnonces();
      const list = Array.isArray(data) ? data : data.results || [];

      // détecter les nouveaux "pending"
      const pendingNow = list.filter((a) => a.reservation_status === "pending");
      const pendingIdsNow = new Set(pendingNow.map((a) => a.id));

      // nouveaux = ceux qui n’étaient pas dans l’ancien set
      const newPending = pendingNow.filter((a) => !lastPendingIdsRef.current.has(a.id));

      // update ref
      lastPendingIdsRef.current = pendingIdsNow;

      setAnnonces(list);
      if (!silent) setErrorMessage(null);

      if (newPending.length > 0) {
        const first = newPending[0];
        setNotif({ count: newPending.length, annonceId: first.id });

        // Option: notification navigateur
        maybeBrowserNotify(
          "Nouvelle demande de réservation",
          `${newPending.length} nouvelle(s) demande(s). Exemple : "${first.title}"`
        );

        // Auto-hide bannière après 12s
        window.clearTimeout(window.__notifTimer);
        window.__notifTimer = window.setTimeout(() => setNotif(null), 12000);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      if (!silent) setErrorMessage("Impossible de charger tes annonces.");
    }
  }

  // 1er chargement
  useEffect(() => {
    loadAnnonces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling toutes les 8 secondes (notification)
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnnonces({ silent: true });
    }, 8000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Actions ----------
  async function handleDelete(id) {
    try {
      await deleteAnnonce(id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setErrorMessage("Impossible de supprimer l'annonce.");
    }
  }

  async function handleStatusChange(id, newStatus, oldStatus) {
    if (newStatus === oldStatus) return;

    try {
      await updateAnnonce(id, { status: newStatus });
      setAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      setErrorMessage(null);
    } catch (error) {
      const message = error?.message || "Transition non autorisée.";
      setErrorMessage(message);

      // rollback
      setAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, status: oldStatus } : a)));
    }
  }

  function startEditing(annonce) {
    setEditingId(annonce.id);
    setEditData({ title: annonce.title, description: annonce.description });
  }

  async function handleEditSave(id) {
    try {
      await updateAnnonce(id, editData);
      setAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, ...editData } : a)));
      setEditingId(null);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Erreur lors de la modification.");
    }
  }

  async function handleAcceptReservation(id) {
    setErrorMessage(null);
    setReservationBusyId(id);
    try {
      await acceptReservation(id);
      await loadAnnonces({ silent: true });
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.message || "Erreur lors de l’acceptation.");
    } finally {
      setReservationBusyId(null);
    }
  }

  async function handleRejectReservation(id) {
    setErrorMessage(null);
    setReservationBusyId(id);
    try {
      await rejectReservation(id);
      await loadAnnonces({ silent: true });
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.message || "Erreur lors du refus.");
    } finally {
      setReservationBusyId(null);
    }
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold">Mes Annonces</h2>

        <button
          onClick={() => loadAnnonces()}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition"
          title="Rafraîchir"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* 🔔 Notification bannière */}
      {notif && (
        <div
          className="mb-6 p-4 rounded-2xl border border-yellow-200 bg-yellow-50 text-yellow-900 flex items-center justify-between gap-4 cursor-pointer"
          onClick={() => {
            navigate(`/annonces/${notif.annonceId}`);
            setNotif(null);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="min-w-0">
            <p className="font-semibold">🔔 Nouvelle demande de réservation</p>
            <p className="text-sm text-yellow-800">
              {notif.count} nouvelle(s) demande(s). Clique pour voir.
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotif(null);
            }}
            className="px-3 py-1 rounded-lg bg-white border border-yellow-200 text-yellow-900 hover:bg-yellow-100"
          >
            Fermer
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 border border-red-200">
          {errorMessage}
        </div>
      )}

      {annonces.length === 0 && <p className="text-gray-500">Aucune annonce créée.</p>}

      {annonces.map((a) => (
        <div
          key={a.id}
          className="bg-white p-6 mb-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border"
        >
          {editingId === a.id ? (
            <>
              {/* 📝 MODE EDITION */}
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="border p-2 w-full mb-3 rounded-lg"
              />

              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="border p-2 w-full mb-4 rounded-lg"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => handleEditSave(a.id)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Enregistrer
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                >
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 👁️ MODE NORMAL */}
              <div className="flex justify-between items-center mb-3 gap-3">
                <h3 className="text-xl font-semibold">{a.title}</h3>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyle(a.status)}`}>
                    {getStatusLabel(a.status)}
                  </span>
                  {getReservationBadge(a.reservation_status)}
                </div>
              </div>

              {/* ✅ Bloc réservation */}
              <div className="mb-4 p-4 rounded-xl border bg-gray-50">
                <p className="text-sm text-gray-700">
                  Demandeur : <b>{a.reservation_requester_email || "—"}</b>
                </p>

                {a.reservation_status === "pending" && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleAcceptReservation(a.id)}
                      disabled={reservationBusyId === a.id}
                      className={`px-4 py-2 rounded-lg text-white ${
                        reservationBusyId === a.id ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {reservationBusyId === a.id ? "..." : "Accepter"}
                    </button>

                    <button
                      onClick={() => handleRejectReservation(a.id)}
                      disabled={reservationBusyId === a.id}
                      className={`px-4 py-2 rounded-lg text-white ${
                        reservationBusyId === a.id ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {reservationBusyId === a.id ? "..." : "Refuser"}
                    </button>
                  </div>
                )}

                {a.reservation_status === "accepted" && (
                  <p className="text-sm text-green-700 mt-2">✅ Réservation acceptée — service en cours.</p>
                )}

                {a.reservation_status === "rejected" && (
                  <p className="text-sm text-red-700 mt-2">❌ Demande refusée.</p>
                )}
              </div>

              <p className="text-gray-600 mb-4">{a.description}</p>

              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => navigate(`/annonces/${a.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Voir détail
                </button>

                <select
                  value={a.status}
                  onChange={(e) => handleStatusChange(a.id, e.target.value, a.status)}
                  className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {allStatuses.map((status) => (
                    <option key={status} value={status} disabled={!isAllowed(a.status, status)}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => startEditing(a)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                >
                  Modifier
                </button>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default MesAnnonces;
