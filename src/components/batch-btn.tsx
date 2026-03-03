"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BatchBtn() {
  const [loading, setLoading] = useState(false);

  async function handleBatch() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages/generate-batch", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(
        `Geradas: ${data.generated} | Falhas: ${data.failed || 0}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro na geração em lote"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleBatch} disabled={loading}>
      {loading ? "Gerando..." : "Gerar Mensagens em Lote"}
    </Button>
  );
}
