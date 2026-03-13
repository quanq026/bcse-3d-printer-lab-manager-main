import React, { useState, useEffect } from 'react';
import { HardDrive, Download, RefreshCw, Loader2, Plus, Database } from 'lucide-react';
import { api } from '../lib/api';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleString('vi-VN');
}

export const BackupPage: React.FC = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await api.listBackups();
      setBackups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await api.createBackup();
      alert(`Đã tạo backup: ${result.file}`);
      fetchBackups();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive size={24} className="text-blue-600" />
            Sao lưu dữ liệu
          </h2>
          <p className="text-sm text-slate-500">Hệ thống tự động sao lưu mỗi 30 ngày. Bạn cũng có thể tạo backup thủ công bất kỳ lúc nào.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBackups}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Tạo backup ngay
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Database size={16} className="text-slate-400" />
          <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Danh sách bản sao lưu</span>
          <span className="ml-auto text-xs text-slate-400">{backups.length} file</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <HardDrive size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có bản sao lưu nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {backups.map((b, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <Database size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(b.createdAt)} · {formatSize(b.size)}</p>
                  </div>
                </div>
                <a
                  href={api.downloadBackup(b.name)}
                  download={b.name}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Download size={14} />
                  Tải về
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-sm text-amber-800 dark:text-amber-400">
        <strong>Lưu ý:</strong> Các file backup chứa toàn bộ dữ liệu hệ thống (người dùng, yêu cầu in, kho vật liệu). Hãy lưu trữ ở nơi an toàn và không chia sẻ với người ngoài.
      </div>
    </div>
  );
};
