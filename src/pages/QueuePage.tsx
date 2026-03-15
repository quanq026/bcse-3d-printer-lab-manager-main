import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Loader2,
  Printer as PrinterIcon,
  RefreshCw,
  User,
} from 'lucide-react';
import { StatusChip, STATUS_LABELS } from '../components/StatusChip';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { JobStatus } from '../types';

interface QueuePageProps {
  currentUser: any;
}

function formatDateTime(value?: string) {
  if (!value) return 'Chưa có thời gian';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
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

  useEffect(() => {
    fetchQueue();
  }, []);

  const myJobs = useMemo(
    () => jobs.filter((job) => job.userId === currentUser?.id),
    [currentUser?.id, jobs]
  );
  const myPositions = new Set(myJobs.map((job) => job.id));
  const reviewCount = jobs.filter((job) => [JobStatus.SUBMITTED, JobStatus.PENDING_REVIEW].includes(job.status)).length;
  const printingCount = jobs.filter((job) => job.status === JobStatus.PRINTING).length;

  const summaryCards = [
    {
      label: 'Lệnh trong hàng',
      value: jobs.length,
      note: 'Toàn bộ yêu cầu đang hiện diện trong hàng chờ in.',
    },
    {
      label: 'Lệnh của bạn',
      value: myJobs.length,
      note: myJobs.length > 0 ? 'Các yêu cầu của bạn đang được đánh dấu xuyên suốt danh sách.' : 'Bạn chưa có yêu cầu nào xuất hiện trong hàng chờ hiện tại.',
    },
    {
      label: 'Chờ duyệt',
      value: reviewCount,
      note: 'Các yêu cầu đang chờ moderator kiểm tra trước khi xếp lịch.',
    },
    {
      label: 'Đang in',
      value: printingCount,
      note: 'Những công việc hiện đã được đưa lên máy in.',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="app-panel grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:px-8 lg:py-8">
        <div>
          <p className="app-eyebrow">// Hàng đợi</p>
          <h2 className="app-display-sm mt-3">Nhìn rõ vị trí của từng yêu cầu trong hàng chờ.</h2>
          <p className="app-subtle-copy mt-4 max-w-2xl text-sm sm:text-base">
            Danh sách này phản ánh đúng thứ tự xử lý hiện tại. Yêu cầu nộp sớm sẽ nằm cao hơn, còn trạng thái cho biết công việc đang ở bước nào trong quy trình.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={fetchQueue}
              className="app-primary-button inline-flex min-w-[220px] items-center justify-center gap-2 px-5 text-sm font-black uppercase tracking-[0.16em]"
            >
              <RefreshCw size={18} />
              Làm mới hàng đợi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {summaryCards.map((card, index) => (
            <article key={card.label} className="app-panel-soft app-hover-box px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="app-overline">{card.label}</p>
                <span className="app-overline">0{index + 1}</span>
              </div>
              <p className="app-stat-number mt-4 text-slate-900 dark:text-[var(--landing-text)]">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-[var(--landing-muted)]">{card.note}</p>
            </article>
          ))}
        </div>
      </section>

      {myJobs.length > 0 && (
        <section className="app-panel border-[rgba(239,125,87,0.2)] bg-[linear-gradient(135deg,rgba(255,247,237,0.92),rgba(255,240,228,0.9))] px-6 py-5 dark:border-[rgba(239,125,87,0.16)] dark:bg-[linear-gradient(135deg,rgba(239,125,87,0.12),rgba(240,179,91,0.06))]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="app-eyebrow">// Yêu cầu của bạn</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-[var(--landing-text)]">
                {myJobs.map((job) => {
                  const position = jobs.findIndex((queueJob) => queueJob.id === job.id) + 1;
                  return `${job.jobName} ở vị trí #${position}`;
                }).join(' · ')}
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-[var(--landing-muted)]">
              Các hàng được đánh dấu để bạn theo dõi nhanh hơn
            </p>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="app-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[rgba(30,23,19,0.08)] px-6 py-5 dark:border-white/8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="app-overline">// Danh sách hàng chờ</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-[var(--landing-text)]">Thứ tự xử lý hiện tại</h3>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-[var(--landing-muted)]">
              Ưu tiên từ trên xuống dưới
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-slate-500 dark:text-[var(--landing-muted)]">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Đang tải hàng chờ...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center border border-[rgba(30,23,19,0.08)] bg-white/50 text-slate-400 dark:border-white/8 dark:bg-white/4 dark:text-white/38">
                <Clock size={28} strokeWidth={1.4} />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-[var(--landing-text)]">Hiện chưa có yêu cầu nào trong hàng chờ.</p>
                <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-[var(--landing-muted)]">
                  Khi có yêu cầu mới được đưa vào luồng xử lý, danh sách này sẽ tự hiển thị thứ tự chờ tương ứng.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="md:hidden">
                {jobs.map((job, index) => {
                  const isMine = myPositions.has(job.id);
                  return (
                    <article
                      key={job.id}
                      className={cn(
                        'app-hover-box border-b border-[rgba(30,23,19,0.06)] px-4 py-4 last:border-b-0 dark:border-white/6',
                        isMine && 'bg-[rgba(239,125,87,0.06)] dark:bg-[rgba(239,125,87,0.08)]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="app-overline">#{index + 1}</span>
                            {isMine && (
                              <span className="inline-flex min-h-[24px] items-center border border-[rgba(239,125,87,0.22)] bg-[rgba(239,125,87,0.12)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--landing-accent)]">
                                Của bạn
                              </span>
                            )}
                          </div>
                          <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-[var(--landing-text)]">{job.jobName}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-white/38">#{job.id}</p>
                        </div>
                        <StatusChip status={job.status as JobStatus} />
                      </div>

                      <div className="mt-4 grid gap-2 text-xs text-slate-500 dark:text-[var(--landing-muted)]">
                        <p className="inline-flex items-center gap-2">
                          <User size={12} />
                          {job.userName}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <PrinterIcon size={12} />
                          {job.materialType} / {job.color}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Calendar size={12} />
                          {job.slotTime || 'Chưa xếp lịch'}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Clock size={12} />
                          {formatDateTime(job.createdAt)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Vị trí</th>
                      <th>Yêu cầu</th>
                      <th>Người gửi</th>
                      <th>Vật liệu</th>
                      <th>Ca / lịch</th>
                      <th>Trạng thái</th>
                      <th>Nộp lúc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, index) => {
                      const isMine = myPositions.has(job.id);
                      return (
                        <tr
                          key={job.id}
                          className={cn(
                            isMine && 'bg-[rgba(239,125,87,0.06)] dark:bg-[rgba(239,125,87,0.08)]'
                          )}
                        >
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 dark:text-[var(--landing-text)]">{index + 1}</span>
                              {isMine && (
                                <span className="inline-flex min-h-[24px] items-center border border-[rgba(239,125,87,0.22)] bg-[rgba(239,125,87,0.12)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--landing-accent)]">
                                  Của bạn
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900 dark:text-[var(--landing-text)]">{job.jobName}</span>
                              <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-white/38">#{job.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <span className="text-sm text-slate-600 dark:text-[var(--landing-muted)]">{job.userName}</span>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex flex-col text-sm text-slate-600 dark:text-[var(--landing-muted)]">
                              <span>{job.materialType}</span>
                              <span className="mt-1 text-xs text-slate-400 dark:text-white/40">{job.color}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <span className="text-sm text-slate-600 dark:text-[var(--landing-muted)]">{job.slotTime || 'Chưa xếp lịch'}</span>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <StatusChip status={job.status as JobStatus} />
                          </td>
                          <td className="px-6 py-5 align-top">
                            <span className="text-sm text-slate-500 dark:text-[var(--landing-muted)]">{formatDateTime(job.createdAt)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <aside className="space-y-5">
          <section className="app-panel px-5 py-5">
            <p className="app-overline">// Nguyên tắc xếp hàng</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-[var(--landing-muted)]">
              <p>Nộp sớm hơn sẽ đứng trước trong danh sách chờ.</p>
              <p>Trạng thái được cập nhật ngay khi moderator duyệt hoặc đưa lệnh lên máy.</p>
              <p>Các yêu cầu của bạn luôn được đánh dấu để theo dõi nhanh hơn.</p>
            </div>
          </section>

          <section className="app-panel px-5 py-5">
            <p className="app-overline">// Trạng thái hiện có</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                JobStatus.SUBMITTED,
                JobStatus.PENDING_REVIEW,
                JobStatus.APPROVED,
                JobStatus.SCHEDULED,
                JobStatus.PRINTING,
              ].map((status) => (
                <div key={status} className="inline-flex items-center gap-2">
                  <StatusChip status={status} />
                  <span className="text-xs text-slate-500 dark:text-[var(--landing-muted)]">{STATUS_LABELS[status]}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
};
