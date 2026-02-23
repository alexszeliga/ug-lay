<?php

namespace UgLayout\Nodes;

class SplitNode extends LayoutNode
{
    public function __construct(
        string $id,
        public readonly string $direction,
        public readonly float $ratio,
        public readonly array $children
    ) {
        parent::__construct($id, 'split');
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'],
            $data['direction'],
            (float) $data['ratio'],
            [
                LayoutNode::fromArray($data['children'][0]),
                LayoutNode::fromArray($data['children'][1]),
            ]
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => 'split',
            'direction' => $this->direction,
            'ratio' => $this->ratio,
            'children' => [
                $this->children[0]->toArray(),
                $this->children[1]->toArray(),
            ],
        ];
    }
}
