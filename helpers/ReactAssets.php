<?php
namespace Grocy\Helpers;

// Production builds only: never expose a development server to deployed installations.
class ReactAssets
{
    public static function Load(string $directory): ?array
    {
        $path = $directory . '/.vite/manifest.json';
        if (!is_file($path)) return null;
        $manifest = json_decode(file_get_contents($path), true);
        $entry = is_array($manifest) ? ($manifest['src/main.tsx'] ?? null) : null;
        if (!is_array($entry) || !isset($entry['file']) || !is_array($entry['css'] ?? [])) return null;
        $files = array_merge([$entry['file']], $entry['css'] ?? []);
        foreach ($files as $file)
        {
            if (!is_string($file) || str_contains($file, '..') || str_starts_with($file, '/') || !is_file($directory . '/' . $file)) return null;
        }
        return ['js' => $entry['file'], 'css' => $entry['css'] ?? []];
    }
}
