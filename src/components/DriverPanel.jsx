import React from 'react';

export default function DriverPanel({ vehicleId, vehicles, setView }) {
  // Find vehicle corresponding to the driver (typically VM-018 or VM-042)
  const vehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  // Battery indicator dashoffset calculation (radius = 45, perimeter = 2 * PI * 45 = 282.7)
  const perimeter = 282.7;
  const strokeDashoffset = perimeter - (perimeter * vehicle.battery) / 100;

  const cargoWeight = vehicle.id === 'VM-018' ? 18.5 : vehicle.id === 'VM-099' ? 10.8 : 3.8;
  const cargoMax = vehicle.id === 'VM-018' ? 24.0 : vehicle.id === 'VM-099' ? 12.0 : 4.5;
  const capacityPercent = Math.round((cargoWeight / cargoMax) * 100);

  const rangeLeft = vehicle.id === 'VM-018' ? 340 : vehicle.id === 'VM-099' ? 45 : 410;

  return (
    <div className="flex flex-col gap-lg py-md relative animate-fadeIn pb-12">
      {/* Ambient Background Glow for Battery */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-gradient-radial pointer-events-none z-0"></div>

      {/* 1. Battery & Range Indicator (Hero) */}
      <section className="relative z-10 flex flex-col items-center justify-center py-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Circular Progress Background */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="45" stroke="#1b2b3f" strokeLinecap="round" strokeWidth="8"></circle>
            {/* Dynamic Progress Circle */}
            <circle 
              className="transition-all duration-1000 ease-out" 
              cx="50" 
              cy="50" 
              fill="none" 
              r="45" 
              stroke={vehicle.status === 'Crítico' ? '#ffb4ab' : '#16A34A'} 
              strokeDasharray={perimeter} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
              strokeWidth="8"
            ></circle>
          </svg>
          <div className="flex flex-col items-center justify-center text-center">
            <span className={`material-symbols-outlined text-[32px] mb-xs ${vehicle.status === 'Crítico' ? 'text-error' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {vehicle.status === 'Cargando' ? 'electric_bolt' : 'electric_bolt'}
            </span>
            <span className="font-headline-xl text-headline-xl text-on-background tracking-tight font-bold">
              {vehicle.battery}<span className="text-headline-md text-on-surface-variant font-normal">%</span>
            </span>
          </div>
        </div>
        <div className="mt-lg flex flex-col items-center bg-surface-container-high px-lg py-sm rounded-full border border-surface-variant/40">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Rango Estimado</span>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">{rangeLeft}</span>
            <span className="font-body-md text-body-md text-on-surface-variant">km</span>
          </div>
        </div>
      </section>

      {/* 2. High-Priority Alerts (VTV, Seguro, Licencia) */}
      <section className="flex flex-col gap-sm z-10">
        <h2 className="font-headline-sm text-headline-sm-mobile text-on-surface mb-xs font-bold">Alertas de Documentación</h2>
        
        {/* Warning Card: VTV */}
        <div className="bg-[#1b2b3f] rounded-xl p-md border-l-4 border-[#F59E0B] flex items-start gap-md border border-transparent hover:border-surface-variant/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#3e2400] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline-sm text-headline-sm-mobile text-on-background mb-1 font-bold">VTV Próxima a Vencer</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">La Verificación Técnica Vehicular vence en 5 días (15 Oct).</p>
          </div>
          <button 
            onClick={() => setView('alertas')}
            className="text-primary font-label-md text-label-md px-3 py-1 rounded-full bg-surface-variant hover:bg-surface-bright transition-colors shrink-0 focus:outline-none"
          >
            Ver
          </button>
        </div>

        {/* Warning Card: Licencia */}
        <div className="bg-[#1b2b3f] rounded-xl p-md border-l-4 border-[#ffb4ab] flex items-start gap-md opacity-90 border border-transparent hover:border-surface-variant/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#93000a] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#ffb4ab]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline-sm text-headline-sm-mobile text-on-background mb-1 font-bold">Licencia Nacional</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Renovación requerida inmediatamente.</p>
          </div>
          <button 
            onClick={() => setView('alertas')}
            className="text-[#ffb4ab] font-label-md text-label-md px-3 py-1 rounded-full bg-surface-variant hover:bg-surface-bright transition-colors shrink-0 focus:outline-none"
          >
            Ver
          </button>
        </div>
      </section>

      {/* 3. Current Route Info Card */}
      <section 
        onClick={() => setView('rutas')}
        className="bg-surface-container rounded-xl overflow-hidden z-10 border border-surface-variant/40 cursor-pointer hover:border-primary/50 transition-colors group"
      >
        {/* Map Snippet Placeholder */}
        <div className="h-32 w-full bg-surface-variant relative">
          <img 
            alt="Route Map" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-500" 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
          {/* Destination Tag */}
          <div className="absolute bottom-md left-md right-md flex justify-between items-end">
            <div>
              <span className="font-label-md text-label-md text-primary uppercase tracking-wider mb-1 block">Próximo Destino</span>
              <h3 className="font-headline-md-mobile text-headline-md-mobile text-on-background font-bold">CD Norte</h3>
            </div>
            <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shadow-lg border-2 border-surface-container text-on-primary-container group-hover:scale-115 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
            </div>
          </div>
        </div>
        <div className="p-md flex justify-between items-center bg-surface-container">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1">Distancia Restante</span>
            <span className="font-headline-sm text-headline-sm-mobile text-on-background font-bold">42.5 km</span>
          </div>
          <div className="h-8 w-px bg-surface-variant/50"></div>
          <div className="flex flex-col items-end">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1">ETA</span>
            <span className="font-headline-sm text-headline-sm-mobile text-primary font-bold">14:30 hs</span>
          </div>
        </div>
      </section>

      {/* 4. Cargo Load Status */}
      <section className="bg-surface-container rounded-xl p-md border border-surface-variant/40 z-10">
        <div className="flex justify-between items-center mb-md">
          <h2 className="font-headline-sm text-headline-sm-mobile text-on-surface flex items-center gap-sm font-bold">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 0" }}>weight</span>
            Carga Actual
          </h2>
          <span className="font-label-md text-xs text-primary bg-primary-container/20 px-2 py-0.5 rounded font-semibold">Óptima</span>
        </div>
        <div className="flex items-end justify-between mb-sm">
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-background font-bold">{cargoWeight}</span>
            <span className="font-body-md text-body-md text-on-surface-variant">t</span>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">
            Max: {cargoMax} t
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${capacityPercent}%` }}></div>
        </div>
        <div className="mt-xs text-right font-label-md text-xs text-on-surface-variant font-medium">
          {capacityPercent}% Capacidad
        </div>
      </section>

      {/* 5. Driver Stats: KM y Viajes Realizados */}
      <section className="bg-surface-container rounded-xl p-md border border-surface-variant/40 z-10">
        <div className="flex justify-between items-center mb-md">
          <h2 className="font-headline-sm text-headline-sm-mobile text-on-surface flex items-center gap-sm font-bold">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>distance</span>
            Mi Actividad y Kilometraje
          </h2>
          <span className="font-label-md text-xs text-secondary bg-secondary-container/20 px-2 py-0.5 rounded font-semibold">Mensual</span>
        </div>

        {/* Distance driven badge */}
        <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-sm border border-surface-variant/20 mb-md">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Recorrido</p>
              <h3 className="font-headline-sm text-headline-sm-mobile text-on-background font-bold">14,850 km</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="font-label-md text-xs text-on-surface-variant">Viajes Ejecutados</p>
            <span className="font-headline-sm text-headline-sm-mobile text-primary font-bold">142</span>
          </div>
        </div>

        {/* Completed trips list */}
        <div>
          <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-sm">Últimos Viajes Realizados</h3>
          <ul className="flex flex-col gap-sm">
            <li className="bg-surface-container-low rounded-lg p-sm border border-surface-variant/20 flex justify-between items-center hover:bg-surface-bright transition-colors">
              <div>
                <p className="font-label-md text-xs text-on-surface font-semibold">Base Bs. As. ➜ CD Norte</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant">24 Oct, 2023 · Completado</p>
              </div>
              <span className="font-label-md text-xs text-primary font-bold">+45 km</span>
            </li>
            <li className="bg-surface-container-low rounded-lg p-sm border border-surface-variant/20 flex justify-between items-center hover:bg-surface-bright transition-colors">
              <div>
                <p className="font-label-md text-xs text-on-surface font-semibold">CD Sur ➜ Depósito Lanús</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant">22 Oct, 2023 · Completado</p>
              </div>
              <span className="font-label-md text-xs text-primary font-bold">+68 km</span>
            </li>
            <li className="bg-surface-container-low rounded-lg p-sm border border-surface-variant/20 flex justify-between items-center hover:bg-surface-bright transition-colors">
              <div>
                <p className="font-label-md text-xs text-on-surface font-semibold">CD Norte ➜ Base Bs. As.</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant">20 Oct, 2023 · Completado</p>
              </div>
              <span className="font-label-md text-xs text-primary font-bold">+45 km</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Vehicle Reference Image */}
      <section className="rounded-xl overflow-hidden mt-sm border border-surface-variant/40 z-10 mb-lg">
        <img 
          alt="VerdeMov Truck Reference" 
          className="w-full h-48 object-cover opacity-80" 
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"
        />
      </section>
    </div>
  );
}
