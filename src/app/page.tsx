import Link from "next/link";
import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="home-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1 style={{ fontSize: "3rem", color: "var(--primary)", marginBottom: "1rem" }}>
        Welkom bij BarKas
      </h1>
      <p style={{ fontSize: "1.25rem", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
        Het digitale streeploos systeem voor de Bar van Scouting Willibrordusgroep.
        Koop online je kaarten en hou precies bij hoeveel drankjes je nog tegoed hebt!
      </p>
      
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        {session ? (
          <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none" }}>
            Mijn Dashboard
          </Link>
        ) : (
          <form
            action={async () => {
              "use server"
              await signIn("google")
            }}
          >
            <button type="submit" className="btn-primary">
              Inloggen met Google
            </button>
          </form>
        )}
        <Link 
          href="/shop" 
          className="btn-primary" 
          style={{ textDecoration: "none", backgroundColor: "var(--secondary)" }}
        >
          Kaarten Kopen
        </Link>
      </div>

      <div className="home-features" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "2rem", 
        marginTop: "4rem",
        textAlign: "left"
      }}>
        <div className="card">
          <h3 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>Makkelijk Beheer</h3>
          <p>Nooit meer papieren kaarten kwijtraken. Alles staat overzichtelijk in je account.</p>
        </div>
        <div className="card">
          <h3 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>Snel Afstrepen</h3>
          <p>Met slechts een druk op de knop streept de barmedewerker, of jijzelf, een drankje af.</p>
        </div>
        <div className="card">
          <h3 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>Altijd Inzicht</h3>
          <p>Zie precies hoeveel biertjes (of fris) je nog tegoed hebt en wanneer je een nieuwe kaart nodig hebt.</p>
        </div>
      </div>
    </div>
  );
}
