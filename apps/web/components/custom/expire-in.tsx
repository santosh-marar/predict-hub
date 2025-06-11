import { getMinutesLeft } from "@/lib/utils";

interface ExpiresInProps {
  endTime: string;
  totalVolume: string;
}

export function ExpiresIn({ endTime, totalVolume }: ExpiresInProps) {
  const minutesLeft = getMinutesLeft(endTime);

  if (minutesLeft === 10 || minutesLeft === 20) {
    return <span>Expires in {minutesLeft} minutes</span>;
  }

  return <span>No of trades: {totalVolume}</span>;
}
