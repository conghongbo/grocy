@php require_frontend_packages(['bootstrap-combobox']); @endphp

@extends('layout.default')

@section('title', $__t('Battery tracking'))

@section('content')
<div class="row">
	<div class="col-12 col-md-7 pb-3">
		<h2 class="title">@yield('title')</h2>

		<hr class="my-2">

		<form id="batterytracking-form"
			novalidate>

			<div class="form-group">
				<label class="w-100"
					for="battery_id">
					{{ $__t('Battery') }}
					<i id="barcode-lookup-hint"
						class="fa-solid fa-barcode float-right mt-1"></i>
				</label>
				<select class="form-control combobox barcodescanner-input"
					id="battery_id"
					name="battery_id"
					required
					data-target="@batterypicker">
					<option value=""></option>
					@foreach($batteries as $battery)
					<option value="{{ $battery->id }}">{{ $battery->name }}</option>
					@endforeach
				</select>
				<div class="invalid-feedback">{{ $__t('You have to select a battery') }}</div>
			</div>

			<!-- #2847: Replacement battery -->
			<div class="form-group d-none"
    			id="replacement-battery-group">
				<label for="replacement_battery_id">
					{{ $__t('Replace with') }}
				</label>

				<div class="replacement-select-wrapper">
    				<select class="form-control replacement-battery-select"
						id="replacement_battery_id"
						name="replacement_battery_id">
						<option value=""></option>
		
						@foreach($batteries as $battery)
							@if(
								empty($battery->used_in)
								&&
								(
									$battery->rechargeable == 0
									||
									$battery->is_charged == 1
								)
							)
							<option
								value="{{ $battery->id }}"
								data-rechargeable="{{ $battery->rechargeable }}">
								{{ $battery->name }}
								—
								@if($battery->rechargeable == 1)
									{{ $__t('Rechargeable') }}
								@else
									{{ $__t('Single-use') }}
								@endif
							</option>
							@endif
						@endforeach
    				</select>

					<i class="fa-solid fa-chevron-down replacement-select-arrow"></i>
				</div>

				<div
					id="replacement-battery-empty-message"
					class="alert alert-warning mt-2 d-none">
					<i class="fa-solid fa-triangle-exclamation mr-1"></i>
					{{ $__t('No charged and available replacement battery is currently available') }}
				</div>

				<small
					id="replacement-battery-hint"
					class="form-text text-muted">
					{{ $__t('Only charged and available batteries can be selected as a replacement') }}
				</small>

				<div
					id="replacement-preview"
					class="card mt-3 d-none replacement-preview-card">
					<div class="card-body py-3">
						<div class="text-muted small mb-2">
							{{ $__t('Replacement preview') }}
						</div>
						<div class="d-flex align-items-center mb-3">
							<i class="fa-solid fa-gamepad mr-2 text-muted"></i>
							<div
								id="replacement-preview-used-in"
								class="font-weight-bold">
							</div>
						</div>
						<div class="d-flex align-items-center justify-content-between">
							<div>
								<div class="text-muted small">
									{{ $__t('Current battery') }}
								</div>
								<div
									id="replacement-preview-current"
									class="font-weight-bold">
								</div>
							</div>
							<div class="px-3">
								<div class="replacement-preview-arrow">
									<i class="fa-solid fa-arrow-right"></i>
								</div>
							</div>
							<div class="text-right">
								<div class="text-muted small">
									{{ $__t('Replacement battery') }}
								</div>
								<div
									id="replacement-preview-new"
									class="font-weight-bold">
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			@include('components.datetimepicker', array(
			'id' => 'tracked_time',
			'label' => 'Tracked time',
			'format' => 'YYYY-MM-DD HH:mm:ss',
			'initWithNow' => true,
			'limitEndToNow' => true,
			'limitStartToNow' => false,
			'invalidFeedback' => $__t('This can only be before now')
			))

			@include('components.userfieldsform', array(
			'userfields' => $userfields,
			'entity' => 'battery_charge_cycles'
			))

			<div class="batterytracking-action-area mt-3">
				<button id="save-batterytracking-button"
					class="btn btn-success">{{ $__t('OK') }}</button>
			</div>

			<span
				id="replacement-action-hint"
				class="text-muted small d-none">
				{{ $__t('This will update the battery used by the selected device') }}
			</span>
		</form>
	</div>

	<div class="col-12 col-lg-5">
		@include('components.batterycard')
	</div>
</div>

@include('components.camerabarcodescanner')
@stop

<style>
	.replacement-select-wrapper {
		position: relative;
	}
	.replacement-battery-select {
		height: 38px;
		padding: 6px 42px 6px 12px;
		cursor: pointer;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background-color: #fff;
	}
	.replacement-battery-select:hover {
		border-color: #80bdff;
	}
	.replacement-battery-select:disabled {
		cursor: not-allowed;
		opacity: 0.65;
	}
	.replacement-select-arrow {
		position: absolute;
		right: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: #495057;
		font-size: 12px;
		pointer-events: none;
	}
	.batterytracking-action-area {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	#save-batterytracking-button {
		min-width: 140px;
		font-weight: 600;
	}
	#save-batterytracking-button i {
		margin-right: 6px;
	}
	.replacement-preview-card {
		border-left: 4px solid #17a2b8;
		background-color: #f8f9fa;
	}
	.replacement-preview-card .card-body {
		padding: 14px 16px;
	}
	.replacement-preview-arrow {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: #e9ecef;
		color: #495057;
	}
</style>
