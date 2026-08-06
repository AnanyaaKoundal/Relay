"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { AdminUser } from "@/types/admin.types";
import { listUsers } from "@/services/admin.service";
import { UserFilters } from "@/components/admin/users/user-filters";
import { UserTable } from "@/components/admin/users/user-table";
import { UserDetailDrawer } from "@/components/admin/users/user-detail-drawer";
import { Pagination } from "@/components/admin/users/pagination";

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers({ search, role, status, page });
      setUsers(result.users);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `${total} total users` : "Manage platform users, roles, and access."}
        </p>
      </div>

      <UserFilters />

      {loading ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <>
          <UserTable users={users} onSelectUser={setSelectedUserId} />
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}

      <UserDetailDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
}
