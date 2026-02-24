<?php

namespace UgLayout\Integrations\Laravel;

use Illuminate\Support\ServiceProvider;

class UgLayoutServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../database/migrations' => database_path('migrations'),
            ], 'ug-lay-migrations');
        }
    }

    public function register(): void
    {
        // Register any bindings or singleton if needed
    }
}
