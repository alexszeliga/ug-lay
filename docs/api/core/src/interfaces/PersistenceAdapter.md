[**ug-layout**](../../../README.md)

***

[ug-layout](../../../README.md) / [core/src](../README.md) / PersistenceAdapter

# Interface: PersistenceAdapter\<TMetadata\>

Defined in: core/src/types.ts:45

## Type Parameters

### TMetadata

`TMetadata` = `any`

## Methods

### load()

> **load**(): `Promise`\<[`LayoutState`](LayoutState.md)\<`TMetadata`\> \| `null`\>

Defined in: core/src/types.ts:47

#### Returns

`Promise`\<[`LayoutState`](LayoutState.md)\<`TMetadata`\> \| `null`\>

***

### save()

> **save**(`state`): `Promise`\<`void`\>

Defined in: core/src/types.ts:46

#### Parameters

##### state

[`LayoutState`](LayoutState.md)\<`TMetadata`\>

#### Returns

`Promise`\<`void`\>
