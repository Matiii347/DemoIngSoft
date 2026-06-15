import React, { useState, useEffect } from 'react';

const EMPTY_FORM = {
  name: '',
  origin: '',
  destination: '',
  totalDistance: '',
  estimatedTime: '',
  taskDescription: '',
  newStop: '',
  stops: [],
};

export default function RouteTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/route-templates');
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      origin: t.origin,
      destination: t.destination,
      totalDistance: String(t.totalDistance),
      estimatedTime: t.estimatedTime || '',
      taskDescription: t.taskDescription || '',
      newStop: '',
      stops: t.stops || [],
    });
    setError('');
    setShowModal(true);
  };

  const addStop = () => {
    if (!form.newStop.trim()) return;
    setForm(f => ({ ...f, stops: [...f.stops, f.newStop.trim()], newStop: '' }));
  };

  const removeStop = (idx) => {
    setForm(f => ({ ...f, stops: f.stops.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.origin || !form.destination || !form.totalDistance) {
      setError('Completá todos los campos obligatorios (*).');
      return;
    }
    setSubmitting(true);
    setError('');
    const payload = {
      name: form.name,
      origin: form.origin,
      destination: form.destination,
      totalDistance: parseFloat(form.totalDistance),
      estimatedTime: form.estimatedTime,
      stops: form.stops,
      taskDescription: form.taskDescription,
    };

    try {
      const url = editingId ? `/api/route-templates/${editingId}` : '/api/route-templates';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTemplates();
        setShowModal(false);
        showSuccess(editingId ? 'Plantilla actualizada.' : 'Plantilla creada con éxito.');
      } else {
        setError(data.error || 'Error al guardar plantilla.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await fetch(`/api/route-templates/${id}`, { method: 'DELETE' });
      setTemplates(prev => prev.filter(t => t.id !== id));
      showSuccess('Plantilla eliminada.');
    } catch (err) {
      console.error('Error deleting template:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-lg animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background font-bold">Plantillas de Rutas</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Creá rutas frecuentes para que los choferes las reciban pre-completadas. Ahorrás tiempo en cada asignación.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-xs bg-primary hover:bg-primary/90 text-surface font-label-md text-sm font-bold px-md py-2.5 rounded-xl shadow-lg shadow-green-950/20 active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nueva Plantilla
        </button>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="bg-primary/10 border border-primary/30 text-primary rounded-xl p-sm text-sm font-semibold flex items-center gap-xs animate-fadeIn">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[40px] text-primary animate-spin">sync</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-primary">route</span>
          </div>
          <p className="font-body-md text-on-surface-variant">No hay plantillas todavía. Creá la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
          {templates.map(t => (
            <div
              key={t.id}
              className="bg-surface-container rounded-2xl p-md border border-surface-variant/30 flex flex-col gap-sm hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Template Header */}
              <div className="flex items-start justify-between gap-xs">
                <div className="flex items-center gap-sm">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
                  </div>
                  <h3 className="font-label-md text-sm text-on-surface font-bold leading-tight">{t.name}</h3>
                </div>
                <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[16px]">{deletingId === t.id ? 'sync' : 'delete'}</span>
                  </button>
                </div>
              </div>

              {/* Route Info */}
              <div className="flex flex-col gap-xs pl-1 border-l-2 border-primary/20 ml-1">
                <div className="flex items-center gap-xs text-on-surface-variant font-body-sm text-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">trip_origin</span>
                  <span className="truncate">{t.origin}</span>
                </div>
                {t.stops && t.stops.length > 0 && t.stops.map((s, i) => (
                  <div key={i} className="flex items-center gap-xs text-on-surface-variant font-body-sm text-xs">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">radio_button_unchecked</span>
                    <span className="truncate">{s}</span>
                  </div>
                ))}
                <div className="flex items-center gap-xs text-on-surface-variant font-body-sm text-xs">
                  <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  <span className="truncate">{t.destination}</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-sm mt-xs">
                <span className="flex items-center gap-xs bg-surface-container-high rounded-lg px-sm py-1 text-xs font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-primary">map</span>
                  {t.totalDistance} km
                </span>
                {t.estimatedTime && (
                  <span className="flex items-center gap-xs bg-surface-container-high rounded-lg px-sm py-1 text-xs font-medium text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">schedule</span>
                    {t.estimatedTime}
                  </span>
                )}
              </div>

              {t.taskDescription && (
                <p className="text-xs text-on-surface-variant/70 italic border-t border-surface-variant/20 pt-sm mt-xs truncate">
                  {t.taskDescription}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-high rounded-2xl w-full max-w-lg border border-surface-variant/40 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center p-lg border-b border-surface-variant/20 sticky top-0 bg-surface-container-high z-10">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {editingId ? 'Editar Plantilla' : 'Nueva Plantilla de Ruta'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface focus:outline-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
              {error && (
                <div className="bg-error/15 border border-error/30 text-error rounded-xl p-sm text-xs font-semibold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {/* Name */}
                <div className="md:col-span-2 flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    placeholder="Ej: CABA → Lanús (Ruta A)"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-sm"
                    required
                  />
                </div>

                {/* Origin */}
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Origen *</label>
                  <input
                    type="text"
                    placeholder="Base Operativa CABA"
                    value={form.origin}
                    onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-sm"
                    required
                  />
                </div>

                {/* Destination */}
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Destino *</label>
                  <input
                    type="text"
                    placeholder="Depósito Lanús"
                    value={form.destination}
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-sm"
                    required
                  />
                </div>

                {/* Distance */}
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Distancia Total (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="45"
                    value={form.totalDistance}
                    onChange={e => setForm(f => ({ ...f, totalDistance: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-sm"
                    required
                  />
                </div>

                {/* Estimated time */}
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tiempo Estimado</label>
                  <input
                    type="text"
                    placeholder="1h 10m"
                    value={form.estimatedTime}
                    onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-sm"
                  />
                </div>
              </div>

              {/* Intermediate stops */}
              <div className="flex flex-col gap-xs">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Paradas Intermedias</label>
                <div className="flex gap-xs">
                  <input
                    type="text"
                    placeholder="Ej: Carga Rápida YPF"
                    value={form.newStop}
                    onChange={e => setForm(f => ({ ...f, newStop: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStop(); } }}
                    className="flex-1 bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={addStop}
                    className="bg-surface-container-high border border-surface-variant/60 hover:border-primary/40 rounded-xl px-md py-2.5 text-primary font-bold text-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                {form.stops.length > 0 && (
                  <div className="flex flex-col gap-xs mt-xs">
                    {form.stops.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-surface-container rounded-lg px-sm py-2 text-sm text-on-surface-variant">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px] text-tertiary">radio_button_unchecked</span>
                          {s}
                        </div>
                        <button type="button" onClick={() => removeStop(i)} className="text-error/60 hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task description */}
              <div className="flex flex-col gap-xs">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tarea Principal en Destino</label>
                <textarea
                  placeholder="Ej: Descarga de mercadería y firma de remito digital"
                  value={form.taskDescription}
                  onChange={e => setForm(f => ({ ...f, taskDescription: e.target.value }))}
                  rows={2}
                  className="bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-sm"
                />
              </div>

              <div className="flex gap-sm mt-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-surface-container border border-surface-variant/60 hover:border-surface-variant rounded-xl py-2.5 text-on-surface-variant font-bold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-surface font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-xs shadow-lg shadow-green-950/20 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">{submitting ? 'sync' : 'save'}</span>
                  {submitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
