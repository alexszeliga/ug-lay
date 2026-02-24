[**ug-lay**](../../../README.md)

***

[ug-lay](../../../README.md) / [core/src](../README.md) / LocalStorageAdapter

# Class: LocalStorageAdapter

Defined in: core/src/adapters/LocalStorageAdapter.ts:3

## Implements

- [`PersistenceAdapter`](../interfaces/PersistenceAdapter.md)

## Constructors

### Constructor

> **new LocalStorageAdapter**(`key`): `LocalStorageAdapter`

Defined in: core/src/adapters/LocalStorageAdapter.ts:6

#### Parameters

##### key

`string`

#### Returns

`LocalStorageAdapter`

## Methods

### load()

> **load**(): `Promise`\<[`LayoutState`](../interfaces/LayoutState.md)\<`any`\> \| `null`\>

Defined in: core/src/adapters/LocalStorageAdapter.ts:18

#### Returns

`Promise`\<[`LayoutState`](../interfaces/LayoutState.md)\<`any`\> \| `null`\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`load`](../interfaces/PersistenceAdapter.md#load)

***

### save()

> **save**(`state`): `Promise`\<`void`\>

Defined in: core/src/adapters/LocalStorageAdapter.ts:10

#### Parameters

##### state

[`LayoutState`](../interfaces/LayoutState.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`save`](../interfaces/PersistenceAdapter.md#save)
