import React, { useState, useEffect } from 'react';

const MAINTENANCE_TYPES = [
  'Preventivo', 'Correctivo', 'Revisión de Batería', 'Cambio de Cubiertas',
  'Revisión de Frenos', 'Revisión de Motor', 'Actualización de Software', 'Otro',
];

const SEVERITY_COLORS = {
  error: 'border-error text-error bg-error/10',
  warning: 'border-secondary text-secondary bg-secondary/10',
  info: 'border-primary text-primary bg-primary/10',
};

export default function VehicleDetail({ vehicleId, vehicles, setView }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'rutas' | 'mantenimientos' | 'alertas'
  const [history, setHistory] = useState({ trips: [], maintenances: [], alerts: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  // Maintenance form
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [maintForm, setMaintForm] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'Preventivo',
    cost: '',
    partsUsed: '',
    workshop: '',
    notes: '',
  });
  const [maintSubmitting, setMaintSubmitting] = useState(false);
  const [maintError, setMaintError] = useState('');
  const [maintSuccess, setMaintSuccess] = useState('');

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fadeIn min-h-[50vh]">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-md">sync</span>
        <p className="font-body-md text-on-surface-variant">Cargando detalles del camión...</p>
      </div>
    );
  }

  const vehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fadeIn min-h-[50vh]">
        <span className="material-symbols-outlined text-[48px] text-error mb-md">local_shipping</span>
        <p className="font-body-md text-on-surface-variant">Vehículo no encontrado.</p>
        <button onClick={() => setView('flota')} className="mt-md px-4 py-2 bg-primary text-surface rounded-xl font-bold">
          Volver a la flota
        </button>
      </div>
    );
  }

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}/history`);
      const data = await res.json();
      if (data.success) setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'info' && history.trips.length === 0 && !historyLoading) {
      fetchHistory();
    }
  };

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    setMaintSubmitting(true);
    setMaintError('');
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}/maintenances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintForm),
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => ({ ...prev, maintenances: [data.maintenance, ...prev.maintenances] }));
        setShowMaintForm(false);
        setMaintForm({ maintenanceDate: new Date().toISOString().split('T')[0], maintenanceType: 'Preventivo', cost: '', partsUsed: '', workshop: '', notes: '' });
        setMaintSuccess('Mantenimiento registrado.');
        setTimeout(() => setMaintSuccess(''), 3000);
      } else {
        setMaintError(data.error || 'Error al guardar.');
      }
    } catch (err) {
      setMaintError('Error de conexión.');
    } finally {
      setMaintSubmitting(false);
    }
  };

  const handleDeleteMaint = async (maintId) => {
    try {
      await fetch(`/api/vehicles/${vehicle.id}/maintenances/${maintId}`, { method: 'DELETE' });
      setHistory(prev => ({ ...prev, maintenances: prev.maintenances.filter(m => m.id !== maintId) }));
    } catch (err) {
      console.error('Error deleting maintenance:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'En Ruta': return 'bg-primary/10 text-primary border-primary/20';
      case 'Cargando': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'Crítico': return 'bg-error/10 text-error border-error/20';
      case 'En Mantenimiento': return 'bg-info/10 text-info border-info/20';
      default: return 'bg-surface-variant text-on-surface-variant border-surface-variant/40';
    }
  };

  const statusDot = (status) => {
    switch (status) {
      case 'Crítico': return 'bg-error animate-pulse';
      case 'Cargando': return 'bg-tertiary animate-pulse';
      case 'En Mantenimiento': return 'bg-info animate-pulse';
      default: return 'bg-primary';
    }
  };

  const cargoMax = vehicle.cargoLimit ? `${vehicle.cargoLimit} t` : '4.5 t';
  const rangeDisplay = `${vehicle.rangeLeft || 0} km`;

  const mapImage = vehicle.id === 'VM-018'
    ? "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
    : "https://images.unsplash.com/photo-1577086664693-894d8405334a?auto=format&fit=crop&q=80&w=800";

  const truckHeroImage = vehicle.id === 'VM-018'
    ? "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"
    : vehicle.id === 'VM-099'
      ? "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800"
      : "https://images.unsplash.com/photo-1516576882200-1c036f56b0f1?auto=format&fit=crop&q=80&w=800";

  const TABS = [
    { id: 'info', label: 'Ficha', icon: 'info' },
    { id: 'rutas', label: 'Rutas', icon: 'route' },
    { id: 'mantenimientos', label: 'Mantenimientos', icon: 'build' },
    { id: 'alertas', label: 'Alertas', icon: 'warning' },
  ];

  return (
    <div className="flex flex-col gap-md animate-fadeIn pb-16">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center h-12 relative">
        <button
          onClick={() => setView('flota')}
          className="text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center w-10 h-10 rounded-full focus:outline-none"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm-mobile text-on-surface font-bold text-center">Ficha de Camión</h1>
        <div className="w-10 h-10" />
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-52 bg-surface-container-high rounded-2xl overflow-hidden border border-surface-variant/30">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${truckHeroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-md left-md right-md flex justify-between items-end">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <span className={`px-2 py-0.5 rounded border text-xs font-semibold uppercase flex items-center gap-1 ${getStatusBadge(vehicle.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot(vehicle.status)}`} />
                {vehicle.status}
              </span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">{vehicle.id}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{vehicle.model}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-xs overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-xs px-4 py-2 rounded-full font-label-md text-sm transition-all whitespace-nowrap focus:outline-none shrink-0 ${
              activeTab === tab.id
                ? 'bg-primary text-surface font-bold shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: INFO ─── */}
      {activeTab === 'info' && (
        <>
          {/* Bento Grid Stats */}
          <div className="grid grid-cols-3 gap-sm">
            <div className="bg-surface-container rounded-xl p-sm flex flex-col justify-between border border-surface-container-highest col-span-1">
              <div className="flex justify-between items-start mb-xs">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>battery_charging_full</span>
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Batería</span>
              </div>
              <div>
                <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold">{vehicle.battery}<span className="text-sm text-on-surface-variant font-normal">%</span></h3>
                <p className="text-[10px] text-on-surface-variant">{rangeDisplay} restante</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-sm flex flex-col justify-between border border-surface-container-highest col-span-1">
              <div className="flex justify-between items-start mb-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>weight</span>
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Carga</span>
              </div>
              <div>
                <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold">{vehicle.cargoLimit}<span className="text-sm text-on-surface-variant font-normal"> t</span></h3>
                <p className="text-[10px] text-on-surface-variant">Carga útil máx.</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-sm flex flex-col justify-between border border-surface-container-highest col-span-1">
              <div className="flex justify-between items-start mb-xs">
                <span className="material-symbols-outlined text-info text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>distance</span>
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Km Total</span>
              </div>
              <div>
                <h3 className="text-xl text-on-surface font-bold">{Math.floor(vehicle.kilometers || 0).toLocaleString('es-AR')}<span className="text-xs text-on-surface-variant font-normal"> km</span></h3>
                <p className="text-[10px] text-on-surface-variant">Acumulados</p>
              </div>
            </div>
          </div>

          {/* Driver */}
          <div className="bg-surface-container rounded-xl p-md border border-surface-container-highest flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-surface-container-high border-2 border-primary overflow-hidden flex-shrink-0">
              {vehicle.driver ? (
                <img src={vehicle.driverImage} alt={vehicle.driver} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">person_off</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Conductor Asignado</p>
              <p className="font-headline-sm text-headline-sm-mobile text-on-surface font-bold">{vehicle.driver || 'Sin Asignar'}</p>
            </div>
            {vehicle.driver && (
              <button
                onClick={() => alert(`Llamando a ${vehicle.driver}...`)}
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-bright transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
              </button>
            )}
          </div>

          {/* Location */}
          <div className="bg-surface-container rounded-xl p-md border border-surface-container-highest flex items-start gap-md">
            <div className="mt-1 w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center flex-shrink-0 text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
            <div className="flex-1">
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Ubicación Actual</p>
              <p className="font-body-md text-body-md text-on-surface leading-snug">{vehicle.currentLocation || 'No especificada'}</p>
              <div className="mt-sm h-24 w-full rounded-lg bg-surface-variant relative overflow-hidden border border-surface-variant/30">
                <div className="absolute inset-0 opacity-40 bg-cover bg-center grayscale contrast-125 brightness-75" style={{ backgroundImage: `url('${mapImage}')` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full border-2 border-background shadow-[0_0_10px_rgba(98,223,125,0.8)] animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-surface-container rounded-xl p-md border border-surface-container-highest">
            <h3 className="font-headline-sm text-headline-sm-mobile text-on-surface mb-sm font-bold">Estado del Sistema</h3>
            <ul className="space-y-sm">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-sm"><span className="material-symbols-outlined text-primary text-[20px]">check_circle</span><span className="font-body-md text-body-md text-on-surface">Presión de neumáticos</span></div>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">Óptima</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-sm"><span className="material-symbols-outlined text-primary text-[20px]">check_circle</span><span className="font-body-md text-body-md text-on-surface">Motor eléctrico</span></div>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">Normal</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className={`material-symbols-outlined text-[20px] ${vehicle.status === 'Crítico' ? 'text-error' : 'text-secondary'}`}>{vehicle.status === 'Crítico' ? 'error' : 'warning'}</span>
                  <span className="font-body-md text-body-md text-on-surface">Mantenimiento prog.</span>
                </div>
                <span className={`font-body-sm text-body-sm font-semibold ${vehicle.status === 'Crítico' ? 'text-error' : 'text-secondary'}`}>{vehicle.status === 'Crítico' ? 'Urgente' : 'En 500 km'}</span>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* ─── TAB: RUTAS ─── */}
      {activeTab === 'rutas' && (
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-on-surface font-bold">Historial de Rutas</h2>
            {!historyLoading && <span className="text-xs text-on-surface-variant">{history.trips.length} registros</span>}
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">sync</span></div>
          ) : history.trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-sm text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">route</span>
              <p className="text-sm text-on-surface-variant">Sin rutas registradas para este vehículo.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {history.trips.map(trip => (
                <div key={trip.id} className="bg-surface-container rounded-xl p-md border border-surface-variant/30 flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-xs">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${trip.status === 'Completado' ? 'bg-primary/10 text-primary' : trip.status === 'En Progreso' ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {trip.status}
                      </span>
                      <span className="text-xs text-on-surface-variant">{trip.tripDate}</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">{trip.totalDistance.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center gap-xs text-sm text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                    {trip.driverName || 'Sin chofer'}
                  </div>
                  {trip.expensesAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-variant/20 pt-xs mt-xs">
                      <span>{trip.expensesDetail || 'Gastos rendidos'}</span>
                      <span className="font-bold text-secondary">${trip.expensesAmount.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: MANTENIMIENTOS ─── */}
      {activeTab === 'mantenimientos' && (
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-on-surface font-bold">Mantenimientos</h2>
            <button
              onClick={() => setShowMaintForm(v => !v)}
              className="flex items-center gap-xs bg-primary hover:bg-primary/90 text-surface text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">{showMaintForm ? 'close' : 'add'}</span>
              {showMaintForm ? 'Cancelar' : 'Registrar'}
            </button>
          </div>

          {maintSuccess && (
            <div className="bg-primary/10 border border-primary/30 text-primary rounded-xl p-sm text-xs font-semibold flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {maintSuccess}
            </div>
          )}

          {/* New Maintenance Form */}
          {showMaintForm && (
            <form onSubmit={handleMaintSubmit} className="bg-surface-container-high rounded-xl p-md border border-primary/20 flex flex-col gap-md animate-fadeIn">
              <h3 className="font-label-md text-sm font-bold text-on-surface">Registrar nuevo mantenimiento</h3>

              {maintError && (
                <div className="bg-error/15 border border-error/30 text-error rounded-xl p-sm text-xs font-semibold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {maintError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Fecha *</label>
                  <input type="date" value={maintForm.maintenanceDate}
                    onChange={e => setMaintForm(f => ({ ...f, maintenanceDate: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary/80 transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tipo *</label>
                  <select value={maintForm.maintenanceType}
                    onChange={e => setMaintForm(f => ({ ...f, maintenanceType: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary/80 transition-colors"
                  >
                    {MAINTENANCE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Costo ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={maintForm.cost}
                    onChange={e => setMaintForm(f => ({ ...f, cost: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary/80 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Taller</label>
                  <input type="text" placeholder="Taller VerdeMov" value={maintForm.workshop}
                    onChange={e => setMaintForm(f => ({ ...f, workshop: e.target.value }))}
                    className="bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary/80 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Repuestos Utilizados</label>
                <input type="text" placeholder="Ej: Filtro de frenos, Líquido refrigerante" value={maintForm.partsUsed}
                  onChange={e => setMaintForm(f => ({ ...f, partsUsed: e.target.value }))}
                  className="bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary/80 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Notas</label>
                <textarea rows={2} placeholder="Observaciones adicionales..." value={maintForm.notes}
                  onChange={e => setMaintForm(f => ({ ...f, notes: e.target.value }))}
                  className="bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary/80 transition-colors"
                />
              </div>

              <button type="submit" disabled={maintSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-surface text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-xs shadow-lg shadow-green-950/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">{maintSubmitting ? 'sync' : 'save'}</span>
                {maintSubmitting ? 'Guardando...' : 'Guardar Mantenimiento'}
              </button>
            </form>
          )}

          {/* Maintenances List */}
          {historyLoading ? (
            <div className="flex items-center justify-center py-12"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">sync</span></div>
          ) : history.maintenances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-sm text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">build</span>
              <p className="text-sm text-on-surface-variant">Sin mantenimientos registrados.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {history.maintenances.map(m => (
                <div key={m.id} className="bg-surface-container rounded-xl p-md border border-surface-variant/30 flex flex-col gap-xs group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-info">build</span>
                      <span className="text-sm font-bold text-on-surface">{m.maintenanceType}</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="text-xs text-on-surface-variant">{m.maintenanceDate}</span>
                      <button onClick={() => handleDeleteMaint(m.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-error/60 hover:text-error"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-xs text-xs">
                    {m.cost > 0 && (
                      <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded font-bold">${m.cost.toLocaleString('es-AR')}</span>
                    )}
                    {m.workshop && (
                      <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded">{m.workshop}</span>
                    )}
                  </div>
                  {m.partsUsed && <p className="text-xs text-on-surface-variant">{m.partsUsed}</p>}
                  {m.notes && <p className="text-xs text-on-surface-variant italic">{m.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: ALERTAS ─── */}
      {activeTab === 'alertas' && (
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-on-surface font-bold">Historial de Alertas</h2>
            {!historyLoading && <span className="text-xs text-on-surface-variant">{history.alerts.length} alertas</span>}
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">sync</span></div>
          ) : history.alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-sm text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">notifications_off</span>
              <p className="text-sm text-on-surface-variant">Sin alertas para este vehículo.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {history.alerts.map(alert => (
                <div key={alert.id} className={`rounded-xl p-md border-l-4 ${SEVERITY_COLORS[alert.severity] || 'border-surface-variant text-on-surface-variant bg-surface-container'} bg-surface-container`}>
                  <div className="flex items-center gap-xs mb-xs">
                    <span className="material-symbols-outlined text-[16px]">
                      {alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                    </span>
                    <span className="text-sm font-bold">{alert.title}</span>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">{alert.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
