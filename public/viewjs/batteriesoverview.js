var batteriesOverviewTable = $('#batteries-overview-table').DataTable({
	'order': [[4, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 },
		{ "type": "html", "targets": 3 },
		{ "type": "html", "targets": 4 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#batteries-overview-table tbody').removeClass("d-none");
batteriesOverviewTable.columns.adjust().draw();

$("#search").on("keyup", Delay(function () {
	var value = $(this).val();
	if (value === "all") {
		value = "";
	}

	batteriesOverviewTable.search(value).draw();
}, Grocy.FormFocusDelay));

$("#clear-filter-button").on("click", function () {
	$("#search").val("");
	$("#status-filter").val("all");

	batteriesOverviewTable.column(batteriesOverviewTable.colReorder.transpose(3)).search("");
	$(".battery-summary-card").removeClass("border-primary");

	batteriesOverviewTable.column(batteriesOverviewTable.colReorder.transpose(5)).search("").draw();
	batteriesOverviewTable.search("").draw();
});

$("#status-filter").on("change", function () {
	var value = $(this).val();
	if (value === "all") {
		value = "";
	}

	// Transfer CSS classes of selected element to dropdown element (for background)
	$(this).attr("class", $("#" + $(this).attr("id") + " option[value='" + value + "']").attr("class") + " form-control");

	batteriesOverviewTable.column(batteriesOverviewTable.colReorder.transpose(5)).search(value).draw();
});

$(".status-filter-message").on("click", function () {
	var value = $(this).data("status-filter");
	$("#status-filter").val(value);
	$("#status-filter").trigger("change");
});

$(".battery-summary-card").on("click", function () {
	var state = $(this).data("battery-state");

	$(".battery-summary-card").removeClass("border-primary");
	$(this).addClass("border-primary");

	var stateColumn = batteriesOverviewTable.column(
		batteriesOverviewTable.colReorder.transpose(3)
	);

	if (state === "all") {
		stateColumn.search("").draw();
	}
	else if (state === "ready") {
		stateColumn.search(__t("Ready")).draw();
	}
	else if (state === "in_use") {
		stateColumn.search(__t("In use")).draw();
	}
	else if (state === "needs_charging") {
		stateColumn.search(__t("Needs charging")).draw();
	}
});

$(document).on('click', '.track-charge-cycle-button', function (e) {
	e.preventDefault();

	Grocy.FrontendHelpers.BeginUiBusy();

	var batteryId = $(e.currentTarget).attr('data-battery-id');
	var batteryName = $(e.currentTarget).attr('data-battery-name');
	var trackedTime = moment().format('YYYY-MM-DD HH:mm:ss');

	Grocy.Api.Post('batteries/' + batteryId + '/charge', { 'tracked_time': trackedTime },
		function () {
			Grocy.Api.Get('batteries/' + batteryId,
				function (result) {
					var batteryRow = $('#battery-' + batteryId + '-row');

					var batteryState = $('#battery-' + batteryId + '-state');

					batteryState
						.removeClass(
							'badge-primary badge-warning badge-success badge-secondary'
						);

					if (result.state === 'in_use') {
						batteryState
							.addClass('badge-primary')
							.html(
								'<i class="fa-solid fa-plug mr-1"></i>' +
								__t('In use')
							);
					}
					else if (result.state === 'needs_charging') {
						batteryState
							.addClass('badge-warning')
							.html(
								'<i class="fa-solid fa-bolt mr-1"></i>' +
								__t('Needs charging')
							);
					}
					else if (result.state === 'inactive') {
						batteryState
							.addClass('badge-secondary')
							.html(
								'<i class="fa-solid fa-circle-minus mr-1"></i>' +
								__t('Inactive')
							);
					}
					else {
						batteryState
							.addClass('badge-success')
							.html(
								'<i class="fa-solid fa-circle-check mr-1"></i>' +
								__t('Ready')
							);
					}

					updateBatterySummary();

					var nextXDaysThreshold = moment().add($("#info-due-soon-batteries").data("next-x-days"), "days");
					var now = moment();
					var nextExecutionTime = moment(result.next_estimated_charge_time);

					batteryRow.removeClass("table-warning");
					batteryRow.removeClass("table-danger");
					if (nextExecutionTime.isBefore(now)) {
						batteryRow.addClass("table-danger");
					}
					else if (nextExecutionTime.isBefore(nextXDaysThreshold)) {
						batteryRow.addClass("table-warning");
					}

					animateCSS("#battery-" + batteryId + "-row td:not(:first)", "flash");

					$('#battery-' + batteryId + '-last-tracked-time').text(trackedTime);
					$('#battery-' + batteryId + '-last-tracked-time-timeago').attr('datetime', trackedTime);
					if (result.battery.charge_interval_days != 0) {
						$('#battery-' + batteryId + '-next-charge-time').text(result.next_estimated_charge_time);
						$('#battery-' + batteryId + '-next-charge-time-timeago').attr('datetime', result.next_estimated_charge_time);
					}

					Grocy.FrontendHelpers.EndUiBusy();
					toastr.success(__t('Tracked charge cycle of battery %1$s on %2$s', batteryName, trackedTime));
					RefreshContextualTimeago("#battery-" + batteryId + "-row");
					RefreshStatistics();
				},
				function (xhr) {
					Grocy.FrontendHelpers.EndUiBusy();
					console.error(xhr);
				}
			);
		},
		function (xhr) {
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		}
	);
});

$(document).on('click', '.battery-grocycode-label-print', function (e) {
	e.preventDefault();

	var batteryId = $(e.currentTarget).attr('data-battery-id');
	Grocy.Api.Get('batteries/' + batteryId + '/printlabel', function (labelData) {
		if (Grocy.Webhooks.labelprinter !== undefined) {
			Grocy.FrontendHelpers.RunWebhook(Grocy.Webhooks.labelprinter, labelData);
		}
	});
});

function RefreshStatistics() {
	var nextXDays = $("#info-due-soon-batteries").data("next-x-days");
	Grocy.Api.Get('batteries',
		function (result) {
			var dueTodayCount = 0;
			var dueSoonCount = 0;
			var overdueCount = 0;
			var overdueThreshold = moment();
			var nextXDaysThreshold = moment().add(nextXDays, "days");
			var todayThreshold = moment().endOf("day");

			result.forEach(element => {
				var date = moment(element.next_estimated_charge_time);

				if (date.isBefore(overdueThreshold)) {
					overdueCount++;
				}
				else if (date.isSameOrBefore(todayThreshold)) {
					dueTodayCount++;
					dueSoonCount++;
				}
				else if (date.isSameOrBefore(nextXDaysThreshold)) {
					dueSoonCount++;
				}
			});

			$("#info-due-today-batteries").html('<span class="d-block d-md-none">' + dueTodayCount + ' <i class="fa-solid fa-clock"></i></span><span class="d-none d-md-block">' + __n(dueTodayCount, '%s battery is due to be charged today', '%s batteries are due to be charged today'));
			$("#info-due-soon-batteries").html('<span class="d-block d-md-none">' + dueSoonCount + ' <i class="fa-solid fa-clock"></i></span><span class="d-none d-md-block">' + __n(dueSoonCount, '%s battery is due to be charged', '%s batteries are due to be charged') + ' ' + __n(nextXDays, 'within the next day', 'within the next %s days'));
			$("#info-overdue-batteries").html('<span class="d-block d-md-none">' + overdueCount + ' <i class="fa-solid fa-times-circle"></i></span><span class="d-none d-md-block">' + __n(overdueCount, '%s battery is overdue to be charged', '%s batteries are overdue to be charged'));
		},
		function (xhr) {
			console.error(xhr);
		}
	);
}

RefreshStatistics();

function updateBatterySummary() {
	var total = 0;
	var ready = 0;
	var inUse = 0;
	var needsCharging = 0;

	$("#batteries-overview-table tbody tr").each(function () {
		var stateBadge = $(this).find("[id$='-state']");

		if (stateBadge.length === 0) {
			return;
		}

		total++;

		var stateText = stateBadge.text().trim();

		if (stateText === __t("Ready")) {
			ready++;
		}
		else if (stateText === __t("In use")) {
			inUse++;
		}
		else if (stateText === __t("Needs charging")) {
			needsCharging++;
		}
	});

	$("#battery-summary-total").text(total);
	$("#battery-summary-ready").text(ready);
	$("#battery-summary-in-use").text(inUse);
	$("#battery-summary-needs-charging").text(needsCharging);
}
