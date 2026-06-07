import React, { useState } from 'react';

export default function FleetList({ vehicles, setView, setSelectedVehicleId }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Available filters
  const filters = ['Todos', 'En Ruta', 'Cargando', 'Crítico'];

  // Filter vehicles based on search query and status filter
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.id.toLowerCase().includes(search.toLowerCase()) || 
      (v.driver && v.driver.toLowerCase().includes(search.toLowerCase())) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || v.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'En Ruta':
        return 'bg-primary-container text-on-primary-container';
      case 'Cargando':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Crítico':
        return 'bg-error-container text-on-error-container';
      default:
        return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En Ruta':
        return 'route';
      case 'Cargando':
        return 'ev_station';
      case 'Crítico':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getBatteryColor = (battery, status) => {
    if (status === 'Crítico') return 'bg-error';
    if (battery < 20) return 'bg-error';
    if (status === 'Cargando') return 'bg-tertiary';
    return 'bg-primary';
  };

  const getBatteryTextColor = (battery, status) => {
    if (status === 'Crítico') return 'text-error';
    if (battery < 20) return 'text-error';
    if (status === 'Cargando') return 'text-tertiary';
    return 'text-primary';
  };

  return (
    <div className="flex flex-col gap-lg animate-fadeIn pb-12">
      {/* Search Bar */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container border border-surface-variant/40 rounded-full py-3 pl-12 pr-4 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant" 
          placeholder="Buscar camión, conductor o modelo..." 
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-xs overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all whitespace-nowrap focus:outline-none ${
              statusFilter === filter 
                ? 'bg-primary text-on-primary font-bold shadow-md' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Title & Count */}
      <div className="flex justify-between items-end">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Unidades Activas</h2>
        <span className="font-label-md text-label-md text-primary font-semibold">{filteredVehicles.length} de {vehicles.length} Camiones</span>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 gap-md">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map(vehicle => (
            <div 
              key={vehicle.id}
              onClick={() => {
                setSelectedVehicleId(vehicle.id);
                setView('detalle_vehiculo');
              }}
              className={`bg-surface-container rounded-xl p-md flex flex-col gap-sm cursor-pointer hover:scale-[1.01] hover:bg-surface-container-high transition-all duration-300 relative overflow-hidden border ${
                vehicle.status === 'Crítico' ? 'border-error-container shadow-[0_0_16px_rgba(255,180,171,0.05)]' : 'border-transparent hover:border-surface-variant/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className={`font-headline-sm text-headline-sm font-bold tracking-wider ${vehicle.status === 'Crítico' ? 'text-error' : 'text-primary'}`}>
                    {vehicle.id}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{vehicle.model}</span>
                </div>
                <div className={`px-3 py-1 rounded-full flex items-center gap-xs ${getStatusStyle(vehicle.status)}`}>
                  <span className="material-symbols-outlined text-[16px]">{getStatusIcon(vehicle.status)}</span>
                  <span className="font-label-md text-label-md font-semibold">{vehicle.status}</span>
                </div>
              </div>

              {/* Driver info */}
              <div className="flex items-center gap-sm mt-xs">
                {vehicle.driver ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                      {vehicle.driverImage ? (
                        <img src={vehicle.driverImage} alt={vehicle.driver} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                      )}
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">{vehicle.driver}</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center border border-dashed border-outline-variant">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person_off</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant italic">Sin Asignar</span>
                  </>
                )}
              </div>

              {/* Battery status */}
              <div className="mt-sm flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">
                      {vehicle.status === 'Cargando' ? 'battery_charging_50' : vehicle.battery < 20 ? 'battery_alert' : 'battery_full_alt'}
                    </span> 
                    Batería
                  </span>
                  <span className={`font-label-md text-label-md font-bold ${getBatteryTextColor(vehicle.battery, vehicle.status)}`}>
                    {vehicle.battery}%
                  </span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getBatteryColor(vehicle.battery, vehicle.status)}`} 
                    style={{ width: `${vehicle.battery}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-xl text-on-surface-variant font-body-md">
            No se encontraron camiones que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Floating Action Button (Nuevo Reparto) */}
      <button 
        onClick={() => alert('Función "Nuevo Reparto": Creación de una nueva orden de despacho en el sistema de logística.')}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-primary text-on-primary p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-primary-fixed hover:scale-105 transition-all active:scale-95 z-40 group focus:outline-none"
      >
        <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>add_box</span>
        <span className="font-label-md text-label-md pr-1 hidden group-hover:block transition-all max-w-0 group-hover:max-w-[200px] overflow-hidden whitespace-nowrap">
          Nuevo Reparto
        </span>
      </button>
    </div>
  );
}
