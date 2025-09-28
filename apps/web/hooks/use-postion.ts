import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useCurrentPosition() {
  return useQuery({
    queryKey: ["position"],
    queryFn: async () => {
      try {
        const res = await api.get(`/position`);

        if (res.data.success) {
          return res.data;
        }
        console.log("Api fetch successfully")
      } catch (error) {
        console.error("Error fetching position:", error);
      }
    },
    retry: 2,
    retryDelay: 5000,
  });
}

 