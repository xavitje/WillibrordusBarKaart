import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import AuthStatus from "./AuthStatus";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <Link href="/" className="brand">
          BarKas
        </Link>
        <nav className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/shop">Kaarten Kopen</Link>
          <Link href="/admin">Admin</Link>
          <ThemeToggle />
          <AuthStatus />
        </nav>
      </div>
    </header>
  );
}

