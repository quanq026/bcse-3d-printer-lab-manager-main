import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Settings,
  Save,
  Info,
  ArrowRight,
  Package,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { api } from '../lib/api';

export const AdminPricing: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calcGrams, setCalcGrams] = useState(100);

  useEffect(() => {
    Promise.all([api.getPricing(), api.getServiceFees()])
      .then(([rulesData, feesData]) => {
        setRules(rulesData);
        setFees(feesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updatePrice = (material: string, value: number) => {
    setRules(rules.map(r => r.material === material ? { ...r, pricePerGram: value } : r));
    setSaved(false);
  };

  const updateFee = (name: string, value: number) => {
    setFees(fees.map(f => f.name === name ? { ...f, amount: value } : f));
    setSaved(false);
  };

  const toggleFeeEnabled = (name: string) => {
    setFees(fees.map(f => f.name === name ? { ...f, enabled: !f.enabled } : f));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.updatePricing(rules),
        api.updateServiceFees(fees.map(f => ({ name: f.name, amount: f.amount, enabled: f.enabled !== false }))),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const calcCost = () => {
    const pla = rules.find(r => r.material === 'PLA')?.pricePerGram || 0;
    return (calcGrams * pla).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cấu hình bảng giá</h2>
          <p className="text-sm text-slate-500">Thiết lập đơn giá vật liệu và các loại phí dịch vụ.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Material Pricing */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            Đơn giá vật liệu
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.material} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{rule.material}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Filament</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={rule.pricePerGram}
                      onChange={e => updatePrice(rule.material, parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-400">đ/g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Fees */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            Phí dịch vụ &amp; Phụ phí
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {fees.map((fee) => (
                <div key={fee.name} className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 ${fee.enabled === false ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 mr-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{fee.label}</p>
                        {fee.name === 'service_fee' && (
                          <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[9px] font-bold rounded uppercase">đ/gram</span>
                        )}
                        {fee.name === 'rush_fee' && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${fee.enabled !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            {fee.enabled !== false ? 'Bật' : 'Tắt'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{fee.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle for rush_fee */}
                      {fee.name === 'rush_fee' && (
                        <button
                          onClick={() => toggleFeeEnabled(fee.name)}
                          className={`flex items-center gap-1 text-xs font-bold transition-colors ${fee.enabled !== false ? 'text-emerald-600' : 'text-slate-400'}`}
                          title={fee.enabled !== false ? 'Nhấn để tắt' : 'Nhấn để bật'}
                        >
                          {fee.enabled !== false
                            ? <ToggleRight size={24} className="text-emerald-500" />
                            : <ToggleLeft size={24} className="text-slate-400" />
                          }
                        </button>
                      )}
                      <input
                        type="number"
                        value={fee.amount}
                        onChange={e => updateFee(fee.name, parseInt(e.target.value) || 0)}
                        disabled={fee.enabled === false && fee.name === 'rush_fee'}
                        className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                      />
                      <span className="text-xs font-bold text-slate-400 w-10">
                        {fee.name === 'service_fee' ? 'đ/g' : 'đ'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex gap-3">
            <Info className="text-blue-600 shrink-0" size={18} />
            <p className="text-[10px] text-blue-800 dark:text-blue-400 leading-relaxed">
              Các thay đổi về đơn giá sẽ chỉ áp dụng cho các yêu cầu in được tạo <strong>sau thời điểm lưu</strong>. Các yêu cầu cũ vẫn giữ nguyên đơn giá cũ.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Preview */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-sm">
            <h3 className="text-xl font-bold mb-2">Xem trước cách tính phí</h3>
            <p className="text-slate-400 text-sm">Công cụ giúp bạn kiểm tra nhanh chi phí dựa trên cấu hình hiện tại (PLA).</p>
          </div>
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Khối lượng (g)</label>
              <input
                type="number"
                value={calcGrams}
                onChange={e => setCalcGrams(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-center py-2.5">
              <ArrowRight className="text-slate-600 hidden md:block" />
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Kết quả ước tính (PLA)</p>
              <p className="text-2xl font-black text-blue-400">{calcCost()}đ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
