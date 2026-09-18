@extends('layout.default')

@section('title', $__t('Inventory'))

@section('content')
<script>
	Grocy.QuantityUnits = {!! json_encode($quantityUnits) !!};
	Grocy.QuantityUnitConversionsResolved = {!! json_encode($quantityUnitConversionsResolved) !!};
	Grocy.DefaultMinAmount = '{{$DEFAULT_MIN_AMOUNT}}';
</script>

<div class="row">
	<div class="col-12 col-lg-7 pb-3">
		<div class="d-flex align-items-center justify-content-between mb-2">
			<div>
				<h2 class="title mb-1">@yield('title')</h2>
				<p class="text-muted mb-0">
					{{ $__t('Update the current stock amount and optionally add inventory details') }}
				</p>
			</div>
		</div>

		<hr class="my-3">

		<form id="inventory-form"
			novalidate>

			{{-- ========================================================= --}}
			{{-- Stock Update --}}
			{{-- ========================================================= --}}
			<div class="card mb-3">
				<div class="card-header">
					<div class="d-flex align-items-center">
						<div class="mr-3">
							<i class="fa-solid fa-boxes-stacked fa-lg text-primary"></i>
						</div>

						<div>
							<h5 class="mb-0">
								{{ $__t('Stock update') }}
							</h5>

							<small class="text-muted">
								{{ $__t('Select a product and enter the new stock amount') }}
							</small>
						</div>
					</div>
				</div>

				<div class="card-body">
					@include('components.productpicker', array(
						'products' => $products,
						'barcodes' => $barcodes,
						'nextInputSelector' => '#new_amount'
					))

					@include('components.productamountpicker', array(
						'value' => 1,
						'label' => 'New stock amount',
						'additionalHtmlElements' => '<div id="inventory-change-info"
							class="form-text text-muted d-none ml-3 my-0 w-100"></div>',
						'additionalHtmlContextHelp' => '<div id="tare-weight-handling-info"
							class="text-info font-italic d-none">' .
							$__t('Tare weight handling enabled - please weigh the whole container, the amount to be posted will be automatically calculcated') .
							'</div>'
					))
				</div>
			</div>

			{{-- ========================================================= --}}
			{{-- Additional Details --}}
			{{-- ========================================================= --}}
			<div class="card mb-3">
				<div class="card-header">
					<div class="d-flex align-items-center justify-content-between">
						<div class="d-flex align-items-center">
							<div class="mr-3">
								<i class="fa-solid fa-circle-info fa-lg text-muted"></i>
							</div>

							<div>
								<h5 class="mb-0">
									{{ $__t('Additional details') }}
								</h5>

								<small class="text-muted">
									{{ $__t('Optional information for added stock') }}
								</small>
							</div>
						</div>

						<button class="btn btn-sm btn-outline-secondary"
							type="button"
							data-toggle="collapse"
							data-target="#inventory-additional-details"
							aria-expanded="true"
							aria-controls="inventory-additional-details">
							<i class="fa-solid fa-chevron-down"></i>
						</button>
					</div>
				</div>

				<div id="inventory-additional-details"
					class="collapse show">

					<div class="card-body">

						{{-- Purchased date --}}
						@if(boolval($userSettings['show_purchased_date_on_purchase']))
						@include('components.datetimepicker2', array(
							'id' => 'purchased_date',
							'label' => 'Purchased date',
							'format' => 'YYYY-MM-DD',
							'hint' => $__t('This will apply to added products'),
							'initWithNow' => true,
							'limitEndToNow' => false,
							'limitStartToNow' => false,
							'invalidFeedback' => $__t('A purchased date is required'),
							'nextInputSelector' => '#best_before_date',
							'additionalCssClasses' => 'date-only-datetimepicker2',
							'activateNumberPad' => GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_FIELD_NUMBER_PAD
						))
						@endif


						{{-- Due date --}}
						@php
						$additionalGroupCssClasses = '';

						if (!GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING)
						{
							$additionalGroupCssClasses = 'd-none';
						}
						@endphp

						@include('components.datetimepicker', array(
							'id' => 'best_before_date',
							'label' => 'Due date',
							'hint' => $__t('This will apply to added products'),
							'format' => 'YYYY-MM-DD',
							'initWithNow' => false,
							'limitEndToNow' => false,
							'limitStartToNow' => false,
							'invalidFeedback' => $__t('A due date is required'),
							'nextInputSelector' => '#best_before_date',
							'additionalGroupCssClasses' => 'date-only-datetimepicker',
							'shortcutValue' => '2999-12-31',
							'shortcutLabel' => 'Never overdue',
							'earlierThanInfoLimit' => date('Y-m-d'),
							'earlierThanInfoText' => $__t('The given date is earlier than today, are you sure?'),
							'additionalGroupCssClasses' => $additionalGroupCssClasses,
							'activateNumberPad' => GROCY_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_FIELD_NUMBER_PAD
						))

						@php $additionalGroupCssClasses = ''; @endphp


						{{-- Price and store --}}
						@if(GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING)

						@include('components.numberpicker', array(
							'id' => 'price',
							'label' => 'Price',
							'min' => '0.' . str_repeat('0', $userSettings['stock_decimal_places_prices_input']),
							'decimals' => $userSettings['stock_decimal_places_prices_input'],
							'value' => '',
							'contextInfoId' => 'price-hint',
							'hint' => $__t('This will apply to added products'),
							'isRequired' => false,
							'additionalCssClasses' => 'locale-number-input locale-number-currency'
						))

						@include('components.shoppinglocationpicker', array(
							'label' => 'Store',
							'shoppinglocations' => $shoppinglocations,
							'hint' => $__t('This will apply to added products'),
						))

						@else

						<input type="hidden"
							name="price"
							id="price"
							value="0">

						@endif


						{{-- Location --}}
						@if(GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING)

						@include('components.locationpicker', array(
							'locations' => $locations,
							'hint' => $__t('This will apply to added products')
						))

						@endif


						{{-- Stock label --}}
						@if(GROCY_FEATURE_FLAG_LABEL_PRINTER)

						<div class="form-group">
							<label for="stock_label_type">
								{{ $__t('Stock entry label') }}

								<i class="fa-solid fa-question-circle text-muted"
									data-toggle="tooltip"
									data-trigger="hover click"
									title="{{ $__t('This will apply to added products') }}"></i>
							</label>

							<select class="custom-control custom-select"
								id="stock_label_type"
								name="stock_label_type">

								<option value="0">
									{{ $__t('No label') }}
								</option>

								<option value="1">
									{{ $__t('Single label') }}
								</option>

								<option value="2">
									{{ $__t('Label per unit') }}
								</option>

							</select>

							<div id="stock-entry-label-info"
								class="form-text text-info"></div>
						</div>

						@endif


						{{-- Note --}}
						<div class="form-group mb-0">
							<label for="note">
								{{ $__t('Note') }}

								<i class="fa-solid fa-question-circle text-muted"
									data-toggle="tooltip"
									data-trigger="hover click"
									title="{{ $__t('This will apply to added products') }}"></i>
							</label>

							<div class="input-group">
								<input type="text"
									class="form-control"
									id="note"
									name="note"
									placeholder="{{ $__t('Add an optional note') }}">
							</div>
						</div>

						{{-- User fields --}}
						@include('components.userfieldsform', array(
							'userfields' => $userfields,
							'entity' => 'stock'
						))

					</div>
				</div>
			</div>


			{{-- ========================================================= --}}
			{{-- Submit --}}
			{{-- ========================================================= --}}
			<div class="card">
				<div class="card-body">
					<div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between">

						<div class="mb-3 mb-sm-0">
							<div class="font-weight-bold">
								{{ $__t('Ready to update inventory?') }}
							</div>

							<small class="text-muted">
								{{ $__t('The entered amount will replace the current stock amount') }}
							</small>
						</div>

						<button id="save-inventory-button"
							type="submit"
							class="btn btn-success btn-lg px-4">

							<i class="fa-solid fa-check mr-2"></i>

							{{ $__t('Update inventory') }}
						</button>

					</div>
				</div>
			</div>

		</form>
	</div>


	{{-- ============================================================= --}}
	{{-- Product information --}}
	{{-- ============================================================= --}}
	<div class="col-12 col-lg-5 hide-when-embedded">
		<div class="sticky-top pt-1">
			@include('components.productcard')
		</div>
	</div>
</div>

@stop