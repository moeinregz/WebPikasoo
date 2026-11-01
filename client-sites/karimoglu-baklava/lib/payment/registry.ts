import { mockProvider } from "./mockProvider";
import type { PaymentProvider } from "./types";

const providers: Record<string, PaymentProvider> = {
  "mock-gateway": mockProvider,
  // TODO: افزودن Providerهای واقعی پس از انتخاب درگاه (Blueprint بخش ۳۰)، مثلاً:
  // "zarinpal": zarinpalProvider,
};

export function getPaymentProvider(name: string = "mock-gateway"): PaymentProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Payment provider "${name}" is not registered`);
  return provider;
}
