"use client";

import { useQuery } from "@tanstack/react-query";

interface Data {
  message: string;
  users: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
}

async function fetchUsers(): Promise<Data> {
  const response = await fetch("http://localhost:8080/api/v1/user/users", {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

export function UsersList() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });


  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;
  if (!data || !Array.isArray(data.users) || data.users.length === 0)
    return <div>No users found</div>;

  return (
    <ul>
      {data.users.map((user) => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}
