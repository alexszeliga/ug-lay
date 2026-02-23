<?php

namespace UgLayout\Integrations\Laravel;

use Illuminate\Database\Eloquent\Model;
use UgLayout\LayoutState;

class Layout extends Model
{
    protected $fillable = ['user_id', 'name', 'state', 'is_default'];

    protected $casts = [
        'state' => 'array',
        'is_default' => 'boolean',
    ];

    /**
     * Get the state as a DTO.
     */
    public function getState(): LayoutState
    {
        return LayoutState::fromArray($this->state);
    }

    /**
     * Set the state from a DTO.
     */
    public function setState(LayoutState $state): void
    {
        $this->state = $state->toArray();
    }
}
