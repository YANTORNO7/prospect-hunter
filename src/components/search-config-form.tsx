"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function SearchConfigForm() {
  const [name, setName] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [profiles, setProfiles] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome da configuração é obrigatório");
      return;
    }

    const hashtagList = hashtags
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    const profileList = profiles
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (!hashtagList.length && !profileList.length && !keywordList.length) {
      toast.error("Preencha pelo menos um critério de busca");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/search-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          hashtags: hashtagList.length ? hashtagList : undefined,
          targetProfiles: profileList.length ? profileList : undefined,
          bioKeywords: keywordList.length ? keywordList : undefined,
          location: location.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast.success("Configuração salva!");
      setName("");
      setHashtags("");
      setProfiles("");
      setKeywords("");
      setLocation("");
      window.dispatchEvent(new Event("config-created"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar configuração"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Critérios de Prospecção</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Nome da Configuração *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Empreendedores Tech SP"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Hashtags (separar por vírgula)
            </label>
            <Input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="empreendedorismo, startups, inovação"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Perfis-Alvo (separar por vírgula)
            </label>
            <Input
              value={profiles}
              onChange={(e) => setProfiles(e.target.value)}
              placeholder="@perfil1, @perfil2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Palavras-chave na Bio (separar por vírgula)
            </label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="CEO, fundador, empresário"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Localização (opcional)
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="São Paulo"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
