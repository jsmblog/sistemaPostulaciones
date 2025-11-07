import { Link, useNavigate } from "react-router-dom"

export const Landing = ({handleRoleSelection}) => {
    const navigate = useNavigate();
    const navigateToPaths = (path,role) => {
        if(role){
            handleRoleSelection(role);
        }
        navigate(path);
    }
  return (
    <main>
      <h1>Welcome to the Landing Page</h1>
      <button onClick={() => navigateToPaths('/login')}>
        iniciar sesión
      </button>
      <button onClick={() => navigateToPaths('/sign-up','student')}>
        soy estudiante
      </button>
      <button onClick={() => navigateToPaths('/sign-up','employer')}>
        soy una empresa
      </button>
    </main>
  );
};