"use client";

import { useEffect } from "react";
import useAdmin from "../../../hooks/use-admin/use-admin";
import { useWorkspace } from "../../../components/workspace-context";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-slate-800/40 p-5 flex items-start gap-4 ${color}`}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-current/10">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-mono font-bold text-slate-100">
          {value ?? "—"}
        </p>
        <p className="text-[11px] font-mono text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const {
    user,
    isAuthLoading,
    stats,
    isLoadingStats,
    users,
    isLoadingUsers,
    handleRoleToggle,
    isUpdatingRole,
    requestDelete,
    confirmDelete,
    cancelDelete,
    confirmDeleteOpen,
    deleteTargetId,
    isDeletingUser,
  } = useAdmin();

  const { setIsConnected } = useWorkspace();

  useEffect(() => {
    setIsConnected(true);
  }, [setIsConnected]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const deleteTarget = users.find((u) => u.id === deleteTargetId);

  return (
    <>
      {/* Page Title Bar */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500/20 to-pink-500/10 border border-rose-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-rose-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold text-slate-200">
              Admin Panel
            </h1>
            <p className="text-[10px] font-mono text-slate-500">
              Platform Management & User Control
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 w-full flex flex-col gap-6">
        {/* Stats Grid */}
        <div>
          <h2 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
            Platform Overview
          </h2>
          {isLoadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-slate-800/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Total Users"
                value={stats?.totalUsers}
                color="border-violet-500/20"
                icon={
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Admins"
                value={stats?.totalAdmins}
                color="border-rose-500/20"
                icon={
                  <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                }
              />
              <StatCard
                label="Developers"
                value={stats?.totalDevelopers}
                color="border-emerald-500/20"
                icon={
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                }
              />
              <StatCard
                label="Projects"
                value={stats?.totalProjects}
                color="border-blue-500/20"
                icon={
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                }
              />
              <StatCard
                label="API Requests"
                value={stats?.totalApiRequests}
                color="border-teal-500/20"
                icon={
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
                  </svg>
                }
              />
              <StatCard
                label="DB Connections"
                value={stats?.totalDbConnections}
                color="border-cyan-500/20"
                icon={
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 6c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                }
              />
              <StatCard
                label="Error Logs"
                value={stats?.totalErrorLogs}
                color="border-orange-500/20"
                icon={
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                }
              />
            </div>
          )}
        </div>

        {/* Users Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              User Management
            </h2>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {users.length} users
            </span>
          </div>

          <div className="rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/50">
              {["Name / Email", "Role", "Projects", "Joined", "Actions"].map(
                (col, i) => (
                  <span
                    key={col}
                    className={`text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest ${
                      i === 0
                        ? "col-span-4"
                        : i === 1
                        ? "col-span-2"
                        : i === 2
                        ? "col-span-2"
                        : i === 3
                        ? "col-span-2"
                        : "col-span-2 text-right"
                    }`}
                  >
                    {col}
                  </span>
                )
              )}
            </div>

            {/* Table rows */}
            {isLoadingUsers ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 border-b border-slate-800/50 animate-pulse bg-slate-800/20"
                />
              ))
            ) : users.length === 0 ? (
              <div className="py-10 text-center text-xs font-mono text-slate-500">
                No users found
              </div>
            ) : (
              users.map((u, idx) => (
                <div
                  key={u.id}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors hover:bg-slate-800/30 ${
                    idx !== users.length - 1
                      ? "border-b border-slate-800/50"
                      : ""
                  }`}
                >
                  {/* Name / Email */}
                  <div className="col-span-4 min-w-0">
                    <p className="text-xs font-mono font-semibold text-slate-200 truncate">
                      {u.name ?? "—"}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      {u.email}
                    </p>
                  </div>

                  {/* Role Badge */}
                  <div className="col-span-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        u.role === "admin"
                          ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  {/* Projects */}
                  <div className="col-span-2">
                    <span className="text-xs font-mono text-slate-400">
                      {u._count.projects}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="col-span-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {/* Role toggle — can't demote yourself */}
                    {u.id !== user?.userId && (
                      <button
                        id={`btn-role-${u.id}`}
                        disabled={isUpdatingRole}
                        onClick={() => handleRoleToggle(u)}
                        title={
                          u.role === "admin"
                            ? "Demote to Developer"
                            : "Promote to Admin"
                        }
                        className="text-[9px] font-mono px-2 py-1 rounded border border-slate-600 text-slate-400 hover:border-violet-500/50 hover:text-violet-400 transition-all disabled:opacity-30"
                      >
                        {u.role === "admin" ? "Demote" : "Promote"}
                      </button>
                    )}

                    {/* Delete — can't delete yourself */}
                    {u.id !== user?.userId && (
                      <button
                        id={`btn-delete-${u.id}`}
                        onClick={() => requestDelete(u.id)}
                        title="Delete user"
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-700 text-slate-500 hover:border-red-500/50 hover:text-red-400 transition-all"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Self label */}
                    {u.id === user?.userId && (
                      <span className="text-[9px] font-mono text-slate-600 italic">
                        You
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-slate-200">
                  Delete User
                </h3>
                <p className="text-[11px] font-mono text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-400 mb-5">
              Are you sure you want to delete{" "}
              <span className="text-slate-200 font-semibold">
                {deleteTarget?.email}
              </span>
              ? All their projects and data will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button
                id="btn-cancel-delete"
                onClick={cancelDelete}
                className="flex-1 text-xs font-mono py-2 rounded-lg border border-slate-700 text-slate-400 hover:border-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete"
                onClick={confirmDelete}
                disabled={isDeletingUser}
                className="flex-1 text-xs font-mono py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                {isDeletingUser ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

