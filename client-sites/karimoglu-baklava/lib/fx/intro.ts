/**
 * سیگنال پایان انیمیشن لودینگ ورود.
 * انیمیشن‌های Hero تا پایان لودینگ صبر می‌کنند تا زیر پرده اجرا و هدر نشوند.
 * اگر لودینگ در این Session قبلاً دیده شده باشد، IntroLoader بلافاصله
 * markIntroDone را صدا می‌زند.
 */
export const INTRO_STORAGE_KEY = "kg-intro-seen";

let done = false;
const listeners = new Set<() => void>();

export function isIntroDone() {
  return done;
}

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onIntroDone(cb: () => void): () => void {
  if (done || typeof window === "undefined") {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** اسکریپت inline برای <head>: قبل از اولین Paint وضعیت لودینگ را مشخص می‌کند. */
export const introHeadScript = `try{var h=document.documentElement;if(sessionStorage.getItem('${INTRO_STORAGE_KEY}')){h.classList.add('intro-seen')}else{h.classList.add('intro-lock')}}catch(e){}`;
