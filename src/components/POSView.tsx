import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { OrderType } from '../types';
import { Users, ShoppingBag, Truck } from 'lucide-react';
import { TabButton } from './pos/TabButton';
import { TableMap } from './pos/TableMap';
import { QuickOrder } from './pos/QuickOrder';

export const POSView: React.FC = () => {
  const { tables, currentShift, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<OrderType>('Salon');

  if (!currentShift && currentUser?.role !== 'Administrador') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold mb-2">Caja Cerrada</h2>
        <p>El cajero debe abrir el turno para empezar a tomar pedidos.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-4 mb-6">
        <TabButton active={activeTab === 'Salon'} onClick={() => setActiveTab('Salon')} icon={<Users />} label="Salón" />
        <TabButton active={activeTab === 'Llevar'} onClick={() => setActiveTab('Llevar')} icon={<ShoppingBag />} label="Para Llevar" />
        <TabButton active={activeTab === 'Delivery'} onClick={() => setActiveTab('Delivery')} icon={<Truck />} label="Delivery" />
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex">
        {activeTab === 'Salon' && <TableMap tables={tables} />}
        {activeTab !== 'Salon' && <QuickOrder type={activeTab} />}
      </div>
    </div>
  );
};
