import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PopUp } from "../components/PopUp";
import "./Landing.css";
import { useUser } from "../context/UserContext";
import { supabase } from "../supabase/connection";

export const Landing = ({ handleRoleSelection }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        alert("⚠ Error al iniciar sesión: " + error.message);
        return;
      }

      const user = data?.user;
      if (!user) {
        alert("⚠ No se ha recibido información del usuario.");
        return;
      }

      const role = user.user_metadata?.rol ?? user.user_metadata?.role ?? null;

      // Guardar en contexto
      setUser({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name ?? null,
        role,
        contact: user.user_metadata?.contact ?? null,
      });

      // Navegar según rol (ajusta rutas a tu app)
      if (role === "student") {
        navigate("/student-dashboard");
      } else if (role === "company") {
        navigate("/company-dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Error de login:", err);
      alert("Ha ocurrido un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToPaths = (path, role) => {
    if (role) {
      handleRoleSelection(role);
    }
    navigate(path);
  };

  const handleRoleSelect = (role) => {
    navigateToPaths("/sign-up", role);
  }

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
                value={form.email}
                onChange={handleChange}
                placeholder="nombre.apellido@uleam.edu.ec"
                required
              />

              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                required
              />

              <button disabled={loading} type="submit" className="btn-primary">
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
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