import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold tracking-tight">Prospect Hunter</h1>
      <p className="mt-2 text-zinc-400">
        Sistema de prospecção automatizada com IA
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium hover:bg-blue-700"
      >
        Abrir Dashboard
      </Link>
    </div>
  );
}
