import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Role } from '../types';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useAppContext();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Only Admin can see this view
  if (currentUser?.role !== 'Administrador') {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-zinc-500">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  const handleAddClick = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({ name: '', username: '', password: '', role: 'Mesero' });
  };

  const handleEditClick = (user: User) => {
    setIsEditing(user.id);
    setIsAdding(false);
    setFormData({ ...user, password: '' }); // Don't show password, but allow changing it
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({});
  };

  const handleSave = () => {
    if (!formData.name || !formData.username || !formData.role) return;

    if (isAdding) {
      if (!formData.password) return; // Password required for new users
      addUser(formData as Omit<User, 'id'>);
    } else if (isEditing) {
      updateUser(isEditing, formData);
    }

    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      deleteUser(id);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Gestión de Usuarios</h2>
        {!isAdding && !isEditing && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-6">
          <h3 className="text-lg font-bold mb-4">
            {isAdding ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ej. juanp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Contraseña {isEditing && <span className="text-xs text-zinc-500 font-normal">(Dejar en blanco para no cambiar)</span>}
              </label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Rol</label>
              <select
                value={formData.role || 'Mesero'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="Administrador">Administrador</option>
                <option value="Cajero">Cajero</option>
                <option value="Mesero">Mesero</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.username || (isAdding && !formData.password)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="p-4 font-semibold text-zinc-600">Nombre</th>
              <th className="p-4 font-semibold text-zinc-600">Usuario</th>
              <th className="p-4 font-semibold text-zinc-600">Rol</th>
              <th className="p-4 font-semibold text-zinc-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                <td className="p-4 font-medium text-zinc-800">{user.name}</td>
                <td className="p-4 text-zinc-600">{user.username}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'Administrador' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'Cajero' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            No hay usuarios registrados.
          </div>
        )}
      </div>
    </div>
  );
};
