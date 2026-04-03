import React from 'react';
import { Table, OrderType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useOrder } from '../../hooks/useOrder';
import { ShoppingBag, Plus, Check } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { formatCurrency } from '../../utils/currency';

interface OrderTakingProps {
  table?: Table;
  existingOrderId?: string;
  orderType?: OrderType;
  onBack: () => void;
}

export const OrderTaking: React.FC<OrderTakingProps> = ({ 
  table, 
  existingOrderId, 
  orderType = 'Salon', 
  onBack 
}) => {
  const { updateOrderStatus } = useAppContext();
  const {
    cart,
    activeCategory,
    setActiveCategory,
    customerName,
    setCustomerName,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    existingOrder,
    total,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    toggleItemTakeaway,
    handleSendOrder,
    handlePrecuenta,
    categories,
    products,
    currentUser
  } = useOrder(table, existingOrderId, orderType as OrderType);

  // Lógica para detectar si hay cambios reales en el nombre (ignorando nulos/vacíos)
  const hasNameChanged = existingOrder ? (customerName || '') !== (existingOrder.customerName || '') : false;
  const hasUnsavedChanges = cart.length > 0 || hasNameChanged;

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
                <span className="text-orange-600 font-bold mt-auto">{formatCurrency(product.price)}</span>
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
                  <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">Nuevos</p>
              {cart.map((item) => (
                <div key={item.cartId} className="flex flex-col mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-zinc-800">{item.name}</span>
                    <span className="font-bold text-zinc-800">{formatCurrency(Number(item.price) * item.quantity)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-lg p-1">
                      <button 
                        onClick={() => updateCartItemQuantity(item.cartId, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600"
                      >-</button>
                      <span className="font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(item.cartId, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600"
                      >+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      {table && (
                        <button 
                          onClick={() => toggleItemTakeaway(item.cartId)}
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
                        onClick={() => removeFromCart(item.cartId)}
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
            <span className="text-3xl font-bold text-zinc-800">{formatCurrency(total)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {hasUnsavedChanges && (
              <button 
                onClick={() => handleSendOrder(onBack)}
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
            
            {existingOrder && !hasUnsavedChanges && (existingOrder.status === 'Abierta' || existingOrder.status === 'Precuenta') && (
              <button 
                onClick={() => handlePrecuenta(onBack)}
                className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                Imprimir Precuenta
              </button>
            )}

            {existingOrder && !hasUnsavedChanges && (currentUser?.role === 'Cajero' || currentUser?.role === 'Administrador') && (
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="col-span-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Cobrar {formatCurrency(total)}
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
