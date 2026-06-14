import React, { useState } from 'react';

export default function DriverRoute() {
  const [navigating, setNavigating] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Descarga 5.5t de mercancía general', done: false },
    { id: 2, text: 'Firma de remito digital', done: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const allTasksDone = tasks.every(t => t.done);

  return (
    <div className="flex flex-col gap-lg animate-fadeIn pb-12">
      {/* Header Section */}
      <section className="flex flex-col gap-xs">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background font-bold">Mi Hoja de Ruta</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          24 de Octubre, 2023
        </p>
      </section>

      {/* Summary Card */}
      <section className="bg-surface-container rounded-xl p-md flex justify-between items-center border border-surface-variant/40 shadow-sm">
        <div className="flex flex-col items-center flex-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Distancia</span>
          <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold">142 km</span>
        </div>
        <div className="w-px h-12 bg-surface-variant/50"></div>
        <div className="flex flex-col items-center flex-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Tiempo Est.</span>
          <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold">4h 15m</span>
        </div>
        <div className="w-px h-12 bg-surface-variant/50"></div>
        <div className="flex flex-col items-center flex-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Paradas</span>
          <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface font-bold">3</span>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="flex flex-col gap-md mt-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Secuencia de Viaje</h2>
        <div className="flex flex-col pl-sm relative">
          
          {/* Stop 1: Start (Completed) */}
          <div className="timeline-item relative pl-12 pb-8">
            <div className="timeline-line bg-primary"></div>
            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-primary-container border-4 border-surface flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-on-primary-container filled text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-md border border-primary/20 opacity-80">
              <div className="flex justify-between items-start mb-sm">
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Base Operativa Buenos Aires</h3>
                <span className="font-label-md text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-semibold">Completado</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Salida: 08:00
              </p>
            </div>
          </div>

          {/* Stop 2: Next Stop (Active) */}
          <div className="timeline-item relative pl-12 pb-8">
            <div className="timeline-line bg-outline-variant"></div>
            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-surface border-4 border-primary flex items-center justify-center z-10 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
              <div className={`w-3 h-3 rounded-full bg-primary ${navigating ? 'animate-ping' : 'animate-pulse'}`}></div>
            </div>
            <div className={`bg-surface-container-high rounded-xl p-md border ${allTasksDone ? 'border-primary/50' : 'border-primary'} shadow-lg shadow-black/20 transition-all duration-300`}>
              <div className="flex justify-between items-start mb-sm">
                <h3 className="font-headline-sm text-headline-sm-mobile text-on-surface font-bold">CD Norte</h3>
                <span className={`font-label-md text-xs px-2 py-0.5 rounded font-bold ${allTasksDone ? 'bg-primary/20 text-primary' : 'bg-primary text-surface'}`}>
                  {allTasksDone ? 'Listo' : 'Siguiente'}
                </span>
              </div>
              
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
                  <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">map</span> 45 km</span>
                  <span className="flex items-center gap-xs text-tertiary font-medium">
                    <span className="material-symbols-outlined text-[16px]">schedule</span> 
                    {navigating ? 'Llegando en 15m' : 'ETA: 14:30'}
                  </span>
                </div>
                
                <div className="bg-surface-container-lowest rounded-lg p-sm border border-surface-variant/40 mt-xs">
                  <p className="font-label-md text-label-md text-on-surface mb-2 font-bold">Tareas Requeridas:</p>
                  <ul className="list-none m-0 p-0 flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                    {tasks.map(task => (
                      <li key={task.id} className="flex items-center gap-sm">
                        <input 
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                          className="rounded text-primary focus:ring-primary focus:ring-offset-background bg-surface-variant border-surface-variant w-4 h-4 cursor-pointer"
                        />
                        <span className={`cursor-pointer select-none ${task.done ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`} onClick={() => toggleTask(task.id)}>
                          {task.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Stop 3: Planned */}
          <div className="timeline-item relative pl-12 pb-8">
            <div className="timeline-line bg-outline-variant"></div>
            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-surface-container-highest border-4 border-surface flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>ev_station</span>
            </div>
            <div className="bg-surface-container rounded-xl p-md border border-surface-variant/40">
              <div className="flex justify-between items-start mb-sm">
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Carga Rápida YPF</h3>
                <span className="font-label-md text-xs text-tertiary bg-tertiary/10 px-2 py-0.5 rounded font-semibold">Planificado</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                Carga estimada: 45 min (hasta 80%)
              </p>
            </div>
          </div>

          {/* Destination: Final */}
          <div className="timeline-item relative pl-12">
            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-surface-container-highest border-4 border-surface flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
            <div className="bg-surface-container rounded-xl p-md border border-surface-variant/40">
              <div className="flex justify-between items-start mb-sm">
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Depósito Lanús</h3>
                <span className="font-label-md text-xs text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded font-semibold">Destino</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                Entrega final
              </p>
            </div>
          </div>
          
        </div>
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
    </div>
  );
}
