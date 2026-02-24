[**ug-layout**](../../../README.md)

***

[ug-layout](../../../README.md) / [core/src](../README.md) / LayoutEngine

# Class: LayoutEngine\<TMetadata\>

Defined in: core/src/index.ts:32

## Type Parameters

### TMetadata

`TMetadata` = `any`

## Constructors

### Constructor

> **new LayoutEngine**\<`TMetadata`\>(`initialState?`, `config?`): `LayoutEngine`\<`TMetadata`\>

Defined in: core/src/index.ts:38

#### Parameters

##### initialState?

[`LayoutState`](../interfaces/LayoutState.md)\<`TMetadata`\>

##### config?

`Partial`\<[`LayoutEngineConfig`](../interfaces/LayoutEngineConfig.md)\<`TMetadata`\>\>

#### Returns

`LayoutEngine`\<`TMetadata`\>

## Methods

### addTab()

> **addTab**(`tileId`, `contentId`, `metadata?`): `void`

Defined in: core/src/index.ts:137

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

Defined in: core/src/index.ts:76

#### Returns

[`LayoutState`](../interfaces/LayoutState.md)\<`TMetadata`\>

***

### maximizeTile()

> **maximizeTile**(`tileId`): `void`

Defined in: core/src/index.ts:80

#### Parameters

##### tileId

`string`

#### Returns

`void`

***

### minimize()

> **minimize**(): `void`

Defined in: core/src/index.ts:85

#### Returns

`void`

***

### moveTile()

> **moveTile**(`sourceId`, `targetId`, `direction`, `side`): `void`

Defined in: core/src/index.ts:226

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

Defined in: core/src/index.ts:169

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

Defined in: core/src/index.ts:193

#### Parameters

##### tileId

`string`

#### Returns

`void`

***

### resetTile()

> **resetTile**(`tileId`): `void`

Defined in: core/src/index.ts:117

#### Parameters

##### tileId

`string`

#### Returns

`void`

***

### selectTab()

> **selectTab**(`tileId`, `index`): `void`

Defined in: core/src/index.ts:127

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

Defined in: core/src/index.ts:90

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

Defined in: core/src/index.ts:216

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

Defined in: core/src/index.ts:49

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

Defined in: core/src/index.ts:199

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

Defined in: core/src/index.ts:104

#### Parameters

##### tileId

`string`

##### updates

`Partial`\<`Omit`\<[`TileNode`](../interfaces/TileNode.md)\<`TMetadata`\>, `"id"` \| `"type"`\>\>

#### Returns

`void`
