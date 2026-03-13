import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  MapPin,
  Upload,
  X,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

const MATERIAL_OPTIONS = ['PLA', 'PETG', 'TPU', 'ABS'];
const STATUS_OPTIONS = ['Available', 'Busy', 'Maintenance'];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Busy: 'bg-amber-50 text-amber-700 border-amber-200',
    Maintenance: 'bg-red-50 text-red-600 border-red-200',
  };
  return map[status] || 'bg-slate-50 text-slate-500 border-slate-200';
};

const statusLabel: Record<string, string> = {
  Available: 'Sẵn sàng',
  Busy: 'Đang bận',
  Maintenance: 'Bảo trì',
};

const defaultForm = {
  name: '',
  buildVolume: '',
  supportedMaterials: ['PLA'] as string[],
  status: 'Available',
  location: 'Mỹ Đình',
  imageUrl: '',
  hasAMS: false,
};

export const AdminPrinters: React.FC = () => {
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const data = await api.getPrinters();
      setPrinters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrinters(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...defaultForm });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      buildVolume: p.buildVolume,
      supportedMaterials: p.supportedMaterials || ['PLA'],
      status: p.status,
      location: p.location || 'Mỹ Đình',
      imageUrl: p.imageUrl || '',
      hasAMS: !!p.hasAMS,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const result = await api.uploadPrinterImage(file);
      setForm(f => ({ ...f, imageUrl: result.url }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const toggleMaterial = (m: string) => {
    setForm(f => ({
      ...f,
      supportedMaterials: f.supportedMaterials.includes(m)
        ? f.supportedMaterials.filter(x => x !== m)
        : [...f.supportedMaterials, m],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.buildVolume) { alert('Vui lòng nhập tên và kích thước máy in'); return; }
    if (form.supportedMaterials.length === 0) { alert('Chọn ít nhất một loại vật liệu'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.updatePrinter(editId, form);
      } else {
        await api.createPrinter(form);
      }
      await fetchPrinters();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa máy in "${name}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    try {
      await api.deletePrinter(id);
      await fetchPrinters();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updatePrinter(id, { status });
      await fetchPrinters();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const locations = [...new Set(printers.map(p => p.location || 'Khác'))].sort();
  const byLocation = (loc: string) => printers.filter(p => (p.location || 'Khác') === loc);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Quản lý máy in</h2>
          <p className="text-sm text-slate-500 mt-0.5">{printers.length} máy in tại {locations.length} khu vực</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={fetchPrinters}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={openAdd}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} />
            Thêm máy in
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">Đang tải...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {locations.map(loc => (
            <div key={loc}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-blue-500" />
                <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{loc}</h3>
                <span className="text-xs text-slate-400">({byLocation(loc).length} máy)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {byLocation(loc).map(p => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Printer image */}
                    <div className="relative h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-contain p-4"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Printer size={48} className="text-slate-300" strokeWidth={1} />
                      )}
                      {/* Status badge */}
                      <span className={cn(
                        'absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full border',
                        statusBadge(p.status)
                      )}>
                        {statusLabel[p.status] || p.status}
                      </span>
                      {p.hasAMS && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          AMS
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.buildVolume}</p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.supportedMaterials?.map((m: string) => (
                          <span key={m} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded">
                            {m}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          className={cn(
                            'flex-1 px-2 py-1 text-[10px] font-bold rounded-lg border outline-none cursor-pointer',
                            statusBadge(p.status)
                          )}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{statusLabel[s] || s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deletingId === p.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Xóa"
                        >
                          {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {printers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Printer size={48} strokeWidth={1} />
              <p className="text-sm">Chưa có máy in nào</p>
              <button onClick={openAdd} className="text-xs text-blue-500 hover:underline font-bold">
                Thêm máy in đầu tiên
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {editId ? 'Chỉnh sửa máy in' : 'Thêm máy in mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image preview & upload */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Ảnh máy in</label>
                <div className="relative h-32 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden mb-2">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="preview" className="h-full w-full object-contain p-2" />
                  ) : (
                    <ImageIcon size={32} className="text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={imageUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                  >
                    {imageUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Upload ảnh
                  </button>
                  {form.imageUrl && (
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                      className="flex-1 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                      placeholder="hoặc nhập URL ảnh"
                    />
                  )}
                  {!form.imageUrl && (
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                      className="flex-1 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                      placeholder="hoặc nhập URL ảnh (vd: /images/abc.jpg)"
                    />
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Tên máy in *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vd: Bambu Lab A1"
                />
              </div>

              {/* Build volume */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Kích thước in *</label>
                <input
                  type="text"
                  value={form.buildVolume}
                  onChange={e => setForm(f => ({ ...f, buildVolume: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vd: 256 x 256 x 256 mm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Khu vực</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {['Mỹ Đình', 'Hòa Lạc'].map(loc => (
                    <button
                      key={loc}
                      onClick={() => setForm(f => ({ ...f, location: loc }))}
                      className={cn(
                        'flex-1 py-2 text-xs font-bold rounded-xl border transition-all',
                        form.location === loc
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={!['Mỹ Đình', 'Hòa Lạc'].includes(form.location) ? form.location : ''}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    placeholder="Khu vực khác..."
                  />
                </div>
              </div>

              {/* Materials */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Vật liệu hỗ trợ</label>
                <div className="flex flex-wrap gap-2">
                  {MATERIAL_OPTIONS.map(m => (
                    <button
                      key={m}
                      onClick={() => toggleMaterial(m)}
                      className={cn(
                        'px-3 py-1 text-xs font-bold rounded-full border transition-all',
                        form.supportedMaterials.includes(m)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AMS */}
              <div>
                <button
                  onClick={() => setForm(f => ({ ...f, hasAMS: !f.hasAMS }))}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                    form.hasAMS
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded flex items-center justify-center shrink-0',
                    form.hasAMS ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-600'
                  )}>
                    {form.hasAMS && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <div>
                    <p className={cn('text-xs font-black', form.hasAMS ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300')}>
                      Có hệ thống AMS (đa màu)
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tối đa 4 màu cùng lúc – Bambu Lab A1/X1C</p>
                  </div>
                </button>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{statusLabel[s] || s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {editId ? 'Lưu thay đổi' : 'Thêm máy in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
