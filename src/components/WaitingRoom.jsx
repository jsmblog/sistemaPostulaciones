import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/connection";

export const WaitingRoom = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    // Manejar el hash de confirmación de email
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        console.log('Token de confirmación detectado');
        // Esperar un momento para que Supabase procese la sesión
        setTimeout(() => {
          checkEmailConfirmation();
        }, 1000);
        return;
      }
      
      checkEmailConfirmation();
    };

    handleEmailConfirmation();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        console.log('Session:', session?.user);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Usuario autenticado, verificando email...');
          await handleUserRedirection(session.user);
        }
        
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Recuperación de contraseña detectada');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkEmailConfirmation = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Sesión actual:', session);
      console.log('Error:', error);
      
      if (session?.user) {
        console.log('Email confirmado:', session.user.email_confirmed_at);
        console.log('Metadata:', session.user.user_metadata);
        
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
    console.log('Rol del usuario:', userRol);
    
    setMessage('✅ Email confirmado. Redirigiendo...');
    
    // Pequeño delay para que el usuario vea el mensaje
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (userRol === 'student') {
      navigate('/student-dashboard', { replace: true });
    } else if (userRol === 'company') {
      navigate('/company-dashboard', { replace: true });
    } else {
      console.error('Rol no reconocido:', userRol);
      setMessage('❌ Error: Rol de usuario no válido');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);
    setMessage('Verificando...');
    await checkEmailConfirmation();
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Verificación de Correo</h2>
      {checking ? (
        <div>
          <p>{message}</p>
          <div style={{ fontSize: '48px' }}>⏳</div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '48px', margin: '20px 0' }}>📧</p>
          <p><strong>Te hemos enviado un correo de verificación.</strong></p>
          <p>Por favor, revisa tu bandeja de entrada (y spam) y haz clic en el enlace de confirmación.</p>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '20px' }}>
            {message}
          </p>
          <button 
            onClick={handleManualCheck}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '5px',
              border: '1px solid #ccc',
              background: '#007bff',
              color: 'white'
            }}
          >
            🔄 Ya confirmé mi correo
          </button>
        </div>
      )}
    </div>
  );
};