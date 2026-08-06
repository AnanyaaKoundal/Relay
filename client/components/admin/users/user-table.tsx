"use client";

import type { AdminUser } from "@/types/admin.types";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";

type UserTableProps = {
  users: AdminUser[];
  onSelectUser: (userId: string) => void;
};

export function UserTable({ users, onSelectUser }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Courses</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enrolled</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50"
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <RoleBadge isAdmin={user.isAdmin} isInstructor={user.isInstructor} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{user.courseCount}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.enrollmentCount}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
