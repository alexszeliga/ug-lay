[**ug-lay**](../../../README.md)

***

[ug-lay](../../../README.md) / [core/src](../README.md) / LayoutEngine

# Class: LayoutEngine\<TMetadata\>

Defined in: core/src/index.ts:34

## Type Parameters

### TMetadata

`TMetadata` = `any`

## Constructors

### Constructor

> **new LayoutEngine**\<`TMetadata`\>(`initialState?`, `config?`): `LayoutEngine`\<`TMetadata`\>

Defined in: core/src/index.ts:40

#### Parameters

##### initialState?

[`LayoutState`](../interfaces/LayoutState.md)\<`TMetadata`\>

##### config?

`Partial`\<[`LayoutEngineConfig`](../interfaces/LayoutEngineConfig.md)\<`TMetadata`\>\>

#### Returns

`LayoutEngine`\<`TMetadata`\>

## Accessors

### dragThreshold

#### Get Signature

> **get** **dragThreshold**(): `number`

Defined in: core/src/index.ts:55

##### Returns

`number`

***

### gutterSize

#### Get Signature

> **get** **gutterSize**(): `number`

Defined in: core/src/index.ts:51

##### Returns

`number`

## Methods

### addTab()

> **addTab**(`tileId`, `contentId`, `metadata?`): `void`

Defined in: core/src/index.ts:138

#### Parameters

##### tileId

`string`

##### contentId

`string`

##### metadata?

`TMetadata`

#### Returns

`void`

***

### getState()

> **getState**(): [`LayoutState`](../interfaces/LayoutState.md)\<`TMetadata`\>

Defined in: core/src/index.ts:91

#### Returns

[`LayoutState`](../interfaces/LayoutState.md)\<`TMetadata`\>

***

### maximizeTile()

> **maximizeTile**(`tileId`): `void`

Defined in: core/src/index.ts:95

#### Parameters

##### tileId

`string`

#### Returns

`void`

***

### minimize()

> **minimize**(): `void`

Defined in: core/src/index.ts:100

#### Returns

`void`

***

### moveTile()

> **moveTile**(`sourceId`, `targetId`, `direction`, `side`): `void`

Defined in: core/src/index.ts:220

#### Parameters

##### sourceId

`string`

##### targetId

`string`

##### direction

[`Direction`](../type-aliases/Direction.md)

##### side

`"before"` | `"after"`

#### Returns

`void`

***

### removeTab()

> **removeTab**(`tileId`, `tabId`): `void`

Defined in: core/src/index.ts:167

#### Parameters

##### tileId

`string`

##### tabId

`string`

#### Returns

`void`

***

### removeTile()

> **removeTile**(`tileId`): `void`

Defined in: core/src/index.ts:190

#### Parameters

##### tileId

`string`

#### Returns

`void`

***

### resetTile()

> **resetTile**(`tileId`): `void`

Defined in: core/src/index.ts:120

#### Parameters

##### tileId

`string`

#### Returns

`void`

***

### selectTab()

> **selectTab**(`tileId`, `index`): `void`

Defined in: core/src/index.ts:129

#### Parameters

##### tileId

`string`

##### index

`number`

#### Returns

`void`

***

### setRatio()

> **setRatio**(`splitId`, `ratio`): `void`

Defined in: core/src/index.ts:105

#### Parameters

##### splitId

`string`

##### ratio

`number`

#### Returns

`void`

***

### split()

> **split**(`tileId`, `direction`): `void`

Defined in: core/src/index.ts:211

#### Parameters

##### tileId

`string`

##### direction

[`Direction`](../type-aliases/Direction.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Defined in: core/src/index.ts:59

#### Parameters

##### callback

[`Subscriber`](../type-aliases/Subscriber.md)\<`TMetadata`\>

#### Returns

> (): `void`

##### Returns

`void`

***

### swapTiles()

> **swapTiles**(`sourceId`, `targetId`): `void`

Defined in: core/src/index.ts:195

#### Parameters

##### sourceId

`string`

##### targetId

`string`

#### Returns

`void`

***

### updateTile()

> **updateTile**(`tileId`, `updates`): `void`

Defined in: core/src/index.ts:113

#### Parameters

##### tileId

`string`

##### updates

`Partial`\<`Omit`\<[`TileNode`](../interfaces/TileNode.md)\<`TMetadata`\>, `"id"` \| `"type"`\>\>

#### Returns

`void`
