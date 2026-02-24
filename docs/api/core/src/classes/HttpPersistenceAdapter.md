[**ug-lay**](../../../README.md)

***

[ug-lay](../../../README.md) / [core/src](../README.md) / HttpPersistenceAdapter

# Class: HttpPersistenceAdapter

Defined in: core/src/adapters/HttpPersistenceAdapter.ts:3

## Implements

- [`PersistenceAdapter`](../interfaces/PersistenceAdapter.md)

## Constructors

### Constructor

> **new HttpPersistenceAdapter**(`url`, `options?`): `HttpPersistenceAdapter`

Defined in: core/src/adapters/HttpPersistenceAdapter.ts:4

#### Parameters

##### url

`string`

##### options?

`RequestInit` = `{}`

#### Returns

`HttpPersistenceAdapter`

## Methods

### load()

> **load**(): `Promise`\<[`LayoutState`](../interfaces/LayoutState.md)\<`any`\> \| `null`\>

Defined in: core/src/adapters/HttpPersistenceAdapter.ts:22

#### Returns

`Promise`\<[`LayoutState`](../interfaces/LayoutState.md)\<`any`\> \| `null`\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`load`](../interfaces/PersistenceAdapter.md#load)

***

### save()

> **save**(`state`): `Promise`\<`void`\>

Defined in: core/src/adapters/HttpPersistenceAdapter.ts:6

#### Parameters

##### state

[`LayoutState`](../interfaces/LayoutState.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`save`](../interfaces/PersistenceAdapter.md#save)
