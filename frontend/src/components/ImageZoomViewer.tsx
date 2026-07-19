import { useEffect } from 'react'

export interface ImageZoomViewerProps {
  src: string
  alt: string
  onClose: () => void
}

export function ImageZoomViewer({ src, alt, onClose }: ImageZoomViewerProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return <div className="fixed inset-0 z-50 bg-slate-950/95" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
    <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm sm:right-5 sm:top-5">Close</button>
    <div className="flex h-dvh w-dvw items-center justify-center p-3 sm:p-8">
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" onClick={event => event.stopPropagation()}/>
    </div>
  </div>
}
