import React from "react";
import { NavLink } from "react-router-dom";
import SeniorToggle from "../senior/SeniorToggle";

const linkClass = ({ isActive }) =>
  "senior-click senior-focus rounded-2xl px-4 py-3 text-lg font-semibold " +
  (isActive ? "bg-black text-white" : "hover:bg-gray-100");

export default function SeniorNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🏡</span>
          <span className="text-xl font-bold">EntreIci</span>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClass}>🏠 Accueil</NavLink>
          <NavLink to="/annonces" className={linkClass}>🔎 Rechercher</NavLink>
          <NavLink to="/annonces/nouvelle" className={linkClass}>➕ Publier</NavLink>
          <NavLink to="/messages" className={linkClass}>💬 Messages</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <SeniorToggle />
        </div>
      </div>

      {/* mobile: navigation simple en bas */}
      <nav className="md:hidden grid grid-cols-4 gap-2 px-2 pb-2">
        <NavLink to="/" className={linkClass}>🏠</NavLink>
        <NavLink to="/annonces" className={linkClass}>🔎</NavLink>
        <NavLink to="/annonces/nouvelle" className={linkClass}>➕</NavLink>
        <NavLink to="/messages" className={linkClass}>💬</NavLink>
      </nav>
    </header>
  );
}
