import { LeadsTable } from "@/components/leads-table";
import { MetricsCards } from "@/components/metrics-cards";
import { FunnelChart } from "@/components/funnel-chart";
import { BatchBtn } from "@/components/batch-btn";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Prospect Hunter</h1>
          <nav className="flex gap-2">
            <Link href="/dashboard/search">
              <Button variant="outline" size="sm">
                Configurar Busca
              </Button>
            </Link>
            <BatchBtn />
          </nav>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-6 py-6">
        <MetricsCards />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LeadsTable />
          </div>
          <FunnelChart />
        </div>
      </main>
    </div>
  );
}
