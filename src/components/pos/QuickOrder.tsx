import React, { useState } from 'react';
import { OrderType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ShoppingBag, Plus, Check } from 'lucide-react';
import { OrderTaking } from './OrderTaking';
import { PaymentModal } from './PaymentModal';
import { formatCurrency } from '../../utils/currency';

interface QuickOrderProps {
  type: OrderType;
}

export const QuickOrder: React.FC<QuickOrderProps> = ({ type }) => {
  const { orders, updateOrderStatus } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [payingOrder, setPayingOrder] = useState<any>(null);

  const activeOrders = orders.filter(o => o.type === type && o.status !== 'Pagada' && o.status !== 'Anulada');

  if (isCreating) {
    return <OrderTaking orderType={type} onBack={() => setIsCreating(false)} />;
  }

  if (selectedOrderId) {
    return <OrderTaking orderType={type} existingOrderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
  }

  return (
    <div className="p-6 w-full flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-800">
          Pedidos {type === 'Llevar' ? 'para Llevar' : 'Delivery'}
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
        {activeOrders.map(order => (
          <div key={order.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-bold text-lg text-zinc-800 block">{order.customerName || 'Sin nombre'}</span>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md mt-1 inline-block">
                  {order.status}
                </span>
              </div>
              <span className="text-sm font-medium text-zinc-500 bg-zinc-50 px-2 py-1 rounded-lg">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="text-sm text-zinc-600 mb-4 flex-1">
              <div className="font-medium mb-1">{order.items.length} productos:</div>
              <ul className="list-disc list-inside text-xs text-zinc-500 line-clamp-3">
                {order.items.map((item, i) => (
                  <li key={i}>{item.quantity}x {item.name}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between mb-4 pt-4 border-t border-zinc-100">
              <span className="text-sm text-zinc-500">Total</span>
              <span className="text-lg font-bold text-zinc-800">{formatCurrency(order.total)}</span>
            </div>

            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setSelectedOrderId(order.id)}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2.5 rounded-xl font-medium transition-colors text-sm"
              >
                Ver / Editar
              </button>
              <button
                onClick={() => setPayingOrder(order)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" />
                Cobrar
              </button>
            </div>
          </div>
        ))}
        {activeOrders.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-200">
            <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-zinc-500">No hay pedidos activos</p>
            <p className="text-sm mt-1">Haz clic en "Nuevo Pedido" para comenzar.</p>
          </div>
        )}
      </div>

      {payingOrder && (
        <PaymentModal
          isOpen={!!payingOrder}
          onClose={() => setPayingOrder(null)}
          total={payingOrder.total}
          initialCustomerName={payingOrder.customerName}
          initialCustomerDocument={payingOrder.customerDocument}
          initialCustomerAddress={payingOrder.customerAddress}
          onConfirm={(data) => {
            updateOrderStatus(payingOrder.id, 'Pagada', data);
            setPayingOrder(null);
          }}
        />
      )}
    </div>
  );
};
