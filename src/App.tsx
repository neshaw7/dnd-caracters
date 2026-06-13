function App() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl">
        <p className="font-display tracking-[0.3em] text-gold/70 text-sm uppercase">
          Dungeons &amp; Dragons 5e
        </p>
        <h1 className="font-display mt-4 text-5xl font-bold text-gold-light drop-shadow sm:text-6xl">
          Grimório de Personagens
        </h1>
        <p className="mt-6 text-lg text-parchment/80">
          Crie, organize e imprima suas fichas de D&amp;D em um só lugar.
          O projeto está no ar e funcionando. Em breve: suas fichas aqui.
        </p>

        <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-night-soft px-5 py-2 text-sm text-parchment/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Passo 1 concluído: site no ar via GitHub Pages
        </div>
      </div>
    </main>
  )
}

export default App
