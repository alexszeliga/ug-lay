<?php

namespace UgLayout\Nodes;

abstract class LayoutNode
{
    public function __construct(
        public readonly string $id,
        public readonly string $type
    ) {}

    public static function fromArray(array $data): self
    {
        return match ($data['type']) {
            'tile' => TileNode::fromArray($data),
            'split' => SplitNode::fromArray($data),
            default => throw new \InvalidArgumentException("Unknown node type: {$data['type']}")
        };
    }

    abstract public function toArray(): array;
}
