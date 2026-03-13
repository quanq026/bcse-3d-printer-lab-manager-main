import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, RefreshCw, Loader2, User, ShieldCheck, Crown } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  jobId?: string;
  content: string;
  createdAt: string;
}

interface ChatPageProps {
  currentUser: any;
}

const ROLE_BADGE: Record<string, { label: string; color: string; icon: any }> = {
  Admin: { label: 'Admin', color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400', icon: Crown },
  Moderator: { label: 'Mod', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400', icon: ShieldCheck },
  Student: { label: 'SV', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400', icon: User },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export const ChatPage: React.FC<ChatPageProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [jobId, setJobId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = async () => {
    try {
      const data = await api.getMessages();
      setMessages(data.slice().reverse());
    } catch {}
  };

  useEffect(() => {
    Promise.all([
      api.getJobs().catch(() => []),
      fetchMessages(),
    ]).then(([jobsData]) => {
      if (Array.isArray(jobsData)) setJobs(jobsData);
      setLoading(false);
    });

    intervalRef.current = setInterval(fetchMessages, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(content.trim(), jobId || undefined);
      setMessages(prev => [...prev, msg]);
      setContent('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={24} className="text-blue-600" />
            Cộng đồng & Nhắc đơn
          </h2>
          <p className="text-sm text-slate-500">Gửi tin nhắn, nhắc nhở phê duyệt, hoặc hỏi về trạng thái yêu cầu in.</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchMessages().finally(() => setLoading(false)); }}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Làm mới"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Đang tải tin nhắn...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <MessageCircle size={40} className="opacity-30" />
            <p className="text-sm">Chưa có tin nhắn nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.userId === currentUser?.id;
            const badge = ROLE_BADGE[msg.userRole] || ROLE_BADGE.Student;
            const BadgeIcon = badge.icon;
            return (
              <div key={msg.id} className={cn('flex gap-3', isMe && 'flex-row-reverse')}>
                {/* Avatar */}
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  isMe
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                )}>
                  {msg.userName.charAt(0).toUpperCase()}
                </div>

                <div className={cn('max-w-[75%] space-y-1', isMe && 'items-end flex flex-col')}>
                  {/* Header */}
                  <div className={cn('flex items-center gap-2 text-xs', isMe && 'flex-row-reverse')}>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {isMe ? 'Bạn' : msg.userName}
                    </span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1', badge.color)}>
                      <BadgeIcon size={10} />
                      {badge.label}
                    </span>
                    {msg.jobId && (
                      <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">
                        #{msg.jobId}
                      </span>
                    )}
                    <span className="text-slate-400">{formatTime(msg.createdAt)}</span>
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        {/* Job tag */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Nhắc đơn #</label>
          <select
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
          >
            <option value="">-- Không gắn đơn --</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.id} – {j.jobName} ({j.status})</option>
            ))}
          </select>
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 self-end"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
