import { auth, signIn, signOut } from "@/auth";

export default async function AuthStatus() {
  const session = await auth();

  if (session?.user) {
    return (
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>Hoi, {session.user.name?.split(" ")[0]}</span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" style={{ 
            background: "none", 
            border: "1px solid var(--border-color)", 
            color: "var(--text-color)",
            padding: "0.25rem 0.5rem",
            cursor: "pointer",
            borderRadius: "4px"
          }}>
            Uitloggen
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
        Inloggen
      </button>
    </form>
  );
}
