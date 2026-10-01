<?php
// Test-only entry point: never load embedded.txt or the installation's data/config.php.
$fixture = realpath(getenv('GROCY_REACT_FIXTURE') ?: '');
if ($fixture === false || !is_file($fixture . '/.react-fixture') || !is_file($fixture . '/config.php'))
{
	http_response_code(500);
	exit('A generated React fixture is required');
}
$root = dirname(__DIR__, 2);
$basePath = getenv('GROCY_REACT_BASE_PATH') ?: '';
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($basePath !== '' && !str_starts_with($path, $basePath . '/') && $path !== $basePath)
{
	http_response_code(404);
	exit();
}
$relativePath = substr($path, strlen($basePath));
$file = realpath($root . '/public' . $relativePath);
if ($file !== false && is_file($file) && str_starts_with($file, $root . '/public/') && pathinfo($file, PATHINFO_EXTENSION) !== 'php')
{
	$types = ['js' => 'text/javascript', 'css' => 'text/css', 'json' => 'application/json', 'svg' => 'image/svg+xml'];
	header('Content-Type: ' . ($types[pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
	readfile($file);
	return;
}
define('GROCY_IS_EMBEDDED_INSTALL', false);
define('GROCY_DATAPATH', $fixture);
require $root . '/helpers/PrerequisiteChecker.php';
(new Grocy\Helpers\PrerequisiteChecker())->checkRequirements();
ob_start();
require $root . '/app.php';
