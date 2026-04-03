import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, ShoppingBag, Package, Wallet, Users, LogOut, Settings } from 'lucide-react';
import { POSView } from './POSView';
import { InventoryView } from './InventoryView';
import { CashRegisterView } from './CashRegisterView';
import { UsersView } from './UsersView';
import { CatalogView } from './CatalogView';
import { SettingsView } from './SettingsView';

type Module = 'POS' | 'Catalogo' | 'Caja' | 'Usuarios' | 'Inventario' | 'Configuraciones';

export const MainLayout: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const [activeModule, setActiveModule] = useState<Module>('POS');

  const navItems: { id: Module; label: string; icon: React.ReactNode; roles: string[] }[] = [
    { id: 'POS', label: 'Punto de Venta', icon: <ShoppingBag />, roles: ['Mesero', 'Cajero', 'Administrador'] },
    { id: 'Caja', label: 'Caja', icon: <Wallet />, roles: ['Cajero', 'Administrador'] },
    { id: 'Inventario', label: 'Inventario', icon: <Package />, roles: ['Administrador'] },
    { id: 'Catalogo', label: 'Catálogo', icon: <LayoutDashboard />, roles: ['Administrador'] },
    { id: 'Usuarios', label: 'Usuarios', icon: <Users />, roles: ['Administrador'] },
    { id: 'Configuraciones', label: 'Configuraciones', icon: <Settings />, roles: ['Administrador'] },
  ];

  const allowedNavItems = navItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 text-zinc-300 flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="bg-orange-500 p-1.5 rounded-lg"><ShoppingBag className="w-5 h-5 text-white" /></span>
            Lo Esencial
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">ERP Broastería</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {allowedNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                activeModule === item.id 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-zinc-400 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-100 transition-colors">
        <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between shrink-0 transition-colors">
          <h2 className="text-2xl font-bold text-zinc-800">
            {navItems.find(i => i.id === activeModule)?.label}
          </h2>
          <div className="text-sm font-medium text-zinc-500">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {activeModule === 'POS' && <POSView />}
          {activeModule === 'Inventario' && <InventoryView />}
          {activeModule === 'Caja' && <CashRegisterView />}
          {activeModule === 'Usuarios' && <UsersView />}
          {activeModule === 'Catalogo' && <CatalogView />}
          {activeModule === 'Configuraciones' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
