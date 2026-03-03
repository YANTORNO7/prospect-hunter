"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SearchConfig } from "@/types";

export function SearchConfigList() {
  const [configs, setConfigs] = useState<SearchConfig[]>([]);
  const [collecting, setCollecting] = useState<number | null>(null);

  useEffect(() => {
    fetchConfigs();
    const handler = () => fetchConfigs();
    window.addEventListener("config-created", handler);
    return () => window.removeEventListener("config-created", handler);
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch("/api/search-configs");
      const json = await res.json();
      setConfigs(json.data || []);
    } catch {
      // silently fail
    }
  }

  async function runCollection(configId: number) {
    setCollecting(configId);
    try {
      const res = await fetch(`/api/collect/${configId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(
        `Coletados: ${data.collected} | Novos: ${data.new} | Duplicados: ${data.duplicates}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro na coleta"
      );
    } finally {
      setCollecting(null);
    }
  }

  async function deleteConfig(id: number) {
    try {
      await fetch(`/api/search-configs/${id}`, { method: "DELETE" });
      toast.success("Configuração removida");
      fetchConfigs();
    } catch {
      toast.error("Erro ao remover");
    }
  }

  function parseJson(val: string | null): string[] {
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }

  if (configs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma configuração salva ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {configs.map((cfg) => (
        <Card key={cfg.id}>
          <CardContent className="flex items-start justify-between p-4">
            <div className="space-y-2">
              <div className="font-medium">{cfg.name}</div>
              <div className="flex flex-wrap gap-1">
                {parseJson(cfg.hashtags).map((h) => (
                  <Badge key={h} variant="secondary">
                    #{h}
                  </Badge>
                ))}
                {parseJson(cfg.targetProfiles).map((p) => (
                  <Badge key={p} variant="outline">
                    @{p}
                  </Badge>
                ))}
                {parseJson(cfg.bioKeywords).map((k) => (
                  <Badge key={k} variant="secondary">
                    {k}
                  </Badge>
                ))}
                {cfg.location && <Badge variant="outline">{cfg.location}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                Criada em {new Date(cfg.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => runCollection(cfg.id)}
                disabled={collecting === cfg.id}
              >
                {collecting === cfg.id ? "Coletando..." : "Coletar"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteConfig(cfg.id)}
              >
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
