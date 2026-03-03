import { SearchConfigForm } from "@/components/search-config-form";
import { SearchConfigList } from "@/components/search-config-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Prospect Hunter</h1>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-6 py-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Nova Configuração de Busca
          </h2>
          <SearchConfigForm />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Configurações Salvas
          </h2>
          <SearchConfigList />
        </div>
      </main>
    </div>
  );
}
