import { Button } from './Button'
import { Dialog } from './Dialog'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  loading = false,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={tone === 'danger' ? 'danger' : 'primary'} disabled={loading} onClick={onConfirm}>
            {loading ? 'Aguarde…' : confirmLabel}
          </Button>
        </>
      }
    />
  )
}
