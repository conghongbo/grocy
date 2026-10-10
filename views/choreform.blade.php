@php require_frontend_packages(['bootstrap-select']); @endphp

@extends('layout.default')

@if($mode == 'edit')
@section('title', $__t('Edit chore'))
@else
@section('title', $__t('Create chore'))
@endif

@section('content')
@php
    // Opt-in only; disabled unless explicitly configured on the PHP server.
    $reactChoreCutoverEnabled = filter_var(getenv('GROCY_REACT_CHORE_FORM_ENABLED') ?: 'false', FILTER_VALIDATE_BOOLEAN);
    // Enable only after independent test-database verification of React Edit.
    $reactChoreEditVerified = filter_var(getenv('GROCY_REACT_CHORE_EDIT_VERIFIED') ?: 'false', FILTER_VALIDATE_BOOLEAN);
@endphp
<div id="react-chore-form-root"></div>
<script>
window.GROCY_REACT_CONTEXT = {
    baseUrl: @json($U('')),
    locale: 'en',
    user: { id: {{ (int) GROCY_USER_ID }}, username: "" },
    permissions: [],
    page: {
        name: 'chore-form',
        choreReactCutoverEnabled: {{ $reactChoreCutoverEnabled ? 'true' : 'false' }},
        choreReactEditVerified: {{ $reactChoreEditVerified ? 'true' : 'false' }},
        choreFormId: {{ $mode == 'edit' ? (int) $chore->id : 'null' }},
        choreUserfields: @json(collect($userfields)->map(function ($field) { return ['id' => (int) $field->id, 'entity' => $field->entity, 'name' => $field->name, 'caption' => $field->caption, 'type' => $field->type, 'show_as_column_in_tables' => (int) $field->show_as_column_in_tables, 'sort_number' => $field->sort_number, 'input_required' => (int) $field->input_required, 'config' => $field->config]; })->values()),
        choreStartDateLocked: false,
        choresAssignmentsEnabled: {{ GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS ? 'true' : 'false' }},
        choreProductConsumptionEnabled: {{ GROCY_FEATURE_FLAG_STOCK ? 'true' : 'false' }},
        choreUsers: @json(collect($users)->map(function ($user) { return ['id' => (int) $user->id, 'display_name' => $user->display_name]; })->values()),
        choreProducts: @json(collect($products)->map(function ($product) { return ['id' => (int) $product->id, 'name' => $product->name]; })->values()),
        choreFormInitial: @json($mode == 'edit' ? [
            'name' => $chore->name,
            'description' => $chore->description,
            'active' => (bool) $chore->active,
            'period_type' => $chore->period_type,
            'period_days' => (int) $chore->period_days,
            'period_interval' => (int) $chore->period_interval,
            'period_config' => $chore->period_config,
            'start_date' => $chore->start_date,
            'assignment_type' => $chore->assignment_type,
            'assignment_config' => $chore->assignment_config,
            'consume_product_on_execution' => (bool) $chore->consume_product_on_execution,
            'product_id' => $chore->product_id,
            'product_amount' => $chore->product_amount,
            'track_date_only' => (bool) $chore->track_date_only,
            'rollover' => (bool) $chore->rollover,
        ] : null)
    }
};
</script>
<link rel="stylesheet" href="{{ $U('/react/chore-form.css') }}">
<script type="module" src="{{ $U('/react/chore-form.js') }}"></script>

<style>
	.chore-form-section {
		border: 1px solid #dee2e6;
		border-radius: 0.5rem;
		box-shadow: none;
	}

	.chore-form-section .card-body {
		padding: 1.25rem;
	}

	.chore-section-header h5 {
		font-size: 1rem;
		font-weight: 600;
		color: #343a40;
	}

	.chore-section-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;

		display: flex;
		align-items: center;
		justify-content: center;

		background: #f1f3f5;
		color: #6c757d;

		flex-shrink: 0;
	}

	.chore-schedule-preview {
		display: flex;
		align-items: flex-start;

		margin-top: 1rem;
		padding: 0.85rem 1rem;

		border: 1px solid #bee5eb;
		border-radius: 0.4rem;

		background: #f4fbfc;
	}

	.chore-schedule-preview-icon {
		width: 30px;
		flex-shrink: 0;

		padding-top: 2px;

		color: #17a2b8;
	}

	.chore-schedule-preview-label {
		margin-bottom: 2px;

		font-size: 0.7rem;
		font-weight: 600;

		text-transform: uppercase;
		letter-spacing: 0.03rem;

		color: #6c757d;
	}

	#chore-schedule-info {
		font-size: 0.9rem;
		font-weight: 500;
		color: #343a40;
	}

	.chore-option-row {
		display: flex;
		align-items: center;
		justify-content: space-between;

		padding: 0.9rem 0;

		border-bottom: 1px solid #f0f0f0;
	}

	.chore-option-row:first-of-type {
		padding-top: 0;
	}

	.chore-option-row:last-child {
		border-bottom: 0;
	}

	.chore-option-content {
		padding-right: 2rem;
	}

	.chore-option-row .custom-switch {
		flex-shrink: 0;
	}

	.chore-assignment-info {
		display: flex;
		align-items: flex-start;

		padding: 0.75rem 0.9rem;

		border-radius: 0.35rem;

		background: #f8f9fa;

		font-size: 0.8rem;
		color: #6c757d;
	}

	.chore-assignment-info i {
		margin-top: 2px;
		color: #17a2b8;
	}

	#chore-product-settings {
		display: none;
	}

	.chore-product-settings-title {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03rem;
		color: #6c757d;
	}

	.chore-period-unit-row {
		margin-top: -0.5rem;
		margin-bottom: 1rem;
	}

	#chore-period-unit {
		font-size: 0.72rem;
		font-weight: 500;
	}

	.chore-manual-schedule-info {
		margin-bottom: 1rem;
		padding: 0.85rem 1rem;

		border: 1px solid #e2e6ea;
		border-radius: 0.4rem;

		background: #f8f9fa;
	}

	/* Weekly day selector */
	.chore-weekday-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chore-weekday-option {
		position: relative;
	}

	.chore-weekday-option input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.chore-weekday-option label {
		display: flex;
		align-items: center;
		justify-content: center;

		min-width: 52px;
		height: 38px;
		margin: 0;

		padding: 0 0.75rem;

		border: 1px solid #ced4da;
		border-radius: 0.35rem;

		background: #fff;
		color: #495057;

		font-size: 0.82rem;
		font-weight: 500;

		cursor: pointer;

		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.chore-weekday-option label:hover {
		background: #f8f9fa;
		border-color: #adb5bd;
	}

	.chore-weekday-option input:checked + label {
		background: #17a2b8;
		border-color: #17a2b8;
		color: #fff;
	}

	.chore-weekday-option input:focus + label {
		box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.2);
	}

	.chore-form-actions {
		position: sticky;
		bottom: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.96);
		border: 1px solid #dee2e6;
		border-radius: 0.4rem 0.4rem 0 0;
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
	}

	.chore-form-actions .btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		min-width: 120px;
	}

	@media (max-width: 575.98px) {
		.chore-form-actions {
			flex-direction: column-reverse;
		}

		.chore-form-actions .btn {
			width: 100%;
		}
	}

	/* Edit page sidebar */
	.chore-side-card {
		border: 1px solid #dee2e6;
		border-radius: 0.5rem;
		box-shadow: none;
	}

	.chore-side-card .card-body {
		padding: 1.25rem;
	}

	.chore-side-card-header {
		display: flex;
		align-items: flex-start;

		margin-bottom: 1.25rem;
	}

	.chore-side-card-header h5 {
		font-size: 1rem;
		font-weight: 600;
		color: #343a40;
	}

	.chore-side-card-icon {
		width: 2.5rem;
		height: 2.5rem;

		display: flex;
		align-items: center;
		justify-content: center;

		margin-right: 0.75rem;

		border-radius: 50%;

		background: #f1f3f5;
		color: #6c757d;

		flex-shrink: 0;
	}

	.chore-grocycode-preview {
		display: flex;
		align-items: center;
		justify-content: center;

		min-height: 170px;
		margin-bottom: 1rem;
		padding: 1.25rem;

		border: 1px solid #e9ecef;
		border-radius: 0.4rem;

		background: #fff;
	}

	.chore-grocycode-preview img {
		display: block;

		width: 150px;
		max-width: 100%;
		height: auto;

		image-rendering: pixelated;
	}

	.chore-grocycode-actions {
		margin-bottom: 1rem;
	}

	.chore-grocycode-actions .btn + .btn {
		margin-top: 0.5rem;
	}

	.chore-grocycode-help {
		display: flex;
		align-items: flex-start;

		padding-top: 0.9rem;

		border-top: 1px solid #f0f0f0;

		font-size: 0.75rem;
		line-height: 1.45;
		color: #6c757d;
	}

	.chore-grocycode-help i {
		margin-top: 2px;
		flex-shrink: 0;
	}
</style>

<div id="legacy-chore-form">
<div class="row">
	<div class="col">
		<h2 class="title">@yield('title')</h2>
	</div>
</div>

<hr class="my-2">

<div class="row">
	<div class="@if($mode == 'edit') col-lg-8 @else col-xl-8 col-lg-10 @endif col-12">
		<script>
			Grocy.EditMode = '{{ $mode }}';
		</script>

		@if($mode == 'edit')
		<script>
			Grocy.EditObjectId = {{ $chore->id }};
		</script>
		@endif

		<form id="chore-form"
			novalidate>
			<div class="card chore-form-section mb-4">
				<div class="card-body">
					<div class="d-flex justify-content-between align-items-start mb-3">
						<div>
							<h5 class="mb-1">
								<i class="fa-solid fa-circle-info mr-2 text-muted"></i>
								{{ $__t('Basic information') }}
							</h5>

							<div class="text-muted small">
								{{ $__t('Name and describe this chore.') }}
							</div>
						</div>

						<div class="custom-control custom-switch">
							<input
								@if($mode == 'create')
									checked
								@elseif($mode == 'edit' && $chore->active == 1)
									checked
								@endif
								class="custom-control-input"
								type="checkbox"
								id="active"
								name="active"
								value="1">

							<label class="custom-control-label"
								for="active">
								{{ $__t('Active') }}
							</label>
						</div>
					</div>

					<div class="form-group">
						<label for="name"
							class="font-weight-bold">
							{{ $__t('Name') }}
						</label>

						<input type="text"
							class="form-control"
							required
							id="name"
							name="name"
							placeholder="{{ $__t('e.g. Clean the kitchen') }}"
							value="@if($mode == 'edit'){{ $chore->name }}@endif">

						<div class="invalid-feedback">
							{{ $__t('A name is required') }}
						</div>
					</div>

					<div class="form-group mb-0">
						<label for="description"
							class="font-weight-bold">
							{{ $__t('Description') }}
						</label>

						<textarea
							class="form-control"
							rows="3"
							id="description"
							name="description"
							placeholder="{{ $__t('Add optional details or instructions') }}">@if($mode == 'edit'){{ $chore->description }}@endif</textarea>

						<small class="form-text text-muted">
							{{ $__t('Optional instructions or additional information about this chore.') }}
						</small>
					</div>
				</div>
			</div>

			<div class="card chore-form-section mb-4">
				<div class="card-body">

					<div class="chore-section-header mb-4">
						<div class="d-flex align-items-center">
							<div class="chore-section-icon mr-3">
								<i class="fa-solid fa-calendar-days"></i>
							</div>

							<div>
								<h5 class="mb-1">
									{{ $__t('Schedule') }}
								</h5>

								<div class="text-muted small">
									{{ $__t('Configure when and how often this chore should occur.') }}
								</div>
							</div>
						</div>
					</div>

					<div class="form-group">
						<label for="period_type" class="font-weight-bold">
							{{ $__t('Period type') }}
						</label>

						<div class="text-muted small mb-2">
							{{ $__t('Choose how this chore should repeat.') }}
						</div>

						<select required
							class="custom-control custom-select input-group-chore-period-type"
							id="period_type"
							name="period_type">

							@foreach($periodTypes as $periodType)
								<option
									@if($mode == 'edit' && $periodType == $chore->period_type)
										selected="selected"
									@endif
									value="{{ $periodType }}">
									{{ $__t($periodType) }}
								</option>
							@endforeach

						</select>

						<div class="invalid-feedback">
							{{ $__t('A period type is required') }}
						</div>
					</div>

					@php if($mode == 'edit') { $value = $chore->period_days; } else { $value = 0; } @endphp
					@include('components.numberpicker', array(
						'id' => 'period_days',
						'label' => 'Day of month',
						'value' => $value,
						'min' => '0',
						'additionalCssClasses' => 'input-group-chore-period-type',
						'additionalGroupCssClasses' => 'period-type-input period-type-monthly'
					))

					<div class="form-group period-type-input period-type-weekly chore-weekday-selector">
						<label class="d-block font-weight-bold mb-2">
							{{ $__t('Repeat on') }}
						</label>

						<div class="chore-weekday-buttons">
							<div class="chore-weekday-option">
								<input
									class="input-group-chore-period-type"
									type="checkbox"
									id="monday"
									value="monday">

								<label for="monday"
									title="{{ $__t('Monday') }}">
									{{ $__t('Mon') }}
								</label>
							</div>

							<div class="chore-weekday-option">
								<input
									class="input-group-chore-period-type"
									type="checkbox"
									id="tuesday"
									value="tuesday">

								<label for="tuesday"
									title="{{ $__t('Tuesday') }}">
									{{ $__t('Tue') }}
								</label>
							</div>

							<div class="chore-weekday-option">
								<input
									class="input-group-chore-period-type"
									type="checkbox"
									id="wednesday"
									value="wednesday">

								<label for="wednesday"
									title="{{ $__t('Wednesday') }}">
									{{ $__t('Wed') }}
								</label>
							</div>

							<div class="chore-weekday-option">
								<input
									class="input-group-chore-period-type"
									type="checkbox"
									id="thursday"
									value="thursday">

								<label for="thursday"
									title="{{ $__t('Thursday') }}">
									{{ $__t('Thu') }}
								</label>
							</div>

							<div class="chore-weekday-option">
								<input
									class="input-group-chore-period-type"
									type="checkbox"
									id="friday"
									value="friday">

								<label for="friday"
									title="{{ $__t('Friday') }}">
									{{ $__t('Fri') }}
								</label>
							</div>

							<div class="chore-weekday-option">
								<input
									class="input-group-chore-period-type"
									type="checkbox"
									id="saturday"
									value="saturday">

								<label for="saturday"
									title="{{ $__t('Saturday') }}">
									{{ $__t('Sat') }}
								</label>
							</div>

							<div class="chore-weekday-option">
								<input
									class="input-group-chore-period-type"
									type="checkbox"
									id="sunday"
									value="sunday">

								<label for="sunday"
									title="{{ $__t('Sunday') }}">
									{{ $__t('Sun') }}
								</label>
							</div>

						</div>

						<div class="text-muted small mt-2">
							{{ $__t('Select one or more days of the week.') }}
						</div>
					</div>

					<input type="hidden"
						id="period_config"
						name="period_config"
						value="@if($mode == 'edit'){{ $chore->period_config }}@endif">

					@php if($mode == 'edit') { $value = $chore->period_interval; } else { $value = 1; } @endphp
					@include('components.numberpicker', array(
					'id' => 'period_interval',
					'label' => 'Repeat every',
					'value' => $value,
					'min' => '1',
					'additionalCssClasses' => 'input-group-chore-period-type',
					'additionalGroupCssClasses' => 'period-type-input period-type-hourly period-type-daily period-type-weekly period-type-monthly period-type-yearly'
					))

					<div id="chore-period-unit-row"
						class="period-type-input chore-period-unit-row">
						<span class="text-muted small">
							{{ $__t('Interval unit') }}:
						</span>

						<span id="chore-period-unit"
							class="badge badge-light border ml-1">
						</span>
					</div>

					<div id="chore-manual-schedule-info"
						class="period-type-input period-type-manually chore-manual-schedule-info">
						<div class="d-flex align-items-start">
							<i class="fa-solid fa-hand-pointer mr-2 mt-1 text-muted"></i>

							<div>
								<div class="font-weight-bold">
									{{ $__t('Manual schedule') }}
								</div>

								<div class="small text-muted">
									{{ $__t('This chore has no automatic recurrence and is executed manually.') }}
								</div>
							</div>
						</div>
					</div>

					<div class="chore-schedule-preview">
						<div class="chore-schedule-preview-icon">
							<i class="fa-solid fa-arrows-rotate"></i>
						</div>

						<div>
							<div class="chore-schedule-preview-label">
								{{ $__t('Schedule preview') }}
							</div>

							<p id="chore-schedule-info"
								class="mb-0"></p>
						</div>
					</div>

					@php
					$value = date('Y-m-d H:i:s');
					if ($mode == 'edit')
					{
					$value = date('Y-m-d H:i:s', strtotime($chore->start_date));
					}
					@endphp

					<hr class="my-4">

					@include('components.datetimepicker', array(
					'id' => 'start',
					'label' => 'Start date',
					'initialValue' => $value,
					'format' => 'YYYY-MM-DD HH:mm:ss',
					'initWithNow' => true,
					'limitEndToNow' => false,
					'limitStartToNow' => false,
					'invalidFeedback' => $__t('A start date is required'),
					'hint' => $__t('The start date cannot be changed when the chore was once tracked')
					))

				</div>
			</div>

			@if(GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS)
			<div class="card chore-form-section mb-4">
				<div class="card-body">
					<div class="chore-section-header mb-4">
						<div class="d-flex align-items-center">
							<div class="chore-section-icon mr-3">
								<i class="fa-solid fa-user-check"></i>
							</div>

							<div>
								<h5 class="mb-1">
									{{ $__t('Assignment') }}
								</h5>

								<div class="text-muted small">
									{{ $__t('Choose who should be responsible for this chore.') }}
								</div>
							</div>
						</div>
					</div>

					<div class="form-group">
						<label for="assignment_type"
							class="font-weight-bold">
							{{ $__t('Assignment type') }}
						</label>

						<select required
							class="custom-control custom-select input-group-chore-assignment-type"
							id="assignment_type"
							name="assignment_type">
							@foreach($assignmentTypes as $assignmentType)
								<option
									@if(
										$mode == 'edit'
										&& $assignmentType == $chore->assignment_type
									)
										selected="selected"
									@endif
									value="{{ $assignmentType }}">
									{{ $__t($assignmentType) }}
								</option>
							@endforeach
						</select>

						<div class="invalid-feedback">
							{{ $__t('An assignment type is required') }}
						</div>
					</div>

					<div class="form-group mb-0"
						id="chore-assignment-config-group">
						<label for="assignment_config"
							class="font-weight-bold">
							{{ $__t('Assign to') }}
						</label>

						<select required
							multiple
							class="form-control input-group-chore-assignment-type selectpicker"
							id="assignment_config"
							name="assignment_config"
							data-actions-box="true"
							data-live-search="true">
							@foreach($users as $user)
								<option
									@if(
										$mode == 'edit'
										&& in_array(
											$user->id,
											explode(',', $chore->assignment_config)
										)
									)
										selected="selected"
									@endif
									value="{{ $user->id }}">
									{{ $user->display_name }}
								</option>
							@endforeach
						</select>

						<div class="invalid-feedback">
							{{ $__t('This assignment type requires that at least one is assigned') }}
						</div>
					</div>

					<div class="chore-assignment-info mt-3">
						<i class="fa-solid fa-circle-info mr-2"></i>
						<span id="chore-assignment-type-info"></span>
					</div>
				</div>
			</div>
			@else
			<input type="hidden"
				id="assignment_type"
				name="assignment_type"
				value="{{ \Grocy\Services\ChoresService::CHORE_ASSIGNMENT_TYPE_NO_ASSIGNMENT }}">
			<input type="hidden"
				id="assignment_config"
				name="assignment_config"
				value="">
			@endif

			<div class="card chore-form-section mb-4">
				<div class="card-body">
					<div class="chore-section-header mb-4">
						<div class="d-flex align-items-center">
							<div class="chore-section-icon mr-3">
								<i class="fa-solid fa-sliders"></i>
							</div>

							<div>
								<h5 class="mb-1">
									{{ $__t('Advanced options') }}
								</h5>
								<div class="text-muted small">
									{{ $__t('Configure additional tracking and execution behavior.') }}
								</div>
							</div>
						</div>
					</div>

					{{-- Track date only --}}
					<div class="chore-option-row">
						<div class="chore-option-content">
							<div class="font-weight-bold">
								{{ $__t('Track date only') }}
							</div>
							<div class="text-muted small">
								{{ $__t('Only track the execution date, not the exact time.') }}
							</div>
						</div>
						<div class="custom-control custom-switch">
							<input
								@if(
									$mode == 'edit'
									&& $chore->track_date_only == 1
								)
									checked
								@endif
								class="custom-control-input"
								type="checkbox"
								id="track_date_only"
								name="track_date_only"
								value="1">
							<label class="custom-control-label"
								for="track_date_only">
							</label>
						</div>
					</div>

					{{-- Due date rollover --}}
					<div class="chore-option-row">
						<div class="chore-option-content">
							<div class="font-weight-bold">
								{{ $__t('Due date rollover') }}
							</div>
							<div class="text-muted small">
								{{ $__t('Automatically move the due date forward when the chore becomes due.') }}
							</div>
						</div>
						<div class="custom-control custom-switch">
							<input
								@if(
									$mode == 'edit'
									&& $chore->rollover == 1
								)
									checked
								@endif
								class="custom-control-input"
								type="checkbox"
								id="rollover"
								name="rollover"
								value="1">
							<label class="custom-control-label"
								for="rollover">
							</label>
						</div>
					</div>

					@if(GROCY_FEATURE_FLAG_STOCK)
					<div class="chore-option-row">
						<div class="chore-option-content">
							<div class="font-weight-bold">
								{{ $__t('Consume product on chore execution') }}
							</div>
							<div class="text-muted small">
								{{ $__t('Automatically consume a product when this chore is completed.') }}
							</div>
						</div>
						<div class="custom-control custom-switch">
							<input
								@if(
									$mode == 'edit'
									&& $chore->consume_product_on_execution == 1
								)
									checked
								@endif
								class="custom-control-input"
								type="checkbox"
								id="consume_product_on_execution"
								name="consume_product_on_execution"
								value="1">
							<label class="custom-control-label"
								for="consume_product_on_execution">
							</label>
						</div>
					</div>

					<div class="chore-product-settings mt-3"
						id="chore-product-settings">
						<div class="chore-product-settings-title mb-3">
							<i class="fa-solid fa-box mr-2 text-muted"></i>
							{{ $__t('Product settings') }}
						</div>

						@php
							$prefillById = '';

							if($mode == 'edit' && !empty($chore->product_id))
							{
								$prefillById = $chore->product_id;
							}
						@endphp

						@include('components.productpicker', array(
							'products' => $products,
							'nextInputSelector' => '#product_amount',
							'isRequired' => false,
							'disallowAllProductWorkflows' => true,
							'prefillById' => $prefillById
						))

						@php
							if($mode == 'edit')
							{
								$value = $chore->product_amount;
							}
							else
							{
								$value = '';
							}
						@endphp

						@include('components.numberpicker', array(
							'id' => 'product_amount',
							'label' => 'Amount',
							'contextInfoId' => 'amount_qu_unit',
							'min' => $DEFAULT_MIN_AMOUNT,
							'decimals' => $userSettings['stock_decimal_places_amounts'],
							'isRequired' => false,
							'value' => $value,
							'additionalCssClasses' => 'locale-number-input locale-number-quantity-amount'
						))
					</div>
					@endif
				</div>
			</div>

			@include('components.userfieldsform', array(
				'userfields' => $userfields,
				'entity' => 'chores'
			))

			<div class="chore-form-actions">
				<a href="{{ $U('/chores') }}"
					class="btn btn-outline-secondary">
					<i class="fa-solid fa-xmark mr-1"></i>

					{{ $__t('Cancel') }}
				</a>

				<button id="save-chore-button"
					type="button"
					class="btn btn-success">
					<i class="fa-solid fa-check mr-1"></i>

					@if($mode == 'edit')
						{{ $__t('Save changes') }}
					@else
						{{ $__t('Create chore') }}
					@endif
				</button>
			</div>
		</form>
	</div>

	@if($mode == 'edit')
	<div class="col-lg-4 col-12">
		<div class="card chore-side-card mb-4">
			<div class="card-body">
				<div class="chore-side-card-header">
					<div class="chore-side-card-icon">
						<i class="fa-solid fa-qrcode"></i>
					</div>

					<div>
						<h5 class="mb-1">
							{{ $__t('Grocycode') }}
						</h5>

						<div class="text-muted small">
							{{ $__t('Scan this code to quickly access this chore.') }}
						</div>
					</div>
				</div>

				<div class="chore-grocycode-preview">
					<img src="{{ $U('/chore/' . $chore->id . '/grocycode?size=60') }}"
						alt="{{ $__t('Grocycode') }}"
						loading="lazy">
				</div>

				<div class="chore-grocycode-actions">
					<a class="btn btn-outline-primary btn-sm btn-block"
						href="{{ $U('/chore/' . $chore->id . '/grocycode?download=true') }}">
						<i class="fa-solid fa-download mr-1"></i>
						{{ $__t('Download') }}
					</a>

					@if(GROCY_FEATURE_FLAG_LABEL_PRINTER)
					<a class="btn btn-outline-secondary btn-sm btn-block chore-grocycode-label-print"
						data-chore-id="{{ $chore->id }}"
						href="#">
						<i class="fa-solid fa-print mr-1"></i>
						{{ $__t('Print label') }}
					</a>
					@endif
				</div>

				<div class="chore-grocycode-help">
					<i class="fa-solid fa-circle-info mr-2"></i>

					<span>
						{{ $__t('Print this code onto a label and scan it like any other barcode.') }}
					</span>
				</div>
			</div>
		</div>
	</div>
	@endif
</div>
</div>
@stop
