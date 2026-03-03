import type { Prospect } from "@/types";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: { message: string };
}

function buildPrompt(prospect: Prospect): string {
  return `Você é um especialista em copywriting para prospecção B2B no Instagram.

Gere uma mensagem de primeira abordagem personalizada para este prospect:

Nome: ${prospect.name || prospect.username}
Bio: ${prospect.bio || "Não disponível"}
Seguidores: ${prospect.followers || "Não informado"}
Nicho provável: (inferir da bio)

Contexto: Agência de IA que ajuda empresários a implementar inteligência artificial nos seus negócios.
Ticket médio: R$2.000

Regras:
- Máximo 3 parágrafos curtos
- Tom profissional mas acessível
- Mencione algo específico do perfil
- Não seja genérico ou spam
- Termine com uma pergunta aberta
- Não use emojis em excesso (máx 2)`;
}

export async function generateMessage(prospect: Prospect): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const prompt = buildPrompt(prospect);

  const response = await fetch(
    `${GEMINI_BASE_URL}/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return text;
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
