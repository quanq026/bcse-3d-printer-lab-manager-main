import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Mail, Facebook, MessageCircle, BookOpen, Server, Eye, EyeOff, Send, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

export const AdminSettings: React.FC = () => {
  const { t } = useLang();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ok: boolean; msg: string} | null>(null);

  useEffect(() => {
    api.getSettingsAdmin().then(setSettings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  const handleTestSmtp = async () => {
    setTestingSmtp(true); setSmtpTestResult(null);
    try {
      const res = await fetch('/api/settings/test-smtp', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('lab_token')}` } });
      const data = await res.json();
      if (!res.ok) setSmtpTestResult({ ok: false, msg: data.error });
      else setSmtpTestResult({ ok: true, msg: data.message });
    } catch { setSmtpTestResult({ ok: false, msg: 'Kết nối thất bại' }); }
    finally { setTestingSmtp(false); }
  };

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
        <p className="text-sm text-slate-500">Cấu hình thông tin liên hệ, hướng dẫn và SMTP cho Lab.</p>
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

      {/* SMTP Config */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
          <Server size={16} className="text-amber-500" /> Cấu hình SMTP (Gửi OTP)
        </h3>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-400">
          <strong>Gmail:</strong> Dùng "App Password" (không phải mật khẩu thường). Bật 2FA → Google Account → Security → App Passwords.
          <br />SMTP Host: <code>smtp.gmail.com</code> · Port: <code>587</code>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SettingField label="SMTP Host">
            <input type="text" placeholder="smtp.gmail.com" value={settings.smtp_host || ''} onChange={e => set('smtp_host', e.target.value)} className="settings-input" />
          </SettingField>
          <SettingField label="SMTP Port">
            <input type="number" placeholder="587" value={settings.smtp_port || ''} onChange={e => set('smtp_port', e.target.value)} className="settings-input" />
          </SettingField>
        </div>

        <SettingField label="SMTP User (Gmail address)">
          <input type="email" placeholder="lab@gmail.com" value={settings.smtp_user || ''} onChange={e => set('smtp_user', e.target.value)} className="settings-input" />
        </SettingField>

        <SettingField label="SMTP Password (App Password)">
          <div className="relative">
            <input type={showSmtpPass ? 'text' : 'password'} placeholder="xxxx xxxx xxxx xxxx" value={settings.smtp_pass || ''} onChange={e => set('smtp_pass', e.target.value)} className="settings-input pr-10" />
            <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showSmtpPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </SettingField>

        <SettingField label="From Address (tên hiển thị)">
          <input type="email" placeholder="BCSE 3D Lab <lab@gmail.com>" value={settings.smtp_from || ''} onChange={e => set('smtp_from', e.target.value)} className="settings-input" />
        </SettingField>

        {smtpTestResult && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${smtpTestResult.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {smtpTestResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {smtpTestResult.msg}
          </div>
        )}
        <button onClick={handleTestSmtp} disabled={testingSmtp}
          className="flex items-center gap-2 px-5 py-2.5 border border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-all disabled:opacity-60 text-sm">
          {testingSmtp ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Gửi email test
        </button>
      </section>

      {/* Terms Content */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
          <FileText size={16} className="text-emerald-500" /> Nội dung Điều khoản sử dụng
        </h3>
        <p className="text-xs text-slate-500">Nội dung này hiển thị khi sinh viên bấm "Điều khoản" trên trang đăng ký. Nên ghi rõ quy định an toàn, trách nhiệm, và chi phí.</p>
        <SettingField label="Nội dung điều khoản">
          <textarea
            rows={12}
            placeholder={`Ví dụ:\n1. Sinh viên phải tuân thủ quy định an toàn phòng Lab...\n2. Chi phí in 3D do sinh viên chịu trách nhiệm...\n3. File thiết kế phải hợp lệ và không vi phạm bản quyền...`}
            value={settings.terms_content || ''}
            onChange={e => set('terms_content', e.target.value)}
            className="settings-input"
            style={{ resize: 'vertical', lineHeight: '1.6' }}
          />
        </SettingField>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-60"
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
