/**
 * Backend (datting) se payment config – payment table se aata hai
 */
export const API_BASE = "http://192.168.18.130:3001/api/v1";

export type PaymentConfigResponse = {
  publishableKey: string | null;
  url: string | null;
  configured: boolean;
};

export async function getPaymentConfigFromApi(): Promise<PaymentConfigResponse> {
  try {
    const res = await fetch(`${API_BASE}/payment-config`);
    const data = await res.json();
    return {
      publishableKey: data.publishableKey ?? null,
      url: data.url ?? null,
      configured: !!data.configured,
    };
  } catch (e) {
    return { publishableKey: null, url: null, configured: false };
  }
}
