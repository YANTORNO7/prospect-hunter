"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Prospect } from "@/types";
import { LeadDetailSheet } from "./lead-detail-sheet";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  replied: "bg-green-100 text-green-800",
  qualified: "bg-purple-100 text-purple-800",
  closed: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  replied: "Respondeu",
  qualified: "Qualificado",
  closed: "Fechado",
  lost: "Perdido",
};

export function LeadsTable() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      sort: "createdAt",
      order: "desc",
    });
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/prospects?${params}`);
      const json = await res.json();
      setProspects(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch {
      setProspects([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const openDetail = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nome, username ou bio..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Novo</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="replied">Respondeu</SelectItem>
            <SelectItem value="qualified">Qualificado</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground self-center">
          {total} prospects
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Seguidores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : prospects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum prospect encontrado
                </TableCell>
              </TableRow>
            ) : (
              prospects.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openDetail(p)}
                >
                  <TableCell className="font-medium">@{p.username}</TableCell>
                  <TableCell>{p.name || "—"}</TableCell>
                  <TableCell>
                    {p.followers?.toLocaleString("pt-BR") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[p.status] || ""}
                    >
                      {statusLabels[p.status] || p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.messageStatus === "ready" ? "default" : "outline"
                      }
                    >
                      {p.messageStatus === "ready"
                        ? "Pronta"
                        : p.messageStatus === "pending"
                          ? "Gerando..."
                          : "Sem mensagem"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      <LeadDetailSheet
        prospect={selectedProspect}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={fetchProspects}
      />
    </div>
  );
}
