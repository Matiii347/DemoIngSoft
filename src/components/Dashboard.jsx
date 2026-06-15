import React from 'react';

export default function Dashboard({ setView, alerts = [], vehicles = [], setSelectedVehicleId }) {
  // Calculate dynamic KPIs
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status !== 'Crítico').length;
  
  const avgBattery = totalVehicles > 0 
    ? Math.round(vehicles.reduce((acc, v) => acc + v.battery, 0) / totalVehicles)
    : 78;

  const activeAlertsCount = alerts.filter(a => a.id !== 'vtv' && a.id !== 'motores' && a.id !== 'neumaticos').length || alerts.length;

  // Map database alerts to dashboard list format
  const criticalAlerts = alerts.map(alert => ({
    id: alert.id,
    title: alert.title,
    desc: alert.desc,
    when: alert.text,
    urgency: alert.severity === 'error' ? 'high' : 'warning'
  })).slice(0, 3); // Show top 3 alerts

  return (
    <div className="flex flex-col gap-lg animate-fadeIn">
      {/* Welcome Section */}
      <section>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Hola, Operador</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Resumen general de tu ecosistema hoy.</p>
      </section>

      {/* Bento Grid KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-md md:gap-lg">
        {/* Fleet Status (Spans 2 cols on mobile, 1 on desktop) */}
        <div 
          onClick={() => setView('flota')} 
          className="col-span-2 md:col-span-1 bg-surface-container hover:bg-surface-container-high cursor-pointer rounded-xl p-md relative overflow-hidden flex flex-col justify-between min-h-[120px] border border-surface-variant/30 hover:border-primary/50 transition-all duration-300 group"
        >
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[120px]">truck_responsive</span>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">Flota Activa</p>
              <div className="flex items-end gap-sm mt-xs">
                <span className="font-headline-xl text-headline-xl text-primary font-bold">{activeVehicles}</span>
                <span className="font-body-md text-body-md text-on-surface-variant mb-1">/ {totalVehicles || 60}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-sm relative z-10">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 90}%` }}
            ></div>
          </div>
        </div>

        {/* Avg Battery */}
        <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between min-h-[110px] border border-surface-variant/30">
          <div className="flex justify-between items-start">
            <p className="font-label-md text-label-md text-on-surface-variant">Batería Promedio</p>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>battery_charging_full</span>
          </div>
          <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-sm font-bold">{avgBattery}%</p>
        </div>

        {/* Alerts KPI */}
        <div 
          onClick={() => setView('alertas')} 
          className="bg-tertiary-container hover:bg-tertiary-container/90 cursor-pointer rounded-xl p-md flex flex-col justify-between min-h-[110px] border border-tertiary/20 hover:border-tertiary transition-all duration-300 group"
        >
          <div className="flex justify-between items-start">
            <p className="font-label-md text-label-md text-on-tertiary-container">Alertas Activas</p>
            <span className="material-symbols-outlined text-on-tertiary-container group-hover:animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-tertiary-container mt-sm font-bold">
            {activeAlertsCount < 10 ? `0${activeAlertsCount}` : activeAlertsCount}
          </p>
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
        {/* Critical Alerts List */}
        <section className="bg-surface-container-high rounded-xl p-md flex flex-col gap-sm border border-tertiary/10">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Alertas Críticas</h3>
          </div>
          <ul className="flex flex-col gap-sm">
            {criticalAlerts.map(alert => (
              <li key={alert.id} className="bg-surface-container rounded-lg p-sm flex items-center gap-md hover:bg-surface-container-high transition-colors">
                <div className={`w-2 h-2 rounded-full ${alert.urgency === 'high' ? 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.6)]' : 'bg-tertiary shadow-[0_0_8px_rgba(255,185,95,0.6)]'}`}></div>
                <div className="flex-1">
                  <p className="font-label-md text-label-md text-on-surface font-bold">{alert.title}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{alert.desc}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{alert.when}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40">chevron_right</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => setView('alertas')} 
            className="mt-xs font-label-md text-label-md text-primary text-center hover:opacity-80 transition-opacity focus:outline-none"
          >
            Ver todas las alertas
          </button>
        </section>

        {/* CO2 Savings Chart Widget */}
        <section className="bg-surface-container rounded-xl p-md relative overflow-hidden border border-surface-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-md relative z-10">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Ahorro de CO2</h3>
              <div className="px-2 py-1 rounded bg-primary-container/20 text-primary font-label-md text-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +12%
              </div>
            </div>
            
            {/* Simulated Chart Area */}
            <div className="h-24 w-full flex items-end gap-2 relative z-10 mt-md">
              <div className="w-1/6 bg-surface-variant rounded-t-sm h-1/3 transition-all duration-500 hover:bg-primary/40 cursor-pointer" title="Lunes: 30kg"></div>
              <div className="w-1/6 bg-surface-variant rounded-t-sm h-2/4 transition-all duration-500 hover:bg-primary/40 cursor-pointer" title="Martes: 50kg"></div>
              <div className="w-1/6 bg-surface-variant rounded-t-sm h-1/2 transition-all duration-500 hover:bg-primary/40 cursor-pointer" title="Miércoles: 45kg"></div>
              <div className="w-1/6 bg-surface-variant rounded-t-sm h-3/4 transition-all duration-500 hover:bg-primary/40 cursor-pointer" title="Jueves: 70kg"></div>
              <div className="w-1/6 bg-primary/60 rounded-t-sm h-4/5 transition-all duration-500 hover:bg-primary/80 cursor-pointer" title="Viernes: 80kg"></div>
              <div className="w-1/6 bg-primary rounded-t-sm h-full shadow-[0_-4px_16px_rgba(98,223,125,0.2)] transition-all duration-500 hover:scale-105 cursor-pointer" title="Hoy: 100kg"></div>
            </div>
            <div className="flex justify-between mt-sm font-body-sm text-body-sm text-on-surface-variant relative z-10">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mie</span>
              <span>Jue</span>
              <span>Vie</span>
              <span className="text-primary font-bold">Hoy</span>
            </div>
          </div>
          {/* Atmospheric Gradient */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
        </section>
      </div>
    </div>
  );
}
