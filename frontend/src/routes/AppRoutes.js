import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Annonces from "../pages/Annonces";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Annonces />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
