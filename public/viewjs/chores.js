var choresTable = $('#chores-table').DataTable({
	'order': [[1, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#chores-table tbody').removeClass("d-none");
choresTable.columns.adjust().draw();

$("#search").on("keyup", Delay(function () {
	var value = $(this).val();
	if (value === "all") {
		value = "";
	}

	choresTable.search(value).draw();
}, Grocy.FormFocusDelay));

$("#clear-filter-button").on("click", function () {
	$("#search").val("");

	// Reset to the default active chores view
	if (GetUriParam('include_disabled')) {
		window.location.href = U('/chores');
		return;
	}

	$("#status-filter").val("active");
	choresTable.search("").draw();
	choresTable.column(2).search("").draw();

	$(".chore-management-summary-card").removeClass("active");
	$('.chore-management-summary-card[data-chore-status="active"]').addClass("active");
});

$(document).on('click', '.chore-delete-button', function (e) {
	var objectName = $(e.currentTarget).attr('data-chore-name');
	var objectId = $(e.currentTarget).attr('data-chore-id');

	bootbox.confirm({
		message: __t('Are you sure you want to delete chore "%s"?', objectName),
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
				Grocy.Api.Delete('objects/chores/' + objectId, {},
					function (result) {
						window.location.href = U('/chores');
					},
					function (xhr) {
						console.error(xhr);
					}
				);
			}
		}
	});
});

$("#status-filter").on("change", function () {
	var status = $(this).val();

	if (status === "active") {
		if (GetUriParam('include_disabled')) {
			window.location.href = U('/chores?include_disabled&status=active');
			return;
		}

		choresTable.column(2).search("").draw();
	}
	else if (status === "all") {
		// Disabled chores need to be loaded from the server first
		if (!GetUriParam('include_disabled')) {
			window.location.href = U('/chores?include_disabled&status=all');
			return;
		}

		choresTable.column(2).search("").draw();
	}
	else if (status === "disabled") {
		// Disabled chores need to be loaded from the server first
		if (!GetUriParam('include_disabled')) {
			window.location.href = U('/chores?include_disabled&status=disabled');
			return;
		}

		choresTable.column(2).search("^disabled$", true, false).draw();
	}
});

// Restore filter state after page navigation
if (GetUriParam('include_disabled')) {
	var initialStatus = GetUriParam('status');

	if (initialStatus === "disabled") {
		$("#status-filter").val("disabled");
		choresTable.column(2).search("^disabled$", true, false).draw();

		$('.chore-management-summary-card[data-chore-status="disabled"]')
			.addClass("active");
	}
	else if (initialStatus === "all") {
		$("#status-filter").val("all");
		choresTable.column(2).search("").draw();

		$('.chore-management-summary-card[data-chore-status="all"]')
			.addClass("active");
	}
	else {
		$("#status-filter").val("active");
		choresTable.column(2).search("^active$", true, false).draw();

		$('.chore-management-summary-card[data-chore-status="active"]')
			.addClass("active");
	}
}
else {
	// Default page: Active chores are shown,
	// but no summary card is selected
	$("#status-filter").val("active");
}

$(".merge-chores-button").on("click", function (e) {
	var choreId = $(e.currentTarget).attr("data-chore-id");
	$("#merge-chores-keep").val(choreId);
	$("#merge-chores-remove").val("");
	$("#merge-chores-modal").modal("show");
});

$("#merge-chores-save-button").on("click", function (e) {
	e.preventDefault();

	if (!Grocy.FrontendHelpers.ValidateForm("merge-chores-form", true)) {
		return;
	}

	var choreIdToKeep = $("#merge-chores-keep").val();
	var choreIdToRemove = $("#merge-chores-remove").val();

	Grocy.Api.Post("chores/" + choreIdToKeep.toString() + "/merge/" + choreIdToRemove.toString(), {},
		function (result) {
			window.location.href = U('/chores');
		},
		function (xhr) {
			Grocy.FrontendHelpers.ShowGenericError('Error while merging', xhr.response);
		}
	);
});

$(".chore-management-summary-card").on("click", function () {
	var status = $(this).data("chore-status");

	// Update selected card
	$(".chore-management-summary-card").removeClass("active");
	$(this).addClass("active");

	// Apply the corresponding status filter
	$("#status-filter").val(status).trigger("change");
});

$("#status-filter").on("change", function () {
	var status = $(this).val();

	if (status === "active") {
		if (GetUriParam('include_disabled')) {
			window.location.href = U('/chores?include_disabled&status=active');
			return;
		}

		choresTable.column(2).search("").draw();
	}
	else if (status === "all") {
		if (!GetUriParam('include_disabled')) {
			window.location.href = U('/chores?include_disabled&status=all');
			return;
		}

		choresTable.column(2).search("").draw();
	}
	else if (status === "disabled") {
		if (!GetUriParam('include_disabled')) {
			window.location.href = U('/chores?include_disabled&status=disabled');
			return;
		}

		choresTable.column(2)
			.search("^disabled$", true, false)
			.draw();
	}
});
