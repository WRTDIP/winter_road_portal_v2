import { useCallback, useEffect, useRef, useState } from "react"

/* Drag-to-resize for a bottom sheet with three resting heights: "peek" (just
   the drag zone: handle, header and tabs), "half" and "full".

   Only the drag zone listens for the drag, so the sheet body keeps native
   scrolling and a chart's own touch handling. While a drag is in progress the
   height is written straight to the element, so the (very large) map
   component does not re-render on every pointer move; only the snap at the
   end goes through React state.

   A movement under DRAG_SLOP px is a tap and is left alone, so the buttons and
   tabs inside the drag zone still work. After a real drag the click that
   follows pointerup is swallowed so it cannot also press a button. */

const DRAG_SLOP = 6
const FLICK = 0.5 // px per ms
const ORDER = ["peek", "half", "full"]

function useViewportHeight() {
  const [vh, setVh] = useState(() => (typeof window === "undefined" ? 800 : window.innerHeight))
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener("resize", onResize)
    window.visualViewport?.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      window.visualViewport?.removeEventListener("resize", onResize)
    }
  }, [])
  return vh
}

export default function useSheetDrag({ enabled, snap, setSnap, onClose }) {
  const sheetRef = useRef(null)
  const zoneRef = useRef(null)
  const drag = useRef(null)
  const swallowClick = useRef(false)
  const [peekH, setPeekH] = useState(120)
  const vh = useViewportHeight()

  // The peek height is whatever the drag zone needs, which changes with the
  // title wrapping onto a second line.
  useEffect(() => {
    const el = zoneRef.current
    if (!enabled || !el) return undefined
    const measure = () => setPeekH(Math.ceil(el.getBoundingClientRect().height))
    measure()
    if (typeof ResizeObserver === "undefined") return undefined
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [enabled])

  const heights = {
    peek: peekH,
    half: Math.max(peekH + 160, Math.round(vh * 0.55)),
    full: Math.max(peekH + 160, vh - 12),
  }
  // The pointer handlers read the latest heights through a ref, so they never
  // act on a stale viewport size after a rotation.
  const heightsRef = useRef(heights)
  heightsRef.current = heights

  const onPointerDown = useCallback(
    (e) => {
      if (!enabled || (e.pointerType === "mouse" && e.button !== 0)) return
      const sheet = sheetRef.current
      if (!sheet) return
      swallowClick.current = false
      drag.current = {
        id: e.pointerId,
        startY: e.clientY,
        startH: sheet.getBoundingClientRect().height,
        active: false,
        samples: [{ y: e.clientY, t: e.timeStamp }],
      }
    },
    [enabled]
  )

  const onPointerMove = useCallback(
    (e) => {
      const d = drag.current
      const sheet = sheetRef.current
      if (!d || d.id !== e.pointerId || !sheet) return
      const dy = e.clientY - d.startY
      if (!d.active) {
        if (Math.abs(dy) < DRAG_SLOP) return
        d.active = true
        zoneRef.current?.setPointerCapture?.(e.pointerId)
        sheet.classList.add("wrtdip-feature-popup--dragging")
      }
      const h = Math.min(heightsRef.current.full, Math.max(0, d.startH - dy))
      sheet.style.height = `${h}px`
      d.samples.push({ y: e.clientY, t: e.timeStamp })
      if (d.samples.length > 5) d.samples.shift()
    },
    []
  )

  const finish = useCallback(
    (e) => {
      const d = drag.current
      const sheet = sheetRef.current
      drag.current = null
      if (!d || !d.active || !sheet) return
      const heights = heightsRef.current
      // Swallow only the click the browser synthesises from this gesture; if
      // none comes (the finger ended off any button), forget it shortly after
      // so a later keyboard press on the handle is not eaten.
      swallowClick.current = true
      setTimeout(() => {
        swallowClick.current = false
      }, 400)
      sheet.classList.remove("wrtdip-feature-popup--dragging")
      const h = sheet.getBoundingClientRect().height
      sheet.style.height = ""

      const first = d.samples[0]
      const last = d.samples[d.samples.length - 1]
      const v = last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0 // + is downward

      if (h < heights.peek * 0.6 || (v > FLICK && h < heights.peek + 24)) {
        onClose()
        return
      }
      let target
      if (Math.abs(v) > FLICK) {
        // A flick moves one step from wherever the sheet was dragged to.
        const below = ORDER.filter((k) => heights[k] < h)
        const above = ORDER.filter((k) => heights[k] > h)
        target = v > 0 ? below[below.length - 1] || "peek" : above[0] || "full"
      } else {
        target = ORDER.reduce((best, k) => (Math.abs(heights[k] - h) < Math.abs(heights[best] - h) ? k : best), "peek")
      }
      setSnap(target)
    },
    [onClose, setSnap]
  )

  const onClickCapture = useCallback((e) => {
    if (swallowClick.current) {
      swallowClick.current = false
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const zoneProps = enabled
    ? {
        ref: zoneRef,
        onPointerDown,
        onPointerMove,
        onPointerUp: finish,
        onPointerCancel: finish,
        onClickCapture,
      }
    : { ref: zoneRef }

  return {
    sheetRef,
    zoneProps,
    sheetStyle: enabled ? { height: heights[snap] } : undefined,
  }
}
