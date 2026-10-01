<?php
require_once __DIR__ . '/../helpers/ReactAssets.php';
use Grocy\Helpers\ReactAssets;
$directory = sys_get_temp_dir() . '/grocy-manifest-' . uniqid();
mkdir($directory . '/.vite', 0777, true);
function check($value, $message) { if (!$value) throw new Exception($message); }
check(ReactAssets::Load($directory) === null, 'Missing manifest must fall back');
file_put_contents($directory . '/entry.js', '');
file_put_contents($directory . '/entry.css', '');
file_put_contents($directory . '/.vite/manifest.json', json_encode(['src/main.tsx' => ['file' => 'entry.js', 'css' => ['entry.css']]]));
check(ReactAssets::Load($directory)['js'] === 'entry.js', 'Valid manifest');
unlink($directory . '/entry.css');
check(ReactAssets::Load($directory) === null, 'Missing CSS must fall back');
file_put_contents($directory . '/.vite/manifest.json', '{bad');
check(ReactAssets::Load($directory) === null, 'Malformed manifest must fall back');
file_put_contents($directory . '/.vite/manifest.json', json_encode(['src/main.tsx' => ['file' => '../config.php']]));
check(ReactAssets::Load($directory) === null, 'Traversal must fall back');
unlink($directory . '/.vite/manifest.json'); unlink($directory . '/entry.js'); rmdir($directory . '/.vite'); rmdir($directory);
echo "React asset tests passed\n";
