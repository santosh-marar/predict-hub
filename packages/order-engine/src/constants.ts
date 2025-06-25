import Decimal from "decimal.js";

export const MAKER_FEE_RATE = new Decimal("0.01"); // 1%
export const TAKER_FEE_RATE = new Decimal("0.015"); // 1.5%
export const AMM_FEE_RATE = new Decimal("0.001"); // 0.1%
export const DEFAULT_SLIPPAGE_TOLERANCE = new Decimal(0.1); // 10%