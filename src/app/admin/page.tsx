import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdminPage() {
  const session = await auth();
  
  // NOTE: In a real app, verify `session.user.role === "ADMIN"` 
  // For the sake of this prototype based on instructions, I will just require login.
  if (!session?.user?.id) {
    redirect("/");
  }

  const cardTypes = await prisma.barCardType.findMany({
    orderBy: { createdAt: "desc" }
  });

  const allOwnedCards = await prisma.ownedCard.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: true,
      barCardType: true
    },
    orderBy: { purchaseDate: "desc" }
  });

  async function createCardType(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const capacity = parseInt(formData.get("capacity") as string, 10);

    if (name && price && capacity) {
      await prisma.barCardType.create({
        data: { name, price, capacity }
      });
      revalidatePath("/admin");
      revalidatePath("/shop");
    }
  }

  async function toggleCardStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const card = await prisma.barCardType.findUnique({ where: { id } });
    if (card) {
      await prisma.barCardType.update({
        where: { id },
        data: { isActive: !card.isActive }
      });
      revalidatePath("/admin");
      revalidatePath("/shop");
    }
  }

  return (
    <div>
      <h1 style={{ color: "var(--primary)", marginBottom: "2rem" }}>Admin Beheerpanel</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Left Col: Create Card Types */}
        <section>
          <h2>Nieuwe Barkaart Aanmaken</h2>
          <div className="card" style={{ marginTop: "1rem" }}>
            <form action={createCardType} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
               <div>
                 <label style={{ display: "block", marginBottom: "0.5rem" }}>Naam (bijv. 15 Biertjes)</label>
                 <input name="name" type="text" required style={{ width: "100%", padding: "0.5rem" }} />
               </div>
               <div>
                 <label style={{ display: "block", marginBottom: "0.5rem" }}>Prijs (€)</label>
                 <input name="price" type="number" step="0.01" required style={{ width: "100%", padding: "0.5rem" }} />
               </div>
               <div>
                 <label style={{ display: "block", marginBottom: "0.5rem" }}>Aantal Drankjes (Capaciteit)</label>
                 <input name="capacity" type="number" required style={{ width: "100%", padding: "0.5rem" }} />
               </div>
               <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>Aanmaken</button>
            </form>
          </div>

          <h3 style={{ marginTop: "2rem" }}>Bestaande Types</h3>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {cardTypes.map((c: any) => (
              <li key={c.id} className="card" style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{c.name}</strong> - €{c.price.toFixed(2)} ({c.capacity} stuks) 
                  <span style={{ marginLeft: "1rem", color: c.isActive ? "var(--primary)" : "var(--accent-red)" }}>
                    {c.isActive ? "Actief" : "Inactief"}
                  </span>
                </div>
                <form action={toggleCardStatus}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" style={{ padding: "0.5rem", cursor: "pointer" }}>
                    {c.isActive ? "Deactiveren" : "Activeren"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        {/* Right Col: View Users/Cards */}
        <section>
          <h2>Actieve Gebruikers Kaarten</h2>
          <div className="card" style={{ marginTop: "1rem", maxHeight: "600px", overflowY: "auto" }}>
            {allOwnedCards.length === 0 ? <p>Geen actieve kaarten.</p> : (
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "0.5rem" }}>Gebruiker</th>
                    <th style={{ padding: "0.5rem" }}>Kaart Type</th>
                    <th style={{ padding: "0.5rem" }}>Tegoed</th>
                  </tr>
                </thead>
                <tbody>
                  {allOwnedCards.map((oc: any) => (
                    <tr key={oc.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.5rem" }}>{oc.user?.name || oc.user?.email || "Onbekend"}</td>
                      <td style={{ padding: "0.5rem" }}>{oc.barCardType.name}</td>
                      <td style={{ padding: "0.5rem" }}>{oc.remainingUnits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
