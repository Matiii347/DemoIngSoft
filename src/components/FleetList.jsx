import React, { useState } from 'react';

// Vehicle model templates for quick fleet registration
const MODEL_TEMPLATES = [
  { label: 'e-Truck Pro 2024', model: 'e-Truck Pro 2024', cargoLimit: 4.5, rangeLeft: 420 },
  { label: 'e-Truck Pro', model: 'e-Truck Pro', cargoLimit: 4.5, rangeLeft: 400 },
  { label: 'e-Truck Delivery', model: 'e-Truck Delivery', cargoLimit: 24.0, rangeLeft: 340 },
  { label: 'e-Truck Heavy Duty', model: 'e-Truck Heavy Duty', cargoLimit: 12.0, rangeLeft: 380 },
  { label: 'e-Cargo Midi', model: 'e-Cargo Midi', cargoLimit: 7.5, rangeLeft: 360 },
];

export default function FleetList({ vehicles, setVehicles, drivers, setView, setSelectedVehicleId }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null); // null when creating
  
  // Form states
  const [vehicleId, setVehicleId] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState('En Ruta');
  const [battery, setBattery] = useState(100);
  const [driverId, setDriverId] = useState('');
  const [cargoLimit, setCargoLimit] = useState(4.5);
  const [currentCargo, setCurrentCargo] = useState(0.0);
  const [rangeLeft, setRangeLeft] = useState(400);
  const [currentLocation, setCurrentLocation] = useState('');
  const [vtvExpiration, setVtvExpiration] = useState('');
  const [kilometers, setKilometers] = useState(0.0);
  const [error, setError] = useState('');

  // Available filters
  const filters = ['Todos', 'En Ruta', 'Cargando', 'Crítico', 'En Mantenimiento'];

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
      case 'En Mantenimiento':
        return 'bg-info text-white';
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
      case 'En Mantenimiento':
        return 'build';
      default:
        return 'info';
    }
  };

  const getBatteryColor = (battery, status) => {
    if (status === 'Crítico') return 'bg-error';
    if (battery < 20) return 'bg-error';
    if (status === 'Cargando') return 'bg-tertiary';
    if (status === 'En Mantenimiento') return 'bg-info';
    return 'bg-primary';
  };

  const getBatteryTextColor = (battery, status) => {
    if (status === 'Crítico') return 'text-error';
    if (battery < 20) return 'text-error';
    if (status === 'Cargando') return 'text-tertiary';
    if (status === 'En Mantenimiento') return 'text-info';
    return 'text-primary';
  };

  // Handle open modal for create
  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setVehicleId('');
    setModel('');
    setStatus('En Ruta');
    setBattery(100);
    setDriverId('');
    setCargoLimit(4.5);
    setCurrentCargo(0.0);
    setRangeLeft(400);
    setCurrentLocation('');
    setVtvExpiration('');
    setKilometers(0.0);
    setError('');
    setShowModal(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleId(vehicle.id);
    setModel(vehicle.model);
    setStatus(vehicle.status);
    setBattery(vehicle.battery);
    setDriverId(vehicle.driverId || '');
    setCargoLimit(vehicle.cargoLimit);
    setCurrentCargo(vehicle.currentCargo);
    setRangeLeft(vehicle.rangeLeft);
    setCurrentLocation(vehicle.currentLocation || '');
    setVtvExpiration(vehicle.vtvExpiration || '');
    setKilometers(vehicle.kilometers || 0.0);
    setError('');
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el vehículo ${id}?`)) {
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setVehicles(vehicles.filter(v => v.id !== id));
        } else {
          alert(data.error || 'Error al eliminar el vehículo.');
        }
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Error de conexión al eliminar el vehículo.');
      }
    }
  };

  // Handle submit (save create/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId.trim() || !model.trim()) {
      setError('Por favor, completa los campos requeridos (ID de Vehículo y Modelo).');
      return;
    }

    const payload = {
      id: vehicleId.trim().toUpperCase(),
      model: model.trim(),
      status,
      battery: parseInt(battery, 10),
      driverId: driverId ? parseInt(driverId, 10) : null,
      cargoLimit: parseFloat(cargoLimit),
      currentCargo: parseFloat(currentCargo),
      rangeLeft: parseInt(rangeLeft, 10),
      currentLocation: currentLocation.trim(),
      vtvExpiration: vtvExpiration || null,
      kilometers: parseFloat(kilometers)
    };

    if (payload.driverId) {
      const alreadyAssigned = vehicles.find(
        v => v.driverId === payload.driverId && v.id !== payload.id
      );
      if (alreadyAssigned) {
        setError(`El chofer seleccionado ya está asignado al vehículo ${alreadyAssigned.id}.`);
        return;
      }
    }

    try {
      if (editingVehicle) {
        // Edit mode
        const response = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
          setVehicles(vehicles.map(v => v.id === editingVehicle.id ? data.vehicle : v));
          setShowModal(false);
        } else {
          setError(data.error || 'Error al actualizar el vehículo.');
        }
      } else {
        // Create mode
        const response = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
          setVehicles([...vehicles, data.vehicle]);
          setShowModal(false);
        } else {
          setError(data.error || 'Error al registrar el vehículo.');
        }
      }
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError('Error de conexión con el servidor.');
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-lg">
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
                  <div className="flex items-center gap-sm">
                    <span className={`font-headline-sm text-headline-sm font-bold tracking-wider ${vehicle.status === 'Crítico' ? 'text-error' : 'text-primary'}`}>
                      {vehicle.id}
                    </span>
                    {/* Action buttons inside card */}
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(vehicle); }}
                        className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-primary transition-colors focus:outline-none"
                        title="Editar vehículo"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
                        className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-error-container/20 flex items-center justify-center text-error transition-colors focus:outline-none"
                        title="Eliminar vehículo"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
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

              {/* Kilómetros */}
              <div className="mt-sm flex justify-between items-center text-xs text-on-surface-variant">
                <span className="flex items-center gap-xs font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">distance</span>
                  Km Recorridos
                </span>
                <span className="font-bold text-on-surface text-label-md">
                  {parseFloat(vehicle.kilometers || 0).toLocaleString('es-AR')} km
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-xl text-on-surface-variant font-body-md">
            No se encontraron camiones que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Floating Action Button (Agregar Camión) */}
      <button 
        onClick={handleOpenCreate}
        className="fixed bottom-24 right-4 bg-primary text-on-primary p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-primary/90 hover:scale-105 transition-all active:scale-95 z-40 focus:outline-none"
        id="btn-add-vehicle"
      >
        <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>add_box</span>
        <span className="font-label-md text-label-md pr-1">
          Agregar Vehículo
        </span>
      </button>

      {/* Modal Overlay / Dialog for ABM Flota */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center max-w-md mx-auto">
          <div className="bg-surface-container-high rounded-t-2xl w-full p-lg border-t border-surface-variant/40 shadow-2xl flex flex-col gap-md max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {editingVehicle ? 'Editar Vehículo' : 'Registrar Vehículo'}
              </h2>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface focus:outline-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {error && (
                <div className="bg-error/15 border border-error/30 text-error rounded-xl p-sm text-xs font-semibold flex items-center gap-xs animate-shake">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              {/* ⚡ Model Template Quick-Fill */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
                  Plantilla de Modelo (carga automática)
                </label>
                <div className="flex flex-wrap gap-xs">
                  {MODEL_TEMPLATES.map(tmpl => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => {
                        setModel(tmpl.model);
                        setCargoLimit(tmpl.cargoLimit);
                        setRangeLeft(tmpl.rangeLeft);
                        setError('');
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all focus:outline-none ${
                        model === tmpl.model
                          ? 'bg-primary text-surface border-primary shadow-md'
                          : 'bg-surface-container border-surface-variant/60 text-on-surface-variant hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
                {model && (
                  <p className="text-xs text-primary font-medium flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Auto-completado: {cargoLimit}t · {rangeLeft}km autonomía
                  </p>
                )}
              </div>

              <div className="h-px bg-surface-variant/40" />

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Identificador de Unidad *</label>
                <input 
                  type="text" 
                  name="id"
                  placeholder="Ej: VM-042"
                  value={vehicleId}
                  onChange={(e) => { setVehicleId(e.target.value); setError(''); }}
                  disabled={!!editingVehicle}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Modelo *</label>
                <input 
                  type="text" 
                  name="model"
                  placeholder="Ej: e-Truck Pro 2024"
                  value={model}
                  onChange={(e) => { setModel(e.target.value); setError(''); }}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Estado</label>
                  <select 
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  >
                    <option value="En Ruta">En Ruta</option>
                    <option value="Cargando">Cargando</option>
                    <option value="Crítico">Crítico</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Batería (%)</label>
                  <input 
                    type="number" 
                    name="battery"
                    min="0"
                    max="100"
                    value={battery}
                    onChange={(e) => setBattery(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Chofer Asignado</label>
                  <select 
                    name="driverId"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  >
                    <option value="">Sin Asignar</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} (@{d.username})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Kilómetros</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="kilometers"
                    value={kilometers}
                    onChange={(e) => setKilometers(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Límite Carga (t)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    name="cargoLimit"
                    value={cargoLimit}
                    onChange={(e) => setCargoLimit(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Autonomía (km)</label>
                  <input 
                    type="number" 
                    name="rangeLeft"
                    value={rangeLeft}
                    onChange={(e) => setRangeLeft(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Ubicación Actual</label>
                <input 
                  type="text" 
                  name="currentLocation"
                  placeholder="Ej: CD Norte, Buenos Aires"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Vencimiento de VTV</label>
                <input 
                  type="date" 
                  name="vtvExpiration"
                  value={vtvExpiration}
                  onChange={(e) => setVtvExpiration(e.target.value)}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-on-surface"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-surface font-label-md text-label-md font-bold py-3 rounded-xl mt-sm flex items-center justify-center gap-xs shadow-lg shadow-green-950/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                Guardar Vehículo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
