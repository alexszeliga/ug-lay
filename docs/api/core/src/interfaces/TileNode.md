[**ug-layout**](../../../README.md)

***

[ug-layout](../../../README.md) / [core/src](../README.md) / TileNode

# Interface: TileNode\<TMetadata\>

Defined in: core/src/types.ts:15

## Extends

- [`BaseNode`](BaseNode.md)

## Type Parameters

### TMetadata

`TMetadata` = `any`

## Properties

### activeTabIndex?

> `optional` **activeTabIndex**: `number`

Defined in: core/src/types.ts:20

***

### contentId?

> `optional` **contentId**: `string`

Defined in: core/src/types.ts:17

***

### id

> **id**: `string`

Defined in: core/src/types.ts:5

#### Inherited from

[`BaseNode`](BaseNode.md).[`id`](BaseNode.md#id)

***

### metadata?

> `optional` **metadata**: `TMetadata`

Defined in: core/src/types.ts:18

***

### tabs?

> `optional` **tabs**: [`TileTab`](TileTab.md)\<`TMetadata`\>[]

Defined in: core/src/types.ts:19

***

### type

> **type**: `"tile"`

Defined in: core/src/types.ts:16

#### Overrides

[`BaseNode`](BaseNode.md).[`type`](BaseNode.md#type)
