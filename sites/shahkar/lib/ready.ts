"use client";

// Signals that the intro (garden-gate loader) has finished, so hero animations can start.
const EVT = "shahkar:ready";
type W = Window & { __shahkarReady?: boolean };

export function markReady() {
  (window as W).__shahkarReady = true;
  window.dispatchEvent(new Event(EVT));
}

export function onReady(cb: () => void): () => void {
  if ((window as W).__shahkarReady) {
    cb();
    return () => {};
  }
  window.addEventListener(EVT, cb, { once: true });
  return () => window.removeEventListener(EVT, cb);
}
