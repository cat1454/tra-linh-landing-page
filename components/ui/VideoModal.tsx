'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

interface VideoModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: ReactNode
}

export function VideoModal({ isOpen, onClose, title, children }: VideoModalProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const elements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      if (!elements.length) {
        event.preventDefault()
        return
      }
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="video-modal fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <div ref={panelRef} className="video-modal__panel relative w-full max-w-5xl rounded-[1.5rem] bg-[#10251A] p-3 text-white shadow-2xl sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-4 px-1">
          <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Đóng video"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 hover:border-[#D5A84E] hover:text-[#D5A84E]"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <div className="video-modal__content aspect-video overflow-hidden rounded-xl bg-black">{children}</div>
      </div>
    </motion.div>
  )
}

export default VideoModal
