<?php

namespace UgLayout\Nodes;

class TileNode extends LayoutNode
{
    public function __construct(
        string $id,
        public readonly ?string $contentId = null,
        public readonly ?array $metadata = null
    ) {
        parent::__construct($id, 'tile');
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'],
            $data['contentId'] ?? null,
            $data['metadata'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => 'tile',
            'contentId' => $this->contentId,
            'metadata' => $this->metadata,
        ];
    }
}
