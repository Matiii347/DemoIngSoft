import React, { useState } from 'react';

export default function DriversManagement({ drivers, setDrivers, vehicles = [], reloadData }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null); // null when creating
  
  // Expenses and Activity modal states
  const [viewingExpensesDriver, setViewingExpensesDriver] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Route Assignment modal states
  const [viewingAssignRouteDriver, setViewingAssignRouteDriver] = useState(null);
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [assignTripDate, setAssignTripDate] = useState(new Date().toISOString().substring(0, 10));
  const [assignTotalDistance, setAssignTotalDistance] = useState('142');
  const [assignEstimatedTime, setAssignEstimatedTime] = useState('4h 15m');
  const [assignOrigin, setAssignOrigin] = useState('Base Operativa Buenos Aires');
  const [assignDestination, setAssignDestination] = useState('CD Norte');
  const [assignTaskDescription, setAssignTaskDescription] = useState('Descarga 5.5t de mercancía general y firma de remito digital');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');

  const handleOpenExpenses = async (driver) => {
    setViewingExpensesDriver(driver);
    setLoadingTrips(true);
    setTrips([]);
    try {
      const res = await fetch(`/api/trips?driverId=${driver.id}`);
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips);
      }
    } catch (err) {
      console.error('Error fetching driver trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleOpenAssignRoute = (driver) => {
    setViewingAssignRouteDriver(driver);
    const assigned = vehicles.find(v => v.driverId === driver.id);
    setAssignVehicleId(assigned ? assigned.id : (vehicles[0]?.id || ''));
    setAssignTripDate(new Date().toISOString().substring(0, 10));
    setAssignTotalDistance('142');
    setAssignEstimatedTime('4h 15m');
    setAssignOrigin('Base Operativa Buenos Aires');
    setAssignDestination('CD Norte');
    setAssignTaskDescription('Descarga 5.5t de mercancía general y firma de remito digital');
    setAssignError('');
  };

  const handleAssignRouteSubmit = async (e) => {
    e.preventDefault();
    if (!assignVehicleId) {
      setAssignError('Por favor selecciona un vehículo.');
      return;
    }
    if (!assignTotalDistance || parseFloat(assignTotalDistance) <= 0) {
      setAssignError('Por favor ingresa una distancia válida.');
      return;
    }
    if (!assignOrigin.trim() || !assignDestination.trim()) {
      setAssignError('Por favor ingresa origen y destino.');
      return;
    }

    setAssignSubmitting(true);
    setAssignError('');

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: viewingAssignRouteDriver.id,
          vehicleId: assignVehicleId,
          tripDate: assignTripDate,
          totalDistance: parseFloat(assignTotalDistance),
          estimatedTime: assignEstimatedTime.trim(),
          origin: assignOrigin.trim(),
          destination: assignDestination.trim(),
          taskDescription: assignTaskDescription.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setViewingAssignRouteDriver(null);
        if (reloadData) reloadData();
        alert('¡Hoja de Ruta asignada y enviada al chofer con éxito!');
      } else {
        setAssignError(data.error || 'Error al asignar la hoja de ruta.');
      }
    } catch (err) {
      console.error('Error assigning route:', err);
      setAssignError('Error de conexión con el servidor.');
    } finally {
      setAssignSubmitting(false);
    }
  };
  
  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [licenseStatus, setLicenseStatus] = useState('Vigente');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');

  // Handle open modal for create
  const handleOpenCreate = () => {
    setEditingDriver(null);
    setName('');
    setUsername('');
    setPassword('');
    setLicenseStatus('Vigente');
    setAvatar('');
    setError('');
    setShowModal(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setUsername(driver.username);
    setPassword(driver.password || '');
    setLicenseStatus(driver.licenseStatus || 'Vigente');
    setAvatar(driver.avatar || '');
    setError('');
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este chofer?')) {
      try {
        const response = await fetch(`/api/drivers/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setDrivers(drivers.filter(d => d.id !== id));
        } else {
          alert(data.error || 'Error al eliminar el chofer.');
        }
      } catch (err) {
        console.error('Error deleting driver:', err);
        alert('Error de conexión al eliminar el chofer.');
      }
    }
  };

  // Handle submit (save create/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('Por favor, completa los campos requeridos (Nombre, Usuario y Contraseña).');
      return;
    }

    // Check if username is already taken (excluding current editing driver)
    const usernameExists = drivers.some(
      d => d.username.toLowerCase() === username.trim().toLowerCase() && (!editingDriver || d.id !== editingDriver.id)
    );
    if (usernameExists) {
      setError('El nombre de usuario ya está en uso.');
      return;
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
    const payload = {
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      licenseStatus,
      avatar: avatar.trim() || defaultAvatar
    };

    try {
      if (editingDriver) {
        // Edit mode
        const response = await fetch(`/api/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
          setDrivers(drivers.map(d => d.id === editingDriver.id ? data.driver : d));
          setShowModal(false);
        } else {
          setError(data.error || 'Error al actualizar el chofer.');
        }
      } else {
        // Create mode
        const response = await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
          setDrivers([...drivers, data.driver]);
          setShowModal(false);
        } else {
          setError(data.error || 'Error al registrar el chofer.');
        }
      }
    } catch (err) {
      console.error('Error saving driver:', err);
      setError('Error de conexión con el servidor.');
    }
  };

  // Filter drivers by search term
  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.username.toLowerCase().includes(search.toLowerCase())
  );

  const getLicenseBadgeStyle = (status) => {
    switch (status) {
      case 'Vigente':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Renovación Requerida':
        return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'Vencida':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-surface-variant text-on-surface-variant border-surface-variant/40';
    }
  };

  return (
    <div className="flex flex-col gap-lg py-md animate-fadeIn pb-12">
      {/* Header section */}
      <section className="flex flex-col gap-sm">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">Gestión de Choferes</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">Administra el personal de conducción de la flota eléctrica.</p>
      </section>

      {/* Search and Add Action Bar */}
      <section className="flex items-center gap-md">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input 
            type="text" 
            placeholder="Buscar chofer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-surface-variant/40 rounded-xl py-2.5 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors placeholder:text-on-surface-variant/40 font-body-md"
            id="driver-search-input"
          />
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-surface font-label-md text-label-md font-bold px-4 py-3 rounded-xl flex items-center gap-xs shadow-lg shadow-green-950/20 active:scale-95 transition-all"
          id="btn-add-driver"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Agregar
        </button>
      </section>

      {/* Grid List of Drivers */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-lg">
        {filteredDrivers.length === 0 ? (
          <div className="text-center py-10 bg-surface-container rounded-2xl border border-surface-variant/20">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-sm">person_off</span>
            <p className="text-on-surface-variant font-body-md">No se encontraron choferes.</p>
          </div>
        ) : (
          filteredDrivers.map(driver => (
            <div 
              key={driver.id}
              className="relative bg-surface-container rounded-2xl p-md border border-surface-variant/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/25 flex flex-col justify-between gap-md group animate-fadeIn"
              data-testid={`driver-card-${driver.username}`}
            >
              {/* Badge for License - Top Right */}
              <div className="absolute top-md right-md">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getLicenseBadgeStyle(driver.licenseStatus)}`}>
                  {driver.licenseStatus || 'Vigente'}
                </span>
              </div>

              {/* Driver Profile Header */}
              <div className="flex items-center gap-md">
                <div className="relative w-14 h-14 rounded-full border-2 border-primary/20 group-hover:border-primary/65 overflow-hidden flex-shrink-0 transition-colors">
                  <img 
                    src={driver.avatar} 
                    alt={driver.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-headline-sm text-base text-on-surface font-bold leading-tight group-hover:text-primary transition-colors">
                    {driver.name}
                  </h3>
                  <span className="font-label-md text-xs text-on-surface-variant font-medium">@{driver.username}</span>
                </div>
              </div>

              {/* Status / Assignment Info Area */}
              <div className="flex-1 bg-surface-container-low rounded-xl p-sm border border-surface-variant/20 flex flex-col gap-xs justify-center min-h-[64px]">
                {(() => {
                  const vehicle = vehicles.find(v => v.driverId === driver.id);
                  if (vehicle) {
                    return (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-sm font-body-sm text-[12px] text-primary">
                          <span className="material-symbols-outlined text-[16px] filled">local_shipping</span>
                          <span>Manejando <strong className="text-on-surface">{vehicle.id}</strong> ({vehicle.status})</span>
                        </div>
                        <div className="flex items-center gap-sm font-body-sm text-[12px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
                          <span className="truncate max-w-[220px]" title={vehicle.currentLocation}>{vehicle.currentLocation || 'Base Operativa'}</span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center gap-sm font-body-sm text-[12px] text-on-surface-variant/50 justify-center">
                        <span className="material-symbols-outlined text-[18px] text-outline-variant">person_off</span>
                        <span>Sin unidad asignada</span>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between border-t border-surface-variant/20 pt-sm mt-xs gap-xs">
                <div className="flex items-center gap-xs">
                  <button 
                    onClick={() => handleOpenExpenses(driver)}
                    className="h-9 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-primary transition-all font-label-md text-xs border border-surface-variant/30 focus:outline-none"
                    title="Ver gastos y viajes"
                  >
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    <span>Gastos</span>
                  </button>
                  <button 
                    onClick={() => handleOpenAssignRoute(driver)}
                    className="h-9 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright flex items-center justify-center gap-1.5 text-primary hover:text-primary/80 transition-all font-label-md text-xs border border-surface-variant/30 focus:outline-none"
                    title="Asignar Hoja de Ruta"
                  >
                    <span className="material-symbols-outlined text-[18px]">alt_route</span>
                    <span>Ruta</span>
                  </button>
                </div>

                <div className="flex items-center gap-xs">
                  <button 
                    onClick={() => handleOpenEdit(driver)}
                    className="w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-primary transition-all border border-surface-variant/30 focus:outline-none"
                    title="Editar chofer"
                    data-testid={`btn-edit-${driver.username}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(driver.id)}
                    className="w-9 h-9 rounded-xl bg-surface-container-high hover:bg-error/15 flex items-center justify-center text-on-surface-variant hover:text-error transition-all border border-surface-variant/30 focus:outline-none"
                    title="Eliminar chofer"
                    data-testid={`btn-delete-${driver.username}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal Overlay / Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center max-w-md mx-auto">
          <div className="bg-surface-container-high rounded-t-2xl w-full p-lg border-t border-surface-variant/40 shadow-2xl flex flex-col gap-md max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {editingDriver ? 'Editar Chofer' : 'Registrar Chofer'}
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

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Nombre Completo *</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Ej: Roberto Gómez"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Usuario de Acceso *</label>
                <input 
                  type="text" 
                  name="username"
                  placeholder="Ej: roberto"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Contraseña *</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Contraseña del chofer"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Estado de Licencia</label>
                <select 
                  name="licenseStatus"
                  value={licenseStatus}
                  onChange={(e) => setLicenseStatus(e.target.value)}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                >
                  <option value="Vigente">Vigente</option>
                  <option value="Renovación Requerida">Renovación Requerida</option>
                  <option value="Vencida">Vencida</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">URL de Foto de Perfil (Opcional)</label>
                <input 
                  type="text" 
                  name="avatar"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                />
              </div>

              <button 
                type="submit"
                id="btn-submit-driver"
                className="w-full bg-primary hover:bg-primary/95 text-surface font-label-md text-label-md font-bold py-3 rounded-xl mt-sm flex items-center justify-center gap-xs shadow-lg shadow-green-950/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                Guardar Chofer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Expenses Modal Overlay */}
      {viewingExpensesDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center max-w-md mx-auto">
          <div className="bg-surface-container-high rounded-t-2xl w-full p-lg border-t border-surface-variant/40 shadow-2xl flex flex-col gap-md max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Gastos y Viajes de {viewingExpensesDriver.name}
              </h2>
              <button 
                type="button"
                onClick={() => setViewingExpensesDriver(null)}
                className="text-on-surface-variant hover:text-on-surface focus:outline-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {loadingTrips ? (
              <div className="flex flex-col items-center justify-center py-10">
                <span className="material-symbols-outlined text-[36px] text-primary animate-spin mb-sm">sync</span>
                <p className="text-on-surface-variant font-body-md">Cargando historial...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-10 bg-surface-container rounded-2xl border border-surface-variant/20">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-sm">receipt_long</span>
                <p className="text-on-surface-variant font-body-md">No se registran viajes ni gastos rendidos para este chofer.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                {/* Financial Summary card */}
                <div className="grid grid-cols-2 gap-sm bg-surface-container-low p-sm rounded-xl border border-surface-variant/30">
                  <div className="flex flex-col items-center p-xs">
                    <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">Total Rendido</span>
                    <span className="font-headline-sm text-secondary font-bold mt-1">
                      ${trips.reduce((acc, t) => acc + t.expensesAmount, 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-xs border-l border-surface-variant/30">
                    <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">Total Recorrido</span>
                    <span className="font-headline-sm text-primary font-bold mt-1">
                      {trips.reduce((acc, t) => acc + t.totalDistance, 0).toLocaleString('es-AR')} km
                    </span>
                  </div>
                </div>

                {/* List of trips */}
                <div className="flex flex-col gap-sm">
                  <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Desglose de Hojas de Ruta</h3>
                  <div className="flex flex-col gap-sm max-h-[40vh] overflow-y-auto pr-1">
                    {trips.map(trip => (
                      <div key={trip.id} className="bg-surface-container p-sm rounded-xl border border-surface-variant/20 flex flex-col gap-2 hover:bg-surface-bright transition-all">
                        <div className="flex justify-between items-center">
                          <span className="font-label-md text-xs text-on-surface-variant font-medium">{trip.tripDate}</span>
                          <span className="font-label-md text-xs text-primary bg-primary-container/20 px-2 py-0.5 rounded font-bold">{trip.vehicleId}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="font-body-md text-sm text-on-surface font-semibold">{trip.totalDistance} km recorridos</span>
                          <span className="font-body-md text-sm text-secondary font-bold">${trip.expensesAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {trip.expensesDetail && (
                          <div className="bg-surface-container-lowest p-xs rounded border border-surface-variant/10 text-xs text-on-surface-variant italic leading-tight">
                            "{trip.expensesDetail}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Assignment Modal */}
      {viewingAssignRouteDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center max-w-md mx-auto">
          <div className="bg-surface-container-high rounded-t-2xl w-full p-lg border-t border-surface-variant/40 shadow-2xl flex flex-col gap-md max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Asignar Hoja de Ruta
              </h2>
              <button 
                type="button"
                onClick={() => setViewingAssignRouteDriver(null)}
                className="text-on-surface-variant hover:text-on-surface focus:outline-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Asigna un viaje en progreso a <strong>{viewingAssignRouteDriver.name}</strong>.
            </p>

            <form onSubmit={handleAssignRouteSubmit} className="flex flex-col gap-md">
              {assignError && (
                <div className="bg-error/15 border border-error/30 text-error rounded-xl p-sm text-xs font-semibold flex items-center gap-xs animate-shake">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {assignError}
                </div>
              )}

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Camión Asignado *</label>
                <select 
                  name="assignVehicleId"
                  value={assignVehicleId}
                  onChange={(e) => setAssignVehicleId(e.target.value)}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                  required
                >
                  <option value="">Seleccionar Camión...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.id} - {v.model} ({v.driverId ? `Conductor: ${v.driver}` : 'Libre'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold font-semibold">Fecha *</label>
                  <input 
                    type="date" 
                    name="assignTripDate"
                    value={assignTripDate}
                    onChange={(e) => setAssignTripDate(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold font-semibold">Distancia (km) *</label>
                  <input 
                    type="number" 
                    name="assignTotalDistance"
                    placeholder="Ej: 142"
                    value={assignTotalDistance}
                    onChange={(e) => setAssignTotalDistance(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold font-semibold">Origen *</label>
                  <input 
                    type="text" 
                    name="assignOrigin"
                    placeholder="Ej: Base Bs. As."
                    value={assignOrigin}
                    onChange={(e) => setAssignOrigin(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold font-semibold">Destino *</label>
                  <input 
                    type="text" 
                    name="assignDestination"
                    placeholder="Ej: CD Norte"
                    value={assignDestination}
                    onChange={(e) => setAssignDestination(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-3 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold font-semibold">Tiempo Estimado</label>
                <input 
                  type="text" 
                  name="assignEstimatedTime"
                  placeholder="Ej: 4h 15m"
                  value={assignEstimatedTime}
                  onChange={(e) => setAssignEstimatedTime(e.target.value)}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2.5 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold font-semibold">Detalle de Entrega / Tarea *</label>
                <textarea 
                  name="assignTaskDescription"
                  placeholder="Instrucciones para el chofer..."
                  value={assignTaskDescription}
                  onChange={(e) => setAssignTaskDescription(e.target.value)}
                  className="w-full bg-surface-container border border-surface-variant/60 rounded-xl py-2 px-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors font-body-md min-h-[60px] text-xs"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={assignSubmitting}
                className="w-full bg-primary hover:bg-primary/95 text-surface font-label-md text-label-md font-bold py-3 rounded-xl mt-sm flex items-center justify-center gap-xs shadow-lg shadow-green-950/20 active:scale-95 transition-all disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                {assignSubmitting ? 'Asignando...' : 'Asignar Hoja de Ruta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
