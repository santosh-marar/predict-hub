// app/users/page.tsx (Server Component by default)
import { UsersList } from "./user-list";

export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <UsersList />
    </div>
  );
}
