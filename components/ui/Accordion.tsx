'use client'

import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import clsx from 'clsx'

export interface AccordionItem {
  readonly id: string
  readonly title: string
  readonly content: ReactNode
}

interface AccordionProps {
  readonly items: readonly AccordionItem[]
  readonly defaultOpenId?: string
  readonly className?: string
  readonly inverse?: boolean
}

export function Accordion({
  items,
  defaultOpenId,
  className,
  inverse = false,
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)
  const componentId = useId().replaceAll(':', '')
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={clsx('ui-accordion divide-y', inverse ? 'divide-white/12' : 'divide-[#10251A]/12', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id
        const triggerId = `${componentId}-${item.id}-trigger`
        const panelId = `${componentId}-${item.id}-panel`
        return (
          <div key={item.id} className="ui-accordion__item">
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={clsx(
                  'ui-accordion__trigger flex min-h-14 w-full items-center justify-between gap-5 py-4 text-left text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] sm:text-lg',
                  inverse ? 'text-[#EEF1E9]' : 'text-[#10251A]',
                )}
              >
                <span>{item.title}</span>
                <motion.span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-current/20"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  <Plus size={18} />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="ui-accordion__panel overflow-hidden"
                  initial={prefersReducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
                >
                  <div className={clsx('pb-6 pr-10 text-sm leading-7 sm:text-base', inverse ? 'text-[#EEF1E9]/68' : 'text-[#10251A]/68')}>
                    {item.content}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export default Accordion
