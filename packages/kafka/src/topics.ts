export const KAFKA_TOPICS = {
  ORDER_PLACED: "order.placed",
  ORDER_MATCHED: "order.matched",
  TRADE_EXECUTED: "trade.executed",
  SETTLEMENT_COMPLETED: "settlement.completed",
  PRICE_UPDATE: "price.update",
  WALLET_UPDATE: "wallet.update",
  POSITION_UPDATE: "position.update",
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
