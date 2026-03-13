import React, { useEffect, useState } from 'react';
import { Clock, Loader2, RefreshCw, User, Printer as PrinterIcon, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

const STATUS_STYLE: Record<string, string> = {
  'Submitted':     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'Pending review':'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Approved':      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Scheduled':     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Printing':      'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const STATUS_DOT: Record<string, string> = {
  'Submitted':     'bg-slate-400',
  'Pending review':'bg-yellow-400',
  'Approved':      'bg-emerald-500',
  'Scheduled':     'bg-blue-500',
  'Printing':      'bg-purple-500 animate-pulse',
};

interface QueuePageProps {
  currentUser: any;
}

export const QueuePage: React.FC<QueuePageProps> = ({ currentUser }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getQueue();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const myJobs = jobs.filter(j => j.userId === currentUser?.id);
  const myPositions = new Set(myJobs.map(j => j.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Hàng chờ in</h2>
          <p className="text-sm text-slate-500 mt-1">
            {jobs.length} lệnh đang chờ — được sắp xếp theo thứ tự thời gian nộp
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all"
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* My position banner */}
      {myJobs.length > 0 && (
        <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
            Lệnh của bạn: {myJobs.map(j => {
              const pos = jobs.findIndex(q => q.id === j.id) + 1;
              return `${j.jobName} — vị trí #${pos}`;
            }).join(' · ')}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">Đang tải hàng chờ...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Clock size={40} strokeWidth={1} />
          <p className="text-sm">Không có lệnh nào trong hàng chờ</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên lệnh</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Người gửi</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vật liệu</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ca / Giờ</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nộp lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((job, idx) => {
                  const isMe = myPositions.has(job.id);
                  return (
                    <tr
                      key={job.id}
                      className={cn(
                        'transition-colors',
                        isMe
                          ? 'bg-blue-50/60 dark:bg-blue-900/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      )}
                    >
                      {/* Position */}
                      <td className="px-6 py-4">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-black',
                          idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                          idx === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                          idx === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' :
                          'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-500'
                        )}>
                          {idx + 1}
                        </div>
                      </td>

                      {/* Job name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isMe && (
                            <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">Bạn</span>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{job.jobName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{job.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <User size={14} className="text-slate-500" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{job.userName}</span>
                        </div>
                      </td>

                      {/* Material */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.materialType}</p>
                          <p className="text-[10px] text-slate-400">{job.color}</p>
                        </div>
                      </td>

                      {/* Slot */}
                      <td className="px-6 py-4">
                        {job.slotTime ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Calendar size={12} />
                            {job.slotTime}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit',
                          STATUS_STYLE[job.status] || 'bg-slate-100 text-slate-500'
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[job.status] || 'bg-slate-400')} />
                          {job.status}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock size={12} />
                          {new Date(job.createdAt).toLocaleString('vi-VN', {
                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <p className="text-[11px] text-slate-400">
              Duyệt theo thứ tự từ trên xuống. Nộp sớm = được ưu tiên hơn.
            </p>
          </div>
        </div>
      )}

      {/* Printer status legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_STYLE).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', STATUS_DOT[s])} />
            <span className="text-[11px] text-slate-500">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
