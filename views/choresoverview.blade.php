@php require_frontend_packages(['datatables', 'animatecss']); @endphp

@extends('layout.default')

@section('title', $__t('Chores overview'))

@section('content')

<div id="react-chores-overview-root"></div>

<script>
    window.GROCY_REACT_CONTEXT = {
        baseUrl: @json($U('')),
        locale: 'en',
        user: null,
        permissions: [],
        page: {
            name: 'chores-overview'
        }
    };
</script>

<link
    rel="stylesheet"
    href="{{ $U('/react/chores-overview.css') }}"
>

<script
    type="module"
    src="{{ $U('/react/chores-overview.js') }}">
</script>

<div class="row">
	<div class="col">
		<div class="title-related-links">
			<h2 class="title">@yield('title')</h2>
			<button class="btn btn-outline-dark d-md-none mt-2 float-right order-1 order-md-3"
				type="button"
				data-toggle="collapse"
				data-target="#related-links">
				<i class="fa-solid fa-ellipsis-v"></i>
			</button>
			<div class="related-links collapse d-md-flex order-2 width-xs-sm-100"
				id="related-links">
				<a class="btn btn-outline-dark responsive-button m-1 mt-md-0 mb-md-0 float-right"
					href="{{ $U('/choresjournal') }}">
					{{ $__t('Journal') }}
				</a>
			</div>
		</div>

		<style>
			.chore-summary-card {
				cursor: pointer;
				border: 1px solid #dee2e6;
				border-radius: 0.5rem;
				transition:
					transform 0.15s ease,
					box-shadow 0.15s ease,
					border-color 0.15s ease;
				overflow: hidden;
			}

			.chore-summary-card:hover {
				transform: translateY(-2px);
				box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.08);
			}

			.chore-summary-card .card-body {
				padding: 1rem 1.1rem;
			}

			.chore-summary-icon {
				width: 2.5rem;
				height: 2.5rem;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 1rem;
				background: rgba(0, 0, 0, 0.04);
			}

			.chore-summary-title {
				font-size: 0.8rem;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.03rem;
				color: #6c757d;
			}

			.summary-count {
				font-size: 1.75rem;
				line-height: 1;
				font-weight: 600;
				margin-top: 0.35rem;
			}

			.chore-summary-description {
				margin-top: 0.45rem;
				font-size: 0.75rem;
				color: #6c757d;
			}

			.chore-summary-card.active {
				box-shadow: 0 0 0 2px currentColor;
			}
		</style>

		<div class="row mt-2 mb-3">
			<!-- Overdue -->
			<div class="col-12 col-sm-6 col-xl-3 mb-3">
				<div class="card h-100 chore-summary-card text-danger status-filter-message"
					data-status-filter="overdue"
					title="{{ $__t('Show overdue chores') }}">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-start">
							<div>
								<div class="chore-summary-title">
									{{ $__t('Overdue') }}
								</div>

								<div
									id="summary-overdue-count"
									class="summary-count">
									0
								</div>
							</div>

							<div class="chore-summary-icon">
								<i class="fa-solid fa-triangle-exclamation"></i>
							</div>
						</div>

						<div class="chore-summary-description">
							{{ $__t('Chores requiring attention') }}
						</div>
					</div>
				</div>
			</div>


			<!-- Due today -->
			<div class="col-12 col-sm-6 col-xl-3 mb-3">
				<div class="card h-100 chore-summary-card text-info status-filter-message"
					data-status-filter="duetoday"
					title="{{ $__t('Show chores due today') }}">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-start">
							<div>
								<div class="chore-summary-title">
									{{ $__t('Due today') }}
								</div>

								<div
									id="summary-due-today-count"
									class="summary-count">
									0
								</div>
							</div>

							<div class="chore-summary-icon">
								<i class="fa-solid fa-calendar-day"></i>
							</div>
						</div>

						<div class="chore-summary-description">
							{{ $__t('Scheduled for today') }}
						</div>
					</div>
				</div>
			</div>


			<!-- Due soon -->
			<div class="col-12 col-sm-6 col-xl-3 mb-3 @if($nextXDays == 0) d-none @endif">
				<div class="card h-100 chore-summary-card text-warning status-filter-message"
					data-status-filter="duesoon"
					title="{{ $__t('Show upcoming chores') }}">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-start">
							<div>
								<div class="chore-summary-title">
									{{ $__t('Due soon') }}
								</div>

								<div
									id="summary-due-soon-count"
									class="summary-count">
									0
								</div>
							</div>

							<div class="chore-summary-icon">
								<i class="fa-solid fa-clock"></i>
							</div>
						</div>

						<div class="chore-summary-description">
							{{ $__t('Upcoming chores') }}
						</div>
					</div>
				</div>
			</div>


			<!-- Assigned to me -->
			@if(GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS)
			<div class="col-12 col-sm-6 col-xl-3 mb-3">
				<div class="card h-100 chore-summary-card text-secondary user-filter-message"
					data-user-filter="xx{{ GROCY_USER_ID }}xx"
					title="{{ $__t('Show chores assigned to me') }}">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-start">
							<div>
								<div class="chore-summary-title">
									{{ $__t('Assigned to me') }}
								</div>

								<div
									id="summary-assigned-count"
									class="summary-count">
									0
								</div>
							</div>

							<div class="chore-summary-icon">
								<i class="fa-solid fa-user"></i>
							</div>
						</div>

						<div class="chore-summary-description">
							{{ $__t('Your assigned chores') }}
						</div>
					</div>
				</div>
			</div>
			@endif
		</div>

		<div class="border-top border-bottom my-2 py-1 d-none">
			<div id="info-overdue-chores"
				data-status-filter="overdue"
				class="error-message status-filter-message responsive-button mr-2"></div>
			<div id="info-due-today-chores"
				data-status-filter="duetoday"
				class="normal-message status-filter-message responsive-button mr-2"></div>
			<div id="info-due-soon-chores"
				data-status-filter="duesoon"
				data-next-x-days="{{ $nextXDays }}"
				class="warning-message status-filter-message responsive-message mr-2 @if($nextXDays == 0) d-none @endif"></div>
			@if(GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS)
			<div id="info-assigned-to-me-chores"
				data-user-filter="xx{{ GROCY_USER_ID }}xx"
				class="secondary-message user-filter-message responsive-button"></div>
			@endif
			<div class="float-right mt-1 @if($embedded) pr-5 @endif">
				<a class="btn btn-sm btn-outline-info d-md-none"
					data-toggle="collapse"
					href="#table-filter-row"
					role="button">
					<i class="fa-solid fa-filter"></i>
				</a>
				<button id="clear-filter-button"
					class="btn btn-sm btn-outline-info"
					data-toggle="tooltip"
					title="{{ $__t('Clear filter') }}">
					<i class="fa-solid fa-filter-circle-xmark"></i>
				</button>
			</div>
		</div>
	</div>
</div>

<div class="d-flex justify-content-between align-items-center mb-2">
	<div>
		<h5 class="mb-0">
			{{ $__t('Chores') }}
		</h5>

		<small class="text-muted">
			{{ $__t('Search and filter your upcoming chores') }}
		</small>
	</div>
</div>

<div class="row collapse d-md-flex align-items-center mb-2"
	id="table-filter-row">
	<!-- Search -->
	<div class="col-12 col-md-6 col-lg-4 mb-2">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text">
					<i class="fa-solid fa-search"></i>
				</span>
			</div>

			<input type="text"
				id="search"
				class="form-control"
				placeholder="{{ $__t('Search chores...') }}">
		</div>
	</div>

	<!-- Status -->
	<div class="col-12 col-md-6 col-lg-3 mb-2">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text">
					<i class="fa-solid fa-filter"></i>&nbsp;
					{{ $__t('Status') }}
				</span>
			</div>

			<select class="custom-control custom-select"
				id="status-filter">
				<option value="all">
					{{ $__t('All') }}
				</option>

				<option value="overdue">
					{{ $__t('Overdue') }}
				</option>

				<option value="duetoday">
					{{ $__t('Due today') }}
				</option>

				@if($nextXDays > 0)
				<option value="duesoon">
					{{ $__t('Due soon') }}
				</option>
				@endif
			</select>
		</div>
	</div>

	<!-- Assignment -->
	@if(GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS)
	<div class="col-12 col-md-6 col-lg-3 mb-2">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text">
					<i class="fa-solid fa-user"></i>&nbsp;
					{{ $__t('Assignment') }}
				</span>
			</div>

			<select class="custom-control custom-select"
				id="user-filter">
				<option value="">
					{{ $__t('All') }}
				</option>

				@foreach($users as $user)
					<option
						data-user-id="{{ $user->id }}"
						value="xx{{ $user->id }}xx">
						{{ $user->display_name }}
					</option>
				@endforeach
			</select>
		</div>
	</div>
	@endif

	<!-- Clear filters -->
	<div class="col-12 col-md-6 col-lg-2 mb-2">
		<button type="button"
			id="clear-chore-filters"
			class="btn btn-outline-secondary btn-block">
			<i class="fa-solid fa-xmark mr-1"></i>
			{{ $__t('Clear filters') }}
		</button>
	</div>

</div>

<div class="row">
	<div class="col">
		<table id="chores-overview-table"
			class="table table-sm table-striped nowrap w-100">
			<thead>
				<tr>
					<th class="border-right"><a class="text-muted change-table-columns-visibility-button"
							data-toggle="tooltip"
							title="{{ $__t('Table options') }}"
							data-table-selector="#chores-overview-table"
							href="#"><i class="fa-solid fa-eye"></i></a>
					</th>
					<th>{{ $__t('Chore') }}</th>
					<th>{{ $__t('Next estimated tracking') }}</th>
					<th>{{ $__t('Last tracked') }}</th>
					<th class="@if(!GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS) d-none @endif allow-grouping">{{ $__t('Assigned to') }}</th>
					<th class="d-none">Hidden status</th>
					<th class="d-none">Hidden assigned to user id</th>

					@include('components.userfields_thead', array(
					'userfields' => $userfields
					))

				</tr>
			</thead>
			<tbody class="d-none">
				@foreach($currentChores as $curentChoreEntry)
				<tr id="chore-{{ $curentChoreEntry->chore_id }}-row"
					class="@if($curentChoreEntry->due_type == 'overdue') table-danger @elseif($curentChoreEntry->due_type == 'duetoday') table-info @elseif($curentChoreEntry->due_type == 'duesoon') table-warning @endif">
					<td class="fit-content border-right">
						<a class="btn btn-success btn-sm track-chore-button permission-CHORE_TRACK_EXECUTION @if(boolval($userSettings['chores_overview_swap_tracking_buttons'])) now @endif"
							href="#"
							data-toggle="tooltip"
							data-placement="left"
							@if(boolval($userSettings['chores_overview_swap_tracking_buttons']))
							title="{{ $__t('Track chore execution now') }}"
							@else
							title="{{ $__t('Track next chore schedule') }}"
							@endif
							data-chore-id="{{ $curentChoreEntry->chore_id }}"
							data-chore-name="{{ FindObjectInArrayByPropertyValue($chores, 'id', $curentChoreEntry->chore_id)->name }}">
							<i class="fa-solid fa-play"></i>
						</a>
						<a class="btn btn-secondary btn-sm track-chore-button skip permission-CHORE_TRACK_EXECUTION @if(FindObjectInArrayByPropertyValue($chores, 'id', $curentChoreEntry->chore_id)->period_type == \Grocy\Services\ChoresService::CHORE_PERIOD_TYPE_MANUALLY) disabled @endif"
							href="#"
							data-toggle="tooltip"
							data-placement="left"
							title="{{ $__t('Skip next chore schedule') }}"
							data-chore-id="{{ $curentChoreEntry->chore_id }}"
							data-chore-name="{{ FindObjectInArrayByPropertyValue($chores, 'id', $curentChoreEntry->chore_id)->name }}">
							<i class="fa-solid fa-forward"></i>
						</a>
						<div class="dropdown d-inline-block">
							<button class="btn btn-sm btn-light text-secondary"
								type="button"
								data-toggle="dropdown">
								<i class="fa-solid fa-ellipsis-v"></i>
							</button>
							<div class="table-inline-menu dropdown-menu dropdown-menu-right">
								<a class="dropdown-item track-chore-button permission-CHORE_TRACK_EXECUTION @if(!boolval($userSettings['chores_overview_swap_tracking_buttons'])) now @endif"
									data-chore-id="{{ $curentChoreEntry->chore_id }}"
									data-chore-name="{{ FindObjectInArrayByPropertyValue($chores, 'id', $curentChoreEntry->chore_id)->name }}"
									type="button"
									href="#">
									@if(boolval($userSettings['chores_overview_swap_tracking_buttons']))
									<span>{{ $__t('Track next chore schedule') }}</span>
									@else
									<span>{{ $__t('Track chore execution now') }}</span>
									@endif
								</a>
								<a class="dropdown-item reschedule-chore-button permission-CHORE_TRACK_EXECUTION"
									data-chore-id="{{ $curentChoreEntry->chore_id }}"
									type="button"
									href="#">
									<span>{{ $__t('Reschedule next execution') }}</span>
								</a>
								<div class="dropdown-divider"></div>
								<a class="dropdown-item chorecard-trigger"
									data-chore-id="{{ $curentChoreEntry->chore_id }}"
									type="button"
									href="#">
									<span class="dropdown-item-text">{{ $__t('Chore overview') }}</span>
								</a>
								<a class="dropdown-item show-as-dialog-link"
									type="button"
									href="{{ $U('/choresjournal?embedded&chore=') }}{{ $curentChoreEntry->chore_id }}"
									data-dialog-type="table">
									<span class="dropdown-item-text">{{ $__t('Chore journal') }}</span>
								</a>
								<a class="dropdown-item permission-MASTER_DATA_EDIT"
									type="button"
									href="{{ $U('/chore/') }}{{ $curentChoreEntry->chore_id }}">
									<span class="dropdown-item-text">{{ $__t('Edit chore') }}</span>
								</a>
								<div class="dropdown-divider"></div>
								<a class="dropdown-item"
									type="button"
									href="{{ $U('/chore/' . $curentChoreEntry->chore_id . '/grocycode?download=true') }}">
									{!! str_replace('Grocycode', '<span class="ls-n1">Grocycode</span>', $__t('Download %s Grocycode', $__t('Chore'))) !!}
								</a>
								@if(GROCY_FEATURE_FLAG_LABEL_PRINTER)
								<a class="dropdown-item chore-grocycode-label-print"
									data-chore-id="{{ $curentChoreEntry->chore_id }}"
									type="button"
									href="#">
									{!! str_replace('Grocycode', '<span class="ls-n1">Grocycode</span>', $__t('Print %s Grocycode on label printer', $__t('Chore'))) !!}
								</a>
								@endif
							</div>
						</div>
					</td>
					<td class="chorecard-trigger cursor-link"
						data-chore-id="{{ $curentChoreEntry->chore_id }}">
						{{ FindObjectInArrayByPropertyValue($chores, 'id', $curentChoreEntry->chore_id)->name }}
					</td>
					<td>
						@if(!empty($curentChoreEntry->next_estimated_execution_time))
						<span id="chore-{{ $curentChoreEntry->chore_id }}-next-execution-time">{{ $curentChoreEntry->next_estimated_execution_time }}</span>
						<time id="chore-{{ $curentChoreEntry->chore_id }}-next-execution-time-timeago"
							class="timeago timeago-contextual @if($curentChoreEntry->track_date_only == 1) timeago-date-only @endif"
							datetime="{{ $curentChoreEntry->next_estimated_execution_time }}"></time>
						@else
						<span id="chore-{{ $curentChoreEntry->chore_id }}-next-execution-time">-</span>
						<time id="chore-{{ $curentChoreEntry->chore_id }}-next-execution-time-timeago"
							class="timeago timeago-contextual @if($curentChoreEntry->track_date_only == 1) timeago-date-only @endif"></time>
						@endif
						@if($curentChoreEntry->is_rescheduled == 1)
						<span id="chore-{{ $curentChoreEntry->chore_id }}-rescheduled-icon"
							class="text-muted"
							data-toggle="tooltip"
							title="{{ $__t('Rescheduled') }}">
							<i class="fa-solid fa-clock"></i>
						</span>
						@endif
					</td>
					<td>
						@if(!empty($curentChoreEntry->last_tracked_time))
						<span id="chore-{{ $curentChoreEntry->chore_id }}-last-tracked-time">{{ $curentChoreEntry->last_tracked_time }}</span>
						<time id="chore-{{ $curentChoreEntry->chore_id }}-last-tracked-time-timeago"
							class="timeago timeago-contextual @if($curentChoreEntry->track_date_only == 1) timeago-date-only @endif"
							datetime="{{ $curentChoreEntry->last_tracked_time }}"></time>
						@else
						<span id="chore-{{ $curentChoreEntry->chore_id }}-last-tracked-time">-</span>
						<time id="chore-{{ $curentChoreEntry->chore_id }}-last-tracked-time-timeago"
							class="timeago timeago-contextual @if($curentChoreEntry->track_date_only == 1) timeago-date-only @endif"></time>
						@endif
					</td>

					<td class="@if(!GROCY_FEATURE_FLAG_CHORES_ASSIGNMENTS) d-none @endif">
						<span id="chore-{{ $curentChoreEntry->chore_id }}-next-execution-assigned-user">
							@if(!empty($curentChoreEntry->next_execution_assigned_to_user_id))
							{{ FindObjectInArrayByPropertyValue($users, 'id', $curentChoreEntry->next_execution_assigned_to_user_id)->display_name }}
							@else
							<span>-</span>
							@endif
							@if($curentChoreEntry->is_reassigned == 1)
							<span id="chore-{{ $curentChoreEntry->chore_id }}-reassigned-icon"
								class="text-muted"
								data-toggle="tooltip"
								title="{{ $__t('Reassigned') }}">
								<i class="fa-solid fa-exchange-alt"></i>
							</span>
							@endif
						</span>
					</td>
					<td id="chore-{{ $curentChoreEntry->chore_id }}-due-filter-column"
						class="d-none">
						{{ $curentChoreEntry->due_type }}
						@if($curentChoreEntry->due_type == 'duetoday')
						duesoon
						@endif
					</td>
					<td class="d-none">
						@if(!empty($curentChoreEntry->next_execution_assigned_to_user_id))
						xx{{ $curentChoreEntry->next_execution_assigned_to_user_id }}xx
					</td>
					@endif

					@include('components.userfields_tbody', array(
					'userfields' => $userfields,
					'userfieldValues' => FindAllObjectsInArrayByPropertyValue($userfieldValues, 'object_id', $curentChoreEntry->chore_id)
					))

				</tr>
				@endforeach
			</tbody>
		</table>
	</div>
</div>

@include('components.chorecard', [
'asModal' => true
])

<div class="modal fade"
	id="reschedule-chore-modal"
	tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content text-center">
			<div class="modal-header d-block">
				<h4 class="modal-title">{{ $__t('Reschedule next execution') }}</h4>
				<h5 id="reschedule-chore-modal-title"
					class="text-muted"></h5>
			</div>
			<div class="modal-body">
				<form id="reschedule-chore-form"
					novalidate>

					@include('components.datetimepicker', array(
					'id' => 'reschedule_time',
					'label' => 'Next estimated tracking',
					'format' => 'YYYY-MM-DD HH:mm:ss',
					'initWithNow' => false,
					'limitEndToNow' => false,
					'limitStartToNow' => false,
					'invalidFeedback' => $__t('This can only be in the future')
					))

					@include('components.userpicker', array(
					'label' => 'Assigned to',
					'users' => $users
					))

				</form>
			</div>
			<div class="modal-footer">
				<button id="reschedule-chore-clear-button"
					type="button"
					class="btn btn-success mr-auto">{{ $__t('Reset') }}</button>
				<button type="button"
					class="btn btn-secondary"
					data-dismiss="modal">{{ $__t('Cancel') }}</button>
				<button id="reschedule-chore-save-button"
					type="button"
					class="btn btn-primary">{{ $__t('OK') }}</button>
			</div>
		</div>
	</div>
</div>
@stop
