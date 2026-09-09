import { AuthGate } from "@/features/auth/components/AuthGate";
import { Navbar } from "@/features/dashboard/components/Navbar";

export default function DashboardPage() {
  return (
    <AuthGate>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-2 p-6">
          <h1 className="text-2xl font-semibold">Pulpit domowy</h1>
          <p className="text-muted-foreground">
            Szkielet aplikacji. Elementy pulpitu pojawią się tutaj.
          </p>
        </main>
      </div>
    </AuthGate>
  );
}
