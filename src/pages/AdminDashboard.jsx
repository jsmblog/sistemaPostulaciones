import { useState, useEffect } from 'react';
import { supabase } from '../supabase/connection';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [estudiantesPostulaciones, setEstudiantesPostulaciones] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterPostulacion, setFilterPostulacion] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterEstado !== 'all' || filterPostulacion !== 'all') {
      loadEstudiantesPostulaciones();
    } else {
      loadEstudiantesPostulaciones();
    }
  }, [filterEstado, filterPostulacion]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar estados
      const { data: estadosData, error: estadosError } = await supabase
        .from('estados_postulacion')
        .select('*')
        .order('id');

      if (estadosError) {
        console.error('Error cargando estados:', estadosError);
      } else {
        setEstados(estadosData || []);
      }

      // Cargar todas las postulaciones
      const { data: postulacionesData, error: postulacionesError } = await supabase
        .from('postulaciones')
        .select(`
          *,
          modalidades (
            id,
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      if (postulacionesError) {
        console.error('Error cargando postulaciones:', postulacionesError);
        alert('Error al cargar las postulaciones: ' + postulacionesError.message);
      } else {
        setPostulaciones(postulacionesData || []);
      }

      // Cargar postulaciones de estudiantes
      await loadEstudiantesPostulaciones();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadEstudiantesPostulaciones = async () => {
    try {
      let query = supabase
        .from('estudiantes_postulaciones')
        .select(`
          *,
          estados_postulacion (
            id,
            nombre
          ),
          postulaciones (
            id,
            area,
            duracion,
            localidad,
            modalidades (
              nombre
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filterEstado !== 'all') {
        query = query.eq('estado_id', filterEstado);
      }

      if (filterPostulacion !== 'all') {
        query = query.eq('postulacion_id', filterPostulacion);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando postulaciones de estudiantes:', error);
        alert('Error al cargar las postulaciones de estudiantes: ' + error.message);
      } else {
        setEstudiantesPostulaciones(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEstadoChange = async (postulacionId, nuevoEstadoId) => {
    if (!confirm('¿Estás seguro de que deseas cambiar el estado de esta postulación?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('estudiantes_postulaciones')
        .update({
          estado_id: nuevoEstadoId,
          updated_at: new Date().toISOString()
        })
        .eq('id', postulacionId);

      if (error) throw error;
      alert('Estado actualizado exitosamente');
      loadEstudiantesPostulaciones();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado: ' + error.message);
    }
  };

  const getEstadoColor = (estadoNombre) => {
    switch (estadoNombre) {
      case 'Aceptado':
        return '#28a745';
      case 'Rechazado':
        return '#dc3545';
      case 'Pendiente':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-container">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <h1 className="admin-dashboard-title">Panel de Administración</h1>
          <p className="admin-dashboard-subtitle">Gestión de Postulaciones de Estudiantes</p>
        </div>

        {/* Estadísticas */}
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Postulaciones</h3>
            <p className="stat-number">{postulaciones.length}</p>
          </div>
          <div className="stat-card">
            <h3>Postulaciones de Estudiantes</h3>
            <p className="stat-number">{estudiantesPostulaciones.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pendientes</h3>
            <p className="stat-number">
              {estudiantesPostulaciones.filter(ep => ep.estados_postulacion?.nombre === 'Pendiente').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Aceptadas</h3>
            <p className="stat-number">
              {estudiantesPostulaciones.filter(ep => ep.estados_postulacion?.nombre === 'Aceptado').length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="admin-filters">
          <div className="filter-group">
            <label htmlFor="filter-estado">Filtrar por Estado:</label>
            <select
              id="filter-estado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los estados</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-postulacion">Filtrar por Oferta:</label>
            <select
              id="filter-postulacion"
              value={filterPostulacion}
              onChange={(e) => setFilterPostulacion(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las ofertas</option>
              {postulaciones.map(postulacion => (
                <option key={postulacion.id} value={postulacion.id}>
                  {postulacion.area} - {postulacion.localidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Postulaciones de Estudiantes */}
        <div className="admin-postulaciones-list">
          <h2 className="admin-list-title">
            Postulaciones de Estudiantes ({estudiantesPostulaciones.length})
          </h2>

          {estudiantesPostulaciones.length === 0 ? (
            <div className="admin-empty-state">
              <p>No hay postulaciones de estudiantes registradas.</p>
            </div>
          ) : (
            <div className="admin-postulaciones-grid">
              {estudiantesPostulaciones.map(ep => (
                <div key={ep.id} className="admin-postulacion-card">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">
                      {ep.postulaciones?.area || 'N/A'}
                    </h3>
                    <span
                      className="admin-estado-badge"
                      style={{ backgroundColor: getEstadoColor(ep.estados_postulacion?.nombre) }}
                    >
                      {ep.estados_postulacion?.nombre || 'N/A'}
                    </span>
                  </div>

                  <div className="admin-card-body">
                    <div className="admin-card-info">
                      <span className="admin-info-label">Estudiante ID:</span>
                      <span className="admin-info-value">{ep.student_id}</span>
                    </div>
                    <div className="admin-card-info">
                      <span className="admin-info-label">Duración:</span>
                      <span className="admin-info-value">
                        {ep.postulaciones?.duracion || 'N/A'}
                      </span>
                    </div>
                    <div className="admin-card-info">
                      <span className="admin-info-label">Localidad:</span>
                      <span className="admin-info-value">
                        {ep.postulaciones?.localidad || 'N/A'}
                      </span>
                    </div>
                    <div className="admin-card-info">
                      <span className="admin-info-label">Modalidad:</span>
                      <span className="admin-info-value">
                        {ep.postulaciones?.modalidades?.nombre || 'N/A'}
                      </span>
                    </div>
                    <div className="admin-card-info">
                      <span className="admin-info-label">Fecha de Postulación:</span>
                      <span className="admin-info-value">
                        {new Date(ep.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="admin-card-actions">
                    <label htmlFor={`estado-${ep.id}`}>Cambiar Estado:</label>
                    <select
                      id={`estado-${ep.id}`}
                      value={ep.estado_id}
                      onChange={(e) => handleEstadoChange(ep.id, e.target.value)}
                      className="admin-estado-select"
                    >
                      {estados.map(estado => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

