import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import FleetList from './components/FleetList';
import VehicleDetail from './components/VehicleDetail';
import DriverRoute from './components/DriverRoute';
import DriverPanel from './components/DriverPanel';
import AlertsMaintenance from './components/AlertsMaintenance';
import DriversManagement from './components/DriversManagement';

function Login({ onLogin, drivers }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Error de conexión con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8 animate-fadeIn min-h-[80vh]">
      <div className="bg-surface-container rounded-2xl p-lg border border-surface-variant/40 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-lg relative z-10">
          <div className="w-16 h-16 bg-primary-container/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-md border border-primary/20 shadow-lg shadow-black/20">
            <span className="material-symbols-outlined text-[36px] filled">local_shipping</span>
          </div>
          <h2 className="font-headline-xl text-headline-lg text-primary font-bold">VerdeMov</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Ecosistema de Flota Eléctrica</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md relative z-10">
          {error && (
            <div className="bg-error/15 border border-error/30 text-error rounded-xl p-sm text-xs font-semibold flex items-center gap-xs animate-shake">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Usuario</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">person</span>
              <input 
                name="username"
                type="text" 
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-surface-container-low border border-surface-variant/60 rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors placeholder:text-on-surface-variant/40 font-body-md"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Contraseña</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">lock</span>
              <input 
                name="password"
                type="password" 
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-surface-container-low border border-surface-variant/60 rounded-xl py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary/80 transition-colors placeholder:text-on-surface-variant/40 font-body-md"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-primary hover:bg-primary/95 text-surface font-label-md text-label-md font-bold py-3.5 rounded-xl mt-sm flex items-center justify-center gap-xs shadow-lg shadow-green-950/20 active:scale-[0.98] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
              {loading ? 'sync' : 'login'}
            </span>
            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Quick access helpers */}
        <div className="mt-xl border-t border-surface-variant/20 pt-lg relative z-10">
          <p className="text-center font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold mb-md">Acceso Rápido para Pruebas</p>
          <div className="grid grid-cols-2 gap-sm">
            <button 
              type="button"
              onClick={() => {
                setUsername('gerente');
                setPassword('gerente123');
                setError('');
              }}
              className="bg-surface-container-high hover:bg-surface-bright border border-surface-variant/40 hover:border-primary/30 rounded-xl py-2 px-1 text-center font-label-md text-xs text-primary transition-all focus:outline-none active:scale-95"
            >
              Gerente
            </button>
            <button 
              type="button"
              onClick={() => {
                setUsername('chofer');
                setPassword('chofer123');
                setError('');
              }}
              className="bg-surface-container-high hover:bg-surface-bright border border-surface-variant/40 hover:border-primary/30 rounded-xl py-2 px-1 text-center font-label-md text-xs text-secondary transition-all focus:outline-none active:scale-95"
            >
              Chofer (Carlos)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // { username, name, role, avatar }
  const [role, setRole] = useState('operador'); // 'operador' or 'conductor'
  const [view, setView] = useState('dashboard'); // 'dashboard', 'flota', 'detalle_vehiculo', 'rutas', 'alertas', 'choferes'
  const [selectedVehicleId, setSelectedVehicleId] = useState('VM-042');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Dynamic state from database
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [settings, setSettings] = useState({ alert_red: 15, alert_yellow: 30, alert_green: 60 });

  // Fetch data on session start
  React.useEffect(() => {
    if (!currentUser) return;
    
    const fetchData = async () => {
      try {
        const dRes = await fetch('/api/drivers');
        const dData = await dRes.json();
        if (dData.success) setDrivers(dData.drivers);

        const vRes = await fetch('/api/vehicles');
        const vData = await vRes.json();
        if (vData.success) {
          setVehicles(vData.vehicles);
          if (vData.vehicles.length > 0 && !vData.vehicles.some(v => v.id === selectedVehicleId)) {
            setSelectedVehicleId(vData.vehicles[0].id);
          }
        }

        const sRes = await fetch('/api/settings');
        const sData = await sRes.json();
        if (sData.success) setSettings(sData.settings);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    fetchData();
  }, [currentUser]);

  // Login handler
  const handleLogin = (user) => {
    setCurrentUser(user);
    setRole(user.role);
    setView('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setRole('operador');
    setView('dashboard');
  };

  // Dynamically calculate warnings based on database VTV dates and settings thresholds
  const getAlerts = () => {
    const activeAlerts = [];
    vehicles.forEach(v => {
      if (!v.vtvExpiration) return;
      const expDate = new Date(v.vtvExpiration);
      const today = new Date();
      expDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const timeDiff = expDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= settings.alert_red) {
        activeAlerts.push({
          id: `vtv-${v.id}`,
          title: daysDiff < 0 ? 'VTV Vencida' : 'VTV Vencimiento Crítico',
          desc: `Unidad ${v.id}`,
          severity: 'error',
          text: daysDiff < 0 ? `Expiró hace ${Math.abs(daysDiff)} días` : `Vence en ${daysDiff} días`
        });
      } else if (daysDiff <= settings.alert_yellow) {
        activeAlerts.push({
          id: `vtv-${v.id}`,
          title: 'VTV Próxima a Vencer',
          desc: `Unidad ${v.id}`,
          severity: 'warning',
          text: `Vence en ${daysDiff} días`
        });
      } else if (daysDiff <= settings.alert_green) {
        activeAlerts.push({
          id: `vtv-${v.id}`,
          title: 'VTV en Término',
          desc: `Unidad ${v.id}`,
          severity: 'info',
          text: `Vence en ${daysDiff} días`
        });
      }
    });

    // Fallbacks to keep mock items if database is clean
    if (activeAlerts.length === 0) {
      activeAlerts.push(
        { id: 'vtv', title: 'VTV Vencida', desc: 'VM-042', severity: 'error', text: 'Expiró hace 2 días' },
        { id: 'motores', title: 'Mantenimiento de Motores', desc: 'VM-018', severity: 'warning', text: 'En 500 km' },
        { id: 'neumaticos', title: 'Revisión de Neumáticos', desc: 'VM-105', severity: 'info', text: 'Presión baja' }
      );
    }
    return activeAlerts;
  };

  const alerts = getAlerts();

  // Render active component
  const renderContent = () => {
    if (role === 'operador') {
      switch (view) {
        case 'dashboard':
          return <Dashboard setView={setView} alerts={alerts} vehicles={vehicles} setSelectedVehicleId={setSelectedVehicleId} />;
        case 'flota':
          return <FleetList vehicles={vehicles} setVehicles={setVehicles} drivers={drivers} setView={setView} setSelectedVehicleId={setSelectedVehicleId} />;
        case 'detalle_vehiculo':
          return <VehicleDetail vehicleId={selectedVehicleId} vehicles={vehicles} setView={setView} />;
        case 'choferes':
          return <DriversManagement drivers={drivers} setDrivers={setDrivers} />;
        case 'alertas':
          return <AlertsMaintenance settings={settings} setSettings={setSettings} vehicles={vehicles} />;
        default:
          return <Dashboard setView={setView} alerts={alerts} vehicles={vehicles} setSelectedVehicleId={setSelectedVehicleId} />;
      }
    } else {
      // Driver perspective
      switch (view) {
        case 'dashboard':
          return <DriverPanel vehicleId="VM-018" vehicles={vehicles} setView={setView} />;
        case 'rutas':
          return <DriverRoute />;
        case 'alertas':
          return <AlertsMaintenance settings={settings} setSettings={setSettings} vehicles={vehicles} />;
        default:
          return <DriverPanel vehicleId="VM-018" vehicles={vehicles} setView={setView} />;
      }
    }
  };

  // If session not started, only display login screen
  if (!currentUser) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md relative max-w-md mx-auto shadow-2xl border-x border-surface-variant/20 select-none">
        <main className="flex-1 px-margin-mobile flex flex-col justify-center">
          <Login onLogin={handleLogin} drivers={drivers} />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md relative max-w-md mx-auto shadow-2xl border-x border-surface-variant/20 select-none pb-24">
      {/* Top Header */}
      <header className="bg-surface docked full-width top-0 sticky z-50 flex justify-between items-center px-margin-mobile w-full h-16 border-b border-surface-variant/10">
        <div className="flex items-center gap-sm">
          {/* Avatar / Brand Indicator */}
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden border border-primary/20">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-label-md text-label-md font-bold text-primary">GF</span>
            )}
          </div>
          <h1 className="font-headline-md-mobile text-headline-md-mobile font-bold text-primary">VerdeMov</h1>
          
          {/* Role badge */}
          <span className="ml-2 px-2 py-0.5 rounded-full bg-surface-container-high border border-surface-variant text-[9px] uppercase font-bold text-on-surface-variant">
            {role === 'operador' ? 'Gerente' : 'Chofer'}
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-xs">
          {/* Notifications Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadNotifications(0);
              }} 
              className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-2 rounded-full focus:outline-none"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
              )}
            </button>

            {/* Simple Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-high rounded-xl p-md border border-surface-variant shadow-2xl z-50 animate-fadeIn">
                <h4 className="font-label-md text-label-md text-on-surface font-bold border-b border-surface-variant/40 pb-2 mb-2 flex justify-between">
                  <span>Notificaciones</span>
                  <span className="text-[10px] text-primary">Novedades</span>
                </h4>
                <ul className="flex flex-col gap-sm">
                  <li className="text-xs bg-surface-container p-sm rounded border-l-2 border-error text-on-surface">
                    <span className="font-bold">VM-042:</span> Alerta crítica por VTV vencida.
                  </li>
                  <li className="text-xs bg-surface-container p-sm rounded border-l-2 border-tertiary text-on-surface">
                    <span className="font-bold">VM-018:</span> Nivel de batería óptimo para salida.
                  </li>
                  <li className="text-xs bg-surface-container p-sm rounded border-l-2 border-primary text-on-surface">
                    <span className="font-bold">Rutas:</span> Asignación de hoja de ruta CD Norte activa.
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="text-error hover:opacity-80 active:scale-95 flex items-center justify-center p-2 rounded-full focus:outline-none"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-[24px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-margin-mobile py-md flex flex-col">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 max-w-md w-full z-50 rounded-t-xl bg-surface-container border-t border-surface-variant/40 flex justify-around items-center px-4 py-2 shadow-2xl">
        {role === 'operador' ? (
          <>
            {/* Operator Nav */}
            <button 
              onClick={() => setView('dashboard')}
              className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 focus:outline-none ${
                view === 'dashboard' ? 'bg-primary-container text-on-primary-container rounded-full' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
              <span className="font-label-md text-[10px] mt-1">Dashboard</span>
            </button>

            <button 
              onClick={() => setView('flota')}
              className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 focus:outline-none ${
                view === 'flota' || view === 'detalle_vehiculo' ? 'bg-primary-container text-on-primary-container rounded-full' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: (view === 'flota' || view === 'detalle_vehiculo') ? "'FILL' 1" : "'FILL' 0" }}>local_shipping</span>
              <span className="font-label-md text-[10px] mt-1">Flota</span>
            </button>

            <button 
              onClick={() => setView('choferes')}
              className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 focus:outline-none ${
                view === 'choferes' ? 'bg-primary-container text-on-primary-container rounded-full' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'choferes' ? "'FILL' 1" : "'FILL' 0" }}>badge</span>
              <span className="font-label-md text-[10px] mt-1">Choferes</span>
            </button>

            <button 
              onClick={() => setView('alertas')}
              className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 focus:outline-none ${
                view === 'alertas' ? 'bg-primary-container text-on-primary-container rounded-full' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'alertas' ? "'FILL' 1" : "'FILL' 0" }}>warning</span>
              <span className="font-label-md text-[10px] mt-1">Alertas</span>
            </button>
          </>
        ) : (
          <>
            {/* Driver Nav */}
            <button 
              onClick={() => setView('dashboard')}
              className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 focus:outline-none ${
                view === 'dashboard' ? 'bg-primary-container text-on-primary-container rounded-full' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
              <span className="font-label-md text-[10px] mt-1">Mi Panel</span>
            </button>

            <button 
              onClick={() => setView('rutas')}
              className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 focus:outline-none ${
                view === 'rutas' ? 'bg-primary-container text-on-primary-container rounded-full' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'rutas' ? "'FILL' 1" : "'FILL' 0" }}>route</span>
              <span className="font-label-md text-[10px] mt-1">Rutas</span>
            </button>

            <button 
              onClick={() => setView('alertas')}
              className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 focus:outline-none ${
                view === 'alertas' ? 'bg-primary-container text-on-primary-container rounded-full' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'alertas' ? "'FILL' 1" : "'FILL' 0" }}>warning</span>
              <span className="font-label-md text-[10px] mt-1">Alertas</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
