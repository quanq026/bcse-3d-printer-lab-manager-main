import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Mail, Facebook, MessageCircle, BookOpen } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

export const AdminSettings: React.FC = () => {
  const { t } = useLang();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSettingsAdmin().then(setSettings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));


  const handleSave = async () => {
    setError(''); setSuccess(''); setSaving(true);
    try {
      await api.updateSettings(settings);
      setSuccess('Đã lưu cài đặt thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 size={24} className="animate-spin mr-2" />
      <span>{t('loading')}</span>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('settings')}</h2>
        <p className="text-sm text-slate-500">Cấu hình thông tin liên hệ và hướng dẫn cho Lab.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {/* Contact Info */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
          <Mail size={16} className="text-blue-500" /> Thông tin liên hệ & Hướng dẫn
        </h3>
        <p className="text-xs text-slate-500">Hiển thị trên Landing Page. Để trống nếu không muốn hiện.</p>

        <SettingField icon={<Mail size={14} />} label="Email liên hệ">
          <input type="email" placeholder="lab@vju.ac.vn" value={settings.contact_email || ''} onChange={e => set('contact_email', e.target.value)} className="settings-input" />
        </SettingField>

        <SettingField icon={<Facebook size={14} />} label="Link Facebook">
          <input type="url" placeholder="https://facebook.com/bcse.vju" value={settings.contact_facebook || ''} onChange={e => set('contact_facebook', e.target.value)} className="settings-input" />
        </SettingField>

        <SettingField icon={<MessageCircle size={14} />} label="Số Zalo">
          <input type="text" placeholder="09xxxxxxxx" value={settings.contact_zalo || ''} onChange={e => set('contact_zalo', e.target.value)} className="settings-input" />
        </SettingField>

        <SettingField icon={<BookOpen size={14} />} label="Link Hướng dẫn sử dụng">
          <input type="url" placeholder="https://docs.google.com/..." value={settings.guide_url || ''} onChange={e => set('guide_url', e.target.value)} className="settings-input" />
        </SettingField>
      </section>


      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto justify-center flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-60"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {t('save')}
      </button>

      <style>{`
        .settings-input {
          width: 100%;
          padding: 9px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
          color: #0f172a;
        }
        .dark .settings-input { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .settings-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .settings-input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
};

function SettingField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}
