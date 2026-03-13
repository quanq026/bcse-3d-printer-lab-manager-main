import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Printer as PrinterIcon,
  Package,
  CreditCard,
  FileText,
  MessageSquare,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PenLine,
  Send,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PrintJob, JobStatus, MaterialSource } from '../types';
import { StatusChip } from '../components/StatusChip';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

interface JobDetailProps {
  job: PrintJob;
  onBack: () => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitDone, setResubmitDone] = useState(false);

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      await api.resubmitJob(job.id);
      setResubmitDone(true);
    } catch (err: any) {
      alert(err.message || 'Gửi lại thất bại');
    } finally {
      setResubmitting(false);
    }
  };

  const createdDate = new Date(job.createdAt);
  const fmt = (d: Date) => d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const timeline = [
    { status: JobStatus.SUBMITTED, time: fmt(createdDate), done: true },
    { status: JobStatus.PENDING_REVIEW, time: fmt(new Date(createdDate.getTime() + 5 * 60000)), done: true },
    { status: JobStatus.APPROVED, time: job.status !== JobStatus.PENDING_REVIEW ? fmt(new Date(createdDate.getTime() + 24 * 3600000)) : '—', done: job.status !== JobStatus.PENDING_REVIEW },
    { status: JobStatus.SCHEDULED, time: [JobStatus.SCHEDULED, JobStatus.PRINTING, JobStatus.DONE].includes(job.status) ? fmt(new Date(createdDate.getTime() + 24 * 3600000 + 3600000)) : '—', done: [JobStatus.SCHEDULED, JobStatus.PRINTING, JobStatus.DONE].includes(job.status) },
    { status: JobStatus.PRINTING, time: [JobStatus.PRINTING, JobStatus.DONE].includes(job.status) ? (job.slotTime || '—') : '—', done: [JobStatus.PRINTING, JobStatus.DONE].includes(job.status) },
    { status: JobStatus.DONE, time: job.status === JobStatus.DONE ? fmt(new Date()) : '—', done: job.status === JobStatus.DONE },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{job.jobName}</h2>
              <StatusChip status={job.status} />
            </div>
            <p className="text-sm text-slate-500">Mã yêu cầu: <span className="font-mono font-bold">{job.id}</span> • Tạo ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Hóa đơn
          </button>
          {![JobStatus.DONE, JobStatus.CANCELLED, JobStatus.REJECTED].includes(job.status) && (
            <button
              onClick={async () => {
                if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) return;
                try {
                  await api.updateJob(job.id, { status: JobStatus.CANCELLED });
                  alert('Đã hủy yêu cầu thành công.');
                  onBack();
                } catch (err: any) {
                  alert(err.message || 'Hủy yêu cầu thất bại');
                }
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
            >
              Hủy yêu cầu
            </button>
          )}
        </div>
      </div>

      {/* Revision Banner */}
      {job.status === JobStatus.NEEDS_REVISION && (
        <div className="p-5 rounded-2xl border-2 border-orange-300 dark:border-orange-700" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-xl shrink-0">
              <PenLine size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-orange-900 mb-1">Moderator yêu cầu sửa đổi</h4>
              {job.revisionNote ? (
                <p className="text-sm text-orange-800 leading-relaxed mb-4">"{job.revisionNote}"</p>
              ) : (
                <p className="text-sm text-orange-700 mb-4">Vui lòng liên hệ Moderator để biết thêm chi tiết.</p>
              )}
              {resubmitDone ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 size={18} /> Đã gửi lại thành công! Đang chờ duyệt lại.
                </div>
              ) : (
                <button
                  onClick={handleResubmit}
                  disabled={resubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
                >
                  {resubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Gửi lại yêu cầu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Tổng quan', icon: FileText },
          { id: 'timeline', label: 'Tiến độ', icon: Clock },
          { id: 'files', label: 'File in', icon: Package },
          { id: 'payment', label: 'Thanh toán', icon: CreditCard },
          { id: 'messages', label: 'Tin nhắn', icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative flex items-center gap-2",
              activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Thông tin chi tiết</h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại vật liệu</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{job.materialType} ({job.color})</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nguồn nhựa</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{job.materialSource === MaterialSource.LAB ? 'Mua từ Lab' : 'Tự mang'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khối lượng ước tính</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{job.estimatedGrams} gram</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian in ước tính</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{job.estimatedTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Máy in gán</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{job.printerName || 'Chưa gán'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khung giờ in</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{job.slotTime || 'Chưa xếp lịch'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Ghi chú in ấn</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {job.description || 'Không có ghi chú.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-8 relative">
                <div className="absolute top-0 left-[15px] bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-6 relative z-10">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900 transition-all",
                      item.done ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {item.done ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div className="pt-1">
                      <h4 className={cn("text-sm font-bold", item.done ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                        {item.status}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chi tiết thanh toán</h3>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase",
                    job.status === JobStatus.DONE ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {job.status === JobStatus.DONE ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tiền nhựa ({job.materialType})</span>
                    <span className="font-bold text-slate-900 dark:text-white">{job.cost.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phí dịch vụ</span>
                    <span className="font-bold text-slate-900 dark:text-white">0đ</span>
                  </div>
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">Tổng cộng</span>
                    <span className="text-2xl font-black text-blue-600">{job.cost.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-3xl">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-2">Hướng dẫn thanh toán</h4>
                <p className="text-xs text-blue-800 dark:text-blue-500 leading-relaxed mb-4">
                  Vui lòng thanh toán tại bàn trực của Lab hoặc chuyển khoản qua mã QR bên dưới với nội dung: <strong>{job.id} - {job.userName}</strong>
                </p>
                <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center border border-blue-100">
                  <div className="w-24 h-24 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">QR Code</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">File đính kèm</h4>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 group cursor-pointer hover:border-blue-300 transition-all">
              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{job.fileName}</p>
                <p className="text-[10px] text-slate-500">{job.fileName?.split('.').pop()?.toUpperCase() || 'File'}</p>
              </div>
              <Download size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Moderator phụ trách</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {job.moderatorName ? job.moderatorName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{job.moderatorName || 'Chưa gán'}</p>
                <p className="text-[10px] text-slate-500">Lab Moderator</p>
              </div>
            </div>
          </div>

          {job.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle size={18} />
                <h4 className="text-sm font-bold">Lý do từ chối</h4>
              </div>
              <p className="text-xs text-red-700 dark:text-red-500 leading-relaxed italic">
                "{job.rejectionReason}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
