function TrackChargeCycle(batteryId, trackedTime, onSuccess) {
	Grocy.Api.Post(
		'batteries/' + batteryId + '/charge',
		{
			tracked_time: trackedTime
		},
		onSuccess,
		function (xhr) {
			Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
			console.error(xhr);
		}
	);
}

function ReplaceBattery(batteryId, replacementBatteryId, onSuccess) {
	Grocy.Api.Post(
		'batteries/' + batteryId + '/replace',
		{
			replacement_battery_id: parseInt(replacementBatteryId)
		},
		onSuccess,
		function (xhr) {
			Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
			console.error(xhr);
		}
	);
}

function FinishBatteryReplacement(batteryId, batteryDetails) {
	Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");

	toastr.success(
		__t(
			'Battery %1$s was successfully replaced',
			batteryDetails.battery.name
		)
	);

	Grocy.Components.BatteryCard.Refresh(batteryId);

	ResetBatteryTrackingForm();
}

function FinishChargeCycle(
	batteryId,
	batteryDetails,
	trackedTime,
	result
) {
	Grocy.EditObjectId = result.id;

	Grocy.Components.UserfieldsForm.Save(function () {
		Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");

		toastr.success(
			__t(
				'Tracked charge cycle of battery %1$s on %2$s',
				batteryDetails.battery.name,
				trackedTime
			)
			+ '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoChargeCycle('
			+ result.id
			+ ')"><i class="fa-solid fa-undo"></i> '
			+ __t("Undo")
			+ '</a>'
		);

		Grocy.Components.BatteryCard.Refresh(batteryId);

		ResetBatteryTrackingForm();
	});
}

function ResetBatteryTrackingForm() {
	$('#battery_id').val('');
	$('#battery_id_text_input').val('');
	$('#replacement_battery_id').val('');
	$('#replacement-battery-group').addClass('d-none');

	$('#tracked_time').find('input').val(
		moment().format('YYYY-MM-DD HH:mm:ss')
	);

	$('#battery_id_text_input').trigger('change');
	$('#battery_id_text_input').focus();

	Grocy.FrontendHelpers.ValidateForm(
		'batterytracking-form'
	);
}

$('#save-batterytracking-button').on('click', function (e) {
	e.preventDefault();

	if (!Grocy.FrontendHelpers.ValidateForm("batterytracking-form", true)) {
		return;
	}

	if ($(".combobox-menu-visible").length) {
		return;
	}

	var jsonForm = $('#batterytracking-form').serializeJSON();

	var batteryId = jsonForm.battery_id;
	var replacementBatteryId = jsonForm.replacement_battery_id;
	var trackedTime = $('#tracked_time').find('input').val();

	Grocy.FrontendHelpers.BeginUiBusy("batterytracking-form");

	Grocy.Api.Get(
		'batteries/' + batteryId,
		function (batteryDetails) {
			if (replacementBatteryId) {
				ReplaceBattery(
					batteryId,
					replacementBatteryId,
					function () {
						FinishBatteryReplacement(
							batteryId,
							batteryDetails
						);
					}
				);
			}
			else {
				TrackChargeCycle(
					batteryId,
					trackedTime,
					function (result) {
						Grocy.Api.Get(
							'batteries/' + batteryId,
							function (updatedBatteryDetails) {
								console.log(
									'Updated battery details:',
									updatedBatteryDetails
								);

								FinishChargeCycle(
									batteryId,
									updatedBatteryDetails,
									trackedTime,
									result
								);
							}
						);
					}
				);
			}
		},
		function (xhr) {
			Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
			console.error(xhr);
		}
	);
});

$('#battery_id').on('change', function (e) {
	$("#replacement-preview").addClass("d-none");
	$("#replacement_battery_id").val("");
	updateSubmitButton();

	var input = $('#battery_id_text_input').val().toString();
	$('#battery_id_text_input').val(input);
	$('#battery_id').data('combobox').refresh();

	var batteryId = $(e.target).val();
	if (batteryId) {
		// #2847 - Show replacement battery selector when the
		// selected battery is currently used in a device
		Grocy.Api.Get("batteries/" + batteryId, function (batteryDetails) {
			if (batteryDetails.battery.used_in) {
				$("#replacement-battery-group").removeClass("d-none");
			}
			else {
				$("#replacement-battery-group").addClass("d-none");
				$("#replacement_battery_id").val("");
				$("#replacement-preview").addClass("d-none");
			}
			// The battery itself cannot be selected as replacement
			$("#replacement_battery_id option").prop("disabled", false);
			$("#replacement_battery_id option[value=\"" + batteryId + "\"]").prop("disabled", true);

			var availableReplacementCount =
				$("#replacement_battery_id option").filter(function () {
					return this.value !== "" && !this.disabled;
				}).length;

			if (availableReplacementCount === 0) {
				$("#replacement-battery-empty-message").removeClass("d-none");
				$("#replacement_battery_id").prop("disabled", true);
				$("#replacement-battery-hint").addClass("d-none");
			}
			else {
				$("#replacement-battery-empty-message").addClass("d-none");
				$("#replacement_battery_id").prop("disabled", false);
				$("#replacement-battery-hint").removeClass("d-none");
			}
		});

		Grocy.Components.BatteryCard.Refresh(batteryId);

		setTimeout(function () {
			$('#tracked_time').find('input').focus();
		}, Grocy.FormFocusDelay);

		Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
	}
	else {
		// No battery selected -> hide replacement selector
		$("#replacement-battery-group").addClass("d-none");
		$("#replacement_battery_id").val("");
	}
});

$("#replacement_battery_id").on("change", function () {
	updateReplacementPreview();
	updateSubmitButton();
});

$(".combobox").combobox(Object.assign(BootstrapComboboxDefaults, { "clearIfNoMatch": false }));

$('#battery_id').val('');
$('#battery_id_text_input').val('');
$('#battery_id_text_input').trigger('change');
Grocy.Components.DateTimePicker.GetInputElement().trigger('input');
Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
setTimeout(function () {
	$('#battery_id_text_input').focus();
}, Grocy.FormFocusDelay);

$('#batterytracking-form input').keyup(function (event) {
	Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
});

$('#batterytracking-form input').keydown(function (event) {
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Grocy.FrontendHelpers.ValidateForm('batterytracking-form')) {
			return false;
		}
		else {
			$('#save-batterytracking-button').click();
		}
	}
});

$('#tracked_time').find('input').on('keypress', function (e) {
	Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
});

$(document).on("Grocy.BarcodeScanned", function (e, barcode, target) {
	if (!(target == "@batterypicker" || target == "undefined" || target == undefined)) // Default target
	{
		return;
	}

	// Don't know why the blur event does not fire immediately ... this works...
	$("#battery_id_text_input").focusout();
	$("#battery_id_text_input").focus();
	$("#battery_id_text_input").blur();

	$("#battery_id_text_input").val(barcode);

	setTimeout(function () {
		$("#battery_id_text_input").focusout();
		$("#battery_id_text_input").focus();
		$("#battery_id_text_input").blur();
		$('#tracked_time').find('input').focus();
	}, Grocy.FormFocusDelay);
});

function UndoChargeCycle(chargeCycleId) {
	Grocy.Api.Post('batteries/charge-cycles/' + chargeCycleId.toString() + '/undo', {},
		function (result) {
			toastr.success(__t("Charge cycle successfully undone"));
		},
		function (xhr) {
			console.error(xhr);
		}
	);
};

$('#battery_id_text_input').on('blur', function (e) {
	if ($('#battery_id').hasClass("combobox-menu-visible")) {
		return;
	}

	var input = $('#battery_id_text_input').val().toString();
	var possibleOptionElement = [];

	// Grocycode handling
	if (input.startsWith("grcy")) {
		var gc = input.split(":");
		if (gc[1] == "b") {
			possibleOptionElement = $("#battery_id option[value=\"" + gc[2] + "\"]").first();
		}


		if (possibleOptionElement.length > 0) {
			$('#battery_id').val(possibleOptionElement.val());
			$('#battery_id').data('combobox').refresh();
			$('#battery_id').trigger('change');
		}
		else {
			$('#battery_id').val(null);
			$('#battery_id_text_input').val("");
			$('#battery_id').data('combobox').refresh();
			$('#battery_id').trigger('change');
		}
	}
});

$("#tracked_time").find("input").on("focus", function (e) {
	$(this).select();
});

function updateReplacementPreview() {
	var replacementBatteryId = $("#replacement_battery_id").val();
	if (!replacementBatteryId) {
		$("#replacement-preview").addClass("d-none");
		return;
	}
	var currentBatteryName =
		$("#battery_id_text_input").val();
	var replacementBatteryName =
		$("#replacement_battery_id option:selected").text().trim();
	var usedIn =
		$("#batterycard-battery-used-in").text().trim();
	$("#replacement-preview-current").text(currentBatteryName);
	$("#replacement-preview-new").text(replacementBatteryName);
	$("#replacement-preview-used-in").text(
		usedIn && usedIn !== "-"
			? usedIn
			: __t("No device")
	);
	$("#replacement-preview").removeClass("d-none");
}

function updateSubmitButton() {
	var replacementBatteryId = $("#replacement_battery_id").val();

	if (replacementBatteryId) {
		$("#save-batterytracking-button").html(
			'<i class="fa-solid fa-repeat mr-1"></i>' +
			__t("Replace battery")
		);

		$("#replacement-action-hint").removeClass("d-none");
	}
	else {
		$("#save-batterytracking-button").text(__t("OK"));

		$("#replacement-action-hint").addClass("d-none");
	}
}
