import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyAnnonces,
  deleteAnnonce,
  updateAnnonce,
  acceptReservation,
  rejectReservation,
} from "../api/api";
import { useToast } from "../ui/Toast";

function MesAnnonces() {
  const toast = useToast();
  const navigate = useNavigate();

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // 🔔 Notifications (bannière)
  const [notif, setNotif] = useState(null); // { count, annonceId }
  const lastPendingIdsRef = useRef(new Set());

  // ✅ actions busy
  const [reservationBusyId, setReservationBusyId] = useState(null);

  // 📝 Edition (MODALE)
  const [editOpen, setEditOpen] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [savingEdit, setSavingEdit] = useState(false);

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
        return "bg-green-50 text-green-800 border border-green-200";
      case "in_progress":
        return "bg-blue-50 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border border-gray-200";
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

  const reservationBadge = (rStatus) => {
    const map = {
      none: { label: "Aucune", cls: "bg-gray-50 text-gray-800 border-gray-200" },
      pending: { label: "En attente", cls: "bg-yellow-50 text-yellow-900 border-yellow-200" },
      accepted: { label: "Acceptée", cls: "bg-green-50 text-green-900 border-green-200" },
      rejected: { label: "Refusée", cls: "bg-red-50 text-red-900 border-red-200" },
    };
    const c = map[rStatus || "none"] || map.none;
    return (
      <span className={`text-base px-4 py-2 rounded-full border font-extrabold ${c.cls}`}>
        Réservation : {c.label}
      </span>
    );
  };

  // ---------- Notification navigateur (optionnel) ----------
  async function maybeBrowserNotify(title, body) {
    try {
      if (!("Notification" in window)) return;

      if (Notification.permission === "default") {
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
      if (!silent) {
        setLoading(true);
        setErrorMessage(null);
      }

      const data = await getMyAnnonces();
      const list = Array.isArray(data) ? data : data.results || [];

      // détecter nouveaux pending
      const pendingNow = list.filter((a) => a.reservation_status === "pending");
      const pendingIdsNow = new Set(pendingNow.map((a) => a.id));
      const newPending = pendingNow.filter((a) => !lastPendingIdsRef.current.has(a.id));
      lastPendingIdsRef.current = pendingIdsNow;

      setAnnonces(list);

      if (newPending.length > 0) {
        const first = newPending[0];
        setNotif({ count: newPending.length, annonceId: first.id });

        maybeBrowserNotify(
          "Nouvelle demande de réservation",
          `${newPending.length} nouvelle(s) demande(s). Exemple : "${first.title}"`
        );

        window.clearTimeout(window.__notifTimer);
        window.__notifTimer = window.setTimeout(() => setNotif(null), 12000);

        toast.info("🔔 Nouvelle demande de réservation");
      }

      if (!silent) toast.success("Mes annonces mises à jour ✅");
    } catch (error) {
      console.error("Erreur chargement:", error);
      if (!silent) {
        setErrorMessage("Impossible de charger tes annonces.");
        toast.error("Erreur : chargement impossible.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // 1er chargement
  useEffect(() => {
    loadAnnonces({ silent: true }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling toutes les 8 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnnonces({ silent: true });
    }, 8000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Actions ----------
  async function handleDelete(id) {
    const ok = window.confirm("Voulez-vous vraiment supprimer cette annonce ?");
    if (!ok) return;

    try {
      await deleteAnnonce(id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
      toast.success("Annonce supprimée ✅");
    } catch {
      setErrorMessage("Impossible de supprimer l'annonce.");
      toast.error("Erreur : annonce non supprimée.");
    }
  }

  async function handleStatusChange(id, newStatus, oldStatus) {
    if (newStatus === oldStatus) return;

    try {
      await updateAnnonce(id, { status: newStatus });
      setAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      setErrorMessage(null);
      toast.success("Statut mis à jour ✅");
    } catch (error) {
      const message = error?.message || "Transition non autorisée.";
      setErrorMessage(message);
      toast.error(message);

      // rollback
      setAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, status: oldStatus } : a)));
    }
  }

  function openEditModal(annonce) {
    setEditingAnnonce(annonce);
    setEditData({ title: annonce.title || "", description: annonce.description || "" });
    setEditOpen(true);
  }

  function closeEditModal() {
    setEditOpen(false);
    setEditingAnnonce(null);
    setEditData({ title: "", description: "" });
  }

  async function handleEditSave() {
    if (!editingAnnonce?.id) return;

    if (!editData.title.trim()) {
      toast.info("Le titre est obligatoire.");
      return;
    }
    if (!editData.description.trim()) {
      toast.info("La description est obligatoire.");
      return;
    }

    try {
      setSavingEdit(true);
      await updateAnnonce(editingAnnonce.id, {
        title: editData.title.trim(),
        description: editData.description.trim(),
      });

      setAnnonces((prev) =>
        prev.map((a) =>
          a.id === editingAnnonce.id ? { ...a, ...editData } : a
        )
      );

      toast.success("Annonce modifiée ✅");
      closeEditModal();
      setErrorMessage(null);
    } catch {
      setErrorMessage("Erreur lors de la modification.");
      toast.error("Erreur : modification impossible.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleAcceptReservation(id) {
    setErrorMessage(null);
    setReservationBusyId(id);
    try {
      await acceptReservation(id);
      toast.success("Réservation acceptée ✅");
      await loadAnnonces({ silent: true });
    } catch (error) {
      console.error(error);
      const m = error?.message || "Erreur lors de l’acceptation.";
      setErrorMessage(m);
      toast.error(m);
    } finally {
      setReservationBusyId(null);
    }
  }

  async function handleRejectReservation(id) {
    setErrorMessage(null);
    setReservationBusyId(id);
    try {
      await rejectReservation(id);
      toast.info("Réservation refusée.");
      await loadAnnonces({ silent: true });
    } catch (error) {
      console.error(error);
      const m = error?.message || "Erreur lors du refus.";
      setErrorMessage(m);
      toast.error(m);
    } finally {
      setReservationBusyId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            📌 Mes annonces
          </h2>
          <p className="text-gray-700 text-lg mt-2">
            Gérez vos annonces et vos demandes de réservation.
          </p>
        </div>

        <button
          onClick={() => loadAnnonces({ silent: false })}
          className="bg-gray-900 text-white px-6 py-4 rounded-3xl font-extrabold hover:bg-black transition focus:outline-none focus:ring-4 focus:ring-gray-200"
          title="Rafraîchir"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* 🔔 Notification bannière */}
      {notif && (
        <div
          className="mb-6 p-5 rounded-3xl border border-yellow-200 bg-yellow-50 text-yellow-950 flex items-center justify-between gap-4 cursor-pointer senior-card"
          onClick={() => {
            navigate(`/annonces/${notif.annonceId}`);
            setNotif(null);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(`/annonces/${notif.annonceId}`);
              setNotif(null);
            }
          }}
        >
          <div className="min-w-0">
            <p className="font-extrabold text-lg">🔔 Nouvelle demande de réservation</p>
            <p className="text-base text-yellow-900 font-semibold mt-1">
              {notif.count} nouvelle(s) demande(s). Cliquez pour voir.
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotif(null);
            }}
            className="px-5 py-3 rounded-2xl bg-white border-2 border-yellow-200 text-yellow-950 font-extrabold hover:bg-yellow-100 focus:outline-none focus:ring-4 focus:ring-yellow-200"
          >
            Fermer
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-5 rounded-3xl mb-6 border border-red-200 text-lg senior-card">
          ❌ {errorMessage}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
          ⏳ Chargement de vos annonces...
        </div>
      ) : annonces.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl shadow text-center text-gray-700 text-lg senior-card">
          Aucune annonce créée.
        </div>
      ) : (
        <div className="space-y-6">
          {annonces.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 senior-card"
            >
              {/* TITRE + BADGES */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-extrabold text-gray-900 break-words">
                    {a.title}
                  </h3>
                  <p className="text-gray-700 text-base mt-2">
                    {a.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-start md:justify-end">
                  <span className={`px-4 py-2 text-base font-extrabold rounded-full ${getStatusStyle(a.status)}`}>
                    {getStatusLabel(a.status)}
                  </span>
                  {reservationBadge(a.reservation_status)}
                </div>
              </div>

              {/* BLOC RÉSERVATION */}
              <div className="mt-5 p-5 rounded-3xl border bg-gray-50 senior-card">
                <p className="text-base text-gray-900 font-semibold">
                  Demandeur : <b>{a.reservation_requester_email || "—"}</b>
                </p>

                {a.reservation_status === "pending" && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAcceptReservation(a.id)}
                      disabled={reservationBusyId === a.id}
                      className={`py-4 rounded-3xl text-white font-extrabold text-lg focus:outline-none focus:ring-4 focus:ring-green-200 ${
                        reservationBusyId === a.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {reservationBusyId === a.id ? "..." : "✅ Accepter"}
                    </button>

                    <button
                      onClick={() => handleRejectReservation(a.id)}
                      disabled={reservationBusyId === a.id}
                      className={`py-4 rounded-3xl text-white font-extrabold text-lg focus:outline-none focus:ring-4 focus:ring-red-200 ${
                        reservationBusyId === a.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {reservationBusyId === a.id ? "..." : "❌ Refuser"}
                    </button>
                  </div>
                )}

                {a.reservation_status === "accepted" && (
                  <p className="text-base text-green-800 font-extrabold mt-3">
                    ✅ Réservation acceptée — service en cours.
                  </p>
                )}

                {a.reservation_status === "rejected" && (
                  <p className="text-base text-red-800 font-extrabold mt-3">
                    ❌ Demande refusée.
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
                <button
                  onClick={() => navigate(`/annonces/${a.id}`)}
                  className="bg-blue-700 text-white px-6 py-4 rounded-3xl font-extrabold text-lg hover:bg-blue-800 transition focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  👁 Voir détail
                </button>

                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-base font-extrabold text-gray-900">
                    Statut :
                  </label>

                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value, a.status)}
                    className="border-2 border-gray-300 px-5 py-4 rounded-3xl text-lg bg-white focus:outline-none focus:ring-4 focus:ring-indigo-200"
                  >
                    {allStatuses.map((status) => (
                      <option key={status} value={status} disabled={!isAllowed(a.status, status)}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => openEditModal(a)}
                  className="bg-yellow-500 text-white px-6 py-4 rounded-3xl font-extrabold text-lg hover:bg-yellow-600 transition focus:outline-none focus:ring-4 focus:ring-yellow-200"
                >
                  ✏ Modifier
                </button>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="bg-red-600 text-white px-6 py-4 rounded-3xl font-extrabold text-lg hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-200"
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE ÉDITION */}
      {editOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 z-10 senior-card border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Modifier l’annonce"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-2xl font-extrabold text-gray-900">
                ✏ Modifier l’annonce
              </h3>

              <button
                onClick={closeEditModal}
                className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-lg font-extrabold text-gray-900 mb-2">
                  Titre
                </label>
                <input
                  value={editData.title}
                  onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  placeholder="Titre"
                />
              </div>

              <div>
                <label className="block text-lg font-extrabold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  rows={6}
                  value={editData.description}
                  onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  placeholder="Description"
                />
              </div>

              <button
                onClick={handleEditSave}
                disabled={savingEdit}
                className={`w-full py-5 rounded-3xl font-extrabold text-lg text-white focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                  savingEdit ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
                }`}
              >
                {savingEdit ? "Enregistrement..." : "✅ Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesAnnonces;
