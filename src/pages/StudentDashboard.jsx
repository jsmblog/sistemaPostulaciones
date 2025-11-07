import React, { useEffect, useState } from "react";
import { getPostulaciones } from "../services/postulations";
import "./StudentDashboard.css";

export const StudentDashboard = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostulaciones = async () => {
      const data = await getPostulaciones();
      setPostulaciones(data);
      setLoading(false);
    };

    fetchPostulaciones();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando postulaciones...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Panel del Estudiante</h1>
          <p>Consulta las pasantías disponibles en la ULEAM</p>
        </header>

        {postulaciones.length === 0 ? (
          <div className="no-data">
            <p>No hay postulaciones disponibles.</p>
          </div>
        ) : (
          <div className="postulaciones-grid">
            {postulaciones.map((p) => (
              <div className="postulacion-card" key={p.id}>
                <div className="card-content">
                  <h3>{p.area}</h3>
                  <p>
                    <strong>Localidad:</strong> {p.localidad}
                  </p>
                  <p>
                    <strong>Duración:</strong> {p.duracion}
                  </p>
                  <p>
                    <strong>Requisitos:</strong> {p.requisitos}
                  </p>
                </div>
                <button className="btn-postular">Postularme</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
