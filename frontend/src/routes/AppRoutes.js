import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Annonces from "../pages/Annonces";
import Conversations from "../pages/Conversations";
import Messages from "../pages/Messages";
import ProtectedRoute from "../components/ProtectedRoute";
import Register from "../pages/Register";

function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Inscription */}
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Annonces />
          </ProtectedRoute>
        }
      />

      <Route
        path="/conversations"
        element={
          <ProtectedRoute>
            <Conversations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:id"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* Catch all → redirect home */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default AppRoutes;
