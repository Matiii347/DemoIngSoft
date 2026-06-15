import React, { useState } from 'react';

export default function AlertsMaintenance({ settings, setSettings, vehicles }) {
  const [scheduledAlerts, setScheduledAlerts] = useState({});
  const [showConfig, setShowConfig] = useState(false);
  
  // Local config form states
  const [redThreshold, setRedThreshold] = useState(settings.alert_red);
  const [yellowThreshold, setYellowThreshold] = useState(settings.alert_yellow);
  const [greenThreshold, setGreenThreshold] = useState(settings.alert_green);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSchedule = (alertId, label) => {
    setScheduledAlerts(prev => ({
      ...prev,
      [alertId]: label || 'Agendado'
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_red: parseInt(redThreshold, 10),
          alert_yellow: parseInt(yellowThreshold, 10),
          alert_green: parseInt(greenThreshold, 10),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSettings({
          alert_red: parseInt(redThreshold, 10),
          alert_yellow: parseInt(yellowThreshold, 10),
          alert_green: parseInt(greenThreshold, 10),
        });
        setSuccessMsg('Configuración guardada exitosamente.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert(data.error || 'Error al guardar la configuración.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  // Dynamically calculate alerts based on the database settings & VTV dates
  const getDynamicAlerts = () => {
    const computedList = [];
    
    vehicles.forEach(v => {
      if (!v.vtvExpiration) return;
      
      const expDate = new Date(v.vtvExpiration);
      const today = new Date();
      expDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const timeDiff = expDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= settings.alert_red) {
        computedList.push({
          id: `vtv-${v.id}`,
          vehicleId: v.id,
          title: daysDiff < 0 ? 'VTV Vencida' : 'VTV Vencimiento Crítico',
          desc: `Unidad ${v.id}`,
          severity: 'error',
          text: daysDiff < 0 
            ? `La Verificación Técnica Vehicular expiró hace ${Math.abs(daysDiff)} días (${v.vtvExpiration}). El camión no puede circular.` 
            : `La Verificación Técnica Vehicular expira en ${daysDiff} días (${v.vtvExpiration}). Agendar turno urgente.`
        });
      } else if (daysDiff <= settings.alert_yellow) {
        computedList.push({
          id: `vtv-${v.id}`,
          vehicleId: v.id,
          title: 'VTV Próxima a Vencer',
          desc: `Unidad ${v.id}`,
          severity: 'warning',
          text: `La Verificación Técnica Vehicular vencerá en ${daysDiff} días (${v.vtvExpiration}). Programar taller.`
        });
      } else if (daysDiff <= settings.alert_green) {
        computedList.push({
          id: `vtv-${v.id}`,
          vehicleId: v.id,
          title: 'VTV en Término',
          desc: `Unidad ${v.id}`,
          severity: 'info',
          text: `VTV en regla. Próximo vencimiento en ${daysDiff} días (${v.vtvExpiration}).`
        });
      }
    });

    // Fallback static alerts for design reference if database has no expirations
    if (computedList.length === 0) {
      computedList.push(
        { id: 'vtv', title: 'VTV Vencida', desc: 'VM-042', severity: 'error', text: 'La Verificación Técnica Vehicular para vehículos pesados eléctricos expiró hace 2 días. El camión no puede circular sin oblea vigente.' },
        { id: 'motores', title: 'Mantenimiento de Motores', desc: 'VM-018', severity: 'warning', text: 'Revisión programada de eficiencia de motores eléctricos y balanceo de celdas de batería (50,000 km).' },
        { id: 'neumaticos', title: 'Revisión de Neumáticos', desc: 'VM-105', severity: 'info', text: 'Presión baja detectada. El torque de salida eléctrico requiere un desgaste uniforme en neumáticos reforzados.' }
      );
    }

    return computedList;
  };

  const alerts = getDynamicAlerts();

  return (
    <div className="flex flex-col gap-xl py-md animate-fadeIn pb-12">
      {/* Header Section */}
      <section className="flex flex-col gap-sm">
        <div className="flex justify-between items-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">Alertas de Flota</h1>
          
          {/* Settings button */}
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="w-10 h-10 rounded-xl bg-surface-container-high border border-surface-variant/40 hover:bg-surface-bright flex items-center justify-center text-primary transition-colors focus:outline-none"
            title="Configurar umbrales de alerta"
          >
            <span className="material-symbols-outlined">{showConfig ? 'close' : 'settings'}</span>
          </button>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">Atención requerida para mantener la eficiencia operativa.</p>
      </section>

      {/* Editable Settings Threshold Panel */}
      {showConfig && (
        <section className="bg-surface-container rounded-xl p-md border border-surface-variant/40 animate-slideUp">
          <h2 className="font-headline-sm text-sm text-on-surface font-bold mb-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
            Configurar Días de Anticipación (VTV)
          </h2>
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-sm">
            {successMsg && (
              <div className="bg-primary/15 border border-primary/30 text-primary rounded-lg p-sm text-xs font-semibold">
                {successMsg}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] text-error uppercase font-bold tracking-wider">Rojo (Crítico)</label>
                <input 
                  type="number"
                  value={redThreshold}
                  onChange={(e) => setRedThreshold(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-variant/60 rounded-lg py-2 px-3 text-on-surface text-center font-body-md"
                  required
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] text-tertiary uppercase font-bold tracking-wider">Amarillo (Advert.)</label>
                <input 
                  type="number"
                  value={yellowThreshold}
                  onChange={(e) => setYellowThreshold(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-variant/60 rounded-lg py-2 px-3 text-on-surface text-center font-body-md"
                  required
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] text-primary uppercase font-bold tracking-wider">Verde (Prevent.)</label>
                <input 
                  type="number"
                  value={greenThreshold}
                  onChange={(e) => setGreenThreshold(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-variant/60 rounded-lg py-2 px-3 text-on-surface text-center font-body-md"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/95 text-surface font-label-md text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-xs shadow-md disabled:opacity-75"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </form>
        </section>
      )}

      {/* Bento Grid Alertas */}
      <section className="grid grid-cols-1 gap-md">
        {alerts.map((alertItem) => {
          const borderClass = 
            alertItem.severity === 'error' ? 'border-error' :
            alertItem.severity === 'warning' ? 'border-tertiary' : 'border-primary';
            
          const textClass = 
            alertItem.severity === 'error' ? 'text-error' :
            alertItem.severity === 'warning' ? 'text-tertiary' : 'text-primary';
            
          const bgContainerClass = 
            alertItem.severity === 'error' ? 'bg-error-container text-on-error-container' :
            alertItem.severity === 'warning' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-primary-container text-on-primary-container';
            
          const iconName = 
            alertItem.severity === 'error' ? 'car_crash' :
            alertItem.severity === 'warning' ? 'oil_barrel' : 'tire_repair';

          return (
            <div 
              key={alertItem.id}
              className={`bg-surface-container-high rounded-xl p-md border-l-4 ${borderClass} relative overflow-hidden border border-transparent hover:border-surface-variant/30 transition-all group`}
            >
              <div className="absolute top-0 right-0 p-sm opacity-20 group-hover:scale-105 transition-transform duration-300">
                <span className={`material-symbols-outlined ${textClass}`} style={{ fontSize: '64px' }}>
                  {alertItem.severity === 'error' ? 'warning' : alertItem.severity === 'warning' ? 'build' : 'info'}
                </span>
              </div>
              
              <div className="flex items-start justify-between relative z-10 mb-md">
                <div className="flex items-center gap-sm">
                  <div className={`p-sm rounded-lg flex items-center justify-center ${bgContainerClass}`}>
                    <span className="material-symbols-outlined">{iconName}</span>
                  </div>
                  <div>
                    <h3 className={`font-headline-sm text-headline-sm ${textClass} font-bold`}>{alertItem.title}</h3>
                    <p className="font-label-md text-label-md text-on-surface-variant">{alertItem.desc}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-label-md text-xs font-bold ${bgContainerClass}`}>
                  {alertItem.severity === 'error' ? 'CRÍTICO' : alertItem.severity === 'warning' ? 'PRÓXIMO' : 'INFORMACIÓN'}
                </span>
              </div>
              
              <div className="relative z-10">
                <p className="font-body-sm text-body-sm text-on-surface mb-md">
                  {alertItem.text}
                </p>
                {scheduledAlerts[alertItem.id] ? (
                  <div className="w-full bg-primary/20 text-primary py-2 rounded-lg font-label-md text-label-md flex justify-center items-center gap-xs border border-primary/30">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {scheduledAlerts[alertItem.id]}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSchedule(alertItem.id, 'Turno Agendado (14:00hs)')}
                    className={`w-full py-2 rounded-lg font-label-md text-label-md flex justify-center items-center gap-xs focus:outline-none transition-all ${
                      alertItem.severity === 'error' 
                        ? 'bg-error text-on-error hover:opacity-90' 
                        : 'border border-tertiary text-tertiary hover:bg-tertiary hover:text-on-tertiary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    Agendar Turno Urgente
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
