[**ug-layout**](../../../README.md)

***

[ug-layout](../../../README.md) / [core/src](../README.md) / calculateRatio

# Function: calculateRatio()

> **calculateRatio**(`rect`, `clientX`, `clientY`, `direction`, `gutterSize?`): `number`

Defined in: core/src/geometry.ts:47

Calculates a new ratio for a split based on a pointer position.

## Parameters

### rect

[`Rect`](../interfaces/Rect.md)

The bounding client rectangle of the split container.

### clientX

`number`

The pointer's X coordinate.

### clientY

`number`

The pointer's Y coordinate.

### direction

The direction of the split.

`"horizontal"` | `"vertical"`

### gutterSize?

`number` = `4`

The size of the gutter in pixels.

## Returns

`number`

A ratio between 0 and 1.
