@php require_frontend_packages(['datatables']); @endphp

@extends('layout.default')

@section('title', $__t('Chores'))

@section('content')
<style>
	.chore-management-summary-card {
		border: 1px solid #dee2e6;
		border-radius: 0.5rem;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease,
			border-color 0.15s ease;
		cursor: pointer;
	}

	.chore-management-summary-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.08);
	}

	.chore-management-summary-card .card-body {
		padding: 1rem 1.1rem;
	}

	.chore-management-summary-title {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03rem;
		color: #6c757d;
	}

	.chore-management-summary-count {
		font-size: 1.75rem;
		line-height: 1;
		font-weight: 600;
		margin-top: 0.35rem;
	}

	.chore-management-summary-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		background: rgba(0, 0, 0, 0.04);
	}

	.chore-management-summary-description {
		margin-top: 0.45rem;
		font-size: 0.75rem;
		color: #6c757d;
	}

	.chore-management-summary-card.active {
		box-shadow: 0 0 0 2px #6c757d;
	}

	.chore-name {
		font-size: 0.95rem;
		color: #212529;
	}

	.chore-description-preview {
		margin-top: 2px;
		max-width: 420px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chore-row-disabled {
		color: #8a9299;
	}

	.chore-row-disabled .chore-name {
		color: #6c757d;
	}

	.chore-row-disabled .chore-schedule-main,
	.chore-row-disabled .chore-schedule-secondary {
		color: #8a9299;
	}

	.chore-row-disabled td:first-child,
	.chore-row-disabled .dropdown,
	.chore-row-disabled .dropdown-menu,
	.chore-row-disabled .dropdown-item {
		opacity: 1;
		color: inherit;
	}

	.chore-row-disabled .chore-name {
		color: #6c757d;
	}

	.chore-actions-cell {
		white-space: nowrap;
		width: 1%;
	}

	.chore-actions-menu {
		min-width: 160px;
	}

	.chore-actions-menu .dropdown-item {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
	}

	.chore-actions-menu .dropdown-item i {
		width: 18px;
		text-align: center;
	}

	.chore-actions-menu .dropdown-divider {
		margin: 0.25rem 0;
	}

	/* Chore schedule */
	.chore-schedule-cell {
		min-width: 180px;
		line-height: 1.25;
	}

	.chore-schedule-main {
		display: flex;
		align-items: center;
		font-size: 0.9rem;
		font-weight: 500;
		color: #343a40;
	}

	.chore-schedule-main > i {
		width: 18px;
		margin-right: 0.25rem;
		text-align: center;
		flex-shrink: 0;
	}

	.chore-schedule-secondary {
		margin-top: 4px;
		margin-left: 22px;
		font-size: 0.72rem;
		font-weight: 400;
		color: #8a9299;
	}

	/* Weekly day badges */
	.chore-schedule-days {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.chore-schedule-days span {
		display: inline-block;
		padding: 0.18rem 0.4rem;

		font-size: 0.68rem;
		font-weight: 500;
		line-height: 1.1;

		border: 1px solid #dee2e6;
		border-radius: 0.25rem;

		background: #f8f9fa;
		color: #6c757d;
	}

	/* Disabled chore */
	.chore-row-disabled .chore-schedule-main,
	.chore-row-disabled .chore-schedule-secondary {
		color: #8a9299;
	}

	.chore-row-disabled .chore-schedule-days span {
		background: #f1f3f5;
		color: #8a9299;
		border-color: #e2e6ea;
	}
</style>

<div class="row">
	<div class="col">
		<div class="title-related-links">
			<div>
				<h2 class="title mb-1">@yield('title')</h2>

				<p class="text-muted mb-0">
					{{ $__t('Manage and configure your chores.') }}
				</p>
			</div>
			<div class="float-right @if($embedded) pr-5 @endif">
				<button class="btn btn-outline-dark d-md-none mt-2 order-1 order-md-3"
					type="button"
					data-toggle="collapse"
					data-target="#table-filter-row">
					<i class="fa-solid fa-filter"></i>
				</button>
				<button class="btn btn-outline-dark d-md-none mt-2 order-1 order-md-3"
					type="button"
					data-toggle="collapse"
					data-target="#related-links">
					<i class="fa-solid fa-ellipsis-v"></i>
				</button>
			</div>
			<div class="related-links collapse d-md-flex order-2 width-xs-sm-100"
				id="related-links">
				<a class="btn btn-primary responsive-button m-1 mt-md-0 mb-md-0 float-right"
					href="{{ $U('/chore/new') }}">
					{{ $__t('Add') }}
				</a>
				<a class="btn btn-outline-secondary m-1 mt-md-0 mb-md-0 float-right"
					href="{{ $U('/userfields?entity=chores') }}">
					{{ $__t('Configure userfields') }}
				</a>
			</div>
		</div>
	</div>
</div>

<hr class="my-2">

<div class="row mt-3 mb-2">
	<!-- Total -->
	<div class="col-12 col-sm-4 mb-3">
		<div class="card h-100 chore-management-summary-card"
			data-chore-status="all">
			<div class="card-body">
				<div class="d-flex justify-content-between align-items-start">
					<div>
						<div class="chore-management-summary-title">
							{{ $__t('Total chores') }}
						</div>

						<div class="chore-management-summary-count">
							{{ $totalChores }}
						</div>
					</div>

					<div class="chore-management-summary-icon text-info">
						<i class="fa-solid fa-list-check"></i>
					</div>

				</div>

				<div class="chore-management-summary-description">
					{{ $__t('All configured chores') }}
				</div>
			</div>
		</div>
	</div>

	<!-- Active -->
	<div class="col-12 col-sm-4 mb-3">
		<div class="card h-100 chore-management-summary-card"
			data-chore-status="active">
			<div class="card-body">
				<div class="d-flex justify-content-between align-items-start">
					<div>
						<div class="chore-management-summary-title">
							{{ $__t('Active') }}
						</div>

						<div class="chore-management-summary-count text-success">
							{{ $activeChores }}
						</div>
					</div>

					<div class="chore-management-summary-icon text-success">
						<i class="fa-solid fa-circle-check"></i>
					</div>

				</div>

				<div class="chore-management-summary-description">
					{{ $__t('Currently active chores') }}
				</div>
			</div>
		</div>
	</div>

	<!-- Disabled -->
	<div class="col-12 col-sm-4 mb-3">
		<div class="card h-100 chore-management-summary-card"
			data-chore-status="disabled">
			<div class="card-body">
				<div class="d-flex justify-content-between align-items-start">

					<div>
						<div class="chore-management-summary-title">
							{{ $__t('Disabled') }}
						</div>

						<div class="chore-management-summary-count text-secondary">
							{{ $disabledChores }}
						</div>
					</div>

					<div class="chore-management-summary-icon text-secondary">
						<i class="fa-solid fa-circle-pause"></i>
					</div>

				</div>

				<div class="chore-management-summary-description">
					{{ $__t('Chores currently disabled') }}
				</div>
			</div>
		</div>
	</div>
</div>

<div class="row collapse d-md-flex"
	id="table-filter-row">
	<div class="col-12 col-md-6 col-xl-3">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text"><i class="fa-solid fa-search"></i></span>
			</div>
			<input type="text"
				id="search"
				class="form-control"
				placeholder="{{ $__t('Search') }}">
		</div>
	</div>
	<div class="col-12 col-md-6 col-xl-3">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text">
					<i class="fa-solid fa-filter"></i>&nbsp;
					{{ $__t('Status') }}
				</span>
			</div>

			<select class="custom-control custom-select"
				id="status-filter">
				<option value="active">
					{{ $__t('Active') }}
				</option>

				<option value="all">
					{{ $__t('All') }}
				</option>

				<option value="disabled">
					{{ $__t('Disabled') }}
				</option>
			</select>
		</div>
	</div>
	<div class="col">
		<div class="float-right">
			<button id="clear-filter-button"
				class="btn btn-sm btn-outline-info"
				data-toggle="tooltip"
				title="{{ $__t('Clear filter') }}">
				<i class="fa-solid fa-filter-circle-xmark"></i>
			</button>
		</div>
	</div>
</div>

<div class="row">
	<div class="col">
		<table id="chores-table"
			class="table table-sm table-striped nowrap w-100">
			<thead>
				<tr>
					<th class="border-right"><a class="text-muted change-table-columns-visibility-button"
							data-toggle="tooltip"
							title="{{ $__t('Table options') }}"
							data-table-selector="#chores-table"
							href="#"><i class="fa-solid fa-eye"></i></a>
					</th>
					<th>{{ $__t('Name') }}</th>
					<th>{{ $__t('Status') }}</th>
					<th class="allow-grouping">{{ $__t('Period type') }}</th>
					<th>{{ $__t('Schedule') }}</th>

					@include('components.userfields_thead', array(
					'userfields' => $userfields
					))

				</tr>
			</thead>
			<tbody class="d-none">
				@foreach($chores as $chore)
				<tr class="@if($chore->active == 0) text-muted chore-row-disabled @endif">
					<td class="fit-content border-right chore-actions-cell">
						<a class="btn btn-outline-primary btn-sm"
							href="{{ $U('/chore/') }}{{ $chore->id }}"
							data-toggle="tooltip"
							title="{{ $__t('Edit this item') }}">
							<i class="fa-solid fa-pen"></i>
						</a>

						<div class="dropdown d-inline-block">
							<button class="btn btn-sm btn-light text-secondary"
								type="button"
								data-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false"
								title="{{ $__t('More') }}">

								<i class="fa-solid fa-ellipsis-v"></i>
							</button>

							<div class="dropdown-menu dropdown-menu-right chore-actions-menu">
								<a class="dropdown-item merge-chores-button"
									data-chore-id="{{ $chore->id }}"
									href="#">
									<i class="fa-solid fa-code-merge mr-2 text-muted"></i>
									{{ $__t('Merge') }}
								</a>

								<div class="dropdown-divider"></div>

								<a class="dropdown-item text-danger chore-delete-button"
									href="#"
									data-chore-id="{{ $chore->id }}"
									data-chore-name="{{ $chore->name }}">

									<i class="fa-solid fa-trash mr-2"></i>
									{{ $__t('Delete') }}
								</a>
							</div>
						</div>
					</td>
					<td>
						<div class="chore-name-cell">
							<div class="font-weight-bold chore-name">
								{{ $chore->name }}
							</div>

							@if(!empty($chore->description))
								<div class="text-muted small chore-description-preview">
									{{ $chore->description }}
								</div>
							@endif
						</div>
					</td>
					<td
						data-chore-active="{{ $chore->active }}"
						data-search="{{ $chore->active == 1 ? 'active' : 'disabled' }}">
						@if($chore->active == 1)
							<span class="badge badge-success">
								<i class="fa-solid fa-circle-check mr-1"></i>
								{{ $__t('Active') }}
							</span>
						@else
							<span class="badge badge-secondary">
								<i class="fa-solid fa-circle-pause mr-1"></i>
								{{ $__t('Disabled') }}
							</span>
						@endif
					</td>
					<td>
						@if($chore->period_type == 'manually')
							<span class="badge badge-light border">
								<i class="fa-solid fa-hand-pointer mr-1"></i>
								{{ $__t($chore->period_type) }}
							</span>
						@else
							<span class="badge badge-info">
								<i class="fa-solid fa-repeat mr-1"></i>
								{{ $__t($chore->period_type) }}
							</span>
						@endif
					</td>
					<td>
						<div class="chore-schedule-cell">
							{{-- Manual --}}
							@if($chore->period_type == 'manually')
								<div class="chore-schedule-main">
									<i class="fa-solid fa-hand-pointer text-muted"></i>
									<span>{{ $__t('Manual') }}</span>
								</div>

								<div class="chore-schedule-secondary">
									{{ $__t('No automatic schedule') }}
								</div>

							{{-- Hourly --}}
							@elseif($chore->period_type == 'hourly')
								<div class="chore-schedule-main">
									<i class="fa-solid fa-clock text-muted"></i>

									<span>
										@if($chore->period_interval == 1)
											{{ $__t('Every hour') }}
										@else
											{{ $__t('Every') }}
											{{ $chore->period_interval }}
											{{ $__t('hours') }}
										@endif
									</span>
								</div>

								<div class="chore-schedule-secondary">
									{{ $__t('Repeats automatically') }}
								</div>

							{{-- Daily --}}
							@elseif($chore->period_type == 'daily')
								<div class="chore-schedule-main">
									<i class="fa-solid fa-calendar-day text-muted"></i>

									<span>
										@if($chore->period_interval == 1)
											{{ $__t('Every day') }}
										@else
											{{ $__t('Every') }}
											{{ $chore->period_interval }}
											{{ $__t('days') }}
										@endif
									</span>
								</div>

								<div class="chore-schedule-secondary">
									{{ $__t('Repeats automatically') }}
								</div>

							{{-- Weekly --}}
							@elseif($chore->period_type == 'weekly')
								<div class="chore-schedule-main">
									<i class="fa-solid fa-calendar-week text-muted"></i>

									<span>
										@if($chore->period_interval == 1)
											{{ $__t('Every week') }}
										@else
											{{ $__t('Every') }}
											{{ $chore->period_interval }}
											{{ $__t('weeks') }}
										@endif
									</span>
								</div>

								@if(!empty($chore->period_config))
									@php
										$weekDays = array_filter(
											array_map('trim', explode(',', $chore->period_config))
										);
									@endphp

									<div class="chore-schedule-secondary chore-schedule-days">
										@foreach($weekDays as $day)
											<span>{{ $__t(ucfirst($day)) }}</span>
										@endforeach
									</div>
								@else
									<div class="chore-schedule-secondary">
										{{ $__t('Repeats automatically') }}
									</div>
								@endif

							{{-- Monthly --}}
							@elseif($chore->period_type == 'monthly')
								<div class="chore-schedule-main">
									<i class="fa-solid fa-calendar text-muted"></i>

									<span>
										@if($chore->period_interval == 1)
											{{ $__t('Every month') }}
										@else
											{{ $__t('Every') }}
											{{ $chore->period_interval }}
											{{ $__t('months') }}
										@endif
									</span>
								</div>

								@if($chore->period_days > 0)
									<div class="chore-schedule-secondary">
										<i class="fa-regular fa-calendar-check mr-1"></i>
										{{ $__t('Day') }} {{ $chore->period_days }}
									</div>
								@else
									<div class="chore-schedule-secondary">
										{{ $__t('Repeats automatically') }}
									</div>
								@endif

							{{-- Yearly --}}
							@elseif($chore->period_type == 'yearly')
								<div class="chore-schedule-main">
									<i class="fa-solid fa-calendar-days text-muted"></i>

									<span>
										@if($chore->period_interval == 1)
											{{ $__t('Every year') }}
										@else
											{{ $__t('Every') }}
											{{ $chore->period_interval }}
											{{ $__t('years') }}
										@endif
									</span>
								</div>

								<div class="chore-schedule-secondary">
									{{ $__t('Repeats automatically') }}
								</div>

							{{-- Fallback --}}
							@else
								<div class="chore-schedule-main">
									<i class="fa-solid fa-calendar text-muted"></i>
									<span>{{ $__t($chore->period_type) }}</span>
								</div>
							@endif
						</div>
					</td>

					@include('components.userfields_tbody', array(
					'userfields' => $userfields,
					'userfieldValues' => FindAllObjectsInArrayByPropertyValue($userfieldValues, 'object_id', $chore->id)
					))

				</tr>
				@endforeach
			</tbody>
		</table>
	</div>
</div>

<div class="modal fade"
	id="merge-chores-modal"
	tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content text-center">
			<div class="modal-header">
				<h4 class="modal-title w-100">{{ $__t('Merge chores') }}</h4>
			</div>
			<div class="modal-body">
				<form id="merge-chores-form"
					novalidate>

					<div class="form-group">
						<label for="merge-chores-keep">{{ $__t('Chore to keep') }}&nbsp;<i class="fa-solid fa-question-circle text-muted"
								data-toggle="tooltip"
								data-trigger="hover click"
								title="{{ $__t('After merging, this chore will be kept') }}"></i>
						</label>
						<select class="custom-control custom-select"
							id="merge-chores-keep"
							required>
							<option></option>
							@foreach($chores as $chore)
							<option value="{{ $chore->id }}">{{ $chore->name }}</option>
							@endforeach
						</select>
					</div>
					<div class="form-group">
						<label for="merge-chores-remove">{{ $__t('Chore to remove') }}&nbsp;<i class="fa-solid fa-question-circle text-muted"
								data-toggle="tooltip"
								data-trigger="hover click"
								title="{{ $__t('After merging, all occurences of this chore will be replaced by the kept chore (means this chore will not exist anymore)') }}"></i>
						</label>
						<select class="custom-control custom-select"
							id="merge-chores-remove"
							required>
							<option></option>
							@foreach($chores as $chore)
							<option value="{{ $chore->id }}">{{ $chore->name }}</option>
							@endforeach
						</select>
					</div>

				</form>
			</div>
			<div class="modal-footer">
				<button type="button"
					class="btn btn-secondary"
					data-dismiss="modal">{{ $__t('Cancel') }}</button>
				<button id="merge-chores-save-button"
					type="button"
					class="btn btn-primary">{{ $__t('OK') }}</button>
			</div>
		</div>
	</div>
</div>
@stop
