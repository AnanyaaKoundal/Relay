export function RoleBadge({ isAdmin, isInstructor }: { isAdmin: boolean; isInstructor: boolean }) {
  if (isAdmin) {
    return (
      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
        Admin
      </span>
    );
  }
  if (isInstructor) {
    return (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
        Instructor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
      Learner
    </span>
  );
}
