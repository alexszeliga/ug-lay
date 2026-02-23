<?php

namespace UgLayout;

use UgLayout\Nodes\LayoutNode;

class LayoutState
{
    public function __construct(
        public readonly LayoutNode $root,
        public readonly ?string $maximizedTileId = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            LayoutNode::fromArray($data['root']),
            $data['maximizedTileId'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'root' => $this->root->toArray(),
            'maximizedTileId' => $this->maximizedTileId,
        ];
    }
}
