import React, { useEffect, useState } from "react";
import { getPostulaciones } from "../services/postulations";

export const StudentDashboard = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(postulaciones)
  useEffect(() => {
    const fetchPostulaciones = async () => {
      const data = await getPostulaciones();
      setPostulaciones(data);
      setLoading(false);
    };

    fetchPostulaciones();
  }, []);

  if (loading) return <p>Cargando postulaciones...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Student Dashboard</h1>
      <h2>Postulaciones disponibles</h2>

      {postulaciones.length === 0 ? (
        <p>No hay postulaciones disponibles.</p>
      ) : (
        <ul>
          {postulaciones.map((p) => (
            <li key={p.id}>
              <strong>{p.area}</strong> — {p.localidad} <br />
              <span>Duración: {p.duracion}</span>
              <br />
              <small>{p.requisitos}</small>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
