# ug-lay/php

PHP DTOs and validation for ug-lay.

## Installation

```bash
composer require ug-lay/php
```

## Usage

```php
use UgLayout\LayoutState;

$data = json_decode($json, true);
$state = LayoutState::fromArray($data);
$array = $state->toArray();
```