'use client';
import { useState, useEffect } from 'react';
import { UserPlus, Mail, Shield, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/config';

export default function TeamPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/auth/admin/invites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInvites(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/auth/admin/invite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ email, role: 'admin' })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Invitation sent to ' + email);
        setEmail('');
        fetchInvites();
      } else {
        toast.error(data.message || 'Failed to send invite');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Invite and manage administrative staff.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invite Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-indigo-600" />
              Invite Member
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@brainiyo.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button 
                  className="w-full"
                  type="submit" 
                  disabled={isSending}
                >
                  {isSending ? <Loader2 className="animate-spin mx-auto" /> : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Invites List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                Pending Invitations
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sent By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <Loader2 className="animate-spin mx-auto text-slate-400" />
                      </td>
                    </tr>
                  ) : invites.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No pending invitations found.
                      </td>
                    </tr>
                  ) : (
                    invites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{invite.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-bold uppercase tracking-wider">
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {invite.status === 'pending' ? (
                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium">
                              <Clock size={14} /> Pending
                            </span>
                          ) : invite.status === 'accepted' ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                              <CheckCircle2 size={14} /> Accepted
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-medium">
                              <XCircle size={14} /> Expired
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {invite.invited_by_name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
