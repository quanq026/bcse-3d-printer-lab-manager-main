import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  Search,
  History,
  Loader2,
  RefreshCw,
  X,
  Check,
  Trash2,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

const AREAS = ['Mỹ Đình', 'Hòa Lạc'];
const MATERIALS = ['PLA', 'PETG', 'TPU', 'ABS'];

const emptyNew = () => ({
  material: 'PLA',
  color: '',
  brand: '',
  remainingGrams: 1000,
  threshold: 200,
  location: '',
  area: 'Mỹ Đình',
});

const statusLabel: Record<string, string> = {
  'In Stock': 'Còn hàng',
  'Low': 'Sắp hết',
  'Out of Stock': 'Hết hàng',
};

export const AdminInventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editGrams, setEditGrams] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState(emptyNew());

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const filtered = inventory.filter(item =>
    !search ||
    item.color?.toLowerCase().includes(search.toLowerCase()) ||
    item.material?.toLowerCase().includes(search.toLowerCase()) ||
    item.brand?.toLowerCase().includes(search.toLowerCase()) ||
    item.id?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = inventory.filter(i => i.status === 'Low' || i.status === 'Out of Stock').length;
  const totalPLA = inventory.filter(i => i.material === 'PLA').reduce((sum, i) => sum + (i.remainingGrams || 0), 0);
  const totalPETG = inventory.filter(i => i.material === 'PETG').reduce((sum, i) => sum + (i.remainingGrams || 0), 0);

  const stats = [
    { label: 'Tổng PLA', value: `${(totalPLA / 1000).toFixed(1)}kg`, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Tổng PETG', value: `${(totalPETG / 1000).toFixed(1)}kg`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Sắp hết hàng', value: `${lowStock} cuộn`, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Tổng cuộn', value: `${inventory.length}`, icon: History, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await api.updateInventory(id, { remainingGrams: parseFloat(editGrams) });
      await fetchInventory();
      setEditId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa cuộn nhựa này?')) return;
    try {
      await api.deleteInventory(id);
      setInventory(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdd = async () => {
    if (!newItem.color || !newItem.material) return;
    setSaving(true);
    try {
      await api.addInventory(newItem);
      await fetchInventory();
      setShowAdd(false);
      setNewItem(emptyNew());
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const groupedByArea = AREAS.map(area => ({
    area,
    items: filtered.filter(i => (i.area || 'Mỹ Đình') === area),
  })).filter(g => g.items.length > 0 || !search);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Thêm cuộn nhựa mới</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Khu vực</label>
              <select
                value={newItem.area}
                onChange={e => setNewItem({ ...newItem, area: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              >
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Loại nhựa</label>
              <select
                value={newItem.material}
                onChange={e => setNewItem({ ...newItem, material: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              >
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Thương hiệu</label>
              <input
                type="text"
                placeholder="Bambu, Elegoo..."
                value={newItem.brand}
                onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Màu sắc</label>
              <input
                type="text"
                placeholder="Trắng, Đen..."
                value={newItem.color}
                onChange={e => setNewItem({ ...newItem, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Khối lượng (g)</label>
              <input
                type="number"
                value={newItem.remainingGrams}
                onChange={e => setNewItem({ ...newItem, remainingGrams: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ngưỡng cảnh báo (g)</label>
              <input
                type="number"
                value={newItem.threshold}
                onChange={e => setNewItem({ ...newItem, threshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vị trí tủ</label>
              <input
                type="text"
                placeholder="Tủ A1..."
                value={newItem.location}
                onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Lưu
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Danh mục vật liệu</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm màu, thương hiệu, mã..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <Plus size={14} />
            Thêm cuộn mới
          </button>
        </div>
      </div>

      {/* Inventory grouped by area */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      ) : (
        groupedByArea.map(({ area, items }) => (
          <div key={area} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Area header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
              <MapPin size={16} className="text-blue-500" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100">{area}</h4>
              <span className="ml-2 text-xs text-slate-400">{items.length} cuộn</span>
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Chưa có vật liệu nào tại khu vực này</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại nhựa</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thương hiệu</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Màu sắc</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Còn lại</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vị trí tủ</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{item.id}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 font-medium">{item.material}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{item.brand || <span className="text-slate-300">—</span>}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{item.color}</span>
                        </td>
                        <td className="px-6 py-4">
                          {editId === item.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editGrams}
                                onChange={e => setEditGrams(e.target.value)}
                                className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-400 rounded text-xs outline-none"
                                autoFocus
                              />
                              <button onClick={() => saveEdit(item.id)} disabled={saving} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              </button>
                              <button onClick={() => setEditId(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1.5 w-32">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>{item.remainingGrams}g</span>
                                <span>1000g</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    item.remainingGrams < 200 ? "bg-red-500" : item.remainingGrams < 500 ? "bg-amber-500" : "bg-emerald-500"
                                  )}
                                  style={{ width: `${Math.min((item.remainingGrams / 1000) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{item.location || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                            item.status === 'In Stock' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400" :
                              item.status === 'Low' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400" :
                                "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
                          )}>
                            {statusLabel[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditId(item.id); setEditGrams(item.remainingGrams.toString()); }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-all"
                            >
                              Cập nhật
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
