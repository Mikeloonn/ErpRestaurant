import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Category, Product } from '../types';
import { Plus, Edit2, Trash2, X, Check, Layers, Package } from 'lucide-react';
import { formatCurrency, formatRaw, toCents } from '../utils/currency';

export const CatalogView: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('products');

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'products'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
          }`}
        >
          <Package className="w-5 h-5" />
          Productos
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'categories'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
          }`}
        >
          <Layers className="w-5 h-5" />
          Categorías
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'categories' ? (
          <CategoriesManager categories={categories} onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} />
        ) : (
          <ProductsManager products={products} categories={categories} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} />
        )}
      </div>
    </div>
  );
};

// --- Categories Manager ---
const CategoriesManager = ({ categories, onAdd, onUpdate, onDelete }: { 
  categories: Category[], 
  onAdd: (c: Omit<Category, 'id'>) => void, 
  onUpdate: (id: string, c: Partial<Category>) => void, 
  onDelete: (id: string) => void 
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});

  const handleAddClick = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({ name: '' });
  };

  const handleEditClick = (category: Category) => {
    setIsEditing(category.id);
    setIsAdding(false);
    setFormData({ ...category });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({});
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (isAdding) {
      onAdd(formData as Omit<Category, 'id'>);
    } else if (isEditing) {
      onUpdate(isEditing, formData);
    }
    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      onDelete(id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-zinc-800">Gestión de Categorías</h3>
        {!isAdding && !isEditing && (
          <button onClick={handleAddClick} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-6">
          <h4 className="font-bold mb-4">{isAdding ? 'Crear Categoría' : 'Editar Categoría'}</h4>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre de la Categoría</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ej. Combos Broaster"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
              <button onClick={handleSave} disabled={!formData.name} className="p-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50">
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="p-4 font-semibold text-zinc-600">Nombre</th>
              <th className="p-4 font-semibold text-zinc-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                <td className="p-4 font-medium text-zinc-800">{category.name}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(category)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <div className="p-8 text-center text-zinc-500">No hay categorías registradas.</div>}
      </div>
    </div>
  );
};

// --- Products Manager ---
const ProductsManager = ({ products, categories, onAdd, onUpdate, onDelete }: { 
  products: Product[], 
  categories: Category[],
  onAdd: (p: Omit<Product, 'id'>) => void, 
  onUpdate: (id: string, p: Partial<Product>) => void, 
  onDelete: (id: string) => void 
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [priceInput, setPriceInput] = useState('');
  const [modifiersInput, setModifiersInput] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({ name: '', price: 0, stock: 0, minStock: 0, categoryId: categories[0]?.id || '', modifiers: [] });
    setPriceInput('0');
    setModifiersInput('');
  };

  const handleEditClick = (product: Product) => {
    setIsEditing(product.id);
    setIsAdding(false);
    setFormData({ ...product });
    setPriceInput(formatRaw(product.price));
    setModifiersInput(product.modifiers?.join(', ') || '');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({});
    setPriceInput('');
    setModifiersInput('');
  };

  const handleSave = () => {
    if (!formData.name || !formData.categoryId || priceInput === '') return;
    
    const productData = {
      ...formData,
      price: toCents(parseFloat(priceInput)),
      modifiers: modifiersInput.split(',').map(m => m.trim()).filter(m => m !== '')
    } as Omit<Product, 'id'>;

    if (isAdding) {
      onAdd(productData);
    } else if (isEditing) {
      onUpdate(isEditing, productData);
    }
    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      onDelete(id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-zinc-800">Gestión de Productos</h3>
        {!isAdding && !isEditing && (
          <button onClick={handleAddClick} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-6">
          <h4 className="font-bold mb-4">{isAdding ? 'Crear Producto' : 'Editar Producto'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Categoría</label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="" disabled>Seleccione una categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Precio (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Stock Actual</label>
              <input
                type="number"
                min="0"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Stock Mínimo</label>
              <input
                type="number"
                min="0"
                value={formData.minStock || ''}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Modificadores (separados por coma)</label>
              <input
                type="text"
                value={modifiersInput}
                onChange={(e) => setModifiersInput(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Ej. Pechuga, Pierna, Ala, Sin ensalada"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button onClick={handleSave} disabled={!formData.name || !formData.categoryId} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50">
              <Check className="w-4 h-4" /> Guardar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="p-4 font-semibold text-zinc-600">Nombre</th>
              <th className="p-4 font-semibold text-zinc-600">Categoría</th>
              <th className="p-4 font-semibold text-zinc-600">Precio</th>
              <th className="p-4 font-semibold text-zinc-600">Stock</th>
              <th className="p-4 font-semibold text-zinc-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const category = categories.find(c => c.id === product.categoryId);
              return (
                <tr key={product.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-medium text-zinc-800">
                    {product.name}
                    {product.modifiers && product.modifiers.length > 0 && (
                      <div className="text-xs text-zinc-400 mt-1 truncate max-w-xs">{product.modifiers.join(', ')}</div>
                    )}
                  </td>
                  <td className="p-4 text-zinc-600">{category?.name || '---'}</td>
                  <td className="p-4 font-medium">{formatCurrency(product.price)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      product.stock <= 0 ? 'bg-red-100 text-red-800' :
                      product.stock <= product.minStock ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditClick(product)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <div className="p-8 text-center text-zinc-500">No hay productos registrados.</div>}
      </div>
    </div>
  );
};
