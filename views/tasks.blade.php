@php require_frontend_packages(['datatables', 'animatecss']); @endphp

@extends('layout.default')

@section('title', $__t('Tasks'))

@section('content')

<style>
	/* ================================
	   Tasks page
	   UI only - no business logic
	   ================================ */

	.tasks-page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.tasks-page-title {
		margin-bottom: .25rem;
		font-weight: 600;
	}

	.tasks-page-subtitle {
		margin: 0;
		color: #6c757d;
		font-size: .95rem;
	}

	.tasks-summary-card {
		position: relative;
		height: 100%;
		min-height: 118px;
		padding: 1.15rem 1.25rem;
		border: 1px solid #e5e7eb;
		border-radius: .75rem;
		background: #fff;
		cursor: pointer;
		transition:
			transform .15s ease,
			box-shadow .15s ease,
			border-color .15s ease;
		overflow: hidden;
	}

	.tasks-summary-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 .35rem 1rem rgba(0, 0, 0, .07);
	}

	.tasks-summary-card-title {
		display: flex;
		align-items: center;
		gap: .5rem;
		margin-bottom: .6rem;
		font-size: .75rem;
		font-weight: 700;
		letter-spacing: .045rem;
		text-transform: uppercase;
	}

	.tasks-summary-card-value {
		font-size: 1.55rem;
		font-weight: 700;
		line-height: 1.15;
	}

	.tasks-summary-card-description {
		margin-top: .4rem;
		color: #6c757d;
		font-size: .82rem;
	}

	.tasks-summary-overdue {
		border-left: 4px solid #dc3545;
	}

	.tasks-summary-overdue .tasks-summary-card-title,
	.tasks-summary-overdue .tasks-summary-card-value {
		color: #dc3545;
	}

	.tasks-summary-today {
		border-left: 4px solid #17a2b8;
	}

	.tasks-summary-today .tasks-summary-card-title,
	.tasks-summary-today .tasks-summary-card-value {
		color: #138496;
	}

	.tasks-summary-soon {
		border-left: 4px solid #ffc107;
	}

	.tasks-summary-soon .tasks-summary-card-title,
	.tasks-summary-soon .tasks-summary-card-value {
		color: #9a7500;
	}

	.tasks-filter-card {
		margin-bottom: 1.25rem;
		border: 1px solid #e5e7eb;
		border-radius: .75rem;
		background: #fff;
	}

	.tasks-filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: .9rem 1.1rem;
		border-bottom: 1px solid #edf0f2;
	}

	.tasks-filter-title {
		margin: 0;
		font-size: .9rem;
		font-weight: 600;
	}

	.tasks-filter-body {
		padding: 1rem;
	}

	.tasks-filter-label {
		display: block;
		margin-bottom: .35rem;
		color: #6c757d;
		font-size: .75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: .025rem;
	}

	.tasks-show-done {
		display: flex;
		align-items: center;
		min-height: 38px;
		margin-top: 1.55rem;
	}

	.tasks-table-card {
		border: 1px solid #e5e7eb;
		border-radius: .75rem;
		background: #fff;
		overflow: hidden;
	}

	.tasks-table-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.1rem;
		border-bottom: 1px solid #edf0f2;
	}

	.tasks-table-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	#tasks-table {
		margin-bottom: 0 !important;
	}

	#tasks-table thead th {
		padding-top: .85rem;
		padding-bottom: .85rem;
		border-top: 0;
		border-bottom-width: 1px;
		background: #fafbfc;
		color: #6c757d;
		font-size: .75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: .025rem;
	}

	#tasks-table tbody td {
		padding-top: .85rem;
		padding-bottom: .85rem;
		vertical-align: middle;
	}

	#tasks-table tbody tr {
		transition: background-color .15s ease;
	}

	#tasks-table tbody tr:hover {
		background-color: rgba(0, 0, 0, .025);
	}

	.task-name {
		font-weight: 600;
	}

	.task-due-date {
		display: flex;
		flex-direction: column;
		gap: .1rem;
	}

	.task-due-date .timeago {
		color: #6c757d;
		font-size: .78rem;
	}

	.task-category-badge {
		display: inline-flex;
		align-items: center;
		padding: .25rem .55rem;
		border-radius: 999px;
		background: #f1f3f5;
		color: #495057;
		font-size: .78rem;
		font-weight: 500;
	}

	.task-assignee {
		display: inline-flex;
		align-items: center;
		gap: .4rem;
		color: #495057;
	}

	.task-assignee i {
		color: #adb5bd;
	}

	.task-actions {
		display: flex;
		align-items: center;
		gap: .3rem;
		white-space: nowrap;
	}

	.tasks-empty-assignment {
		color: #adb5bd;
	}

	/* Keep contextual row colours, but make them softer */
	#tasks-table tbody tr.table-danger > td {
		background-color: rgba(220, 53, 69, .055);
	}

	#tasks-table tbody tr.table-info > td {
		background-color: rgba(23, 162, 184, .055);
	}

	#tasks-table tbody tr.table-warning > td {
		background-color: rgba(255, 193, 7, .065);
	}

	@media (max-width: 767.98px) {
		.tasks-page-header {
			align-items: center;
		}

		.tasks-page-subtitle {
			display: none;
		}

		.tasks-summary-card {
			min-height: 100px;
		}

		.tasks-summary-card-value {
			font-size: 1.3rem;
		}

		.tasks-filter-body {
			padding-bottom: .5rem;
		}

		.tasks-filter-body .form-group {
			margin-bottom: .85rem;
		}

		.tasks-show-done {
			margin-top: 0;
			margin-bottom: .85rem;
		}

		.tasks-table-card {
			overflow-x: auto;
		}
	}

	/* ================================
   	 Task due status
   	================================ */

	.task-due-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: .35rem;
	}

	.task-due-date-text {
		color: #495057;
		font-size: .875rem;
		font-weight: 500;
	}

	.task-due-badge {
		display: inline-flex;
		align-items: center;
		gap: .3rem;
		padding: .22rem .5rem;
		border-radius: 999px;
		font-size: .72rem;
		font-weight: 600;
		line-height: 1.2;
		white-space: nowrap;
	}

	.task-due-badge-overdue {
		background: rgba(220, 53, 69, .1);
		color: #c82333;
	}

	.task-due-badge-today {
		background: rgba(23, 162, 184, .1);
		color: #117a8b;
	}

	.task-due-badge-soon {
		background: rgba(255, 193, 7, .15);
		color: #856404;
	}

	.task-due-badge-normal {
		background: #f1f3f5;
		color: #6c757d;
	}

	/* ================================
   	 Task actions
   	================================ */

	.task-actions {
		display: flex;
		align-items: center;
		gap: .4rem;
		white-space: nowrap;
	}

	.task-action-button {
		display: inline-flex !important;
		align-items: center;
		justify-content: center;
		width: 34px !important;
		height: 34px !important;
		padding: 0 !important;
		border-radius: .5rem !important;
		border: 1px solid #dee2e6 !important;
		background: #fff !important;
		box-shadow: none !important;
		transition:
			background-color .15s ease,
			border-color .15s ease,
			transform .15s ease;
	}

	.task-action-button:hover {
		transform: translateY(-1px);
	}

	.task-action-complete {
		color: #28a745 !important;
	}

	.task-action-complete:hover {
		background: rgba(40, 167, 69, .08) !important;
		border-color: rgba(40, 167, 69, .35) !important;
	}

	.task-action-undo {
		color: #6c757d !important;
	}

	.task-action-undo:hover {
		background: #f1f3f5 !important;
		border-color: #ced4da !important;
	}

	.task-action-edit {
		color: #17a2b8 !important;
	}

	.task-action-edit:hover {
		background: rgba(23, 162, 184, .08) !important;
		border-color: rgba(23, 162, 184, .35) !important;
	}

	.task-action-delete {
		color: #dc3545 !important;
	}

	.task-action-delete:hover {
		background: rgba(220, 53, 69, .07) !important;
		border-color: rgba(220, 53, 69, .3) !important;
	}

	/* Completed task */
	#tasks-table tbody tr.text-muted .task-name {
		opacity: .65;
	}

	#tasks-table tbody tr.text-muted .task-due-wrapper {
		opacity: .55;
	}

	/* ================================
   	 Completed task
   	================================ */

	.task-row-completed {
		opacity: .72;
	}

	.task-row-completed > td {
		background-color: #fafbfc !important;
	}

	.task-row-completed .task-name {
		color: #6c757d;
		text-decoration: line-through;
	}

	.task-completed-badge {
		display: inline-flex;
		align-items: center;
		gap: .3rem;
		padding: .22rem .5rem;
		border-radius: 999px;
		background: rgba(40, 167, 69, .09);
		color: #218838;
		font-size: .72rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.task-row-completed .task-category-badge,
	.task-row-completed .task-assignee {
		opacity: .7;
	}

	/* ================================
   	 Empty state
   	================================ */

	.tasks-empty-state {
		padding: 4rem 1.5rem;
		text-align: center;
	}

	.tasks-empty-state-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 58px;
		height: 58px;
		margin: 0 auto 1rem;
		border-radius: 50%;
		background: #f1f3f5;
		color: #adb5bd;
		font-size: 1.35rem;
	}

	.tasks-empty-state-title {
		margin-bottom: .4rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.tasks-empty-state-description {
		max-width: 360px;
		margin: 0 auto 1rem;
		color: #6c757d;
		font-size: .875rem;
	}

	/* ================================
  	 Mobile task cards
   	================================ */

	@media (max-width: 767.98px) {
		.tasks-table-card {
			border: 0;
			background: transparent;
			overflow: visible;
		}

		.tasks-table-header {
			margin-bottom: .75rem;
			padding: .75rem 0;
			background: transparent;
			border-bottom: 0;
		}

		#tasks-table thead {
			display: none;
		}

		#tasks-table,
		#tasks-table tbody {
			display: block;
			width: 100%;
		}

		#tasks-table tbody tr {
			position: relative;
			display: grid;
			grid-template-columns: 1fr auto;
			gap: .75rem 1rem;

			margin-bottom: .75rem;
			padding: 1rem;

			border: 1px solid #e5e7eb;
			border-radius: .75rem;

			background: #fff;
		}

		#tasks-table tbody td {
			display: block;
			width: auto !important;
			padding: 0 !important;
			border: 0 !important;
			background: transparent !important;
		}

		/* Actions */
		#tasks-table tbody td:nth-child(1) {
			grid-column: 2;
			grid-row: 1 / span 3;
		}

		/* Task name */
		#tasks-table tbody td:nth-child(2) {
			grid-column: 1;
			grid-row: 1;

			padding-right: .5rem !important;

			font-size: .95rem;
		}

		/* Due */
		#tasks-table tbody td:nth-child(3) {
			grid-column: 1;
			grid-row: 2;
		}

		/* Category */
		#tasks-table tbody td:nth-child(4) {
			grid-column: 1;
			grid-row: 3;
		}

		/* Assigned */
		#tasks-table tbody td:nth-child(5) {
			grid-column: 1;
			grid-row: 4;
		}

		/* Hidden filter columns remain hidden */
		#tasks-table tbody td:nth-child(6),
		#tasks-table tbody td:nth-child(7) {
			display: none !important;
		}

		.task-actions {
			flex-direction: column;
			gap: .35rem;
		}

		.task-action-button {
			width: 32px !important;
			height: 32px !important;
		}

		.task-due-wrapper {
			flex-direction: row;
			align-items: center;
			flex-wrap: wrap;
		}

		.task-category-badge {
			font-size: .72rem;
		}

		.task-assignee {
			font-size: .8rem;
		}

		/* DataTables controls */
		.dataTables_wrapper .dataTables_length,
		.dataTables_wrapper .dataTables_filter {
			margin-bottom: .75rem;
		}

		.dataTables_wrapper .dataTables_info {
			padding-top: .75rem !important;
			font-size: .8rem;
		}

		.dataTables_wrapper .dataTables_paginate {
			padding-top: .5rem;
		}
	}

	@media (max-width: 767.98px) {
		.tasks-summary-card {
			min-height: 92px;
			padding: .8rem;
		}

		.tasks-summary-card-title {
			gap: .3rem;
			margin-bottom: .35rem;
			font-size: .62rem;
		}

		.tasks-summary-card-value {
			font-size: 1.35rem;
		}

		.tasks-summary-card-description {
			display: none;
		}
	}

	.tasks-summary-row {
		max-width: 900px;
	}

	.tasks-summary-card {
		width: 100%;
		min-height: 110px;
	}

	@media (min-width: 576px) {
		.tasks-summary-row > div {
			display: flex;
		}

		.tasks-summary-row .tasks-summary-card {
			flex: 1;
		}
	}
</style>

{{-- ============================================
     Page header
     ============================================ --}}
<div class="row">
	<div class="col">
		<div class="tasks-page-header">
			<div>
				<h2 class="tasks-page-title">
					@yield('title')
				</h2>

				<p class="tasks-page-subtitle">
					{{ $__t('Manage your tasks and keep track of upcoming work') }}
				</p>
			</div>

			<div>
				<a class="btn btn-primary responsive-button show-as-dialog-link"
					href="{{ $U('/task/new?embedded') }}">
					<i class="fa-solid fa-plus mr-1"></i>
					{{ $__t('Add') }}
				</a>
			</div>
		</div>
	</div>
</div>

{{-- ============================================
     Summary cards
     ============================================ --}}
<div class="row mb-4 tasks-summary-row">
	{{-- Overdue --}}
	<div class="col-12 col-sm-4 mb-3 mb-sm-0">
		<div id="info-overdue-tasks"
			data-status-filter="overdue"
			class="tasks-summary-card tasks-summary-overdue status-filter-message">
			<div class="tasks-summary-card-title">
				<i class="fa-solid fa-circle-exclamation"></i>
				<span>{{ $__t('Overdue') }}</span>
			</div>

			<div class="tasks-summary-card-value">
				<span id="overdue-tasks-count">
					<i class="fa-solid fa-spinner fa-spin"></i>
				</span>
			</div>

			<div class="tasks-summary-card-description">
				{{ $__t('Tasks that need attention') }}
			</div>
		</div>
	</div>

	{{-- Due today --}}
	<div class="col-12 col-sm-4 mb-3 mb-sm-0">
		<div id="info-due-today-tasks"
			data-status-filter="duetoday"
			class="tasks-summary-card tasks-summary-today status-filter-message">
			<div class="tasks-summary-card-title">
				<i class="fa-solid fa-clock"></i>
				<span>{{ $__t('Due today') }}</span>
			</div>

			<div class="tasks-summary-card-value">
				<span id="due-today-tasks-count">
					<i class="fa-solid fa-spinner fa-spin"></i>
				</span>
			</div>

			<div class="tasks-summary-card-description">
				{{ $__t('Tasks scheduled for today') }}
			</div>
		</div>
	</div>

	{{-- Due soon --}}
	<div class="col-12 col-sm-4 mb-3 mb-sm-0 @if($nextXDays == 0) d-none @endif">
		<div id="info-due-soon-tasks"
			data-status-filter="duesoon"
			data-next-x-days="{{ $nextXDays }}"
			class="tasks-summary-card tasks-summary-soon status-filter-message">
			<div class="tasks-summary-card-title">
				<i class="fa-solid fa-calendar-day"></i>
				<span>{{ $__t('Due soon') }}</span>
			</div>

			<div class="tasks-summary-card-value">
				<span id="due-soon-tasks-count">
					<i class="fa-solid fa-spinner fa-spin"></i>
				</span>
			</div>

			<div class="tasks-summary-card-description">
				{{ $__t('Within the next %s days', $nextXDays) }}
			</div>
		</div>
	</div>
</div>

{{-- ============================================
     Filters
     ============================================ --}}
<div class="tasks-filter-card">
	<div class="tasks-filter-header">
		<h3 class="tasks-filter-title">
			<i class="fa-solid fa-filter mr-1 text-muted"></i>
			{{ $__t('Filters') }}
		</h3>

		<button id="clear-filter-button"
			class="btn btn-sm btn-outline-secondary"
			data-toggle="tooltip"
			title="{{ $__t('Clear filter') }}">
			<i class="fa-solid fa-filter-circle-xmark mr-1"></i>

			<span class="d-none d-sm-inline">
				{{ $__t('Clear filter') }}
			</span>
		</button>
	</div>

	<div id="table-filter-row"
		class="tasks-filter-body">
		<div class="row">
			{{-- Search --}}
			<div class="col-12 col-md-6 col-xl-3">
				<div class="form-group">
					<label class="tasks-filter-label"
						for="search">
						{{ $__t('Search') }}
					</label>

					<div class="input-group">
						<div class="input-group-prepend">
							<span class="input-group-text">
								<i class="fa-solid fa-search"></i>
							</span>
						</div>

						<input type="text"
							id="search"
							class="form-control"
							placeholder="{{ $__t('Search') }}">
					</div>
				</div>
			</div>

			{{-- Status --}}
			<div class="col-12 col-md-6 col-xl-2">
				<div class="form-group">
					<label class="tasks-filter-label"
						for="status-filter">
						{{ $__t('Status') }}
					</label>

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

			{{-- Category --}}
			<div class="col-12 col-md-6 col-xl-2">
				<div class="form-group">
					<label class="tasks-filter-label"
						for="category-filter">
						{{ $__t('Category') }}
					</label>

					<select class="custom-control custom-select"
						id="category-filter">
						<option value="all">
							{{ $__t('All') }}
						</option>

						@foreach($taskCategories as $taskCategory)
							<option value="{{ $taskCategory->name }}">
								{{ $taskCategory->name }}
							</option>
						@endforeach

						<option class="font-italic font-weight-light"
							value="{{ $__t('Uncategorized') }}">
							{{ $__t('Uncategorized') }}
						</option>
					</select>
				</div>
			</div>

			{{-- Assignment --}}
			<div class="col-12 col-md-6 col-xl-3">
				<div class="form-group">
					<label class="tasks-filter-label"
						for="user-filter">
						{{ $__t('Assignment') }}
					</label>

					<select class="custom-control custom-select"
						id="user-filter">
						<option value="all">
							{{ $__t('All') }}
						</option>

						@foreach($users as $user)
							<option value="{{ $user->display_name }}">
								{{ $user->display_name }}
							</option>
						@endforeach
					</select>
				</div>
			</div>

			{{-- Show done --}}
			<div class="col-12 col-md-6 col-xl-2">
				<div class="tasks-show-done">
					<div class="form-check custom-control custom-checkbox">
						<input class="form-check-input custom-control-input"
							type="checkbox"
							id="show-done-tasks">
						<label class="form-check-label custom-control-label"
							for="show-done-tasks">
							{{ $__t('Show done tasks') }}
						</label>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

{{-- ============================================
     Tasks table
     ============================================ --}}
<div class="tasks-table-card">
	<div class="tasks-table-header">
		<h3 class="tasks-table-title">
			<i class="fa-solid fa-list-check mr-1 text-muted"></i>
			{{ $__t('Tasks') }}
		</h3>

		<a class="btn btn-sm btn-outline-secondary change-table-columns-visibility-button"
			data-toggle="tooltip"
			title="{{ $__t('Table options') }}"
			data-table-selector="#tasks-table"
			href="#">
			<i class="fa-solid fa-eye"></i>
		</a>
	</div>

	<div id="tasks-empty-state"
		class="tasks-empty-state d-none">

		<div class="tasks-empty-state-icon">
			<i class="fa-solid fa-list-check"></i>
		</div>

		<h4 class="tasks-empty-state-title">
			{{ $__t('No tasks found') }}
		</h4>

		<p class="tasks-empty-state-description">
			{{ $__t('There are no tasks matching the current filters') }}
		</p>

		<button type="button"
			id="tasks-empty-clear-filter"
			class="btn btn-sm btn-outline-secondary">
			<i class="fa-solid fa-filter-circle-xmark mr-1"></i>
			{{ $__t('Clear filter') }}
		</button>
	</div>

	<div class="table-responsive">
		<table id="tasks-table"
			class="table table-sm nowrap w-100">
			<thead>
				<tr>
					{{-- IMPORTANT:
					     Column order is intentionally unchanged.
					     tasks.js depends on these indexes.
					--}}

					<th class="border-right"></th>

					<th>
						{{ $__t('Task') }}
					</th>

					<th class="allow-grouping">
						{{ $__t('Due') }}
					</th>

					<th class="allow-grouping"
						data-shadow-rowgroup-column="6">
						{{ $__t('Category') }}
					</th>

					<th class="allow-grouping">
						{{ $__t('Assigned to') }}
					</th>

					<th class="d-none">
						Hidden status
					</th>

					<th class="d-none">
						Hidden category_id
					</th>

					@include(
						'components.userfields_thead',
						array(
							'userfields' => $userfields
						)
					)
				</tr>
			</thead>

			<tbody class="d-none">
				@foreach($tasks as $task)
					<tr id="task-{{ $task->id }}-row"
						data-task-due-date="{{ $task->due_date }}"
						data-task-done="{{ $task->done }}"
						class="@if($task->done == 1) text-muted task-row-completed @endif">

						{{-- Actions --}}
						<td class="fit-content border-right">
							<div class="task-actions">
								@if($task->done == 0)
								<a class="btn btn-sm task-action-button task-action-complete do-task-button"
									href="#"
									data-toggle="tooltip"
									data-placement="top"
									title="{{ $__t('Mark task as completed') }}"
									data-task-id="{{ $task->id }}"
									data-task-name="{{ $task->name }}">
									<i class="fa-solid fa-check"></i>
								</a>
								@else
								<a class="btn btn-sm task-action-button task-action-undo undo-task-button"
									href="#"
									data-toggle="tooltip"
									data-placement="top"
									title="{{ $__t('Undo task', $task->name) }}"
									data-task-id="{{ $task->id }}"
									data-task-name="{{ $task->name }}">
									<i class="fa-solid fa-rotate-left"></i>
								</a>
								@endif
								<a class="btn btn-sm task-action-button task-action-edit show-as-dialog-link"
									href="{{ $U('/task/') }}{{ $task->id }}?embedded"
									data-toggle="tooltip"
									data-placement="top"
									title="{{ $__t('Edit this item') }}">
									<i class="fa-solid fa-pen"></i>
								</a>

								<a class="btn btn-sm task-action-button task-action-delete delete-task-button"
									href="#"
									data-task-id="{{ $task->id }}"
									data-task-name="{{ $task->name }}"
									data-toggle="tooltip"
									data-placement="top"
									title="{{ $__t('Delete this item') }}">
									<i class="fa-solid fa-trash"></i>
								</a>
							</div>
						</td>

						{{-- Task name --}}
						<td id="task-{{ $task->id }}-name"
							class="task-name @if($task->done == 1) text-strike-through @endif">
							{{ $task->name }}
						</td>

						{{-- Due --}}
						<td>
							<div class="task-due-wrapper">
								<div class="task-due-date-text">
									@if($task->due_date)
										<i class="fa-regular fa-calendar mr-1 text-muted"></i>
										{{ $task->due_date }}
									@else
										<span class="text-muted">—</span>
									@endif
								</div>
								@if($task->done == 1)
									<span class="task-completed-badge">
										<i class="fa-solid fa-circle-check"></i>
										{{ $__t('Done') }}
									</span>
								@elseif($task->due_date)
									<span class="task-due-status"></span>
								@endif
							</div>
						</td>

						{{-- Category --}}
						<td>
							@if($task->category_id != null)
								<span class="task-category-badge">
									<i class="fa-solid fa-tag mr-1"></i>
									{{
										FindObjectInArrayByPropertyValue(
											$taskCategories,
											'id',
											$task->category_id
										)->name
									}}
								</span>
							@else
								<span class="task-category-badge font-italic font-weight-light">
									{{ $__t('Uncategorized') }}
								</span>
							@endif
						</td>

						{{-- Assigned user --}}
						<td>
							@if($task->assigned_to_user_id != null)
								<span class="task-assignee">
									<i class="fa-solid fa-user"></i>
									{{
										GetUserDisplayName(
											FindObjectInArrayByPropertyValue(
												$users,
												'id',
												$task->assigned_to_user_id
											)
										)
									}}
								</span>
							@else
								<span class="tasks-empty-assignment">
									—
								</span>
							@endif
						</td>

						{{-- Hidden status
						     REQUIRED BY tasks.js
						--}}
						<td class="d-none task-status-filter-value"></td>

						{{-- Hidden category
						     REQUIRED BY tasks.js
						--}}
						<td class="d-none">
							@if($task->category_id != null)
								{{
									FindObjectInArrayByPropertyValue(
										$taskCategories,
										'id',
										$task->category_id
									)->name
								}}
							@else
								{{ $__t('Uncategorized') }}
							@endif
						</td>

						@include(
							'components.userfields_tbody',
							array(
								'userfields' => $userfields,
								'userfieldValues' =>
									FindAllObjectsInArrayByPropertyValue(
										$userfieldValues,
										'object_id',
										$task->id
									)
							)
						)
					</tr>
				@endforeach
			</tbody>
		</table>
	</div>
</div>
@stop