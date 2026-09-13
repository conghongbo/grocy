Grocy.Components.BatteryCard = {};

Grocy.Components.BatteryCard.Refresh = function (batteryId) {
	Grocy.Api.Get('batteries/' + batteryId,
		function (batteryDetails) {
			$('#batterycard-battery-name').text(batteryDetails.battery.name);

			if (batteryDetails.battery.rechargeable == 1) {
				$('#batterycard-battery-type').html(
					'<span class="badge badge-info px-2 py-1">' +
					'<i class="fa-solid fa-rotate mr-1"></i>' +
					__t('Rechargeable') +
					'</span>'
				);
			}
			else {
				$('#batterycard-battery-type').html(
					'<span class="badge badge-light border px-2 py-1">' +
					'<i class="fa-solid fa-battery-full mr-1"></i>' +
					__t('Single-use') +
					'</span>'
				);
			}

			var batteryState = $('#batterycard-battery-state');
			if (batteryDetails.state === 'in_use') {
				batteryState.html(
					'<span class="badge badge-primary px-2 py-1">' +
					'<i class="fa-solid fa-plug mr-1"></i>' +
					__t('In use') +
					'</span>'
				);
			}
			else if (batteryDetails.state === 'needs_charging') {
				batteryState.html(
					'<span class="badge badge-warning px-2 py-1">' +
					'<i class="fa-solid fa-bolt mr-1"></i>' +
					__t('Needs charging') +
					'</span>'
				);
			}
			else if (batteryDetails.state === 'inactive') {
				batteryState.html(
					'<span class="badge badge-secondary px-2 py-1">' +
					'<i class="fa-solid fa-circle-minus mr-1"></i>' +
					__t('Inactive') +
					'</span>'
				);
			}
			else {
				batteryState.html(
					'<span class="badge badge-success px-2 py-1">' +
					'<i class="fa-solid fa-circle-check mr-1"></i>' +
					__t('Ready') +
					'</span>'
				);
			}

			$('#batterycard-battery-used-in').text(batteryDetails.battery.used_in || '-');
			$('#batterycard-battery-last-charged').text((batteryDetails.last_charged || __t('never')));
			$('#batterycard-battery-last-charged-timeago').attr("datetime", batteryDetails.last_charged || '');
			$('#batterycard-battery-charge-cycles-count').text((batteryDetails.charge_cycles_count || '0'));

			$('#batterycard-battery-edit-button').attr("href", U("/battery/" + batteryDetails.battery.id.toString()));
			$('#batterycard-battery-journal-button').attr("href", U("/batteriesjournal?embedded&battery=" + batteryDetails.battery.id.toString()));
			$('#batterycard-battery-edit-button').removeClass("disabled");
			$('#batterycard-battery-journal-button').removeClass("disabled");

			RefreshContextualTimeago(".batterycard");
		},
		function (xhr) {
			console.error(xhr);
		}
	);
};

$(document).on("click", ".batterycard-trigger", function (e) {
	Grocy.Components.BatteryCard.Refresh($(e.currentTarget).attr("data-battery-id"));
	$("#batterycard-modal").modal("show");
});
