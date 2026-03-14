import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  const ownedCards = await prisma.ownedCard.findMany({
    where: { 
      userId: session.user.id,
      status: "ACTIVE"
    },
    include: {
      barCardType: true
    },
    orderBy: {
      purchaseDate: "asc"
    }
  });

  async function punchCard(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const ownedCardId = formData.get("ownedCardId") as string;
    
    const card = await prisma.ownedCard.findUnique({
      where: { id: ownedCardId, userId: session.user.id }
    });

    if (!card || card.remainingUnits <= 0) return;

    const newUnits = card.remainingUnits - 1;
    const newStatus = newUnits === 0 ? "EXHAUSTED" : "ACTIVE";

    await prisma.ownedCard.update({
      where: { id: card.id },
      data: {
        remainingUnits: newUnits,
        status: newStatus
      }
    });

    revalidatePath("/dashboard");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary)" }}>Mijn Dashboard</h1>
      </div>

      {ownedCards.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Je hebt geen actieve kaarten</h2>
          <p style={{ marginTop: "1rem", marginBottom: "2rem" }}>Ga naar de shop om een nieuwe BarKas kaart te kopen.</p>
          <a href="/shop" className="btn-primary" style={{ textDecoration: "none" }}>Naar Shop</a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
          {ownedCards.map((card: any) => {
            const percentage = (card.remainingUnits / card.barCardType.capacity) * 100;
            const isLow = card.remainingUnits <= 3;

            return (
              <div key={card.id} className="card" style={{ borderTop: `4px solid ${isLow ? 'var(--accent-red)' : 'var(--primary)'}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{card.barCardType.name}</h3>
                  <span style={{ 
                    background: "var(--bg-color)", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px",
                    fontWeight: "bold",
                    color: isLow ? "var(--accent-red)" : "var(--text-color)"
                  }}>
                    {card.remainingUnits} / {card.barCardType.capacity}
                  </span>
                </div>

                <div style={{ 
                  width: "100%", 
                  height: "10px", 
                  backgroundColor: "var(--bg-color)", 
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "2rem"
                }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${percentage}%`, 
                    backgroundColor: isLow ? "var(--accent-red)" : "var(--primary)",
                    transition: "width 0.3s ease"
                  }} />
                </div>

                <form action={punchCard}>
                  <input type="hidden" name="ownedCardId" value={card.id} />
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      width: "100%", 
                      fontSize: "1.1rem", 
                      padding: "1rem",
                      backgroundColor: "var(--primary)"
                    }}
                    disabled={card.remainingUnits <= 0}
                  >
                    1 Biertje Afstrepen
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
