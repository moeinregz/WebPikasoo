/**
 * ===== استراتژی Canonical برای صفحات فهرست (Prompt 12، بخش ۱۳/۱۴) =====
 *
 * قانون: پارامترهای فیلتر/مرتب‌سازی/جستجو (`unit`, `sort`, `min`, `max`,
 * `rating`, `avail`, `q`) هرگز وارد Canonical نمی‌شوند — چون این‌ها زیرمجموعه‌ای
 * از همان کاتالوگ پایه‌اند و هیچ محتوای واقعاً منحصربه‌فردی اضافه نمی‌کنند؛
 * اگر وارد Canonical شوند، برای هر ترکیب فیلتر یک URL «اصلی» جدا ساخته
 * می‌شود که دقیقاً همان Duplicate Content است که این Prompt منع کرده.
 *
 * اما `page` (شماره صفحه) متفاوت است: صفحه ۲ واقعاً محصولات متفاوتی از
 * صفحه ۱ نشان می‌دهد، پس یک URL معتبر و مستقل خودش است — طبق رویه فعلی
 * Google (حذف rel=next/prev، توصیه به Self-referencing Canonical برای هر
 * صفحه از یک نتیجه صفحه‌بندی‌شده)، صفحه ۲ به خودش Canonical می‌شود، نه به
 * صفحه ۱.
 */
export function buildListingCanonical(basePath: string, searchParams: Record<string, string | string[] | undefined>): string {
  const pageValue = searchParams.page;
  const page = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  const pageNumber = Number(page);

  if (page && Number.isFinite(pageNumber) && pageNumber > 1) {
    return `${basePath}?page=${pageNumber}`;
  }
  return basePath;
}
