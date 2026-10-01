@extends('layout.default')

@section('title', 'React integration')

@section('content')
@if($reactEntry)
<div id="grocy-react-root"></div>
<noscript>JavaScript is required to display this page.</noscript>
@else
<p>React assets are unavailable. Build the frontend before opening this page.</p>
@endif
@stop

@push('pageStyles')
@foreach(($reactEntry['css'] ?? []) as $css)
<link rel="stylesheet" href="{{ $U('/react/' . $css, true) }}">
@endforeach
@endpush

@push('pageScripts')
@if($reactEntry)
<script type="module" src="{{ $U('/react/' . $reactEntry['file'], true) }}"></script>
@endif
@endpush
