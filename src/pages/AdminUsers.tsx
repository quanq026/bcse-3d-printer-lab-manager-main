import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  UserCheck,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Trash2,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

const ROLE_OPTIONS = ['Student', 'Moderator', 'Admin'];

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'warnings'>('users');
  const [banModal, setBanModal] = useState<{ user: any; type: 'temporary' | 'permanent' } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState('7');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const doUpdate = async (id: string, data: any) => {
    setActionLoading(id);
    try {
      await api.updateUser(id, data);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const doDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa tài khoản "${name}"? Hành động này không thể hoàn tác và sẽ xóa toàn bộ yêu cầu in của người dùng này.`)) return;
    setActionLoading(id);
    try {
      await api.deleteUser(id);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const doBan = async () => {
    if (!banModal || !banReason.trim()) return;
    const { user, type } = banModal;
    const banUntil = type === 'temporary'
      ? new Date(Date.now() + parseInt(banDays) * 86400000).toISOString()
      : null;
    setActionLoading(user.id);
    try {
      await api.updateUser(user.id, { status: 'suspended', banReason: banReason.trim(), banUntil });
      setBanModal(null);
      setBanReason('');
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const doUnban = async (id: string) => {
    setActionLoading(id);
    try {
      await api.updateUser(id, { status: 'active', banReason: '', banUntil: '' });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      suspended: 'bg-red-50 text-red-600 border-red-100',
    };
    return map[status] || 'bg-slate-50 text-slate-500 border-slate-100';
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      Admin: 'bg-purple-50 text-purple-700 border-purple-100',
      Moderator: 'bg-blue-50 text-blue-700 border-blue-100',
      Student: 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return map[role] || 'bg-slate-50 text-slate-500 border-slate-100';
  };

  const suspendedUsers = users.filter(u => u.status === 'suspended');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-fit">
        {([['users', 'Người dùng'], ['warnings', 'Bảng cảnh cáo']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === tab
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {label}
            {tab === 'warnings' && suspendedUsers.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{suspendedUsers.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Warning Board Tab ── */}
      {activeTab === 'warnings' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-400 font-bold">
              {suspendedUsers.length} tài khoản đang bị cấm sử dụng máy in
            </p>
          </div>
          {suspendedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Shield size={36} strokeWidth={1} />
              <p className="text-sm">Không có vi phạm nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suspendedUsers.map(user => (
                <div key={user.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/30 p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                        <Ban size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email} {user.studentId ? `· ${user.studentId}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {actionLoading === user.id ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : (
                        <button
                          onClick={() => doUnban(user.id)}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
                        >
                          Bỏ cấm
                        </button>
                      )}
                    </div>
                  </div>
                  {user.banReason && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Lý do vi phạm:</p>
                      <p className="text-xs text-red-800 dark:text-red-300">{user.banReason}</p>
                    </div>
                  )}
                  {user.banUntil && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Cấm đến: {new Date(user.banUntil).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {!user.banUntil && user.banReason && (
                    <p className="mt-2 text-[11px] text-red-500 font-bold">Cấm vĩnh viễn</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && <>
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tong nguoi dung', value: users.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Dang hoat dong', value: users.filter(u => u.status === 'active').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cho duyet', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Bi khoa', value: users.filter(u => u.status === 'suspended').length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', s.bg)}>
              <Users size={16} className={s.color} />
            </div>
            <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserCheck size={20} className="text-amber-600" />
            <p className="text-sm font-bold text-amber-900 dark:text-amber-400">
              Co {pendingCount} tai khoan dang cho phe duyet
            </p>
          </div>
          <button
            onClick={() => setFilterStatus('pending')}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
          >
            Xem ngay
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tim ten, email, ma SV..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none w-full sm:w-auto"
            >
              <option value="all">Tat ca trang thai</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button
            onClick={fetchUsers}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all"
          >
            <RefreshCw size={14} />
            Lam moi
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span className="text-sm">Dang tai...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Users size={36} strokeWidth={1} />
            <p className="text-sm">Khong tim thay nguoi dung</p>
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(user => (
                <div key={user.id} className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                      {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                      {user.studentId && (
                        <p className="text-[10px] text-slate-400 font-mono mt-1">{user.studentId}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail size={12} />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone size={12} />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar size={12} />
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={user.role}
                      disabled={actionLoading === user.id}
                      onChange={e => doUpdate(user.id, { role: e.target.value })}
                      className={cn(
                        'px-2 py-1 text-[10px] font-bold rounded-full border outline-none cursor-pointer',
                        roleBadge(user.role)
                      )}
                    >
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <span className={cn('px-2 py-1 text-[10px] font-bold rounded-full border uppercase', statusBadge(user.status))}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {actionLoading === user.id ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : (
                      <>
                        {user.status === 'pending' && (
                          <button
                            onClick={() => doUpdate(user.id, { status: 'active' })}
                            className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
                          >
                            Phê duyệt
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button
                            onClick={() => { setBanModal({ user, type: 'temporary' }); setBanReason(''); setBanDays('7'); }}
                            className="px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-xl"
                          >
                            Cấm tạm thời
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button
                            onClick={() => doUnban(user.id)}
                            className="px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                          >
                            Bỏ cấm
                          </button>
                        )}
                        <button
                          onClick={() => doDelete(user.id, user.fullName)}
                          className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nguoi dung</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lien he</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngay dang ky</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quyen</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trang thai</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Thao tac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                          {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                          {user.studentId && (
                            <p className="text-[10px] text-slate-400 font-mono">{user.studentId}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail size={12} />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone size={12} />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} />
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={actionLoading === user.id}
                        onChange={e => doUpdate(user.id, { role: e.target.value })}
                        className={cn(
                          'px-2 py-1 text-[10px] font-bold rounded-full border outline-none cursor-pointer',
                          roleBadge(user.role)
                        )}
                      >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase', statusBadge(user.status))}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {actionLoading === user.id ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : (
                          <>
                            {user.status === 'pending' && (
                              <button
                                onClick={() => doUpdate(user.id, { status: 'active' })}
                                title="Phe duyet"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                            {user.status === 'active' && (
                              <button
                                onClick={() => { setBanModal({ user, type: 'temporary' }); setBanReason(''); setBanDays('7'); }}
                                title="Cấm tạm thời"
                                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            {user.status === 'suspended' && (
                              <button
                                onClick={() => doUnban(user.id)}
                                title="Bỏ cấm"
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                              >
                                <Shield size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => doDelete(user.id, user.fullName)}
                              title="Xóa tài khoản"
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      </>}

      {/* Ban modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-8 w-full max-w-md space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <Ban size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">Cấm tài khoản</h3>
                <p className="text-xs text-slate-500">{banModal.user.fullName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Loại cấm</label>
              <div className="grid grid-cols-2 sm:flex gap-2">
                {(['temporary', 'permanent'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setBanModal(m => m ? { ...m, type } : null)}
                    className={cn(
                      'flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                      banModal.type === type
                        ? 'bg-red-600 text-white border-red-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {type === 'temporary' ? 'Tạm thời' : 'Vĩnh viễn'}
                  </button>
                ))}
              </div>
            </div>

            {banModal.type === 'temporary' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Số ngày cấm</label>
                <div className="grid grid-cols-2 sm:flex gap-2">
                  {['3', '7', '14', '30'].map(d => (
                    <button
                      key={d}
                      onClick={() => setBanDays(d)}
                      className={cn(
                        'flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                        banDays === d
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      )}
                    >{d} ngày</button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Lý do vi phạm <span className="text-red-500">*</span></label>
              <textarea
                rows={3}
                placeholder="Mô tả hành vi vi phạm nội quy..."
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setBanModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={doBan}
                disabled={!banReason.trim() || !!actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                Xác nhận cấm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
