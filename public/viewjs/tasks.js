function GetTaskDueStatus(dueDate) {
	if (!dueDate) {
		return "";
	}

	var due = moment(dueDate, "YYYY-MM-DD", true);

	if (!due.isValid()) {
		return "";
	}

	var today = moment().startOf("day");

	var nextXDays = parseInt(
		$("#info-due-soon-tasks").data("next-x-days"),
		10
	);

	if (isNaN(nextXDays)) {
		nextXDays = 0;
	}

	var dueDay = due.clone().startOf("day");

	if (dueDay.isBefore(today)) {
		return "overdue";
	}

	if (dueDay.isSame(today, "day")) {
		return "duetoday";
	}

	if (
		nextXDays > 0 &&
		dueDay.isSameOrBefore(
			today.clone().add(nextXDays, "days"),
			"day"
		)
	) {
		return "duesoon";
	}

	return "normal";
}

function ApplyTaskDueStatus(row) {
	var taskRow = $(row);

	var dueDate = taskRow.attr("data-task-due-date");
	var done = taskRow.attr("data-task-done") === "1";

	var statusCell = taskRow.find(".task-status-filter-value");
	var badge = taskRow.find(".task-due-status");

	// Always remove old contextual states first
	taskRow.removeClass(
		"table-danger table-info table-warning"
	);

	if (done) {
		statusCell.text("done");
		return;
	}

	var status = GetTaskDueStatus(dueDate);

	/*
	 * Keep "duetoday duesoon" intentionally.
	 *
	 * Grocy's original behaviour considered a task due today
	 * also part of "due soon", so the Due soon filter includes today.
	 */
	if (status === "duetoday") {
		statusCell.text("duetoday duesoon");
	}
	else {
		statusCell.text(status);
	}


	if (status === "overdue") {
		taskRow.addClass("table-danger");

		badge.html(
			'<span class="task-due-badge task-due-badge-overdue">' +
			'<i class="fa-solid fa-circle-exclamation"></i>' +
			'<span>' + __t("Overdue") + '</span>' +
			'</span>'
		);
	}
	else if (status === "duetoday") {
		taskRow.addClass("table-info");

		badge.html(
			'<span class="task-due-badge task-due-badge-today">' +
			'<i class="fa-solid fa-clock"></i>' +
			'<span>' + __t("Due today") + '</span>' +
			'</span>'
		);
	}
	else if (status === "duesoon") {
		taskRow.addClass("table-warning");

		badge.html(
			'<span class="task-due-badge task-due-badge-soon">' +
			'<i class="fa-solid fa-clock"></i>' +
			'<span>' + __t("Due soon") + '</span>' +
			'</span>'
		);
	}
	else {
		badge.html(
			'<span class="task-due-badge task-due-badge-normal">' +
			'<i class="fa-regular fa-calendar"></i>' +
			'<span>' + __t("Upcoming") + '</span>' +
			'</span>'
		);
	}
}

$("#tasks-table tbody tr").each(function () {
	ApplyTaskDueStatus(this);
});

var tasksTable = $('#tasks-table').DataTable({
	'order': [[2, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 },
		{ "type": "html", "targets": 2 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#tasks-table tbody').removeClass("d-none");
tasksTable.columns.adjust().draw();

function RefreshTasksEmptyState() {
	var visibleRows = tasksTable.rows({
		search: 'applied'
	}).count();

	if (visibleRows === 0) {
		$("#tasks-empty-state").removeClass("d-none");
		$("#tasks-table_wrapper").addClass("tasks-table-is-empty");
	}
	else {
		$("#tasks-empty-state").addClass("d-none");
		$("#tasks-table_wrapper").removeClass("tasks-table-is-empty");
	}
}

tasksTable.on('draw', function () {
	RefreshTasksEmptyState();
});

RefreshTasksEmptyState();

$("#tasks-empty-clear-filter").on("click", function () {
	$("#clear-filter-button").trigger("click");
});

$("#search").on("keyup", Delay(function () {
	var value = $(this).val();
	if (value === "all") {
		value = "";
	}

	tasksTable.search(value).draw();
}, Grocy.FormFocusDelay));

$("#status-filter").on("change", function () {
	var value = $(this).val();
	if (value === "all") {
		value = "";
	}

	// Transfer CSS classes of selected element to dropdown element (for background)
	$(this).attr("class", $("#" + $(this).attr("id") + " option[value='" + value + "']").attr("class") + " form-control");

	tasksTable.column(tasksTable.colReorder.transpose(5)).search(value).draw();
});

$("#user-filter").on("change", function () {
	var value = $(this).val();
	if (value === "all") {
		value = "";
	}
	else {
		value = "^" + $.fn.dataTable.util.escapeRegex(value) + "$";
	}

	tasksTable.column(tasksTable.colReorder.transpose(4)).search(value, true, false).draw();
});

$("#category-filter").on("change", function () {
	var value = $(this).val();
	if (value === "all") {
		value = "";
	}

	tasksTable.column(tasksTable.colReorder.transpose(3)).search(value).draw();
});

$("#clear-filter-button").on("click", function () {
	$("#search").val("");
	$("#status-filter").val("all");
	$("#category-filter").val("all");
	$("#search").trigger("keyup");
	$("#status-filter").trigger("change");
	$("#category-filter").trigger("change");
	$("#user-filter").val("all").trigger("change");
	$("#show-done-tasks").trigger('checked', false);
});

$(".status-filter-message").on("click", function () {
	var value = $(this).data("status-filter");
	$("#status-filter").val(value);
	$("#status-filter").trigger("change");
});

$(document).on('click', '.do-task-button', function (e) {
	e.preventDefault();

	Grocy.FrontendHelpers.BeginUiBusy();

	var taskId = $(e.currentTarget).attr('data-task-id');
	var taskName = $(e.currentTarget).attr('data-task-name');
	var doneTime = moment().format('YYYY-MM-DD HH:mm:ss');

	Grocy.Api.Post('tasks/' + taskId + '/complete', { 'done_time': doneTime },
		function () {
			if (!$("#show-done-tasks").is(":checked")) {
				animateCSS("#task-" + taskId + "-row", "fadeOut", function () {
					$("#task-" + taskId + "-row").remove();
				});
			}
			else {
				var taskRow = $('#task-' + taskId + '-row');
				taskRow.attr("data-task-done", "1");

				taskRow
					.addClass("text-muted task-row-completed")
					.removeClass("table-danger table-info table-warning");

				$('#task-' + taskId + '-name')
					.addClass("text-strike-through");

				// Replace the due status badge immediately
				taskRow.find('.task-due-badge')
					.replaceWith(
						'<span class="task-completed-badge">' +
						'<i class="fa-solid fa-circle-check"></i> ' +
						__t('Done') +
						'</span>'
					);

				// Disable complete action until reload
				$('.do-task-button[data-task-id="' + taskId + '"]')
					.addClass("disabled");
			}

			Grocy.FrontendHelpers.EndUiBusy();
			toastr.success(__t('Marked task %s as completed on %s', taskName, doneTime));
			RefreshContextualTimeago("#task-" + taskId + "-row");
			RefreshStatistics();
		},
		function (xhr) {
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		}
	);
});

$(document).on('click', '.undo-task-button', function (e) {
	e.preventDefault();

	Grocy.FrontendHelpers.BeginUiBusy();

	var taskId = $(e.currentTarget).attr('data-task-id');
	var taskName = $(e.currentTarget).attr('data-task-name');

	Grocy.Api.Post('tasks/' + taskId + '/undo', {},
		function () {
			window.location.reload();
		},
		function (xhr) {
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		}
	);
});

$(document).on('click', '.delete-task-button', function (e) {
	e.preventDefault();

	var objectName = $(e.currentTarget).attr('data-task-name');
	var objectId = $(e.currentTarget).attr('data-task-id');

	bootbox.confirm({
		message: __t('Are you sure you want to delete task "%s"?', objectName),
		closeButton: false,
		buttons: {
			confirm: {
				label: __t('Yes'),
				className: 'btn-success'
			},
			cancel: {
				label: __t('No'),
				className: 'btn-danger'
			}
		},
		callback: function (result) {
			if (result === true) {
				Grocy.Api.Delete('objects/tasks/' + objectId, {},
					function (result) {
						animateCSS("#task-" + objectId + "-row", "fadeOut", function () {
							$("#task-" + objectId + "-row").remove();
						});
					},
					function (xhr) {
						console.error(xhr);
					}
				);
			}
		}
	});
});

$("#show-done-tasks").change(function () {
	if (this.checked) {
		window.location.href = U('/tasks?include_done');
	}
	else {
		window.location.href = U('/tasks');
	}
});

if (GetUriParam('include_done')) {
	$("#show-done-tasks").prop('checked', true);
}

function RefreshStatistics() {
	Grocy.Api.Get('tasks',
		function (result) {
			var dueTodayCount = 0;
			var dueSoonCount = 0;
			var overdueCount = 0;

			result.forEach(function (task) {
				var status = GetTaskDueStatus(task.due_date);

				if (status === "overdue") {
					overdueCount++;
				}
				else if (status === "duetoday") {
					dueTodayCount++;

					// Keep original Grocy behaviour:
					// today is also included in "due soon"
					dueSoonCount++;
				}
				else if (status === "duesoon") {
					dueSoonCount++;
				}
			});

			$("#overdue-tasks-count").text(overdueCount);
			$("#due-today-tasks-count").text(dueTodayCount);
			$("#due-soon-tasks-count").text(dueSoonCount);
		},
		function (xhr) {
			console.error(xhr);

			$("#overdue-tasks-count").text("-");
			$("#due-today-tasks-count").text("-");
			$("#due-soon-tasks-count").text("-");
		}
	);
}

RefreshStatistics();

// Apply filters (there are maybe some set when a task was just edited)
$("#search").trigger("keyup");
$("#status-filter").trigger("change");
$("#category-filter").trigger("change");
