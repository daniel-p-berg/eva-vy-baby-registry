export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatVnd(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value))} ₫`;
}

export function usdToVnd(usd: number, rate?: number) {
  const resolvedRate =
    rate ?? Number(process.env.NEXT_PUBLIC_USD_TO_VND_RATE || 26000);
  return Math.round(usd * resolvedRate);
}

export function clampMoney(value: number) {
  return Math.round(value * 100) / 100;
}
