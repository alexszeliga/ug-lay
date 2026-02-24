[**ug-layout**](../../../README.md)

***

[ug-layout](../../../README.md) / [react/src](../README.md) / LayoutContextValue

# Interface: LayoutContextValue\<TMetadata\>

Defined in: react/src/context.tsx:30

## Type Parameters

### TMetadata

`TMetadata` = `any`

## Properties

### config?

> `optional` **config**: [`LayoutConfig`](LayoutConfig.md)

Defined in: react/src/context.tsx:34

***

### dragState

> **dragState**: [`DragState`](DragState.md) \| `null`

Defined in: react/src/context.tsx:35

***

### engine

> **engine**: [`LayoutEngine`](../../../core/src/classes/LayoutEngine.md)\<`TMetadata`\>

Defined in: react/src/context.tsx:31

***

### registry?

> `optional` **registry**: [`ComponentRegistry`](../type-aliases/ComponentRegistry.md)\<`TMetadata`\>

Defined in: react/src/context.tsx:33

***

### setDragState()

> **setDragState**: (`state`) => `void`

Defined in: react/src/context.tsx:36

#### Parameters

##### state

[`DragState`](DragState.md) | `null`

#### Returns

`void`

***

### state

> **state**: [`LayoutState`](../../../core/src/interfaces/LayoutState.md)\<`TMetadata`\>

Defined in: react/src/context.tsx:32
