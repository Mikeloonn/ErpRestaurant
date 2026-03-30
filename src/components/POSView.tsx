import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Table, OrderType, PaymentMethod } from '../types';
import { Users, ShoppingBag, Truck, Plus, Check, X } from 'lucide-react';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  total,
  initialCustomerName = '',
  initialCustomerDocument = '',
  initialCustomerAddress = ''
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (data: { method: PaymentMethod, customerName: string, customerDocument: string, customerAddress: string }) => void;
  total: number;
  initialCustomerName?: string;
  initialCustomerDocument?: string;
  initialCustomerAddress?: string;
}) => {
  const [method, setMethod] = useState<PaymentMethod>('Efectivo');
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerDocument, setCustomerDocument] = useState(initialCustomerDocument);
  const [customerAddress, setCustomerAddress] = useState(initialCustomerAddress);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-800">Cobrar Pedido</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-zinc-500 font-medium mb-1">Total a Cobrar</p>
            <p className="text-4xl font-bold text-green-600">S/ {total.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Efectivo', 'Yape/Plin', 'Tarjeta'] as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-3 rounded-xl font-medium border-2 transition-all ${
                    method === m 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <h3 className="font-medium text-zinc-800">Datos para Boleta (Opcional)</h3>
            
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">DNI / RUC</label>
              <input 
                type="text" 
                value={customerDocument}
                onChange={e => setCustomerDocument(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ej: 12345678"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Nombre / Razón Social</label>
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Dirección</label>
              <input 
                type="text" 
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Dirección del cliente"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 bg-zinc-50">
          <button
            onClick={() => onConfirm({ method, customerName, customerDocument, customerAddress })}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6" />
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

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

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
      active 
        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
        : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    {label}
  </button>
);

const TableMap = ({ tables }: { tables: Table[] }) => {
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

const QuickOrder = ({ type }: { type: OrderType }) => {
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
              <span className="text-lg font-bold text-zinc-800">S/ {order.total.toFixed(2)}</span>
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

// Simplified OrderTaking for MVP
const OrderTaking = ({ table, existingOrderId, orderType = 'Salon', onBack }: { table?: Table, existingOrderId?: string, orderType?: OrderType, onBack: () => void }) => {
  const { categories, products, createOrder, updateOrderStatus, updateOrder, orders, currentUser } = useAppContext();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const [cart, setCart] = useState<any[]>([]);
  
  const existingOrder = existingOrderId 
    ? orders.find(o => o.id === existingOrderId) 
    : (table?.currentOrderId ? orders.find(o => o.id === table.currentOrderId) : null);

  const [customerName, setCustomerName] = useState(existingOrder?.customerName || '');
  const [defaultIsTakeaway, setDefaultIsTakeaway] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, cartId: Date.now(), quantity: 1, notes: '', isTakeaway: defaultIsTakeaway }]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + 
                (existingOrder ? existingOrder.total : 0);

  const handleSendOrder = () => {
    // If there's an existing order but no new items, we might just be updating the name
    if (cart.length === 0 && existingOrder && customerName !== existingOrder.customerName) {
      updateOrder(existingOrder.id, [], 0, customerName);
      onBack();
      return;
    }

    if (cart.length === 0) return;
    
    const newItems = cart.map(c => ({
      productId: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      notes: c.notes,
      isTakeaway: c.isTakeaway
    }));
    const additionalTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (existingOrder) {
      updateOrder(existingOrder.id, newItems, additionalTotal, customerName);
    } else {
      createOrder({
        type: table ? 'Salon' : orderType,
        tableId: table?.id,
        customerName: customerName,
        items: newItems,
        total: additionalTotal
      });
    }
    setCart([]);
    onBack();
  };

  const handlePrecuenta = () => {
    if (existingOrder) {
      updateOrderStatus(existingOrder.id, 'Precuenta');
      onBack();
    }
  };

  const handlePay = () => {
    if (existingOrder) {
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col border-r border-zinc-200 bg-zinc-50/50">
        <div className="p-4 flex items-center gap-4 bg-white border-b border-zinc-200">
          <button onClick={onBack} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium">
            ← Volver
          </button>
          <h2 className="text-xl font-bold text-zinc-800">
            {table ? `Mesa ${table.number}` : `Pedido ${orderType}`}
          </h2>
          <input 
            type="text" 
            placeholder="Nombre del cliente (opcional)..." 
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="ml-auto px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
          />
        </div>

        <div className="flex gap-2 p-4 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-zinc-800 text-white' 
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.categoryId === activeCategory).map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col h-32 ${
                  product.stock > 0 
                    ? 'bg-white border-zinc-200 hover:border-orange-500 hover:shadow-md' 
                    : 'bg-zinc-100 border-zinc-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="font-bold text-zinc-800 line-clamp-2">{product.name}</span>
                <span className="text-orange-600 font-bold mt-auto">S/ {product.price.toFixed(2)}</span>
                {product.stock <= product.minStock && product.stock > 0 && (
                  <span className="text-xs text-red-500 font-medium mt-1">¡Quedan {product.stock}!</span>
                )}
                {product.stock <= 0 && (
                  <span className="text-xs text-red-500 font-medium mt-1">Agotado</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50">
          <h3 className="font-bold text-zinc-800 text-lg">Resumen de Pedido</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {existingOrder && (
            <div className="mb-6 pb-6 border-b border-dashed border-zinc-300">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Ya enviado</p>
              {existingOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start mb-2 text-zinc-600">
                  <div className="flex flex-col">
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                    </div>
                    {item.isTakeaway && (
                      <span className="text-[10px] font-bold text-orange-500 uppercase">Para Llevar</span>
                    )}
                  </div>
                  <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">Nuevos</p>
              {cart.map((item, index) => (
                <div key={item.cartId} className="flex flex-col mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-zinc-800">{item.name}</span>
                    <span className="font-bold text-zinc-800">S/ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-lg p-1">
                      <button 
                        onClick={() => setCart(cart.map((c, i) => i === index ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600"
                      >-</button>
                      <span className="font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => setCart(cart.map((c, i) => i === index ? { ...c, quantity: c.quantity + 1 } : c))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600"
                      >+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      {table && (
                        <button 
                          onClick={() => setCart(cart.map((c, i) => i === index ? { ...c, isTakeaway: !c.isTakeaway } : c))}
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${
                            item.isTakeaway 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-zinc-200 text-zinc-500'
                          }`}
                        >
                          {item.isTakeaway ? 'Llevar' : 'Mesa'}
                        </button>
                      )}
                      <button 
                        onClick={() => setCart(cart.filter((_, i) => i !== index))}
                        className="text-red-500 text-sm font-medium hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {cart.length === 0 && !existingOrder && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
              <p>El pedido está vacío</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 font-medium">Total</span>
            <span className="text-3xl font-bold text-zinc-800">S/ {total.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {(cart.length > 0 || (existingOrder && customerName !== existingOrder.customerName)) && (
              <button 
                onClick={handleSendOrder}
                className="col-span-2 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                {cart.length > 0 ? (
                  <>
                    <Plus className="w-5 h-5" />
                    Enviar a Cocina
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            )}
            
            {existingOrder && cart.length === 0 && customerName === existingOrder.customerName && (existingOrder.status === 'Abierta' || existingOrder.status === 'Precuenta') && (
              <button 
                onClick={handlePrecuenta}
                className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                Imprimir Precuenta
              </button>
            )}

            {existingOrder && cart.length === 0 && customerName === existingOrder.customerName && (currentUser?.role === 'Cajero' || currentUser?.role === 'Administrador') && (
              <button 
                onClick={handlePay}
                className="col-span-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Cobrar S/ {total.toFixed(2)}
              </button>
            )}
          </div>
        </div>
      </div>

      {existingOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          total={total}
          initialCustomerName={existingOrder.customerName}
          initialCustomerDocument={existingOrder.customerDocument}
          initialCustomerAddress={existingOrder.customerAddress}
          onConfirm={(data) => {
            updateOrderStatus(existingOrder.id, 'Pagada', data);
            setIsPaymentModalOpen(false);
            onBack();
          }}
        />
      )}
    </div>
  );
};
