"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metrics {
  total: number;
  byStatus: Record<string, number>;
  withMessage: number;
  withoutMessage: number;
}

export function MetricsCards() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      const res = await fetch("/api/prospects?limit=1000");
      const json = await res.json();
      const data = json.data || [];

      const byStatus: Record<string, number> = {};
      let withMessage = 0;
      let withoutMessage = 0;

      for (const p of data) {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
        if (p.messageStatus === "ready") withMessage++;
        else withoutMessage++;
      }

      setMetrics({
        total: json.total || data.length,
        byStatus,
        withMessage,
        withoutMessage,
      });
    } catch {
      // silently fail
    }
  }

  if (!metrics) return null;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Prospects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Novos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.byStatus["new"] || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Com Mensagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {metrics.withMessage}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Qualificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {metrics.byStatus["qualified"] || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
