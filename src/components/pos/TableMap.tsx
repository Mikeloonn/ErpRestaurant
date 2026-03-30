import React, { useState } from 'react';
import { Table } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { OrderTaking } from './OrderTaking';

interface TableMapProps {
  tables: Table[];
}

export const TableMap: React.FC<TableMapProps> = ({ tables }) => {
  const { orders } = useAppContext();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  if (selectedTable) {
    return <OrderTaking table={selectedTable} onBack={() => setSelectedTable(null)} />;
  }

  const getOrderTime = (orderId?: string) => {
    if (!orderId) return null;
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    
    const timeToUse = order.updatedAt || order.createdAt;
    const date = new Date(timeToUse);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-xl font-bold text-zinc-800 mb-6">Mapa de Mesas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map(table => {
          const orderTime = getOrderTime(table.currentOrderId);
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-4 transition-all hover:scale-105 ${
                table.status === 'Libre' ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' :
                table.status === 'Ocupada' ? 'bg-orange-100 text-orange-700 border-2 border-orange-500' :
                'bg-blue-100 text-blue-700 border-2 border-blue-500'
              }`}
            >
              <span className="text-3xl font-bold mb-2">{table.number}</span>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/50">
                {table.status}
              </span>
              {table.status !== 'Libre' && orderTime && (
                <span className="text-xs font-medium mt-2 opacity-80">
                  {orderTime}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-8 flex gap-6 text-sm font-medium text-zinc-500">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-zinc-200"></div> Libre</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-500"></div> Ocupada</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div> Precuenta Entregada</div>
      </div>
    </div>
  );
};
