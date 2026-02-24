[**ug-lay**](../../../README.md)

***

[ug-lay](../../../README.md) / [core/src](../README.md) / PersistenceAdapter

# Interface: PersistenceAdapter\<TMetadata\>

Defined in: core/src/types.ts:47

## Type Parameters

### TMetadata

`TMetadata` = `any`

## Methods

### load()

> **load**(): `Promise`\<[`LayoutState`](LayoutState.md)\<`TMetadata`\> \| `null`\>

Defined in: core/src/types.ts:49

#### Returns

`Promise`\<[`LayoutState`](LayoutState.md)\<`TMetadata`\> \| `null`\>

***

### save()

> **save**(`state`): `Promise`\<`void`\>

Defined in: core/src/types.ts:48

#### Parameters

##### state

[`LayoutState`](LayoutState.md)\<`TMetadata`\>

#### Returns

`Promise`\<`void`\>
