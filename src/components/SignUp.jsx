import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/connection';
export const SignUp = ({ rol }) => {
  const navigate = useNavigate();
  const isStudent = rol === 'student';
  
  const [dataForm, setDataForm] = useState({
    name: '',
    email: '',
    password: '',
    contact:'',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      setDataForm(prev => ({
        ...prev,
        options: {
          data: {
            nombre: value
          }
        }
      }));
    } else {
      setDataForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitRegister = async (event) => {
    event.preventDefault();
    try {
      const name = dataForm.name 

      const { data, error } = await supabase.auth.signUp(
        { email: dataForm.email, password: dataForm.password },
        {
          data: { name, rol , email: dataForm.email },
          redirectTo: `${window.location.origin}/confirm-email`
        }
      );

      if (error) {
        alert("⚠ Ha ocurrido un error: " + error.message);
        return;
      }

      alert('Registro exitoso. Por favor revisa tu correo para verificar la cuenta.');
      setDataForm({
        name: '',
        email: '',
        password: '',
        contact:'',
      });
      navigate("/panel");

      console.log("Data de registro (auth):", data);

    } catch (err) {
      console.log("Error al registrar:", err?.message || err);
      alert("⚠ Ha ocurrido un error inesperado al registrarte.");
    }
  };

  return (
    <main>
      <h1>Regístrese ahora</h1>
     
      <form onSubmit={handleSubmitRegister}>
        <label htmlFor="name">
          {isStudent ? "Nombre Completo" : "Nombre de la empresa"}
        </label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          value={dataForm.options.data.nombre}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="email">Correo Electrónico</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={dataForm.email}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="password">Contraseña</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          value={dataForm.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        
        <button type="submit">Registrarse</button>
      </form>
    </main>
  );
};
// ...existing code...