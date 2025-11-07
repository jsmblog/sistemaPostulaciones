import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/connection";

export const WaitingRoom = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    checkEmailConfirmation();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event); // Para debugging
        
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserRedirection(session.user);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkEmailConfirmation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        if (session.user.email_confirmed_at) {
          await handleUserRedirection(session.user);
        } else {
          setChecking(false);
          setMessage('Esperando confirmación de correo...');
        }
      } else {
        setChecking(false);
        setMessage('Por favor, verifica tu correo electrónico.');
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      setChecking(false);
      setMessage('Error al verificar tu sesión.');
    }
  };

  const handleUserRedirection = async (user) => {
    if (!user.email_confirmed_at) {
      setChecking(false);
      setMessage('Aún no has confirmado tu correo.');
      return;
    }

    const userRol = user.user_metadata?.rol;
    
    if (userRol === 'student') {
      navigate('/student-dashboard', { replace: true });
    } else if (userRol === 'company') {
      navigate('/company-dashboard', { replace: true });
    } else {
      console.error('Rol no reconocido:', userRol);
      navigate('/', { replace: true });
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Verificación de Correo</h2>
      {checking ? (
        <div>
          <p>{message}</p>
          <div>⏳</div>
        </div>
      ) : (
        <div>
          <p>📧 Te hemos enviado un correo de verificación.</p>
          <p>Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación.</p>
          <p>Una vez que confirmes tu correo, serás redirigido automáticamente.</p>
          <button onClick={checkEmailConfirmation}>
            🔄 Verificar ahora
          </button>
        </div>
      )}
    </div>
  );
};