import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, AlertTriangle, ArrowDownRight, ArrowUpRight, Calendar, Plus, Trash2 } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, kardex, addKardexMovement, updateProductStock, addProductBatch, removeProductBatch, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Stock' | 'Kardex' | 'Toma' | 'Vencimientos'>('Stock');

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  // Calculate expiring products (within 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const expiringBatches = products.flatMap(p => 
    (p.batches || []).map(b => ({
      ...b,
      productName: p.name,
      productId: p.id
    }))
  ).filter(b => {
    const expDate = new Date(b.expirationDate);
    return expDate <= nextWeek && expDate >= today;
  }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  const expiredBatches = products.flatMap(p => 
    (p.batches || []).map(b => ({
      ...b,
      productName: p.name,
      productId: p.id
    }))
  ).filter(b => {
    const expDate = new Date(b.expirationDate);
    return expDate < today;
  }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <TabButton active={activeTab === 'Stock'} onClick={() => setActiveTab('Stock')} label="Stock Actual" />
          <TabButton active={activeTab === 'Vencimientos'} onClick={() => setActiveTab('Vencimientos')} label="Lotes y Vencimientos" />
          <TabButton active={activeTab === 'Kardex'} onClick={() => setActiveTab('Kardex')} label="Kardex (Movimientos)" />
          <TabButton active={activeTab === 'Toma'} onClick={() => setActiveTab('Toma')} label="Toma de Inventario" />
        </div>
        
        <div className="flex gap-2">
          {expiredBatches.length > 0 && (
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg border border-red-200 font-medium text-sm">
              <AlertTriangle className="w-4 h-4" />
              {expiredBatches.length} lotes vencidos
            </div>
          )}
          {expiringBatches.length > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200 font-medium text-sm">
              <Calendar className="w-4 h-4" />
              {expiringBatches.length} lotes por vencer
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg border border-orange-200 font-medium text-sm">
              <AlertTriangle className="w-4 h-4" />
              {lowStockProducts.length} stock bajo
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
        {activeTab === 'Stock' && <StockList products={products} />}
        {activeTab === 'Vencimientos' && <ExpirationsList products={products} addProductBatch={addProductBatch} removeProductBatch={removeProductBatch} expiringBatches={expiringBatches} expiredBatches={expiredBatches} />}
        {activeTab === 'Kardex' && <KardexList kardex={kardex} products={products} />}
        {activeTab === 'Toma' && <InventoryTake products={products} updateProductStock={updateProductStock} addKardexMovement={addKardexMovement} userId={currentUser?.id || ''} />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-xl font-medium transition-all ${
      active 
        ? 'bg-zinc-800 text-white' 
        : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
    }`}
  >
    {label}
  </button>
);

const StockList = ({ products }: { products: any[] }) => (
  <div className="overflow-auto flex-1 p-6">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b-2 border-zinc-100 text-zinc-500">
          <th className="pb-3 font-medium">Producto</th>
          <th className="pb-3 font-medium text-right">Stock Actual</th>
          <th className="pb-3 font-medium text-right">Stock Mínimo</th>
          <th className="pb-3 font-medium text-center">Estado</th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50">
            <td className="py-4 font-medium text-zinc-800">{p.name}</td>
            <td className="py-4 text-right font-mono text-lg">{p.stock}</td>
            <td className="py-4 text-right text-zinc-500">{p.minStock}</td>
            <td className="py-4 text-center">
              {p.stock <= p.minStock ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3" /> Bajo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Normal
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ExpirationsList = ({ products, addProductBatch, removeProductBatch, expiringBatches, expiredBatches }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ productId: '', quantity: '', expirationDate: '' });
  const [batchToDiscard, setBatchToDiscard] = useState<{productId: string, batchId: string, isExpired: boolean} | null>(null);

  const handleSave = () => {
    if (!formData.productId || !formData.quantity || !formData.expirationDate) return;
    addProductBatch(formData.productId, parseInt(formData.quantity), formData.expirationDate);
    setIsAdding(false);
    setFormData({ productId: '', quantity: '', expirationDate: '' });
  };

  const handleDiscard = (productId: string, batchId: string, isExpired: boolean) => {
    setBatchToDiscard({ productId, batchId, isExpired });
  };

  const confirmDiscard = () => {
    if (!batchToDiscard) return;
    const reason = batchToDiscard.isExpired ? 'Descarte por Vencimiento' : 'Descarte Manual de Lote';
    removeProductBatch(batchToDiscard.productId, batchToDiscard.batchId, reason);
    setBatchToDiscard(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
        <div>
          <h3 className="text-lg font-bold text-zinc-800">Control de Lotes y Vencimientos</h3>
          <p className="text-sm text-zinc-500">Registra ingresos con fecha de caducidad (Método FIFO).</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Registrar Ingreso (Lote)
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-zinc-200 bg-white">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Producto</label>
              <select 
                value={formData.productId}
                onChange={e => setFormData({...formData, productId: e.target.value})}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Seleccione un producto...</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Cantidad</label>
              <input 
                type="number" 
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Fecha de Vencimiento</label>
              <input 
                type="date" 
                value={formData.expirationDate}
                onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button 
              onClick={handleSave}
              disabled={!formData.productId || !formData.quantity || !formData.expirationDate}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 h-[42px]"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {batchToDiscard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-zinc-800 mb-2">Confirmar Retiro</h3>
              <p className="text-zinc-600 mb-6">
                ¿Estás seguro de que deseas retirar este lote del inventario? Se registrará como "{batchToDiscard.isExpired ? 'Descarte por Vencimiento' : 'Descarte Manual de Lote'}".
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setBatchToDiscard(null)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDiscard}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Sí, retirar lote
                </button>
              </div>
            </div>
          </div>
        )}

        {expiredBatches.length > 0 && (
          <div className="mb-8">
            <h4 className="text-red-700 font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Lotes Vencidos (¡Retirar!)
            </h4>
            <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-red-100/50 text-red-800 text-sm">
                  <tr>
                    <th className="p-3 font-medium">Producto</th>
                    <th className="p-3 font-medium">Lote ID</th>
                    <th className="p-3 font-medium text-right">Cantidad Restante</th>
                    <th className="p-3 font-medium text-right">Venció el</th>
                    <th className="p-3 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredBatches.map((b: any) => (
                    <tr key={b.id} className="border-t border-red-100">
                      <td className="p-3 font-bold text-red-900">{b.productName}</td>
                      <td className="p-3 text-red-700 font-mono text-xs">{b.id}</td>
                      <td className="p-3 text-right font-bold text-red-900">{b.quantity}</td>
                      <td className="p-3 text-right text-red-700">{new Date(b.expirationDate).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleDiscard(b.productId, b.id, true)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          title="Retirar lote vencido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {expiringBatches.length > 0 && (
          <div className="mb-8">
            <h4 className="text-yellow-700 font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Por Vencer (Próximos 7 días)
            </h4>
            <div className="bg-yellow-50 rounded-xl border border-yellow-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-yellow-100/50 text-yellow-800 text-sm">
                  <tr>
                    <th className="p-3 font-medium">Producto</th>
                    <th className="p-3 font-medium">Lote ID</th>
                    <th className="p-3 font-medium text-right">Cantidad Restante</th>
                    <th className="p-3 font-medium text-right">Vence el</th>
                    <th className="p-3 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringBatches.map((b: any) => (
                    <tr key={b.id} className="border-t border-yellow-100">
                      <td className="p-3 font-bold text-yellow-900">{b.productName}</td>
                      <td className="p-3 text-yellow-700 font-mono text-xs">{b.id}</td>
                      <td className="p-3 text-right font-bold text-yellow-900">{b.quantity}</td>
                      <td className="p-3 text-right text-yellow-700">{new Date(b.expirationDate).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleDiscard(b.productId, b.id, false)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
                          title="Retirar lote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-zinc-800 font-bold mb-3">Todos los Lotes Activos</h4>
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 text-zinc-600 text-sm">
                <tr>
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 font-medium">Lote ID</th>
                  <th className="p-3 font-medium text-right">Cantidad Restante</th>
                  <th className="p-3 font-medium text-right">Vencimiento</th>
                  <th className="p-3 font-medium text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {products.flatMap((p: any) => 
                  (p.batches || []).map((b: any) => ({ ...b, productName: p.name, productId: p.id }))
                ).filter((b: any) => b.quantity > 0).sort((a: any, b: any) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()).map((b: any) => (
                  <tr key={b.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                    <td className="p-3 font-medium text-zinc-800">{b.productName}</td>
                    <td className="p-3 text-zinc-500 font-mono text-xs">{b.id}</td>
                    <td className="p-3 text-right font-medium text-zinc-800">{b.quantity}</td>
                    <td className="p-3 text-right text-zinc-600">{new Date(b.expirationDate).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                        <button 
                          onClick={() => handleDiscard(b.productId, b.id, false)}
                          className="text-zinc-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Retirar lote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const KardexList = ({ kardex, products }: { kardex: any[], products: any[] }) => (
  <div className="overflow-auto flex-1 p-6">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b-2 border-zinc-100 text-zinc-500">
          <th className="pb-3 font-medium">Fecha</th>
          <th className="pb-3 font-medium">Producto</th>
          <th className="pb-3 font-medium">Tipo</th>
          <th className="pb-3 font-medium text-right">Cant.</th>
          <th className="pb-3 font-medium">Motivo</th>
        </tr>
      </thead>
      <tbody>
        {kardex.map((k: any) => {
          const product = products.find(p => p.id === k.productId);
          return (
            <tr key={k.id} className="border-b border-zinc-100 hover:bg-zinc-50">
              <td className="py-3 text-sm text-zinc-500">{new Date(k.date).toLocaleString()}</td>
              <td className="py-3 font-medium text-zinc-800">{product?.name || 'Desconocido'}</td>
              <td className="py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                  k.type === 'Entrada' ? 'bg-green-100 text-green-700' :
                  k.type === 'Salida' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {k.type === 'Entrada' ? <ArrowDownRight className="w-3 h-3" /> : 
                   k.type === 'Salida' ? <ArrowUpRight className="w-3 h-3" /> : null}
                  {k.type}
                </span>
              </td>
              <td className="py-3 text-right font-mono font-medium">{k.type === 'Salida' ? '-' : '+'}{k.quantity}</td>
              <td className="py-3 text-sm text-zinc-600">{k.reason}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const InventoryTake = ({ products, updateProductStock, addKardexMovement, userId }: any) => {
  const [counts, setCounts] = useState<Record<string, string>>({});

  const handleSave = () => {
    Object.entries(counts).forEach(([productId, countStr]) => {
      const count = parseInt(countStr as string);
      if (isNaN(count)) return;

      const product = products.find((p: any) => p.id === productId);
      if (!product) return;

      const diff = count - product.stock;
      if (diff !== 0) {
        addKardexMovement({
          productId,
          type: diff > 0 ? 'Entrada' : 'Salida',
          quantity: Math.abs(diff),
          reason: 'Ajuste por Toma de Inventario',
          userId: String(userId)
        });
        updateProductStock(productId, count);
      }
    });
    setCounts({});
    alert("Inventario actualizado correctamente");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-200 bg-zinc-50">
        <h3 className="font-bold text-zinc-800">Toma de Inventario Físico</h3>
        <p className="text-sm text-zinc-500 mt-1">Ingresa la cantidad real contada en almacén/refrigeradora.</p>
      </div>
      <div className="overflow-auto flex-1 p-6">
        <div className="grid gap-4 max-w-2xl">
          {products.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl hover:border-orange-300 transition-colors">
              <div>
                <div className="font-bold text-zinc-800">{p.name}</div>
                <div className="text-sm text-zinc-500">Stock en sistema: {p.stock}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-zinc-600">Conteo Real:</label>
                <input
                  type="number"
                  min="0"
                  value={counts[p.id] || ''}
                  onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })}
                  className="w-24 px-3 py-2 border border-zinc-300 rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={p.stock.toString()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 border-t border-zinc-200 bg-white">
        <button
          onClick={handleSave}
          className="bg-zinc-800 hover:bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold transition-colors"
        >
          Guardar Ajustes
        </button>
      </div>
    </div>
  );
};
