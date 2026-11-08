import "server-only";
import type { Settings } from "../settings";
import type { Gateway } from "./types";
import { mock } from "./mock";
import { zarinpal } from "./zarinpal";
import { snappay } from "./snappay";
import { digipay } from "./digipay";

export const GATEWAYS: Gateway[] = [zarinpal, snappay, digipay, mock];

export function gateway(id: string): Gateway | undefined {
  return GATEWAYS.find((g) => g.id === id);
}

export function enabledGateways(s: Settings) {
  return GATEWAYS.filter((g) => g.enabled(s)).map((g) => ({ id: g.id, title: g.title, note: g.note }));
}
