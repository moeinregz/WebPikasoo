/**
 * تیتر را کلمه‌به‌کلمه در span ماسک‌دار می‌شکند تا GSAP بتواند هر کلمه را
 * از پایین ماسک بالا بیاورد. (در فارسی حروف به هم متصل‌اند، پس شکستن در
 * سطح «کلمه» انجام می‌شود، نه حرف.) متن کامل برای Screen Reader حفظ می‌شود.
 */
export function SplitWords({ text, wordClassName = "" }: { text: string; wordClassName?: string }) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} className="split-word">
            <span className={`split-inner ${wordClassName}`}>{w}</span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>
  );
}
