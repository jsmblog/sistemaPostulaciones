import { useState, useEffect } from 'react';
import { supabase } from '../supabase/connection';
import './CompanyDashboard.css';

export const CompanyDashboard = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  
  const [formData, setFormData] = useState({
    area: '',
    duracion: '',
    modalidad_id: '',
    localidad: '',
    requisitos: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('No hay sesión activa');
        return;
      }

      const userId = session.user.id;
      setCompanyId(userId);

      // Cargar modalidades
      const { data: modalidadesData, error: modalidadesError } = await supabase
        .from('modalidades')
        .select('*')
        .order('id');

      if (modalidadesError) {
        console.error('Error cargando modalidades:', modalidadesError);
        // Si no existe la tabla, crear las modalidades por defecto
        await createDefaultModalidades();
        const { data: newModalidades } = await supabase
          .from('modalidades')
          .select('*')
          .order('id');
        setModalidades(newModalidades || []);
      } else {
        setModalidades(modalidadesData || []);
      }

      // Cargar postulaciones de la empresa
      const { data: postulacionesData, error: postulacionesError } = await supabase
        .from('postulaciones')
        .select(`
          *,
          modalidades (
            id,
            nombre
          )
        `)
        .eq('company_id', userId)
        .order('created_at', { ascending: false });

      if (postulacionesError) {
        console.error('Error cargando postulaciones:', postulacionesError);
        alert('Error al cargar las postulaciones: ' + postulacionesError.message);
      } else {
        setPostulaciones(postulacionesData || []);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultModalidades = async () => {
    const defaultModalidades = [
      { nombre: 'Virtual' },
      { nombre: 'Presencial' },
      { nombre: 'Semipresencial' }
    ];

    for (const modalidad of defaultModalidades) {
      await supabase
        .from('modalidades')
        .insert([modalidad]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.area || !formData.duracion || !formData.modalidad_id || !formData.localidad || !formData.requisitos) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingId) {
        // Actualizar postulación existente
        const { error } = await supabase
          .from('postulaciones')
          .update({
            area: formData.area,
            duracion: formData.duracion,
            modalidad_id: formData.modalidad_id,
            localidad: formData.localidad,
            requisitos: formData.requisitos,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('Postulación actualizada exitosamente');
      } else {
        // Crear nueva postulación
        const { error } = await supabase
          .from('postulaciones')
          .insert([{
            company_id: companyId,
            area: formData.area,
            duracion: formData.duracion,
            modalidad_id: formData.modalidad_id,
            localidad: formData.localidad,
            requisitos: formData.requisitos
          }]);

        if (error) throw error;
        alert('Postulación creada exitosamente');
      }

      // Limpiar formulario y recargar datos
      setFormData({
        area: '',
        duracion: '',
        modalidad_id: '',
        localidad: '',
        requisitos: ''
      });
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la postulación: ' + error.message);
    }
  };

  const handleEdit = (postulacion) => {
    setFormData({
      area: postulacion.area,
      duracion: postulacion.duracion,
      modalidad_id: postulacion.modalidad_id,
      localidad: postulacion.localidad || '',
      requisitos: postulacion.requisitos
    });
    setEditingId(postulacion.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta postulación?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('postulaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Postulación eliminada exitosamente');
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la postulación: ' + error.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      area: '',
      duracion: '',
      modalidad_id: '',
      localidad: '',
      requisitos: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Gestión de Postulaciones de Pasantías</h1>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Nueva Postulación'}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h2 className="form-title">
              {editingId ? 'Editar Postulación' : 'Nueva Postulación'}
            </h2>
            <form className="postulacion-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="area">Área *</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Ej: Desarrollo de Software, Marketing, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duracion">Duración *</label>
                <input
                  type="text"
                  id="duracion"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  placeholder="Ej: 3 meses, 6 meses, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalidad_id">Modalidad *</label>
                <select
                  id="modalidad_id"
                  name="modalidad_id"
                  value={formData.modalidad_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una modalidad</option>
                  {modalidades.map(modalidad => (
                    <option key={modalidad.id} value={modalidad.id}>
                      {modalidad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="localidad">Localidad *</label>
                <input
                  type="text"
                  id="localidad"
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleChange}
                  placeholder="Ej: Manta, Portoviejo, Guayaquil, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="requisitos">Requisitos *</label>
                <textarea
                  id="requisitos"
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  placeholder="Describe los requisitos para la pasantía..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Actualizar' : 'Crear Postulación'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="postulaciones-list">
          <h2 className="list-title">Mis Postulaciones ({postulaciones.length})</h2>
          
          {postulaciones.length === 0 ? (
            <div className="empty-state">
              <p>No hay postulaciones registradas. Crea una nueva postulación para comenzar.</p>
            </div>
          ) : (
            <div className="postulaciones-grid">
              {postulaciones.map(postulacion => (
                <div key={postulacion.id} className="postulacion-card">
                  <div className="card-header">
                    <h3 className="card-title">{postulacion.area}</h3>
                    <div className="card-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(postulacion)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(postulacion.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-info">
                      <span className="info-label">Duración:</span>
                      <span className="info-value">{postulacion.duracion}</span>
                    </div>
                    <div className="card-info">
                      <span className="info-label">Modalidad:</span>
                      <span className="info-value">
                        {postulacion.modalidades?.nombre || 'N/A'}
                      </span>
                    </div>
                    <div className="card-info">
                      <span className="info-label">Localidad:</span>
                      <span className="info-value">
                        {postulacion.localidad || 'No especificada'}
                      </span>
                    </div>
                    <div className="card-info-full">
                      <span className="info-label">Requisitos:</span>
                      <p className="info-value">{postulacion.requisitos}</p>
                    </div>
                    <div className="card-date">
                      Creado: {new Date(postulacion.created_at).toLocaleDateString('es-ES')}
                    </div>
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
