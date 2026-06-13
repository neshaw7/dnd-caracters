export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-gold/30 bg-night-soft p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display mb-2 text-lg font-semibold text-gold-light">
          {title}
        </h2>
        <p className="mb-6 text-sm text-parchment/70">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gold/30 py-2.5 text-parchment/80 transition hover:border-gold/60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-wine py-2.5 font-semibold text-parchment transition hover:bg-wine/80"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
