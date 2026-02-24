# ug-layout/php

PHP DTOs and validation for ug-layout.

## Installation

```bash
composer require ug-layout/php
```

## Usage

```php
use UgLayout\LayoutState;

$data = json_decode($json, true);
$state = LayoutState::fromArray($data);
$array = $state->toArray();
```