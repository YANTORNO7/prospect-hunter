"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelStep {
  label: string;
  count: number;
  color: string;
}

export function FunnelChart() {
  const [steps, setSteps] = useState<FunnelStep[]>([]);

  useEffect(() => {
    fetchFunnel();
  }, []);

  async function fetchFunnel() {
    try {
      const res = await fetch("/api/prospects?limit=10000");
      const json = await res.json();
      const data = json.data || [];

      const counts: Record<string, number> = {};
      for (const p of data) {
        counts[p.status] = (counts[p.status] || 0) + 1;
      }

      setSteps([
        { label: "Coletados", count: data.length, color: "bg-blue-500" },
        { label: "Contatados", count: counts["contacted"] || 0, color: "bg-yellow-500" },
        { label: "Responderam", count: counts["replied"] || 0, color: "bg-green-500" },
        { label: "Qualificados", count: counts["qualified"] || 0, color: "bg-purple-500" },
        { label: "Fechados", count: counts["closed"] || 0, color: "bg-emerald-500" },
      ]);
    } catch {
      // silently fail
    }
  }

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <div className="space-y-3">
            {steps.map((step) => {
              const width = Math.max((step.count / maxCount) * 100, 2);
              return (
                <div key={step.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{step.label}</span>
                    <span className="font-medium">{step.count}</span>
                  </div>
                  <div className="h-6 w-full bg-muted rounded overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded transition-all`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
