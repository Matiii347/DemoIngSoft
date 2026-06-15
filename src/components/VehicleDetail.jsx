import React from 'react';

export default function VehicleDetail({ vehicleId, vehicles, setView }) {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fadeIn min-h-[50vh]">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-md">sync</span>
        <p className="font-body-md text-on-surface-variant">Cargando detalles del camión...</p>
      </div>
    );
  }

  // Find the selected vehicle, or use VM-042 as default
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

  const getUrgencyColor = (status) => {
    switch (status) {
      case 'En Ruta': return 'text-primary';
      case 'Cargando': return 'text-tertiary';
      case 'Crítico': return 'text-error';
      default: return 'text-on-surface';
    }
  };

  const getUrgencyBg = (status) => {
    switch (status) {
      case 'En Ruta': return 'bg-primary/10 text-primary border-primary/20';
      case 'Cargando': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'Crítico': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-surface-variant text-on-surface-variant border-surface-variant/40';
    }
  };

  // Mock specific data points that differ by truck
  const cargoMax = vehicle.id === 'VM-018' ? '24.0 t' : vehicle.id === 'VM-099' ? '12.0 t' : '4.5 t';
  const rangeLeft = vehicle.id === 'VM-018' ? '340 km' : vehicle.id === 'VM-099' ? '45 km' : '410 km';
  
  // Custom unsplash maps / environments to feel premium
  const mapImage = vehicle.id === 'VM-018' 
    ? "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
    : "https://images.unsplash.com/photo-1577086664693-894d8405334a?auto=format&fit=crop&q=80&w=800";

  const truckHeroImage = vehicle.id === 'VM-018' 
    ? "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800" // delivery truck
    : vehicle.id === 'VM-099'
      ? "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800" // heavy utility
      : "https://images.unsplash.com/photo-1516576882200-1c036f56b0f1?auto=format&fit=crop&q=80&w=800"; // high tech truck

  return (
    <div className="flex flex-col gap-md animate-fadeIn pb-12">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center h-12 relative">
        <button 
          onClick={() => setView('flota')} 
          className="text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center w-10 h-10 rounded-full focus:outline-none"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm-mobile text-on-surface font-bold text-center">Ficha Técnica de Camión</h1>
        <button className="text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center w-10 h-10 rounded-full focus:outline-none">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      {/* Hero Image Section */}
      <div className="relative w-full h-64 bg-surface-container-high rounded-2xl overflow-hidden border border-surface-variant/30">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700" 
          style={{ backgroundImage: `url('${truckHeroImage}')` }}
        ></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"></div>
        {/* Vehicle Basic Info Overlay */}
        <div className="absolute bottom-md left-md right-md flex justify-between items-end">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <span className={`px-2 py-0.5 rounded border text-xs font-semibold uppercase flex items-center gap-1 ${getUrgencyBg(vehicle.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${vehicle.status === 'Crítico' ? 'bg-error animate-pulse' : vehicle.status === 'Cargando' ? 'bg-tertiary animate-pulse' : 'bg-primary'}`}></span> 
                {vehicle.status}
              </span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">{vehicle.id}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{vehicle.model} 2024</p>
          </div>
        </div>
      </div>

      {/* Bento Grid: Stats */}
      <div className="grid grid-cols-2 gap-md">
        {/* Battery Card */}
        <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between relative overflow-hidden border border-surface-container-highest">
          <div className="flex justify-between items-start mb-sm relative z-10">
            <span className={`material-symbols-outlined ${getUrgencyColor(vehicle.status)}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {vehicle.status === 'Cargando' ? 'battery_charging_full' : vehicle.battery < 20 ? 'battery_alert' : 'battery_charging_full'}
            </span>
            <span className={`font-label-md text-label-md ${getUrgencyColor(vehicle.status)}`}>
              {vehicle.status === 'Cargando' ? 'Cargando' : 'Nivel'}
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold">
              {vehicle.battery}<span className="text-headline-md-mobile text-on-surface-variant font-normal">%</span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Autonomía: {rangeLeft}</p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary-container/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Payload limit */}
        <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between border border-surface-container-highest">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>weight</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Límite</span>
          </div>
          <div>
            <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold">
              {cargoMax.split(' ')[0]}<span className="text-headline-md-mobile text-on-surface-variant font-normal">{cargoMax.split(' ')[1]}</span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Carga Útil Máx.</p>
          </div>
        </div>
      </div>

      {/* Driver Info Card */}
      <div className="bg-surface-container rounded-xl overflow-hidden border border-surface-container-highest">
        <div className="p-md flex items-center justify-between border-b border-surface-container-highest">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-surface-container-high border-2 border-primary overflow-hidden flex-shrink-0">
              {vehicle.driver ? (
                <img src={vehicle.driverImage} alt={vehicle.driver} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">person_off</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Conductor Asignado</p>
              <p className="font-headline-sm text-headline-sm-mobile text-on-surface font-bold">
                {vehicle.driver || 'Sin Asignar'}
              </p>
            </div>
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

        {/* Location Info */}
        <div className="p-md flex items-start gap-md">
          <div className="mt-1 w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center flex-shrink-0 text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          </div>
          <div className="flex-1">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Ubicación Actual</p>
            <p className="font-body-md text-body-md text-on-surface leading-snug">
              {vehicle.id === 'VM-018' ? 'Centro de Distribución Norte, Buenos Aires' : 'Av. Insurgentes Sur 1234, Ciudad de México'}
            </p>
            
            {/* Map Snippet */}
            <div className="mt-sm h-28 w-full rounded-lg bg-surface-variant relative overflow-hidden border border-surface-variant/30">
              <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center grayscale contrast-125 brightness-75 transition-all duration-500" 
                style={{ backgroundImage: `url('${mapImage}')` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-background shadow-[0_0_10px_rgba(98,223,125,0.8)] animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-surface-container rounded-xl p-md border border-surface-container-highest">
        <h3 className="font-headline-sm text-headline-sm-mobile text-on-surface mb-sm font-bold">Estado del Sistema</h3>
        <ul className="space-y-sm">
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
              <span className="font-body-md text-body-md text-on-surface">Presión de neumáticos</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">Óptima</span>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
              <span className="font-body-md text-body-md text-on-surface">Motor eléctrico</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">Normal</span>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className={`material-symbols-outlined text-[20px] ${vehicle.status === 'Crítico' ? 'text-error' : 'text-tertiary'}`}>
                {vehicle.status === 'Crítico' ? 'error' : 'warning'}
              </span>
              <span className="font-body-md text-body-md text-on-surface">Mantenimiento prog.</span>
            </div>
            <span className={`font-body-sm text-body-sm font-semibold ${vehicle.status === 'Crítico' ? 'text-error' : 'text-tertiary'}`}>
              {vehicle.status === 'Crítico' ? 'Urgente' : 'En 500 km'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
