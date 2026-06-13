// Aviso amigavel mostrado quando o .env ainda nao tem as chaves do Supabase.
export function SupabaseNotConfigured() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="max-w-lg rounded-2xl border border-gold/30 bg-night-soft p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-gold-light">
          Falta conectar o Supabase
        </h1>
        <p className="mt-4 text-parchment/80">
          Crie um arquivo <code className="text-gold">.env</code> na raiz do
          projeto (copie de <code className="text-gold">.env.example</code>) e
          preencha:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-night p-4 text-left text-sm text-parchment/90">
          {`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...`}
        </pre>
        <p className="mt-4 text-sm text-parchment/60">
          Você encontra esses valores no painel do Supabase em
          <span className="text-parchment/80"> Settings &gt; API</span>. Depois,
          reinicie o <code className="text-gold">npm run dev</code>.
        </p>
      </div>
    </div>
  )
}
