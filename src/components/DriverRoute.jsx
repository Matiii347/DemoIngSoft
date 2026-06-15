import React, { useState, useEffect } from 'react';

export default function DriverRoute({ currentUser }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [showRendicionModal, setShowRendicionModal] = useState(false);
  
  // Rendición form states
  const [finalKm, setFinalKm] = useState('');
  const [expensesAmount, setExpensesAmount] = useState('');
  const [expensesDetail, setExpensesDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchActiveTrip = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/trips/active?driverId=${currentUser.id}`);
      const data = await res.json();
      if (data.success && data.activeTrip) {
        setActiveTrip(data.activeTrip);
        setFinalKm(data.activeTrip.totalDistance || '');
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.error('Error fetching active trip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTrip();
  }, [currentUser]);

  const toggleTask = async (task) => {
    try {
      // Optimistic update
      const updatedStops = activeTrip.stops.map(stop => {
        const hasTask = stop.tasks.some(t => t.id === task.id);
        if (hasTask) {
          return {
            ...stop,
            tasks: stop.tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
          };
        }
        return stop;
      });
      setActiveTrip({ ...activeTrip, stops: updatedStops });

      await fetch(`/api/tasks/${task.id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !task.done })
      });
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleCompleteTripSubmit = async (e) => {
    e.preventDefault();
    if (!finalKm || parseFloat(finalKm) <= 0) {
      setError('Por favor, ingresa los kilómetros recorridos.');
      return;
    }
    if (!expensesAmount || parseFloat(expensesAmount) < 0) {
      setError('Por favor, ingresa un monto de gastos válido.');
      return;
    }
    if (!expensesDetail.trim()) {
      setError('Por favor, detalla los gastos realizados.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/trips/${activeTrip.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expensesAmount: parseFloat(expensesAmount),
          expensesDetail: expensesDetail.trim(),
          finalKm: parseFloat(finalKm)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowRendicionModal(false);
        setActiveTrip(null); // Clear active trip since it is completed
      } else {
        setError(data.error || 'Error al completar el viaje.');
      }
    } catch (err) {
      console.error('Error completing trip:', err);
      setError('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fadeIn min-h-[50vh]">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-md">sync</span>
        <p className="font-body-md text-on-surface-variant">Cargando hoja de ruta...</p>
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fadeIn min-h-[60vh] text-center px-lg gap-md">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-sm shadow-inner border border-primary/20">
          <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background font-bold">¡Todo al día!</h1>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-xs">
          No tienes ninguna Hoja de Ruta activa asignada en este momento. Consulta con el Gerente de Flota para nuevas asignaciones.
        </p>
      </div>
    );
  }

  // Find active stop (e.g. status === 'Siguiente' or first 'Planificado')
  const activeStop = activeTrip.stops.find(s => s.status === 'Siguiente') || activeTrip.stops.find(s => s.status === 'Planificado');
  const activeTasks = activeStop?.tasks || [];
  const allTasksDone = activeTasks.length > 0 ? activeTasks.every(t => t.done) : true;

  return (
    <div className="flex flex-col gap-lg animate-fadeIn pb-12">
      {/* Header Section */}
      <section className="flex flex-col gap-xs">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background font-bold">Mi Hoja de Ruta</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          Unidad: <strong>{activeTrip.vehicleId}</strong> · {activeTrip.tripDate}
        </p>
      </section>

      {/* Summary Card */}
      <section className="bg-surface-container rounded-xl p-md flex justify-between items-center border border-surface-variant/40 shadow-sm">
        <div className="flex flex-col items-center flex-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Distancia</span>
          <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold">{activeTrip.totalDistance} km</span>
        </div>
        <div className="w-px h-12 bg-surface-variant/50"></div>
        <div className="flex flex-col items-center flex-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Tiempo Est.</span>
          <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold">{activeTrip.estimatedTime || 'N/A'}</span>
        </div>
        <div className="w-px h-12 bg-surface-variant/50"></div>
        <div className="flex flex-col items-center flex-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Paradas</span>
          <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold">{activeTrip.totalStops}</span>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="flex flex-col gap-md mt-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Secuencia de Viaje</h2>
        <div className="flex flex-col pl-sm relative">
          
          {activeTrip.stops.map((stop, index) => {
            const isCompleted = stop.status === 'Completado';
            const isActive = stop.status === 'Siguiente';
            const isLast = index === activeTrip.stops.length - 1;
            
            return (
              <div key={stop.id} className={`timeline-item relative pl-12 ${isLast ? '' : 'pb-8'}`}>
                {!isLast && (
                  <div className={`timeline-line ${isCompleted ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                )}
                
                {/* Circle Icon */}
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-surface flex items-center justify-center z-10 ${
                  isCompleted 
                    ? 'bg-primary-container text-on-primary-container' 
                    : isActive 
                      ? 'bg-surface border-primary shadow-[0_0_15px_rgba(22,163,74,0.3)]' 
                      : 'bg-surface-container-highest border-surface'
                }`}>
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[20px] text-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ) : stop.stopType === 'Carga' ? (
                    <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>ev_station</span>
                  ) : stop.stopType === 'Destino' ? (
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  ) : (
                    <div className={`w-3 h-3 rounded-full bg-primary ${navigating && isActive ? 'animate-ping' : ''}`}></div>
                  )}
                </div>

                {/* Stop Card */}
                <div className={`rounded-xl p-md border transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-surface-container-low border-primary/20 opacity-85' 
                    : isActive 
                      ? `bg-surface-container-high border-primary shadow-lg shadow-black/20` 
                      : 'bg-surface-container border-surface-variant/40'
                }`}>
                  <div className="flex justify-between items-start mb-sm">
                    <h3 className="font-label-md text-label-md text-on-surface font-bold">{stop.name}</h3>
                    <span className={`font-label-md text-xs px-2 py-0.5 rounded font-bold ${
                      isCompleted 
                        ? 'bg-primary/10 text-primary' 
                        : isActive 
                          ? allTasksDone ? 'bg-primary/20 text-primary' : 'bg-primary text-surface'
                          : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {isCompleted ? 'Completado' : isActive ? (allTasksDone ? 'Listo' : 'Siguiente') : 'Planificado'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-sm">
                    <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
                      {stop.distanceToNext > 0 && (
                        <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">map</span> {stop.distanceToNext} km</span>
                      )}
                      {stop.details && (
                        <span className="flex items-center gap-xs text-tertiary font-medium">
                          <span className="material-symbols-outlined text-[16px]">schedule</span> 
                          {stop.details}
                        </span>
                      )}
                    </div>

                    {/* Tasks inside active stop */}
                    {isActive && stop.tasks && stop.tasks.length > 0 && (
                      <div className="bg-surface-container-lowest rounded-lg p-sm border border-surface-variant/40 mt-xs">
                        <p className="font-label-md text-label-md text-on-surface mb-2 font-bold">Tareas Requeridas:</p>
                        <ul className="list-none m-0 p-0 flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                          {stop.tasks.map(task => (
                            <li key={task.id} className="flex items-center gap-sm">
                              <input 
                                type="checkbox"
                                checked={task.done}
                                onChange={() => toggleTask(task)}
                                className="rounded text-primary focus:ring-primary focus:ring-offset-background bg-surface-variant border-surface-variant w-4 h-4 cursor-pointer"
                              />
                              <span 
                                className={`cursor-pointer select-none ${task.done ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`} 
                                onClick={() => toggleTask(task)}
                              >
                                {task.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
        </div>
      </section>

      {/* Complete Route & Rendición Section */}
      <section className="mt-md flex flex-col gap-sm">
        <button 
          onClick={() => setShowRendicionModal(true)}
          className="w-full bg-secondary hover:bg-secondary/95 text-surface font-label-md text-label-md font-bold py-3.5 rounded-xl flex items-center justify-center gap-xs shadow-lg shadow-amber-950/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          Rendir y Finalizar Hoja de Ruta
        </button>
      </section>

      {/* Floating Navigation Action */}
      <div className="fixed bottom-24 right-4 z-40">
        <button 
          onClick={() => setNavigating(!navigating)}
          className={`${
            navigating 
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/30' 
              : 'bg-primary hover:bg-primary/90 shadow-green-950/30'
          } text-white font-label-md text-label-md rounded-full px-6 py-4 flex items-center gap-sm shadow-lg hover:scale-105 transition-all active:scale-95 focus:outline-none`}
        >
          <span className="material-symbols-outlined animate-pulse">navigation</span>
          {navigating ? 'Detener Navegación' : 'Iniciar Navegación'}
        </button>
      </div>

      {/* Rendición Modal */}
      {showRendicionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center max-w-md mx-auto">
          <div className="bg-surface-container-high rounded-t-2xl w-full p-lg border-t border-surface-variant/40 shadow-2xl flex flex-col gap-md max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Rendir Hoja de Ruta (HDR)
              </h2>
              <button 
                type="button"
                onClick={() => setShowRendicionModal(false)}
                className="text-on-surface-variant hover:text-on-surface focus:outline-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCompleteTripSubmit} className="flex flex-col gap-md">
              {error && (
                <div className="bg-error/15 border border-error/30 text-error rounded-xl p-sm text-xs font-semibold flex items-center gap-xs animate-shake">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Kilómetros Totales Recorridos *</label>
                <input 
                  type="number" 
                  name="finalKm"
                  placeholder="Ej: 142"
                  value={finalKm}
                  onChange={(e) => { setFinalKm(e.target.value); setError(''); }}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Monto de Gastos a Rendir ($) *</label>
                <input 
                  type="number" 
                  name="expensesAmount"
                  placeholder="Ej: 8500"
                  value={expensesAmount}
                  onChange={(e) => { setExpensesAmount(e.target.value); setError(''); }}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Detalle de los Gastos *</label>
                <textarea 
                  name="expensesDetail"
                  placeholder="Ej: Peajes de autopista y carga rápida de batería."
                  value={expensesDetail}
                  onChange={(e) => { setExpensesDetail(e.target.value); setError(''); }}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md min-h-[80px]"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/95 text-surface font-label-md text-label-md font-bold py-3 rounded-xl mt-sm flex items-center justify-center gap-xs shadow-lg shadow-green-950/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
                {submitting ? 'Enviando...' : 'Finalizar y Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
