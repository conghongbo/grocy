@once
@push('componentScripts')
<script src="{{ $U('/viewjs/components/batterycard.js', true) }}?v={{ $version }}"></script>
@endpush
@endonce

@php if(!isset($asModal)) { $asModal = false; } @endphp

@if($asModal)
<div class="modal fade"
	id="batterycard-modal"
	tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content text-center">
			<div class="modal-body">
				@endif

				<div class="card batterycard">
					<div class="card-header">
						<span class="float-left">{{ $__t('Battery overview') }}</span>
						<a id="batterycard-battery-edit-button"
							class="btn btn-sm btn-outline-secondary py-0 float-right disabled"
							href="#"
							data-toggle="tooltip"
							title="{{ $__t('Edit battery') }}">
							<i class="fa-solid fa-edit"></i>
						</a>
						<a id="batterycard-battery-journal-button"
							class="btn btn-sm btn-outline-secondary py-0 mr-1 float-right disabled show-as-dialog-link"
							href="#"
							data-dialog-type="table">
							{{ $__t('Battery journal') }}
						</a>
					</div>
					<div class="card-body battery-card-body">
						<h3 class="mb-4">
							<span id="batterycard-battery-name"></span>
						</h3>
						<div class="battery-info-section">
							<div class="text-muted small">
								{{ $__t('Type') }}
							</div>
							<div class="font-weight-bold">
								<span id="batterycard-battery-type"></span>
							</div>
						</div>
						<div class="battery-info-section">
							<div class="text-muted small">
								{{ $__t('State') }}
							</div>
							<div>
								<span id="batterycard-battery-state"></span>
							</div>
						</div>
						<div class="battery-info-section">
							<div class="text-muted small">
								{{ $__t('Used in') }}
							</div>
							<div class="font-weight-bold">
								<span id="batterycard-battery-used-in"></span><br>
							</div>
						</div>
						<div class="row">
							<div class="col-6">
								<div class="battery-stat-box">
									<div class="d-flex align-items-center mb-1">
										<i class="fa-solid fa-repeat mr-2 text-muted"></i>
										<div class="text-muted small">
											{{ $__t('Charge cycles count') }}
										</div>
									</div>
									<div class="battery-stat-value">
										<span
											id="batterycard-battery-charge-cycles-count"
											class="locale-number locale-number-generic">
										</span>
									</div>
								</div>
							</div>
							<div class="col-6">
								<div class="battery-stat-box">
									<div class="d-flex align-items-center mb-1">
										<i class="fa-solid fa-clock mr-2 text-muted"></i>
										<div class="text-muted small">
											{{ $__t('Last charged') }}
										</div>
									</div>
									<div class="battery-stat-value">
										<span id="batterycard-battery-last-charged"></span>
										<time
											id="batterycard-battery-last-charged-timeago"
											class="timeago timeago-contextual">
										</time>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				@if($asModal)
			</div>
			<div class="modal-footer">
				<button type="button"
					class="btn btn-secondary"
					data-dismiss="modal">{{ $__t('Close') }}</button>
			</div>
		</div>
	</div>
</div>
@endif

<style>
	.battery-stat-box {
		padding: 12px;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		background-color: #f8f9fa;
		height: 100%;
	}
	.battery-stat-value {
		font-weight: 600;
		font-size: 14px;
	}
	.battery-card-body {
		padding: 18px;
	}
	.battery-card-body h3 {
		margin-bottom: 18px;
	}
	.battery-info-section {
		margin-bottom: 14px;
	}
	.battery-info-section .text-muted {
		margin-bottom: 4px;
	}
	.battery-stat-box {
		padding: 12px;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		background-color: #f8f9fa;
		height: 100%;
	}
	.battery-stat-value {
		margin-top: 4px;
		font-weight: 600;
		font-size: 14px;
	}
</style>
