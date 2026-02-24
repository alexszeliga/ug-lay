<?php

require __DIR__ . '/../vendor/autoload.php';

function it($description, $test) {
    try {
        $test();
        echo "✓ $description
";
    } catch (Throwable $e) {
        echo "× $description
";
        echo "  Error: " . $e->getMessage() . "
";
        echo "  File: " . $e->getFile() . ":" . $e->getLine() . "
";
        exit(1);
    }
}

// --- Tests ---

it('can represent a basic layout state', function() {
    $json = '{"root": {"id": "1", "type": "tile"}}';
    $state = \UgLayout\LayoutState::fromArray(json_decode($json, true));
    
    assert($state->root instanceof \UgLayout\Nodes\TileNode);
    assert($state->root->id === "1");
});

it('can represent a complex nested layout tree', function() {
    $data = [
        'root' => [
            'id' => 'root',
            'type' => 'split',
            'direction' => 'horizontal',
            'ratio' => 0.3,
            'children' => [
                ['id' => 'left', 'type' => 'tile', 'contentId' => 'analytics'],
                [
                    'id' => 'right-split',
                    'type' => 'split',
                    'direction' => 'vertical',
                    'ratio' => 0.5,
                    'children' => [
                        ['id' => 'right-top', 'type' => 'tile'],
                        ['id' => 'right-bottom', 'type' => 'tile'],
                    ]
                ]
            ]
        ],
        'maximizedTileId' => 'left'
    ];

    $state = \UgLayout\LayoutState::fromArray($data);
    
    assert($state->root instanceof \UgLayout\Nodes\SplitNode);
    assert($state->root->children[1] instanceof \UgLayout\Nodes\SplitNode);
    assert($state->root->children[1]->children[0]->type === 'tile');
    assert($state->maximizedTileId === 'left');

    // Test serialization parity
    assert($state->toArray() === $data);
});

it('can represent a tile with tabs', function() {
    $data = [
        'root' => [
            'id' => 'tile-1',
            'type' => 'tile',
            'contentId' => null,
            'metadata' => null,
            'tabs' => [
                ['id' => 'tab-1', 'contentId' => 'a', 'metadata' => null],
                ['id' => 'tab-2', 'contentId' => 'b', 'metadata' => ['foo' => 'bar']]
            ],
            'activeTabIndex' => 1
        ],
        'maximizedTileId' => null
    ];

    $state = \UgLayout\LayoutState::fromArray($data);
    $output = $state->toArray();
    
    assert($output['root']['tabs'][0]['id'] === 'tab-1');
    assert($output['root']['tabs'][1]['metadata']['foo'] === 'bar');
    assert($output['root']['activeTabIndex'] === 1);
    assert($output === $data);
});
