import React, { useState } from 'react';

export default function DriversManagement({ drivers, setDrivers }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null); // null when creating
  
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
  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este chofer?')) {
      setDrivers(drivers.filter(d => d.id !== id));
    }
  };

  // Handle submit (save create/edit)
  const handleSubmit = (e) => {
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

    if (editingDriver) {
      // Edit mode
      setDrivers(drivers.map(d => d.id === editingDriver.id ? {
        ...d,
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
        licenseStatus,
        avatar: avatar.trim() || defaultAvatar
      } : d));
    } else {
      // Create mode
      const newId = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
      setDrivers([
        ...drivers,
        {
          id: newId,
          name: name.trim(),
          username: username.trim(),
          password: password.trim(),
          role: 'conductor',
          licenseStatus,
          avatar: avatar.trim() || defaultAvatar
        }
      ]);
    }

    setShowModal(false);
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
      <section className="flex flex-col gap-md">
        {filteredDrivers.length === 0 ? (
          <div className="text-center py-10 bg-surface-container rounded-2xl border border-surface-variant/20">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-sm">person_off</span>
            <p className="text-on-surface-variant font-body-md">No se encontraron choferes.</p>
          </div>
        ) : (
          filteredDrivers.map(driver => (
            <div 
              key={driver.id}
              className="bg-surface-container rounded-xl p-md border border-surface-variant/30 flex items-center justify-between hover:border-primary/45 transition-colors group animate-fadeIn"
              data-testid={`driver-card-${driver.username}`}
            >
              <div className="flex items-center gap-md">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full border-2 border-surface-variant/50 overflow-hidden flex-shrink-0">
                  <img 
                    src={driver.avatar} 
                    alt={driver.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                </div>
                {/* Info */}
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline-sm text-sm text-on-surface font-bold leading-tight">{driver.name}</h3>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-md text-[11px] text-on-surface-variant font-medium">@{driver.username}</span>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getLicenseBadgeStyle(driver.licenseStatus)}`}>
                      {driver.licenseStatus || 'Vigente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-xs">
                <button 
                  onClick={() => handleOpenEdit(driver)}
                  className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-primary transition-colors focus:outline-none"
                  title="Editar chofer"
                  data-testid={`btn-edit-${driver.username}`}
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(driver.id)}
                  className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-error-container/20 flex items-center justify-center text-error transition-colors focus:outline-none"
                  title="Eliminar chofer"
                  data-testid={`btn-delete-${driver.username}`}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
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
    </div>
  );
}
