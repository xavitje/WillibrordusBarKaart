import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function ShopPage() {
  const session = await auth();
  
  // Create default cards if none exist for demo purposes
  const cardCount = await prisma.barCardType.count();
  if (cardCount === 0) {
    await prisma.barCardType.createMany({
      data: [
        { name: "15 Biertjes", price: 10.0, capacity: 15 },
        { name: "20 Biertjes", price: 13.0, capacity: 20 },
      ]
    });
  }

  const cardTypes = await prisma.barCardType.findMany({
    where: { isActive: true }
  });

  async function buyCard(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) {
      redirect("/");
    }

    const cardTypeId = formData.get("cardTypeId") as String;
    const cardType = await prisma.barCardType.findUnique({
      where: { id: cardTypeId as string }
    });

    if (!cardType) return;

    await prisma.ownedCard.create({
      data: {
        userId: session.user.id,
        barCardTypeId: cardType.id,
        remainingUnits: cardType.capacity,
      }
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 style={{ color: "var(--primary)", marginBottom: "2rem" }}>Shop - Kaarten Kopen</h1>
      
      {!session ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Log in om kaarten te kopen</h2>
          <p style={{ marginTop: "1rem", color: "var(--text-color)" }}>
            Je moet ingelogd zijn om een BarKas kaart aan je account toe te voegen.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {cardTypes.map((card: any) => (
            <div key={card.id} className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{card.name}</h2>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--secondary)", margin: "1rem 0" }}>
                €{card.price.toFixed(2)}
              </p>
              <p style={{ marginBottom: "2rem" }}>Goed voor {card.capacity} drankjes</p>
              
              <form action={buyCard} style={{ width: "100%" }}>
                <input type="hidden" name="cardTypeId" value={card.id} />
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                  Koop Nu (Demo)
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
