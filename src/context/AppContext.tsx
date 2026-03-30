import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Table, Category, Product, Order, KardexMovement, CashTransaction, CashShift, PaymentMethod } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  tables: Table[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  kardex: KardexMovement[];
  cashTransactions: CashTransaction[];
  currentShift: CashShift | null;
}

interface AppContextType extends AppState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  updateTableStatus: (id: string, status: Table['status'], orderId?: string) => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (id: string, status: Order['status'], paymentData?: { method: PaymentMethod, customerName?: string, customerDocument?: string, customerAddress?: string }) => void;
  updateOrder: (id: string, items: Order['items'], total: number, customerName?: string) => void;
  addKardexMovement: (movement: Omit<KardexMovement, 'id' | 'date'>) => void;
  openShift: (initialAmount: number) => void;
  closeShift: (finalAmount: number) => void;
  addCashTransaction: (transaction: Omit<CashTransaction, 'id' | 'date'>) => void;
  updateProductStock: (id: string, newStock: number) => void;
  addProductBatch: (productId: string, quantity: number, expirationDate: string) => void;
  removeProductBatch: (productId: string, batchId: string, reason: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const initialUsers: User[] = [
  { id: 'u1', name: 'Admin', username: 'admin', role: 'Administrador', password: '123' },
  { id: 'u2', name: 'Juan (Cajero)', username: 'juan', role: 'Cajero', password: '123' },
  { id: 'u3', name: 'Maria (Mesera)', username: 'maria', role: 'Mesero', password: '123' },
];

const initialTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `t${i + 1}`,
  number: i + 1,
  status: 'Libre',
}));

const initialCategories: Category[] = [
  { id: 'c1', name: 'Combos Broaster' },
  { id: 'c2', name: 'Bebidas' },
  { id: 'c3', name: 'Extras' },
];

const initialProducts: Product[] = [
  { id: 'p1', categoryId: 'c1', name: 'Cuarto de Broaster', price: 1500, stock: 50, minStock: 10, modifiers: ['Pechuga', 'Pierna', 'Ala', 'Ensalada cocida', 'Ensalada fresca', 'Sin ensalada'] },
  { id: 'p2', categoryId: 'c1', name: 'Octavo de Broaster', price: 1000, stock: 50, minStock: 10, modifiers: ['Pechuga', 'Pierna', 'Ala', 'Ensalada cocida', 'Ensalada fresca', 'Sin ensalada'] },
  { id: 'p3', categoryId: 'c2', name: 'Gaseosa 1L', price: 800, stock: 24, minStock: 12, modifiers: ['Helada', 'Sin helar'] },
  { id: 'p4', categoryId: 'c2', name: 'Chicha Morada 1L', price: 1000, stock: 15, minStock: 5, modifiers: [] },
  { id: 'p5', categoryId: 'c3', name: 'Porción de Papas', price: 600, stock: 100, minStock: 20, modifiers: ['Bien fritas', 'Normales'] },
];

const STORAGE_KEY = 'broasteria_erp_data';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kardex, setKardex] = useState<KardexMovement[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);

  // Cargar datos al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.tables) setTables(parsed.tables);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.kardex) setKardex(parsed.kardex);
        if (parsed.cashTransactions) setCashTransactions(parsed.cashTransactions);
        if (parsed.currentShift) setCurrentShift(parsed.currentShift);
      } catch (e) {
        console.error("Error loading data from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    if (isLoaded) {
      const dataToSave = {
        users,
        tables,
        categories,
        products,
        orders,
        kardex,
        cashTransactions,
        currentShift
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [users, tables, categories, products, orders, kardex, cashTransactions, currentShift, isLoaded]);

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateTableStatus = (id: string, status: Table['status'], orderId?: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          currentOrderId: status === 'Libre' ? undefined : (orderId !== undefined ? orderId : t.currentOrderId)
        };
      }
      return t;
    }));
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      status: 'Abierta',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    
    if (newOrder.type === 'Salon' && newOrder.tableId) {
      updateTableStatus(newOrder.tableId, 'Ocupada', newOrder.id);
    }

    // Deduct stock
    newOrder.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateProductStock(product.id, product.stock - item.quantity);
        addKardexMovement({
          productId: product.id,
          type: 'Salida',
          quantity: item.quantity,
          reason: `Venta Ticket #${newOrder.id}`,
          userId: currentUser?.id || 'system'
        });
      }
    });
  };

  const updateOrderStatus = (id: string, status: Order['status'], paymentData?: { method: PaymentMethod, customerName?: string, customerDocument?: string, customerAddress?: string }) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    // Prevent double-processing if it's already in the target status
    if (order.status === status) return;

    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status,
          ...(paymentData ? {
            paymentMethod: paymentData.method,
            customerName: paymentData.customerName || o.customerName,
            customerDocument: paymentData.customerDocument || o.customerDocument,
            customerAddress: paymentData.customerAddress || o.customerAddress,
          } : {})
        };
      }
      return o;
    }));
    
    if (order.tableId && (status === 'Pagada' || status === 'Anulada')) {
      updateTableStatus(order.tableId, 'Libre', undefined);
    }
    if (order.tableId && status === 'Precuenta') {
      updateTableStatus(order.tableId, 'Precuenta', order.id);
    }

    // Automatically register income in Caja when an order is paid
    if (status === 'Pagada') {
      addCashTransaction({
        type: 'Ingreso',
        amount: order.total,
        reason: `Pago de Pedido #${order.id.slice(-4)} (${order.type})${paymentData ? ` - ${paymentData.method}` : ''}`,
        userId: currentUser?.id || 'system',
        orderId: order.id,
        paymentMethod: paymentData?.method
      });
    }
  };

  const updateOrder = (id: string, newItems: Order['items'], additionalTotal: number, customerName?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          items: [...o.items, ...newItems],
          total: o.total + additionalTotal,
          customerName: customerName !== undefined ? customerName : o.customerName,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    // Deduct stock for new items
    newItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateProductStock(product.id, product.stock - item.quantity);
        addKardexMovement({
          productId: product.id,
          type: 'Salida',
          quantity: item.quantity,
          reason: `Adición a Ticket #${id}`,
          userId: currentUser?.id || 'system'
        });
      }
    });
  };

  const addKardexMovement = (movement: Omit<KardexMovement, 'id' | 'date'>) => {
    const newMovement: KardexMovement = {
      ...movement,
      id: `kdx-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setKardex(prev => [newMovement, ...prev]);
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      
      const diff = newStock - p.stock;
      let updatedBatches = [...(p.batches || [])];

      if (diff < 0) {
        // Deducting stock: FIFO (First In, First Out) based on expiration date
        let remainingToDeduct = Math.abs(diff);
        updatedBatches.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

        for (let i = 0; i < updatedBatches.length; i++) {
          if (remainingToDeduct <= 0) break;
          if (updatedBatches[i].quantity <= remainingToDeduct) {
            remainingToDeduct -= updatedBatches[i].quantity;
            updatedBatches[i].quantity = 0;
          } else {
            updatedBatches[i].quantity -= remainingToDeduct;
            remainingToDeduct = 0;
          }
        }
        updatedBatches = updatedBatches.filter(b => b.quantity > 0);
      } else if (diff > 0) {
        updatedBatches.push({
          id: `b-${Date.now()}`,
          quantity: diff,
          expirationDate: '2099-12-31',
          dateAdded: new Date().toISOString()
        });
      }

      return { ...p, stock: newStock, batches: updatedBatches };
    }));
  };

  const addProductBatch = (productId: string, quantity: number, expirationDate: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const newBatch = {
        id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        quantity,
        expirationDate,
        dateAdded: new Date().toISOString()
      };
      return {
        ...p,
        stock: p.stock + quantity,
        batches: [...(p.batches || []), newBatch]
      };
    }));
    
    addKardexMovement({
      productId,
      type: 'Entrada',
      quantity,
      reason: `Ingreso de Lote (Vence: ${expirationDate})`,
      userId: currentUser?.id || 'system'
    });
  };

  const removeProductBatch = (productId: string, batchId: string, reason: string) => {
    let quantityToRemove = 0;
    
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const batchToRemove = p.batches?.find(b => b.id === batchId);
      if (!batchToRemove) return p;

      quantityToRemove = batchToRemove.quantity;

      return {
        ...p,
        stock: p.stock - quantityToRemove,
        batches: p.batches?.filter(b => b.id !== batchId)
      };
    }));

    if (quantityToRemove > 0) {
      addKardexMovement({
        productId,
        type: 'Salida',
        quantity: quantityToRemove,
        reason: reason,
        userId: currentUser?.id || 'system'
      });
    }
  };

  const openShift = (initialAmount: number) => {
    if (!currentUser) return;
    setCurrentShift({
      id: `shift-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy: currentUser.id,
      initialAmount,
      status: 'Abierta'
    });
  };

  const closeShift = (finalAmount: number) => {
    if (!currentShift || !currentUser) return;
    setCurrentShift({
      ...currentShift,
      closedAt: new Date().toISOString(),
      closedBy: currentUser.id,
      finalAmount,
      status: 'Cerrada'
    });
    setCurrentShift(null);
  };

  const addCashTransaction = (transaction: Omit<CashTransaction, 'id' | 'date'>) => {
    const newTx: CashTransaction = {
      ...transaction,
      id: `ctx-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setCashTransactions(prev => [newTx, ...prev]);
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `c${Date.now()}`,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...categoryData } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p${Date.now()}`,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, tables, categories, products, orders, kardex, cashTransactions, currentShift,
      login, logout, addUser, updateUser, deleteUser, updateTableStatus, createOrder, updateOrderStatus, updateOrder, addKardexMovement,
      openShift, closeShift, addCashTransaction, updateProductStock, addProductBatch, removeProductBatch,
      addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
