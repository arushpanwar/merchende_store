export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export const COD_SHIPPING_PAISE = 7000;
export const PREPAID_SHIPPING_PAISE = 0;

export function shippingFor(method: "PREPAID" | "COD"): number {
  return method === "COD" ? COD_SHIPPING_PAISE : PREPAID_SHIPPING_PAISE;
}
