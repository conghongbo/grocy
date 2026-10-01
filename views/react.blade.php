<!doctype html>
<html lang="{{ str_replace('_', '-', GROCY_LOCALE) }}" dir="{{ $dir }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Grocy</title>
  <link rel="stylesheet" href="{{ $U('/react/app.css', true) }}">
</head>
<body>
  <div id="root"></div>
  <noscript>JavaScript is required for the React interface. <a href="{{ $U('/') }}">Open Grocy</a></noscript>
  <script>window.grocyReact = {!! json_encode(['apiUrl' => $U('/api'), 'legacyUrl' => rtrim($U('/'), '/'), 'features' => ['stock' => GROCY_FEATURE_FLAG_STOCK, 'inventory' => GROCY_FEATURE_FLAG_STOCK, 'chores' => GROCY_FEATURE_FLAG_CHORES, 'tasks' => GROCY_FEATURE_FLAG_TASKS, 'batteries' => GROCY_FEATURE_FLAG_BATTERIES]], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!};</script>
  <script type="module" src="{{ $U('/react/app.js', true) }}"></script>
</body>
</html>
