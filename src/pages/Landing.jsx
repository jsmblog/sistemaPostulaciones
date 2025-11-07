import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PopUp } from "../components/PopUp";
import "./Landing.css";

export const Landing = ({ handleRoleSelection }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  
  const navigateToPaths = (path, role) => {
    if (role) {
      handleRoleSelection(role);
    }
    navigate(path);
  };

  const handleRoleSelect = (role) => {
    navigateToPaths("/sign-up", role);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigateToPaths("/login");
  };

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <h1 className="landing-title">Bienvenido al Sistema de Postulaciones</h1>
          <p className="landing-intro">
            Centraliza tus convocatorias, postula con confianza y haz seguimiento a cada
            oportunidad desde una sola plataforma institucional inspirada en la experiencia
            de ULEAM.
          </p>

          <div className="landing-form-wrapper">
            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="email">Correo institucional</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="nombre.apellido@uleam.edu.ec"
                required
              />

              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                required
              />

              <button type="submit" className="btn-primary">
                Iniciar sesión
              </button>
            </form>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowPopup(true)}
            >
              ¿Aún no te has registrado?
            </button>
          </div>
        </div>

        <div className="landing-image">
          <img
            src="https://www.uleam.edu.ec/wp-content/uploads/2020/06/uleam-campus.jpg"
            alt="Campus ULEAM"
          />
        </div>
      </section>

      <PopUp 
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onSelectRole={handleRoleSelect}
      />
    </main>
  );
};