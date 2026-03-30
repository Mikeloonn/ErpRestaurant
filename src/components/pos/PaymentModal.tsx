import React, { useState } from 'react';
import { PaymentMethod } from '../../types';
import { X, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { method: PaymentMethod, customerName: string, customerDocument: string, customerAddress: string }) => void;
  total: number;
  initialCustomerName?: string;
  initialCustomerDocument?: string;
  initialCustomerAddress?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  total,
  initialCustomerName = '',
  initialCustomerDocument = '',
  initialCustomerAddress = ''
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
            <p className="text-4xl font-bold text-green-600">{formatCurrency(total)}</p>
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
