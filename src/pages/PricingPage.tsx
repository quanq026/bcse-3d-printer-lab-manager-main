import React, { useEffect, useState } from 'react';
import { Tag, Layers, Wrench, Info, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const MATERIAL_COLORS: Record<string, string> = {
  PLA: '#22c55e',
  PETG: '#3b82f6',
  TPU: '#a855f7',
  ABS: '#f97316',
};

const MATERIAL_DESC: Record<string, string> = {
  PLA: 'Dễ in, phổ biến nhất. Phù hợp mô hình, prototype, đồ trang trí.',
  PETG: 'Bền hơn PLA, chịu nhiệt tốt hơn. Phù hợp đồ dùng thực tế.',
  TPU: 'Nhựa dẻo, đàn hồi. Phù hợp vỏ bọc, gioăng, đế giày mô hình.',
  ABS: 'Chịu nhiệt, bền cơ học. Dùng cho bộ phận kỹ thuật.',
};

export const PricingPage: React.FC = () => {
  const [pricing, setPricing] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPricing(), api.getServiceFees()])
      .then(([p, f]) => { setPricing(p); setFees(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 size={24} className="animate-spin mr-2" /> Đang tải bảng giá...
    </div>
  );

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          Bảng giá dịch vụ
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Chi phí in 3D tại BCSE Lab được tính theo loại nhựa và khối lượng thực tế sau khi in.
        </p>
      </div>

      {/* Filament pricing */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Giá nhựa theo vật liệu</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pricing.map((rule: any) => (
            <div key={rule.material}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                  style={{ background: MATERIAL_COLORS[rule.material] || '#64748b' }}>
                  {rule.material}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{rule.material}</h4>
                  <p className="text-xs text-slate-500">Nhựa in 3D</p>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-black" style={{ color: MATERIAL_COLORS[rule.material] || '#64748b' }}>
                  {Number(rule.pricePerGram).toLocaleString('vi-VN')}đ
                </span>
                <span className="text-sm text-slate-500 ml-1">/ gram</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {MATERIAL_DESC[rule.material] || ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Service fees */}
      {fees.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Phí dịch vụ</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {fees.map((fee: any, i: number) => (
              <div key={fee.name}
                className={`flex items-center justify-between px-6 py-4 ${i < fees.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{fee.label}</p>
                  {fee.description && <p className="text-xs text-slate-500 mt-0.5">{fee.description}</p>}
                </div>
                <span className={`text-sm font-bold ${fee.amount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {fee.amount === 0 ? 'Miễn phí' : `${Number(fee.amount).toLocaleString('vi-VN')}đ`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formula note */}
      <section className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/40" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl shrink-0">
            <Tag size={18} className="text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 mb-2">Công thức tính chi phí</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Chi phí nhựa</strong> = Khối lượng thực tế (gram) × Đơn giá vật liệu<br />
              <strong>Tổng chi phí</strong> = Chi phí nhựa + Phí dịch vụ (nếu có)<br /><br />
              Khối lượng thực tế sẽ được cân sau khi in xong. Chi phí tạm tính trong đơn là ước tính ban đầu của bạn.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p>Giá có thể thay đổi theo chính sách của Lab. Liên hệ Moderator nếu có thắc mắc về chi phí.</p>
      </div>
    </div>
  );
};
