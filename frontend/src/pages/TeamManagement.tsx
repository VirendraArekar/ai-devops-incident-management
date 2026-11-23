import React from 'react';
import { Users, Shield, Plus, Mail } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const members = [
    { name: 'Alex Vance', email: 'admin@acme.com', role: 'SUPER_ADMIN', joined: 'Oct 12, 2026', status: 'ACTIVE' },
    { name: 'Sarah Connor', email: 'devops@acme.com', role: 'DEVOPS_ENGINEER', joined: 'Nov 01, 2026', status: 'ACTIVE' },
    { name: 'David Miller', email: 'david@acme.com', role: 'SRE_ENGINEER', joined: 'Nov 10, 2026', status: 'ACTIVE' },
    { name: 'Emily Chen', email: 'emily@acme.com', role: 'DEVELOPER', joined: 'Nov 18, 2026', status: 'ACTIVE' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Organization Team &amp; Role-Based Access Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage organization members, assign SRE Incident Commander roles, and configure least-privilege permissions
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition-all cursor-pointer self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined Date</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {members.map((m) => (
                <tr key={m.email} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{m.joined}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
