<?php

namespace UgLayout\Nodes;

class TileTab
{
    public function __construct(
        public readonly string $id,
        public readonly string $contentId,
        public readonly ?array $metadata = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'],
            $data['contentId'],
            $data['metadata'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'contentId' => $this->contentId,
            'metadata' => $this->metadata,
        ];
    }
}
