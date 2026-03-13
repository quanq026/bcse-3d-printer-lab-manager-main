import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Check,
  Loader2,
  RefreshCw,
  PenLine,
  Calculator,
} from 'lucide-react';
import { StatusChip } from '../components/StatusChip';
import { JobStatus, MaterialSource } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

interface ModeratorQueueProps {
  onSelectJob: (id: string) => void;
}

export const ModeratorQueue: React.FC<ModeratorQueueProps> = ({ onSelectJob }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [moderatorNote, setModeratorNote] = useState('');
  const [actualGrams, setActualGrams] = useState('');
  const [search, setSearch] = useState('');
  const [printers, setPrinters] = useState<any[]>([]);
  const [quoteGrams, setQuoteGrams] = useState('');
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [pricing, setPricing] = useState<any[]>([]);
  const [serviceFees, setServiceFees] = useState<any[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs();
      setJobs(data);
      if (!selectedId && data.length > 0) {
        const first = data.find((j: any) =>
          [JobStatus.PENDING_REVIEW, JobStatus.SUBMITTED, JobStatus.PRINTING, JobStatus.APPROVED, JobStatus.SCHEDULED].includes(j.status)
        );
        if (first) setSelectedId(first.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    api.getPrinters().then(setPrinters).catch(console.error);
    api.getPricing().then(setPricing).catch(console.error);
    api.getServiceFees().then(setServiceFees).catch(console.error);
  }, []);

  const activeJobs = jobs.filter(j =>
    [JobStatus.PENDING_REVIEW, JobStatus.SUBMITTED, JobStatus.PRINTING, JobStatus.APPROVED, JobStatus.SCHEDULED, JobStatus.NEEDS_REVISION].includes(j.status)
  );

  const filteredJobs = activeJobs.filter(j =>
    !search || j.jobName.toLowerCase().includes(search.toLowerCase()) || j.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedJob = jobs.find(j => j.id === selectedId);

  const doAction = async (status: string, extra?: any) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.updateJob(selectedId, { status, notes: moderatorNote || undefined, ...extra });
      await fetchJobs();
      setModeratorNote('');
      setActualGrams('');
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm yêu cầu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
            />
          </div>
          <button
            onClick={fetchJobs}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 uppercase">
            Chờ duyệt: {activeJobs.filter(j => [JobStatus.PENDING_REVIEW, JobStatus.SUBMITTED].includes(j.status)).length}
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 uppercase">
            Đang in: {activeJobs.filter(j => j.status === JobStatus.PRINTING).length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left List */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <FileText size={32} strokeWidth={1} />
              <p className="text-sm">Không có yêu cầu nào</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedId(job.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all cursor-pointer relative group",
                  selectedId === job.id
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "border-white dark:border-slate-900 bg-white dark:bg-slate-900 hover:border-blue-200 shadow-sm"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.id}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{job.jobName}</h4>
                  </div>
                  <StatusChip status={job.status} className="text-[10px]" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {job.userName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {job.estimatedTime}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{job.materialType} · {job.color}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{job.materialSource === MaterialSource.LAB ? 'Mua nhựa' : 'Tự mang'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Detail Inspector */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          {!selectedJob ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
              <FileText size={40} strokeWidth={1} />
              <p className="text-sm">Chọn một yêu cầu để xem chi tiết</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedJob.jobName}</h3>
                    <p className="text-xs text-slate-500">Yêu cầu bởi {selectedJob.userName} · {selectedJob.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectJob(selectedJob.id)}
                  className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Status override bar */}
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/30">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Trạng thái:</span>
                <StatusChip status={selectedJob.status} />
                <span className="text-slate-300 dark:text-slate-600">→</span>
                <select
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value=""
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    if (!newStatus) return;
                    if (!confirm(`Chuyển trạng thái từ "${selectedJob.status}" sang "${newStatus}"?`)) {
                      e.target.value = '';
                      return;
                    }
                    setActionLoading(true);
                    try {
                      await api.updateJob(selectedJob.id, { status: newStatus });
                      await fetchJobs();
                    } catch (err: any) {
                      alert(err.message || 'Cập nhật thất bại');
                    } finally {
                      setActionLoading(false);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Chuyển sang...</option>
                  {[
                    JobStatus.SUBMITTED,
                    JobStatus.PENDING_REVIEW,
                    JobStatus.APPROVED,
                    JobStatus.SCHEDULED,
                    JobStatus.PRINTING,
                    JobStatus.DONE,
                    JobStatus.NEEDS_REVISION,
                    JobStatus.REJECTED,
                    JobStatus.CANCELLED,
                  ].filter(s => s !== selectedJob.status).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vật liệu</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedJob.materialType} ({selectedJob.color})</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Khối lượng (Ước tính)</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedJob.estimatedGrams} gram</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nguồn nhựa</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedJob.materialSource === MaterialSource.LAB ? 'Mua từ Lab' : 'Tự mang'}</p>
                  </div>
                </div>

                {/* Báo giá lại — for lab_assisted + Lab material */}
                {selectedJob.printMode === 'lab_assisted' && selectedJob.materialSource === 'Lab' && [JobStatus.PENDING_REVIEW, JobStatus.SUBMITTED].includes(selectedJob.status) && (
                  <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Calculator size={18} className="text-amber-600" />
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">Báo giá lại cho sinh viên</h4>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      Sau khi slice file của sinh viên, nhập khối lượng nhựa thực tế để hệ thống tính lại chi phí chính xác.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Gram ước tính mới</label>
                        <input
                          type="number"
                          min="0"
                          placeholder={selectedJob.estimatedGrams?.toString() || '0'}
                          value={quoteGrams}
                          onChange={e => setQuoteGrams(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-lg outline-none text-sm focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Chi phí dự kiến</label>
                        <div className="px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg text-sm font-bold text-amber-900 dark:text-amber-300">
                          {(() => {
                            const g = parseInt(quoteGrams) || selectedJob.estimatedGrams || 0;
                            const rule = pricing.find((p: any) => p.material === selectedJob.materialType);
                            const matCost = (rule?.pricePerGram || 0) * g;
                            const svcFee = serviceFees.find((f: any) => f.name === 'service_fee');
                            const svcCost = (svcFee?.enabled !== false ? svcFee?.amount || 0 : 0) * g;
                            return (matCost + svcCost).toLocaleString() + 'đ';
                          })()}
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={quoteSaving || !quoteGrams || parseInt(quoteGrams) <= 0}
                      onClick={async () => {
                        setQuoteSaving(true);
                        try {
                          await api.updateJob(selectedJob.id, { estimatedGrams: parseInt(quoteGrams) });
                          await fetchJobs();
                          setQuoteGrams('');
                          alert('Đã cập nhật báo giá thành công!');
                        } catch (err: any) {
                          alert(err.message || 'Cập nhật thất bại');
                        } finally {
                          setQuoteSaving(false);
                        }
                      }}
                      className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-700 transition-all disabled:opacity-50"
                    >
                      {quoteSaving ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
                      Lưu báo giá mới
                    </button>
                  </div>
                )}

                {/* Action Area */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thao tác phê duyệt</h4>

                  {selectedJob.status === JobStatus.PRINTING ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h5 className="font-bold text-emerald-900 dark:text-emerald-400">Đang tiến hành in...</h5>
                          <p className="text-xs text-emerald-700 dark:text-emerald-500">Máy in: {selectedJob.printerName || 'Chưa gán'}</p>
                        </div>
                        <button
                          onClick={() => doAction(JobStatus.CANCELLED)}
                          disabled={actionLoading}
                          className="p-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all disabled:opacity-60"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider">Khối lượng nhựa thực tế (Gram)</label>
                          <input
                            type="number"
                            placeholder="Nhập sau khi in xong..."
                            value={actualGrams}
                            onChange={e => setActualGrams(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 rounded-lg outline-none text-sm"
                          />
                        </div>
                        <button
                          onClick={() => doAction(JobStatus.DONE, { actualGrams: parseFloat(actualGrams) || undefined })}
                          disabled={actionLoading}
                          className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-60"
                        >
                          {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                          Đánh dấu hoàn thành
                        </button>
                      </div>
                    </div>
                  ) : [JobStatus.APPROVED, JobStatus.SCHEDULED].includes(selectedJob.status) ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Gán máy in</label>
                        <select
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm"
                          defaultValue={selectedJob.printerId || ''}
                          onChange={e => api.updateJob(selectedJob.id, { printerId: e.target.value })}
                        >
                          <option value="">-- Chọn máy in --</option>
                          {printers.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => doAction(JobStatus.PRINTING)}
                        disabled={actionLoading}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg transition-all disabled:opacity-60"
                      >
                        {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                        Bắt đầu in
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <button
                          onClick={() => doAction(JobStatus.APPROVED)}
                          disabled={actionLoading}
                          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-60"
                        >
                          {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                          Phê duyệt &amp; Xếp lịch
                        </button>
                        <button
                          onClick={() => {
                            if (!moderatorNote.trim()) { alert('Vui lòng nhập nội dung yêu cầu sửa ở ô Ghi chú bên dưới'); return; }
                            doAction(JobStatus.NEEDS_REVISION, { revisionNote: moderatorNote });
                          }}
                          disabled={actionLoading}
                          className="w-full py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"
                        >
                          <PenLine size={20} />
                          Yêu cầu sửa đổi
                        </button>
                      </div>
                      <div className="space-y-4">
                        <button
                          onClick={() => doAction(JobStatus.REJECTED)}
                          disabled={actionLoading}
                          className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/30 disabled:opacity-60"
                        >
                          {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
                          Từ chối yêu cầu
                        </button>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gán máy in</label>
                          <select
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                            defaultValue={selectedJob.printerId || ''}
                            onChange={e => api.updateJob(selectedJob.id, { printerId: e.target.value })}
                          >
                            <option value="">-- Chọn --</option>
                            {printers.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Box */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú / Nội dung yêu cầu sửa</label>
                  <textarea
                    placeholder="Nhập lý do từ chối hoặc nội dung yêu cầu sửa (bắt buộc khi bấm 'Yêu cầu sửa đổi')..."
                    value={moderatorNote}
                    onChange={e => setModeratorNote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
