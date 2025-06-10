"use client";

import EventsSection from "@/components/custom/event-section";
import FAQSection from "@/components/custom/faq-section";
import React from "react";
import { useSession } from "@/lib/auth-client";

export default function EventsPage() {
  const { data, error, isPending } = useSession();

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/user/users", {
        credentials: "include", // Important!
        headers: {
          "Content-Type": "application/json",
        },
      });

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  const fetchUs = async () => {
    const data = await fetchUsers();
  };

  React.useEffect(() => {
    fetchUs();
  }, []);

  return (
    <>
      <EventsSection />
      <FAQSection />
    </>
  );
}
