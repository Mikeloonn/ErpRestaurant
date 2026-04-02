import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Table, Category, Product, Order, KardexMovement, CashTransaction, CashShift, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateTableStatus: (id: string, status: Table['status'], orderId?: string) => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<any>;
  updateOrderStatus: (id: string, status: Order['status'], paymentData?: { method: PaymentMethod, customerName?: string, customerDocument?: string, customerAddress?: string }) => Promise<void>;
  updateOrder: (id: string, items: Order['items'], total: number, customerName?: string) => Promise<void>;
  addKardexMovement: (movement: Omit<KardexMovement, 'id' | 'date'>) => Promise<void>;
  openShift: (initialAmount: number) => Promise<void>;
  closeShift: (finalAmount: number) => Promise<void>;
  addCashTransaction: (transaction: Omit<CashTransaction, 'id' | 'date'>) => Promise<void>;
  updateProductStock: (id: string, newStock: number) => Promise<void>;
  addProductBatch: (productId: string, quantity: number, expirationDate: string) => Promise<void>;
  removeProductBatch: (productId: string, batchId: string, reason: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'broasteria_erp_data';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kardex, setKardex] = useState<KardexMovement[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);

  // --- CARGA INICIAL DESDE SUPABASE ---
  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.from('users').select('*');
      if (userData) setUsers(userData as User[]);

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData as Category[]);

      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) setProducts(prodData as Product[]);

      const { data: tableData } = await supabase.from('tables').select('*').order('number', { ascending: true });
      if (tableData) setTables(tableData as Table[]);

      const { data: orderData } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
      if (orderData) setOrders(orderData as unknown as Order[]);

      const { data: kardexData } = await supabase.from('kardex_movements').select('*').order('date', { ascending: false });
      if (kardexData) setKardex(kardexData as unknown as KardexMovement[]);

      const { data: cashData } = await supabase.from('cash_transactions').select('*').order('date', { ascending: false });
      if (cashData) setCashTransactions(cashData as unknown as CashTransaction[]);

      const { data: shiftData } = await supabase.from('cash_shifts').select('*').eq('status', 'Abierta').single();
      if (shiftData) setCurrentShift(shiftData as unknown as CashShift);

      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Error fetching data from Supabase", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- AUTENTICACIÓN ---
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setCurrentUser(data.user as User);
        toast.success(`¡Bienvenido de nuevo, ${data.user.name}!`);
        return true;
      } else {
        toast.error(data.message || 'Error en el inicio de sesión');
        return false;
      }
    } catch (err: any) {
      toast.error('Error de conexión con el servidor');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info('Sesión cerrada correctamente');
  };

  // --- GESTIÓN DE USUARIOS ---
  const addUser = async (userData: Omit<User, 'id'>) => {
    const { error } = await supabase.from('users').insert([userData]);
    if (error) throw error;
    fetchData();
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const { error } = await supabase.from('users').update(userData).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  // --- GESTIÓN DE MESAS ---
  const updateTableStatus = async (id: string, status: Table['status'], orderId?: string) => {
    const { error } = await supabase.from('tables').update({ 
      status, 
      current_order_id: status === 'Libre' ? null : (orderId || null) 
    }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  // --- GESTIÓN DE PEDIDOS (TRAVÉS DEL BACKEND) ---
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Manejar errores de validación de Zod con detalle
        if (errorData.errors) {
          const detail = errorData.errors.map((e: any) => e.message).join(', ');
          throw new Error(`Validación: ${detail}`);
        }
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const newOrder = await response.json();
      fetchData(); // Refrescar todo
      toast.success('Pedido creado correctamente');
      return newOrder;
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status'], paymentData?: { method: PaymentMethod, customerName?: string, customerDocument?: string, customerAddress?: string }) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const updateData: any = { status };
    if (paymentData) {
      updateData.payment_method = paymentData.method;
      updateData.customer_name = paymentData.customerName || order.customerName;
      updateData.customer_document = paymentData.customerDocument || order.customerDocument;
      updateData.customer_address = paymentData.customerAddress || order.customerAddress;
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', id);
    if (error) throw error;

    // Si se paga, registrar transacción en caja
    if (status === 'Pagada') {
      await addCashTransaction({
        shift_id: currentShift?.id,
        type: 'Ingreso',
        amount: order.total,
        reason: `Pago de Pedido #${order.id.slice(-4)} (${order.type})${paymentData ? ` - ${paymentData.method}` : ''}`,
        user_id: currentUser?.id,
        order_id: order.id,
        payment_method: paymentData?.method
      } as any);
    }

    fetchData();
  };

  const updateOrder = async (id: string, newItems: Order['items'], additionalTotal: number, customerName?: string) => {
    // Para simplificar, esta actualización compleja debería ir al backend si resta stock
    // Por ahora, solo actualizamos el total y nombre si es necesario
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const { error } = await supabase.from('orders').update({
      total: Number(order.total) + additionalTotal,
      customer_name: customerName !== undefined ? customerName : order.customerName,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    
    if (error) throw error;
    fetchData();
  };

  // --- KARDEX Y STOCK ---
  const addKardexMovement = async (movement: Omit<KardexMovement, 'id' | 'date'>) => {
    const { error } = await supabase.from('kardex_movements').insert([movement]);
    if (error) throw error;
    fetchData();
  };

  const updateProductStock = async (id: string, newStock: number) => {
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const addProductBatch = async (productId: string, quantity: number, expirationDate: string) => {
    const { error } = await supabase.from('product_batches').insert([{
      product_id: productId,
      quantity,
      expiration_date: expirationDate
    }]);
    if (error) throw error;
    
    // Actualizar stock del producto
    const product = products.find(p => p.id === productId);
    if (product) {
      await updateProductStock(productId, product.stock + quantity);
    }
  };

  const removeProductBatch = async (productId: string, batchId: string, reason: string) => {
    const { error } = await supabase.from('product_batches').delete().eq('id', batchId);
    if (error) throw error;
    fetchData();
  };

  // --- CAJA Y TURNOS ---
  const openShift = async (initialAmount: number) => {
    if (!currentUser) return;
    const { error } = await supabase.from('cash_shifts').insert([{
      opened_by: currentUser.id,
      initial_amount: initialAmount,
      status: 'Abierta'
    }]);
    if (error) throw error;
    fetchData();
  };

  const closeShift = async (finalAmount: number) => {
    if (!currentShift || !currentUser) return;
    const { error } = await supabase.from('cash_shifts').update({
      closed_by: currentUser.id,
      final_amount: finalAmount,
      status: 'Cerrada',
      closed_at: new Date().toISOString()
    }).eq('id', currentShift.id);
    if (error) throw error;
    fetchData();
  };

  const addCashTransaction = async (transaction: any) => {
    const { error } = await supabase.from('cash_transactions').insert([{
      ...transaction,
      shift_id: currentShift?.id || transaction.shift_id
    }]);
    if (error) throw error;
    fetchData();
  };

  // --- CATEGORÍAS Y PRODUCTOS ---
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const { error } = await supabase.from('categories').insert([categoryData]);
    if (error) throw error;
    fetchData();
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    const { error } = await supabase.from('categories').update(categoryData).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert([{
      category_id: productData.categoryId,
      name: productData.name,
      price: productData.price,
      stock: productData.stock,
      min_stock: productData.minStock,
      modifiers: productData.modifiers
    }]);
    if (error) throw error;
    fetchData();
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updatePayload: any = { ...productData };
    if (productData.categoryId) {
      updatePayload.category_id = productData.categoryId;
      delete updatePayload.categoryId;
    }
    if (productData.minStock !== undefined) {
      updatePayload.min_stock = productData.minStock;
      delete updatePayload.minStock;
    }

    const { error } = await supabase.from('products').update(updatePayload).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    fetchData();
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
