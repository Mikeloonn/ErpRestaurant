import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings, Moon, Sun, RefreshCcw, AlertOctagon, ShieldAlert } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isDarkMode, setDarkMode, resetInventory } = useAppContext();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    await resetInventory();
    setShowResetConfirm(false);
  };

  return (
    <div className="h-full p-6 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6" /> Configuraciones del Sistema
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">Administra las preferencias y el estado de la aplicación.</p>
      </div>

      {/* SECCIÓN: APARIENCIA */}
      <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-500" /> Apariencia
        </h3>
        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
          <div>
            <div className="font-bold text-zinc-800 dark:text-white">Modo Nocturno</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Cambia los colores de la interfaz para entornos con poca luz.</div>
          </div>
          <button
            onClick={() => setDarkMode(!isDarkMode)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
              isDarkMode ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-7' : 'translate-x-1'
              } flex items-center justify-center shadow-sm`}
            >
              {isDarkMode ? <Moon className="w-3.5 h-3.5 text-orange-500" /> : <Sun className="w-3.5 h-3.5 text-zinc-400" />}
            </span>
          </button>
        </div>
      </section>

      {/* SECCIÓN: MANTENIMIENTO (ZONA DE PELIGRO) */}
      <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Zona de Peligro
        </h3>
        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-red-600">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-800 dark:text-red-400 text-lg">Reiniciar Inventario y Kardex</div>
              <p className="text-red-700/70 dark:text-red-400/60 text-sm mt-1">
                Esta acción eliminará permanentemente todos los lotes, el historial de movimientos (Kardex) y reseteará el stock de todos los productos a cero. 
                <span className="font-bold"> Esta acción no se puede deshacer.</span>
              </p>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
              >
                <RefreshCcw className="w-4 h-4" /> Reiniciar Todo el Inventario
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE CONFIRMACIÓN */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-red-100 dark:border-red-900/20 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 dark:text-white text-center mb-2">¿Estás totalmente seguro?</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8">
              Estás a punto de borrar todo el historial operativo de inventario. Los productos y categorías se mantendrán, pero sus cantidades volverán a cero.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleReset}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-red-600/20 active:scale-95"
              >
                Sí, borrar historial
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="w-full py-4 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-2xl font-bold transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
