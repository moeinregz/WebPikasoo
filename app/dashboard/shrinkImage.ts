// Shared by the photo editor and the menu editor (browser-side image shrinking).


/** Shrinks a photo in the browser (longest side 2000px by default, JPEG) so uploads are
 *  quick, fit the server's request limit and the finished site stays light.
 *  Phone photos of 5–10 MB typically end up around 300–600 KB. */
export async function shrinkImage(file: File, maxSide = 2000): Promise<{ file: File; width: number }> {
  if (!file.type.startsWith("image/")) throw new Error("فقط فایل عکس قابل قبوله.");

  let width = 0;
  let height = 0;
  let source: CanvasImageSource;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    width = bmp.width;
    height = bmp.height;
    source = bmp;
  } catch {
    // Older browsers: decode through an <img>.
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode"));
        el.src = url;
      });
      width = img.naturalWidth;
      height = img.naturalHeight;
      source = img;
    } catch {
      throw new Error("این عکس باز نشد. فرمت JPG، PNG یا WebP رو امتحان کن (HEIC آیفون رو اول به JPG تبدیل کن).");
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }
  if (!width || !height) throw new Error("این عکس باز نشد.");

  const toBlob = (c: HTMLCanvasElement, q: number) =>
    new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/jpeg", q));

  let scale = Math.min(1, maxSide / Math.max(width, height));
  for (let attempt = 0; attempt < 4; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("مرورگر از پردازش عکس پشتیبانی نمی‌کنه.");
    ctx.fillStyle = "#ffffff"; // PNGs with transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    for (const q of [0.86, 0.76, 0.66]) {
      const blob = await toBlob(canvas, q);
      if (blob && blob.size <= 2.6 * 1024 * 1024) {
        return { file: new File([blob], "photo.jpg", { type: "image/jpeg" }), width: canvas.width };
      }
    }
    scale *= 0.8;
  }
  throw new Error("نتونستم حجم این عکس رو کم کنم؛ یه عکس دیگه امتحان کن.");
}

