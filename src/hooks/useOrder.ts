import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Table, OrderType, Product } from '../types';

export const useOrder = (table?: Table, existingOrderId?: string, orderType: OrderType = 'Salon') => {
  const { categories, products, createOrder, updateOrder, updateOrderStatus, orders, currentUser } = useAppContext();
  
  const existingOrder = existingOrderId 
    ? orders.find(o => o.id === existingOrderId) 
    : (table?.currentOrderId ? orders.find(o => o.id === table.currentOrderId) : null);

  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const [customerName, setCustomerName] = useState(existingOrder?.customerName || '');
  const [defaultIsTakeaway, setDefaultIsTakeaway] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, { 
      ...product, 
      cartId: Date.now(), 
      quantity: 1, 
      notes: '', 
      isTakeaway: defaultIsTakeaway 
    }]);
  };

  const removeFromCart = (cartId: number) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartItemQuantity = (cartId: number, delta: number) => {
    setCart(prev => prev.map(item => 
      item.cartId === cartId 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
        : item
    ));
  };

  const toggleItemTakeaway = (cartId: number) => {
    setCart(prev => prev.map(item => 
      item.cartId === cartId 
        ? { ...item, isTakeaway: !item.isTakeaway } 
        : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 
                (existingOrder ? existingOrder.total : 0);

  const handleSendOrder = (onSuccess: () => void) => {
    if (cart.length === 0 && existingOrder && customerName !== existingOrder.customerName) {
      updateOrder(existingOrder.id, [], 0, customerName);
      onSuccess();
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
    const additionalTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
    onSuccess();
  };

  const handlePrecuenta = (onSuccess: () => void) => {
    if (existingOrder) {
      updateOrderStatus(existingOrder.id, 'Precuenta');
      onSuccess();
    }
  };

  return {
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
  };
};
