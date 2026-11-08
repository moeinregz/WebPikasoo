// Site header. Implemented in components/ui/header-3.tsx (adapted from the
// header-3 block); this keeps the existing <Nav isLoggedIn /> call sites.
import { Header } from "@/components/ui/header-3";

export default function Nav({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return <Header isLoggedIn={isLoggedIn} />;
}
