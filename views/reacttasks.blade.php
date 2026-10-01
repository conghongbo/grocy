@extends('layout.default')
@section('title', $__t($reactTitle))
@push('pageStyles')
@foreach($reactAssets['css'] as $css)
<link rel="stylesheet" href="{{ $U('/react/' . $css, true) }}">
@endforeach
@endpush
@section('content')
<script id="grocy-react-bootstrap" type="application/json">{!! $reactBootstrap !!}</script>
<div id="grocy-react-root"><p role="status">{{ $__t('Loading...') }}</p></div>
<noscript>{{ $__t('JavaScript is required') }}</noscript>
<a href="{{ $reactLegacyUrl }}" class="small">{{ $__t('Legacy') }}</a>
@stop
@push('pageScripts')
<script type="module" src="{{ $U('/react/' . $reactAssets['js'], true) }}"></script>
@endpush
