import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Ajusta la ruta según tu proyecto
import { insert_Admin } from './services'; // Ajusta la ruta según tu proyecto

export const SignUp = ({ rol }) => {
  const navigate = useNavigate();
  const isStudent = rol === 'student';
  
  const [dataForm, setDataForm] = useState({
    email: '',
    password: '',
    options: {
      data: {
        nombre: '',
      }
    }
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
    try {
      event.preventDefault();

      // registrar al usuario
      const { data, error } = await supabase.auth.signUp(dataForm);

      if (error) {
        alert("⚠ Ha ocurrido un error: " + error.message);
        return; // 🚫 no seguimos
      } else if (data.user?.identities?.length === 0) {
        alert('Este usuario ya existe');
        return; // 🚫 no seguimos
      } else {
        const admin = {
          id: data.user.id,
          nombre: dataForm.options.data.nombre || dataForm.email.split('@')[0],
          email: dataForm.email,
          rol,
        };
        console.log("Datos enviados a la tabla admin:", admin);
        await insert_Admin(admin);
        alert('¡Éxito al registrarte! Por favor, revisa tu correo.');
        navigate("/panel");
      }

      console.log("Data de registro:", data);

    } catch (error) {
      console.log("Error al registrar:", error.message);
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