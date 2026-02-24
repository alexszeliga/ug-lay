<?php

namespace UgLayout\Nodes;

class TileNode extends LayoutNode
{
    /**
     * @param TileTab[]|null $tabs
     */
    public function __construct(
        string $id,
        public readonly ?string $contentId = null,
        public readonly ?array $metadata = null,
        public readonly ?array $tabs = null,
        public readonly ?int $activeTabIndex = null
    ) {
        parent::__construct($id, 'tile');
    }

    public static function fromArray(array $data): self
    {
        $tabs = null;
        if (isset($data['tabs']) && is_array($data['tabs'])) {
            $tabs = array_map(fn($t) => TileTab::fromArray($t), $data['tabs']);
        }

        return new self(
            $data['id'],
            $data['contentId'] ?? null,
            $data['metadata'] ?? null,
            $tabs,
            $data['activeTabIndex'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [
            'id' => $this->id,
            'type' => 'tile',
            'contentId' => $this->contentId,
            'metadata' => $this->metadata,
        ];

        if ($this->tabs !== null) {
            $data['tabs'] = array_map(fn($t) => $t->toArray(), $this->tabs);
            $data['activeTabIndex'] = $this->activeTabIndex;
        }

        return $data;
    }
}
