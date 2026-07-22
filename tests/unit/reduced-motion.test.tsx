import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useReducedMotionPreference } from '@/components/animation/useReducedMotionPreference'

describe('useReducedMotionPreference', () => {
  it('tracks media-query changes and removes its listener on unmount', () => {
    let matches = true
    let listener: (() => void) | undefined
    const addEventListener = vi.fn(
      (_event: string, callback: () => void) => {
        listener = callback
      },
    )
    const removeEventListener = vi.fn()

    vi.stubGlobal('matchMedia', vi.fn(
      () =>
        ({
          get matches() {
            return matches
          },
          media: '(prefers-reduced-motion: reduce)',
          onchange: null,
          addEventListener,
          removeEventListener,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    ))

    const { result, unmount } = renderHook(() => useReducedMotionPreference())
    expect(result.current).toBe(true)
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    matches = false
    act(() => listener?.())
    expect(result.current).toBe(false)

    unmount()
    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    )
  })
})
