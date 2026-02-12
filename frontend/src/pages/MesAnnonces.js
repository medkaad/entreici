import { useEffect, useState } from "react";
import { getMyAnnonces, deleteAnnonce, updateAnnonce } from "../api/api";

function MesAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // 📝 Edition
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
  });

  // 🔐 Workflow identique backend
  const allowedTransitions = {
    active: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  const allStatuses = ["active", "in_progress", "completed", "cancelled"];

  async function loadAnnonces() {
    try {
      const data = await getMyAnnonces();
      setAnnonces(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    }
  }

  useEffect(() => {
    loadAnnonces();
  }, []);

  async function handleDelete(id) {
    try {
      await deleteAnnonce(id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      setErrorMessage("Impossible de supprimer l'annonce.");
    }
  }

  async function handleStatusChange(id, newStatus, oldStatus) {
    if (newStatus === oldStatus) return;

    try {
      await updateAnnonce(id, { status: newStatus });

      setAnnonces((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: newStatus } : a
        )
      );

      setErrorMessage(null);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Transition non autorisée.";

      setErrorMessage(message);

      // rollback visuel
      setAnnonces((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: oldStatus } : a
        )
      );
    }
  }

  // ✏️ Lancer édition
  function startEditing(annonce) {
    setEditingId(annonce.id);
    setEditData({
      title: annonce.title,
      description: annonce.description,
    });
  }

  // 💾 Sauvegarder modification
  async function handleEditSave(id) {
    try {
      await updateAnnonce(id, editData);

      setAnnonces((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, ...editData } : a
        )
      );

      setEditingId(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Erreur lors de la modification.");
    }
  }

  const isAllowed = (current, target) => {
    if (current === target) return true;
    return allowedTransitions[current]?.includes(target);
  };

  // 🎨 Styles dynamiques
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

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Mes Annonces</h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 border border-red-200">
          {errorMessage}
        </div>
      )}

      {annonces.length === 0 && (
        <p className="text-gray-500">Aucune annonce créée.</p>
      )}

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
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                className="border p-2 w-full mb-3 rounded-lg"
              />

              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
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
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold">{a.title}</h3>

                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyle(
                    a.status
                  )}`}
                >
                  {getStatusLabel(a.status)}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{a.description}</p>

              <div className="flex gap-4 items-center">
                <select
                  value={a.status}
                  onChange={(e) =>
                    handleStatusChange(a.id, e.target.value, a.status)
                  }
                  className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {allStatuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={!isAllowed(a.status, status)}
                    >
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
