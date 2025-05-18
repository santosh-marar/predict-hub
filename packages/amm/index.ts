export function calculateLMSRPrice(
  qYes: number,
  qNo: number,
  b: number = 100
): { priceYes: number; priceNo: number } {
  const expYes = Math.exp(qYes / b);
  const expNo = Math.exp(qNo / b);
  const sumExp = expYes + expNo;

  return {
    priceYes: expYes / sumExp,
    priceNo: expNo / sumExp,
  };
}
