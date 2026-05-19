import { useRef, useEffect, useCallback } from "react";

const ABSOLUTE_MIN = 1900;
const ABSOLUTE_MAX = new Date().getFullYear();

/**
 * Hook that enables pinch-to-zoom and single-finger pan on a chart container.
 * - Horizontal pinch = adjust X-axis (year) range
 * - Vertical pinch = adjust Y-axis (value) range
 * - Single-finger horizontal drag = pan the time window left/right
 *
 * @param {[number, number]} yearRange - Current [startYear, endYear]
 * @param {function} setYearRange - Setter for year range
 * @param {number} dataMin - Minimum year in the dataset
 * @param {number} dataMax - Maximum year in the dataset
 * @param {object} [yAxis] - Optional Y-axis config: { range, setRange, min, max }
 * @returns {React.RefObject} ref to attach to the chart container
 */
function usePinchZoomYears(yearRange, setYearRange, dataMin, dataMax, yAxis) {
  const containerRef = useRef(null);
  const pinchState = useRef(null);
  const panState = useRef(null);

  const minRange = 5; // minimum 5 years visible
  const boundMin = Math.max(dataMin || ABSOLUTE_MIN, ABSOLUTE_MIN);
  const boundMax = Math.min(dataMax || ABSOLUTE_MAX, ABSOLUTE_MAX);

  const yBoundMin = yAxis ? yAxis.min : 0;
  const yBoundMax = yAxis ? yAxis.max : 0;
  const yMinSpan = yAxis ? Math.max((yBoundMax - yBoundMin) * 0.05, 100) : 0;

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getHorizontalDistance = (touches) => {
    return Math.abs(touches[0].clientX - touches[1].clientX);
  };

  const getVerticalDistance = (touches) => {
    return Math.abs(touches[0].clientY - touches[1].clientY);
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Pinch start
      e.preventDefault();
      panState.current = null;
      pinchState.current = {
        initialHDist: getHorizontalDistance(e.touches),
        initialVDist: getVerticalDistance(e.touches),
        initialRange: [...yearRange],
        initialYRange: yAxis ? [...yAxis.range] : null,
      };
    } else if (e.touches.length === 1) {
      // Pan start
      pinchState.current = null;
      panState.current = {
        startX: e.touches[0].clientX,
        initialRange: [...yearRange],
        containerWidth: containerRef.current ? containerRef.current.offsetWidth : 300,
      };
    }
  }, [yearRange, yAxis?.range]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && pinchState.current) {
      // Pinch zoom - separate horizontal and vertical components
      e.preventDefault();
      panState.current = null;

      const currentHDist = getHorizontalDistance(e.touches);
      const currentVDist = getVerticalDistance(e.touches);

      // Horizontal pinch → X-axis (years)
      if (pinchState.current.initialHDist > 20) {
        const hScale = pinchState.current.initialHDist / currentHDist;
        const [initStart, initEnd] = pinchState.current.initialRange;
        const initSpan = initEnd - initStart;
        const center = (initStart + initEnd) / 2;

        let newSpan = Math.round(initSpan * hScale);
        newSpan = Math.max(minRange, Math.min(boundMax - boundMin, newSpan));

        let newStart = Math.round(center - newSpan / 2);
        let newEnd = newStart + newSpan;

        if (newStart < boundMin) {
          newStart = boundMin;
          newEnd = newStart + newSpan;
        }
        if (newEnd > boundMax) {
          newEnd = boundMax;
          newStart = newEnd - newSpan;
        }
        newStart = Math.max(newStart, boundMin);

        setYearRange([newStart, newEnd]);
      }

      // Vertical pinch → Y-axis (values)
      if (yAxis && pinchState.current.initialVDist > 20 && pinchState.current.initialYRange) {
        const vScale = pinchState.current.initialVDist / currentVDist;
        const [initYStart, initYEnd] = pinchState.current.initialYRange;
        const initYSpan = initYEnd - initYStart;
        const yCenter = (initYStart + initYEnd) / 2;

        let newYSpan = initYSpan * vScale;
        newYSpan = Math.max(yMinSpan, Math.min(yBoundMax - yBoundMin, newYSpan));

        let newYStart = yCenter - newYSpan / 2;
        let newYEnd = yCenter + newYSpan / 2;

        if (newYStart < yBoundMin) {
          newYStart = yBoundMin;
          newYEnd = yBoundMin + newYSpan;
        }
        if (newYEnd > yBoundMax) {
          newYEnd = yBoundMax;
          newYStart = yBoundMax - newYSpan;
        }
        newYStart = Math.max(newYStart, yBoundMin);

        yAxis.setRange([Math.round(newYStart), Math.round(newYEnd)]);
      }
    } else if (e.touches.length === 1 && panState.current) {
      // Single-finger pan
      const dx = e.touches[0].clientX - panState.current.startX;
      const [initStart, initEnd] = panState.current.initialRange;
      const span = initEnd - initStart;

      // Map pixel movement to year shift (full container width = current span)
      const yearShift = Math.round((-dx / panState.current.containerWidth) * span);

      let newStart = initStart + yearShift;
      let newEnd = initEnd + yearShift;

      // Clamp to bounds
      if (newStart < boundMin) {
        newStart = boundMin;
        newEnd = boundMin + span;
      }
      if (newEnd > boundMax) {
        newEnd = boundMax;
        newStart = boundMax - span;
      }

      if (newStart !== yearRange[0] || newEnd !== yearRange[1]) {
        e.preventDefault();
        setYearRange([newStart, newEnd]);
      }
    }
  }, [setYearRange, boundMin, boundMax, yearRange, yAxis?.setRange, yBoundMin, yBoundMax, yMinSpan]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      pinchState.current = null;
    }
    if (e.touches.length === 0) {
      panState.current = null;
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return containerRef;
}

export default usePinchZoomYears;
