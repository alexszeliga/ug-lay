<?php

require __DIR__ . '/vendor/autoload.php';

$storageFile = __DIR__ . '/layout.json';

// --- API Logic ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/api/layout') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    try {
        // Validate using our PHP package
        $state = \UgLayout\LayoutState::fromArray($data);
        file_put_contents($storageFile, json_encode($state->toArray()));
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
        exit;
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_SERVER['REQUEST_URI'] === '/api/layout') {
    header('Content-Type: application/json');
    if (file_exists($storageFile)) {
        echo file_get_contents($storageFile);
    } else {
        http_response_code(404);
    }
    exit;
}

// --- UI Logic ---
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ug-layout PHP Sandbox</title>
    <style>
        body { margin: 0; background: #1e1e1e; color: white; font-family: sans-serif; }
        #app { width: 100vw; height: 90vh; border-bottom: 1px solid #444; }
        .status { padding: 10px; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div id="app"></div>
    <div class="status">
        Backend: PHP (Native) | Storage: layout.json | <span id="sync-status">Connected</span>
    </div>

    <!-- We use the built JS from our monorepo -->
    <script type="module">
        // In a real app, you'd use a bundler. For this sandbox, we'll use a hack to load the source.
        // Since we are running a simple PHP server, we'll assume we can reach the monorepo root.
        // BUT, a better way is to just use the global LayoutEngine if we built it.
        
        // FOR THIS DEMO: We will use a script that we will 'inject' after this.
    </script>
    <script type="module" src="/src/client.ts"></script>
</body>
</html>
