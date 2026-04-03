import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Table, Category, Product, Order, KardexMovement, CashTransaction, CashShift, PaymentMethod, ProductBatch } from '../types';
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
  addCashTransaction: (transaction: Partial<CashTransaction>) => Promise<void>;
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.from('users').select('*');
      if (userData) setUsers(userData as User[]);

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData as Category[]);

      const { data: allBatchesData } = await supabase.from('product_batches').select('*');
      const allBatches = allBatchesData || [];

      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) {
        setProducts(prodData.map((p: any) => ({
          ...p,
          categoryId: p.category_id,
          minStock: p.min_stock,
          batches: allBatches
            .filter((b: any) => b.product_id === p.id)
            .map((b: any) => ({
              id: b.id,
              quantity: b.quantity,
              expirationDate: b.expiration_date,
              dateAdded: b.date_added,
              productId: b.product_id
            }))
        })));
      }

      const { data: tableData } = await supabase.from('tables').select('*').order('number', { ascending: true });
      if (tableData) {
        setTables(tableData.map((t: any) => ({
          ...t,
          currentOrderId: t.current_order_id
        })));
      }

      const { data: orderData } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
      if (orderData) {
        setOrders(orderData.map((o: any) => ({
          ...o,
          tableId: o.table_id,
          customerName: o.customer_name,
          customerDocument: o.customer_document,
          customerAddress: o.customer_address,
          customerPhone: o.customer_phone,
          clientOrderId: o.client_order_id,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          paymentMethod: o.payment_method,
          items: o.items.map((i: any) => ({
            ...i,
            productId: i.product_id,
            isTakeaway: i.is_takeaway
          }))
        })));
      }

      const { data: kardexData } = await supabase.from('kardex_movements').select('*').order('date', { ascending: false });
      if (kardexData) {
        setKardex(kardexData.map((k: any) => ({
          ...k,
          productId: k.product_id,
          userId: k.user_id
        })));
      }

      const { data: cashData } = await supabase.from('cash_transactions').select('*').order('date', { ascending: false });
      if (cashData) {
        setCashTransactions(cashData.map((ct: any) => ({
          ...ct,
          shiftId: ct.shift_id,
          userId: ct.user_id,
          orderId: ct.order_id,
          paymentMethod: ct.payment_method
        })));
      }

      const { data: shiftData } = await supabase.from('cash_shifts').select('*').eq('status', 'Abierta').single();
      if (shiftData) {
        setCurrentShift({
          ...shiftData,
          openedBy: shiftData.opened_by,
          closedBy: shiftData.closed_by,
          initialAmount: shiftData.initial_amount,
          finalAmount: shiftData.final_amount,
          openedAt: shiftData.opened_at,
          closedAt: shiftData.closed_at
        } as CashShift);
      } else {
        setCurrentShift(null);
      }

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

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setCurrentUser(data.user as User);
        toast.success(`¡Bienvenido, ${data.user.name}!`);
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
    toast.info('Sesión cerrada');
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Usuario creado con éxito');
        fetchData();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
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

  const updateTableStatus = async (id: string, status: Table['status'], orderId?: string) => {
    const { error } = await supabase.from('tables').update({ 
      status, 
      current_order_id: status === 'Libre' ? null : (orderId || null) 
    }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    try {
      const clientOrderId = crypto.randomUUID();
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, clientOrderId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const detail = errorData.errors.map((e: any) => e.message).join(', ');
          throw new Error(`Validación: ${detail}`);
        }
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const newOrder = await response.json();
      fetchData();
      toast.success('Pedido creado');
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

    if (status === 'Pagada') {
      await addCashTransaction({
        type: 'Ingreso',
        amount: order.total,
        reason: `Pago de Pedido #${order.id.slice(-4)}`,
        orderId: order.id,
        paymentMethod: paymentData?.method
      });
    }
    fetchData();
  };

  const updateOrder = async (id: string, newItems: Order['items'], additionalTotal: number, customerName?: string) => {
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

  const addKardexMovement = async (movement: Omit<KardexMovement, 'id' | 'date'>) => {
    // CORRECCIÓN: Si no hay un ID de usuario válido, enviamos null (Supabase lo permite)
    const validUserId = (movement.userId && movement.userId.length > 10) ? movement.userId : null;

    const { error } = await supabase.from('kardex_movements').insert([{
      product_id: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      user_id: validUserId
    }]);
    if (error) throw error;
    fetchData();
  };

  const updateProductStock = async (id: string, newStock: number) => {
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const addProductBatch = async (productId: string, quantity: number, expirationDate: string) => {
    try {
      const { error: batchError } = await supabase.from('product_batches').insert([{
        product_id: productId,
        quantity,
        expiration_date: expirationDate
      }]);
      if (batchError) throw batchError;

      const { data: prodData } = await supabase.from('products').select('stock').eq('id', productId).single();
      const currentStock = prodData ? Number(prodData.stock) : 0;

      await updateProductStock(productId, currentStock + quantity);

      // CORRECCIÓN: Pasar el ID real del usuario o null
      await addKardexMovement({
        productId,
        type: 'Entrada',
        quantity,
        reason: `Ingreso de Lote (Vence: ${expirationDate})`,
        userId: currentUser?.id || ''
      });

      toast.success('Lote registrado e inventario actualizado');
      await fetchData();
    } catch (err: any) {
      toast.error('Error al registrar lote: ' + err.message);
    }
  };

  const removeProductBatch = async (productId: string, batchId: string, reason: string) => {
    const { error } = await supabase.from('product_batches').delete().eq('id', batchId);
    if (error) throw error;
    fetchData();
  };

  const openShift = async (initialAmount: number) => {
    if (!currentUser) return;
    const { error } = await supabase.from('cash_shifts').insert([{
      opened_by: currentUser.id,
      initial_amount: initialAmount,
      status: 'Abierta'
    }]);
    if (error) throw error;
    fetchData();
    toast.success('Turno de caja abierto');
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
    toast.info('Turno de caja cerrado');
  };

  const addCashTransaction = async (transaction: Partial<CashTransaction>) => {
    const validUserId = (transaction.userId && transaction.userId.length > 10) ? transaction.userId : (currentUser?.id || null);

    const { error } = await supabase.from('cash_transactions').insert([{
      shift_id: currentShift?.id || (transaction as any).shiftId,
      type: transaction.type,
      amount: transaction.amount,
      reason: transaction.reason,
      user_id: validUserId,
      order_id: transaction.orderId,
      payment_method: transaction.paymentMethod
    }]);
    if (error) throw error;
    fetchData();
  };

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
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
