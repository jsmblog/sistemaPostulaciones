import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/connection';
import { insertUserData } from '../services/insert';
import './SignUp.css';

export const SignUp = ({ rol }) => {
  const navigate = useNavigate();
  const isStudent = rol === 'student';
  
  const [dataForm, setDataForm] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
  });
  
  const [loading, setLoading] = useState(false); // NUEVO: Estado de carga

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm(prev => ({
      ...prev,
      [name]: value
    }));
  };


const handleSubmitRegister = async (event) => {
  event.preventDefault();
  
  if (dataForm.password.length < 6) {
    alert("⚠ La contraseña debe tener al menos 6 caracteres");
    return;
  }
  
  setLoading(true);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: dataForm.email,
      password: dataForm.password,
      options: {
        data: {
          name: dataForm.name,
          rol,
          contact: dataForm.contact
        },
        emailRedirectTo: `${window.location.origin}/waiting-room`  // AÑADE ESTO
      }
    });

    if (error) {
      alert("⚠ Ha ocurrido un error: " + error.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.user.identities?.length) {
      alert("⚠ Este correo ya está registrado. Por favor inicia sesión.");
      setLoading(false);
      return;
    }

    if (data.user) {
      const insertResult = await insertUserData({
        id: data.user.id,
        name: dataForm.name,
        email: dataForm.email,
        contact: dataForm.contact,
        rol
      });

      if (insertResult.error) {
        console.error('Error guardando datos adicionales:', insertResult.error);
        alert("⚠ Error al guardar información adicional.");
        setLoading(false);
        return;
      }
      
       await supabase.auth.signOut(); 
      
      alert('✅ Registro exitoso. Por favor revisa tu correo para verificar la cuenta.');
      
      setDataForm({
        name: '',
        email: '',
        password: '',
        contact: '',
      });
      
      navigate("/waiting-room", { replace: true });
    }

  } catch (err) {
    console.error("Error al registrar:", err);
    alert("⚠ Ha ocurrido un error inesperado al registrarte.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-title">Regístrese ahora</h2>
        <form className="signup-form" onSubmit={handleSubmitRegister}>
          <div className="signup-form-group">
            <label htmlFor="name">
              {isStudent ? "Nombre Completo" : "Nombre de la empresa"}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={dataForm.name}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={3}
              placeholder={isStudent ? "Ingrese su nombre completo" : "Ingrese el nombre de la empresa"}
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={dataForm.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={dataForm.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="contact">
              {isStudent ? "Teléfono de contacto" : "Teléfono de la empresa"}
            </label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={dataForm.contact}
              onChange={handleChange}
              placeholder="+593 99 999 9999"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};