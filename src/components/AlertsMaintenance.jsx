import React, { useState } from 'react';

export default function AlertsMaintenance() {
  const [scheduledAlerts, setScheduledAlerts] = useState({});

  const handleSchedule = (alertId, label) => {
    setScheduledAlerts(prev => ({
      ...prev,
      [alertId]: label || 'Agendado'
    }));
  };

  return (
    <div className="flex flex-col gap-xl py-md animate-fadeIn pb-12">
      {/* Header Section */}
      <section className="flex flex-col gap-sm">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">Alertas de Flota</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">Atención requerida para mantener la eficiencia operativa.</p>
      </section>

      {/* Bento Grid Alertas */}
      <section className="grid grid-cols-1 gap-md">
        
        {/* Alerta Roja: VTV */}
        <div className="bg-surface-container-high rounded-xl p-md border-l-4 border-error relative overflow-hidden border border-transparent hover:border-error/20 transition-all group">
          <div className="absolute top-0 right-0 p-sm opacity-20 group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-error" style={{ fontSize: '64px' }}>warning</span>
          </div>
          <div className="flex items-start justify-between relative z-10 mb-md">
            <div className="flex items-center gap-sm">
              <div className="bg-error-container text-on-error-container p-sm rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">car_crash</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-error font-bold">VTV Vencida</h3>
                <p className="font-label-md text-label-md text-on-surface-variant">Unidad VM-042</p>
              </div>
            </div>
            <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-label-md text-xs font-bold">CRÍTICO</span>
          </div>
          
          <div className="relative z-10">
            <p className="font-body-sm text-body-sm text-on-surface mb-md">
              La Verificación Técnica Vehicular para vehículos pesados eléctricos expiró hace 2 días. El camión no puede circular sin oblea vigente.
            </p>
            {scheduledAlerts['vtv'] ? (
              <div className="w-full bg-primary/20 text-primary py-2 rounded-lg font-label-md text-label-md flex justify-center items-center gap-xs border border-primary/30">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {scheduledAlerts['vtv']}
              </div>
            ) : (
              <button 
                onClick={() => handleSchedule('vtv', 'Turno Agendado (14:00hs)')}
                className="w-full bg-error text-on-error py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex justify-center items-center gap-xs focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                Agendar Turno Urgente
              </button>
            )}
          </div>
        </div>

        {/* Alerta Ámbar: Mantenimiento (km) */}
        <div className="bg-surface-container-high rounded-xl p-md border-l-4 border-tertiary relative overflow-hidden border border-transparent hover:border-tertiary/20 transition-all group">
          <div className="absolute top-0 right-0 p-sm opacity-20 group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '64px' }}>build</span>
          </div>
          <div className="flex items-start justify-between relative z-10 mb-md">
            <div className="flex items-center gap-sm">
              <div className="bg-tertiary-container text-on-tertiary-container p-sm rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">oil_barrel</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-tertiary font-bold">Mantenimiento de Motores</h3>
                <p className="font-label-md text-label-md text-on-surface-variant">Unidad VM-018</p>
              </div>
            </div>
            <span className="bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full font-label-md text-xs font-bold">PRÓXIMO</span>
          </div>
          
          <div className="relative z-10">
            <p className="font-body-sm text-body-sm text-on-surface mb-md">
              Revisión programada de eficiencia de motores eléctricos y balanceo de celdas de batería (50,000 km).
            </p>
            {scheduledAlerts['motores'] ? (
              <div className="w-full bg-primary/20 text-primary py-2 rounded-lg font-label-md text-label-md flex justify-center items-center gap-xs border border-primary/30">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {scheduledAlerts['motores']}
              </div>
            ) : (
              <button 
                onClick={() => handleSchedule('motores', 'Taller Programado (15 Oct)')}
                className="w-full border border-tertiary text-tertiary py-2 rounded-lg font-label-md text-label-md hover:bg-tertiary hover:text-on-tertiary transition-colors flex justify-center items-center gap-xs focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">schedule</span>
                Programar Taller
              </button>
            )}
          </div>
        </div>

        {/* Aviso Info: Revisión Técnica */}
        <div className="bg-surface-container-high rounded-xl p-md border-l-4 border-secondary relative overflow-hidden border border-transparent hover:border-secondary/20 transition-all">
          <div className="flex items-start justify-between relative z-10 mb-md">
            <div className="flex items-center gap-sm">
              <div className="bg-secondary-container text-on-secondary-container p-sm rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">tire_repair</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-secondary font-bold">Revisión de Neumáticos</h3>
                <p className="font-label-md text-label-md text-on-surface-variant">Unidad VM-105</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex justify-between items-center">
            <p className="font-body-sm text-body-sm text-on-surface flex-1 mr-4">
              Presión baja detectada. El torque de salida eléctrico requiere un desgaste uniforme en neumáticos reforzados.
            </p>
            <button 
              onClick={() => alert('Detalles de neumáticos: Sensor trasero izquierdo reporta 28 PSI (recomendado: 34 PSI).')}
              className="text-primary font-label-md text-label-md hover:opacity-80 transition-opacity focus:outline-none whitespace-nowrap"
            >
              Ver Detalles
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}
