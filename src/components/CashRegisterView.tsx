import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Wallet, ArrowDownRight, ArrowUpRight, Lock, Unlock, FileText, X, Search, Filter } from 'lucide-react';
import { Order } from '../types';

export const CashRegisterView: React.FC = () => {
  const { currentShift, openShift, closeShift, addCashTransaction, cashTransactions, currentUser, orders } = useAppContext();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [txType, setTxType] = useState<'Ingreso' | 'Egreso'>('Egreso');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Ingreso' | 'Egreso'>('Todos');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<'Todos' | 'Efectivo' | 'Yape/Plin' | 'Tarjeta'>('Todos');

  const shiftTransactions = cashTransactions.filter(tx => 
    currentShift && new Date(tx.date) >= new Date(currentShift.openedAt)
  );

  const filteredTransactions = shiftTransactions.filter(tx => {
    if (filterType !== 'Todos' && tx.type !== filterType) return false;
    if (filterPaymentMethod !== 'Todos' && tx.paymentMethod !== filterPaymentMethod) return false;
    
    if (searchTerm) {
      const relatedOrder = tx.orderId ? orders.find(o => o.id === tx.orderId) : null;
      const tableText = relatedOrder?.type === 'Salon' && relatedOrder.tableId ? `mesa ${relatedOrder.tableId}` : '';
      const orderIdText = tx.orderId ? tx.orderId.slice(-4) : '';
      const searchString = `${tx.reason} ${tx.amount} ${tableText} ${orderIdText} ${relatedOrder?.customerName || ''} ${relatedOrder?.customerDocument || ''}`.toLowerCase();
      
      if (!searchString.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const calculateBreakdown = () => {
    if (!currentShift) return { initial: 0, incomeCash: 0, incomeOther: 0, expense: 0, totalCash: 0 };
    let incomeCash = 0;
    let incomeOther = 0;
    let expense = 0;
    shiftTransactions.forEach(tx => {
      if (tx.type === 'Ingreso') {
        if (tx.paymentMethod === 'Efectivo' || !tx.paymentMethod) {
          incomeCash += tx.amount;
        } else {
          incomeOther += tx.amount;
        }
      } else {
        expense += tx.amount;
      }
    });
    return {
      initial: currentShift.initialAmount,
      incomeCash,
      incomeOther,
      expense,
      totalCash: currentShift.initialAmount + incomeCash - expense
    };
  };

  const breakdown = calculateBreakdown();

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount) {
      openShift(parseFloat(amount));
      setAmount('');
    }
  };

  const handleCloseShift = () => {
    if (window.confirm('¿Estás seguro de cerrar la caja?')) {
      closeShift(breakdown.totalCash);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && reason) {
      addCashTransaction({
        type: txType,
        amount: parseFloat(amount),
        reason,
        userId: currentUser?.id || ''
      });
      setAmount('');
      setReason('');
    }
  };

  if (currentUser?.role === 'Mesero') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <Lock className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
        <p>Solo Cajeros y Administradores pueden acceder a este módulo.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6">
      {/* Left Column: Shift Status & Actions */}
      <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pb-6 pr-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${currentShift ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-400'}`}>
              {currentShift ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-800">Estado de Caja</h2>
              <p className="text-sm text-zinc-500">{currentShift ? 'Turno Abierto' : 'Turno Cerrado'}</p>
            </div>
          </div>

          {!currentShift ? (
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Monto Inicial (Sencillo)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">S/</span>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors">
                Abrir Turno
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Resumen del Turno</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-zinc-600">
                    <span>Monto Inicial:</span>
                    <span className="font-medium">S/ {breakdown.initial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Ingresos (Efectivo):</span>
                    <span className="font-medium">+ S/ {breakdown.incomeCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Ingresos (Yape/Tarjeta):</span>
                    <span className="font-medium">+ S/ {breakdown.incomeOther.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>Egresos (Gastos):</span>
                    <span className="font-medium">- S/ {breakdown.expense.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-200">
                  <p className="text-sm text-zinc-500 mb-1">Efectivo Esperado en Caja</p>
                  <p className="text-4xl font-bold text-zinc-800 tracking-tight">S/ {breakdown.totalCash.toFixed(2)}</p>
                </div>
              </div>
              <button onClick={handleCloseShift} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors">
                Cerrar Turno
              </button>
            </div>
          )}
        </div>

        {currentShift && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 shrink-0">
            <h3 className="font-bold text-zinc-800 mb-4">Registrar Movimiento (Caja Chica)</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTxType('Egreso')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${txType === 'Egreso' ? 'bg-white text-orange-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  Salida (Gasto)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('Ingreso')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${txType === 'Ingreso' ? 'bg-white text-green-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  Entrada
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">S/</span>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Motivo</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ej: Compra de hielo"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-900 text-white py-2.5 rounded-lg font-medium transition-colors">
                Registrar
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right Column: Transactions List */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex flex-col gap-4">
          <h3 className="font-bold text-zinc-800">Movimientos del Turno Actual</h3>
          
          {currentShift && (
            <div className="flex flex-col gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID, cliente, motivo, mesa o monto..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-zinc-700 font-medium"
                >
                  <option value="Todos">Todos los tipos</option>
                  <option value="Ingreso">Solo Ingresos</option>
                  <option value="Egreso">Solo Egresos</option>
                </select>
                <select
                  value={filterPaymentMethod}
                  onChange={e => setFilterPaymentMethod(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-zinc-700 font-medium"
                >
                  <option value="Todos">Todos los métodos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Yape/Plin">Yape/Plin</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-6">
          {!currentShift ? (
            <div className="h-full flex items-center justify-center text-zinc-400">
              Abre el turno para ver los movimientos
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Search className="w-8 h-8 opacity-20" />
              <p>No se encontraron movimientos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map(tx => {
                const relatedOrder = tx.orderId ? orders.find(o => o.id === tx.orderId) : null;
                return (
                <div key={tx.id} className="flex items-center justify-between p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'Ingreso' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {tx.type === 'Ingreso' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-zinc-800">
                          {tx.reason}
                          {relatedOrder?.type === 'Salon' && relatedOrder.tableId && (
                            <span className="ml-1 font-normal text-zinc-500">
                              - Mesa {relatedOrder.tableId}
                            </span>
                          )}
                        </p>
                        {tx.orderId && (
                          <button 
                            onClick={() => {
                              if (relatedOrder) setSelectedOrder(relatedOrder);
                            }}
                            className="p-1 text-zinc-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                            title="Ver detalles del pedido"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-zinc-500">{new Date(tx.date).toLocaleTimeString()}</p>
                        {tx.paymentMethod && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono font-bold text-lg ${tx.type === 'Ingreso' ? 'text-green-600' : 'text-orange-600'}`}>
                    {tx.type === 'Ingreso' ? '+' : '-'} S/ {tx.amount.toFixed(2)}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-800 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Detalle del Pedido #{selectedOrder.id.slice(-4)}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Cliente</p>
                  <p className="font-bold text-zinc-800">{selectedOrder.customerName || 'Sin nombre'}</p>
                  {selectedOrder.customerDocument && (
                    <p className="text-sm text-zinc-600 mt-1">DNI/RUC: {selectedOrder.customerDocument}</p>
                  )}
                  {selectedOrder.customerAddress && (
                    <p className="text-sm text-zinc-600 mt-1">Dir: {selectedOrder.customerAddress}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500 mb-1">Tipo</p>
                  <p className="font-bold text-zinc-800">{selectedOrder.type}</p>
                  {selectedOrder.paymentMethod && (
                    <p className="text-sm font-medium text-orange-600 mt-1">{selectedOrder.paymentMethod}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200 pb-2">Productos</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start text-zinc-600">
                    <div className="flex flex-col">
                      <div>
                        <span className="font-medium">{item.quantity}x</span> {item.name}
                      </div>
                      {item.isTakeaway && (
                        <span className="text-[10px] font-bold text-orange-500 uppercase">Para Llevar</span>
                      )}
                      {item.notes && (
                        <span className="text-xs text-zinc-400 italic">Nota: {item.notes}</span>
                      )}
                    </div>
                    <span className="font-medium text-zinc-800">S/ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-between items-center">
              <span className="text-zinc-500 font-medium">Total Cobrado</span>
              <span className="text-2xl font-bold text-green-600">S/ {selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
