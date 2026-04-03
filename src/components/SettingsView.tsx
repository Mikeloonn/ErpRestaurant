import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings, RefreshCcw, AlertOctagon, ShieldAlert } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { resetInventory } = useAppContext();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    await resetInventory();
    setShowResetConfirm(false);
  };

  return (
    <div className="h-full p-6 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
          <Settings className="w-6 h-6" /> Configuraciones del Sistema
        </h2>
        <p className="text-zinc-500">Administra el estado y mantenimiento de la aplicación.</p>
      </div>

      {/* SECCIÓN: MANTENIMIENTO (ZONA DE PELIGRO) */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Zona de Peligro
        </h3>
        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-lg text-red-600">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-800 text-lg">Reiniciar Inventario y Kardex</div>
              <p className="text-red-700/70 text-sm mt-1">
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
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-red-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 text-center mb-2">¿Estás totalmente seguro?</h3>
            <p className="text-zinc-600 text-center mb-8">
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
                className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold transition-colors hover:bg-zinc-200"
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
