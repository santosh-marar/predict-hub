export type MarketStatus = "open" | "closed" | "settled";

export interface Market {
  id: string;
  question: string;
  yesShares: number;
  noShares: number;
  status: MarketStatus;
  closeTime: Date;
  createdAt: Date;
}
