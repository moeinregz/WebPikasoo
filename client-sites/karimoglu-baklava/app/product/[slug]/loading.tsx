import { Container } from "@/components/ui/Container";

export default function ProductLoading() {
  return (
    <Container className="flex flex-col gap-10 py-10">
      <div className="h-4 w-64 animate-pulse rounded bg-bg-secondary" />
      <div className="grid grid-cols-1 gap-10 desktop:grid-cols-2">
        <div className="img-placeholder aspect-square animate-pulse rounded-lg" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-bg-secondary" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-bg-secondary" />
          <div className="h-11 w-full animate-pulse rounded bg-bg-secondary" />
          <div className="h-11 w-full animate-pulse rounded bg-bg-secondary" />
          <div className="h-14 w-full animate-pulse rounded bg-bg-secondary" />
        </div>
      </div>
    </Container>
  );
}
