"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Prospect, Message } from "@/types";

interface Props {
  prospect: Prospect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusOptions = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "replied", label: "Respondeu" },
  { value: "qualified", label: "Qualificado" },
  { value: "closed", label: "Fechado" },
  { value: "lost", label: "Perdido" },
];

export function LeadDetailSheet({
  prospect,
  open,
  onOpenChange,
  onUpdate,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMsg, setEditingMsg] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prospect && open) {
      fetchDetail();
    }
  }, [prospect?.id, open]);

  async function fetchDetail() {
    if (!prospect) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      toast.error("Erro ao carregar detalhes");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: string) {
    if (!prospect) return;
    try {
      await fetch(`/api/prospects/${prospect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success("Status atualizado");
      onUpdate();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  async function generateMessage() {
    if (!prospect) return;
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/prospects/${prospect.id}/generate-message`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success("Mensagem gerada com sucesso");
      fetchDetail();
      onUpdate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao gerar mensagem"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function saveEdit(messageId: number) {
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editedContent: editContent }),
      });
      toast.success("Mensagem editada");
      setEditingMsg(null);
      fetchDetail();
    } catch {
      toast.error("Erro ao salvar edição");
    }
  }

  function copyMessage(msg: Message) {
    const text = msg.editedContent || msg.content;
    navigator.clipboard.writeText(text);
    toast.success("Mensagem copiada!");
  }

  if (!prospect) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">@{prospect.username}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Info do Prospect */}
          <div className="space-y-3">
            {prospect.name && (
              <div>
                <span className="text-sm text-muted-foreground">Nome:</span>
                <p className="font-medium">{prospect.name}</p>
              </div>
            )}
            {prospect.bio && (
              <div>
                <span className="text-sm text-muted-foreground">Bio:</span>
                <p className="text-sm">{prospect.bio}</p>
              </div>
            )}
            <div className="flex gap-4">
              {prospect.followers != null && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Seguidores:
                  </span>
                  <p className="font-medium">
                    {prospect.followers.toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
              {prospect.email && (
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-medium">{prospect.email}</p>
                </div>
              )}
            </div>
            {prospect.website && (
              <div>
                <span className="text-sm text-muted-foreground">Website:</span>
                <p className="text-sm">{prospect.website}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Status do Lead:</span>
            <Select
              value={prospect.status}
              onValueChange={updateStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mensagens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mensagens</span>
              <Button
                size="sm"
                onClick={generateMessage}
                disabled={generating}
              >
                {generating ? "Gerando..." : "Gerar Mensagem"}
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma mensagem gerada ainda.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.generatedAt).toLocaleString("pt-BR")}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(msg)}
                      >
                        Copiar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMsg(msg.id);
                          setEditContent(
                            msg.editedContent || msg.content
                          );
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>

                  {editingMsg === msg.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(msg.id)}
                        >
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMsg(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.editedContent || msg.content}
                      {msg.editedContent && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          editada
                        </Badge>
                      )}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
