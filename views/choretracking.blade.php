@php require_frontend_packages(['bootstrap-combobox']); @endphp

@extends('layout.default')

@section('title', $__t('Chore tracking'))

@section('content')
<div class="row">
	<div class="col-12 col-md-6 pb-3">
		<h2 class="title mb-1">@yield('title')</h2>

		<p class="text-muted mb-3">
			{{ $__t('Track completed chores and manage their next execution.') }}
		</p>

		<hr class="my-3">

		<form id="choretracking-form"
			novalidate>

			<div class="mb-3">
				<h5 class="mb-1">
					<i class="fa-solid fa-list-check mr-1"></i>
					{{ $__t('Select chore') }}
				</h5>

				<small class="text-muted">
					{{ $__t('Choose the chore you want to track.') }}
				</small>
			</div>

			<div class="form-group">
				<label class="w-100"
					for="chore_id">
					{{ $__t('Chore') }}
					<i id="barcode-lookup-hint"
						class="fa-solid fa-barcode float-right mt-1"></i>
				</label>
				<select class="form-control combobox barcodescanner-input"
					id="chore_id"
					name="chore_id"
					required
					data-target="@chorepicker">
					<option value=""></option>
					@foreach($chores as $chore)
					<option value="{{ $chore->id }}">{{ $chore->name }}</option>
					@endforeach
				</select>
				<div class="invalid-feedback">{{ $__t('You have to select a chore') }}</div>
			</div>

			<hr class="my-4">

			<div class="mb-3">
				<h5 class="mb-1">
					<i class="fa-solid fa-clock-rotate-left mr-1"></i>
					{{ $__t('Tracking details') }}
				</h5>

				<small class="text-muted">
					{{ $__t('Choose when the chore was completed and who completed it.') }}
				</small>
			</div>

			@include('components.datetimepicker', array(
			'id' => 'tracked_time',
			'label' => 'Tracked time',
			'format' => 'YYYY-MM-DD HH:mm:ss',
			'initWithNow' => true,
			'limitEndToNow' => false,
			'limitStartToNow' => false,
			'invalidFeedback' => $__t('A date is required')
			))

			@if(GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS)
			@include('components.userpicker', array(
			'label' => 'Done by',
			'users' => $users,
			'nextInputSelector' => '#user_id',
			'prefillByUserId' => GROCY_USER_ID
			))
			@else
			<input type="hidden"
				id="user_id"
				name="user_id"
				value="{{ GROCY_USER_ID }}">
			@endif

			@include('components.userfieldsform', array(
			'userfields' => $userfields,
			'entity' => 'chores_log'
			))

			<hr class="my-4">

			<div class="mb-3">
				<h5 class="mb-1">
					<i class="fa-solid fa-bolt mr-1"></i>
					{{ $__t('Actions') }}
				</h5>

				<small class="text-muted">
					{{ $__t('Track this execution or skip the next scheduled execution.') }}
				</small>
			</div>

			<div id="manual-chore-skip-hint"
				class="alert alert-info py-2 px-3 mb-3 d-none">
				<i class="fa-solid fa-circle-info mr-1"></i>
				{{ $__t('This chore uses a manual schedule. The next execution cannot be skipped.') }}
			</div>

			<button
				type="submit"
				class="btn btn-success save-choretracking-button mr-2 disabled">
				<i class="fa-solid fa-check mr-1"></i>
				{{ $__t('Track execution') }}
			</button>

			<button
				type="button"
				class="btn btn-outline-secondary save-choretracking-button skip disabled">
				<i class="fa-solid fa-forward mr-1"></i>
				{{ $__t('Skip next execution') }}
			</button>

			<div id="choretracking-ready-hint"
				class="text-muted small mt-3">
				<i class="fa-solid fa-circle-info mr-1"></i>
				{{ $__t('Select a chore to start tracking.') }}
			</div>
		</form>
	</div>

	<div class="col-12 col-md-6">
		<div class="mb-3">
			<h5 class="mb-1">
				<i class="fa-solid fa-circle-info mr-1"></i>
				{{ $__t('Chore information') }}
			</h5>

			<small class="text-muted">
				{{ $__t('Details about the currently selected chore.') }}
			</small>
		</div>

		@include('components.chorecard')
	</div>
</div>

@include('components.camerabarcodescanner')
@stop
