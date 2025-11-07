import "./PopUp.css";

export const PopUp = ({ isOpen, onClose, onSelectRole }) => {
  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    onSelectRole(role);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-container">
        <h2 className="popup-title">Selecciona tu tipo de cuenta</h2>
        <div className="popup-buttons">
          <button
            className="popup-btn popup-btn-primary"
            onClick={() => handleRoleSelect("student")}
          >
            Soy postulante
          </button>
          <button
            className="popup-btn popup-btn-secondary"
            onClick={() => handleRoleSelect("company")}
          >
            Empresa
          </button>
        </div>
      </div>
    </div>
  );
};

