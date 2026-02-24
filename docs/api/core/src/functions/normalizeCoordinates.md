[**ug-layout**](../../../README.md)

***

[ug-layout](../../../README.md) / [core/src](../README.md) / normalizeCoordinates

# Function: normalizeCoordinates()

> **normalizeCoordinates**(`rect`, `clientX`, `clientY`): [`Point`](../interfaces/Point.md)

Defined in: core/src/geometry.ts:23

Normalizes pointer coordinates relative to a bounding rectangle.
Handles potential CSS transforms (scale, zoom) by relying on the 
provided client-relative rectangle (usually from getBoundingClientRect).

## Parameters

### rect

[`Rect`](../interfaces/Rect.md)

The bounding client rectangle of the target element.

### clientX

`number`

The pointer's X coordinate (client-relative).

### clientY

`number`

The pointer's Y coordinate (client-relative).

## Returns

[`Point`](../interfaces/Point.md)

An object containing normalized x and y (0 to 1).
