export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Normalizes pointer coordinates relative to a bounding rectangle.
 * Handles potential CSS transforms (scale, zoom) by relying on the 
 * provided client-relative rectangle (usually from getBoundingClientRect).
 * 
 * @param rect The bounding client rectangle of the target element.
 * @param clientX The pointer's X coordinate (client-relative).
 * @param clientY The pointer's Y coordinate (client-relative).
 * @returns An object containing normalized x and y (0 to 1).
 */
export function normalizeCoordinates(
  rect: Rect,
  clientX: number,
  clientY: number
): Point {
  // Use Math.max/min to clamp values between 0 and 1, or allow 
  // overflowing if we want to detect "outside" drags. 
  // For most layout logic, we want the raw relative value.
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;

  return { x, y };
}

/**
 * Calculates a new ratio for a split based on a pointer position.
 * 
 * @param rect The bounding client rectangle of the split container.
 * @param clientX The pointer's X coordinate.
 * @param clientY The pointer's Y coordinate.
 * @param direction The direction of the split.
 * @param gutterSize The size of the gutter in pixels.
 * @returns A ratio between 0 and 1.
 */
export function calculateRatio(
  rect: Rect,
  clientX: number,
  clientY: number,
  direction: 'horizontal' | 'vertical',
  gutterSize: number
): number {
  if (direction === 'horizontal') {
    const totalWidth = rect.width - gutterSize;
    return (clientX - rect.left - gutterSize / 2) / totalWidth;
  } else {
    const totalHeight = rect.height - gutterSize;
    return (clientY - rect.top - gutterSize / 2) / totalHeight;
  }
}
