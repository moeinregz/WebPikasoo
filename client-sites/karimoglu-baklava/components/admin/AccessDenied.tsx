export function AccessDenied() {
  return (
    <div className="rounded-lg bg-surface p-8 text-center shadow-sm">
      <p className="text-h4 text-text-primary">دسترسی ندارید</p>
      <p className="mt-2 text-bodySm text-text-muted">نقش شما اجازه مشاهده این بخش را نمی‌دهد.</p>
    </div>
  );
}
