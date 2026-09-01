<?php

namespace Grocy\Services;

class BatteriesService extends BaseService
{
	public function GetBatteryDetails(int $batteryId)
	{
		if (!$this->BatteryExists($batteryId))
		{
			throw new \Exception('Battery does not exist');
		}

		$battery = $this->DB->batteries($batteryId);
		$batteryChargeCyclesCount = $this->DB->battery_charge_cycles()->where('battery_id = :1 AND undone = 0', $batteryId)->count();
		$batteryLastChargedTime = $this->DB->battery_charge_cycles()->where('battery_id = :1 AND undone = 0', $batteryId)->max('tracked_time');
		$nextChargeTime = $this->DB->batteries_current()->where('battery_id', $batteryId)->min('next_estimated_charge_time');

		return [
			'battery' => $battery,
			'state' => $this->GetBatteryState($battery),
			'last_charged' => $batteryLastChargedTime,
			'charge_cycles_count' => $batteryChargeCyclesCount,
			'next_estimated_charge_time' => $nextChargeTime
		];
	}

	public function GetCurrent()
	{
		$batteries = $this->DB->batteries()->where('active = 1')->orderBy('name', 'COLLATE NOCASE');
		$currentBatteries = $this->DB->batteries_current();
		foreach ($currentBatteries as $currentBattery)
		{
			$currentBattery->battery = FindObjectInArrayByPropertyValue($batteries, 'id', $currentBattery->battery_id);
		}

		return $currentBatteries;
	}

	public function TrackChargeCycle(int $batteryId, string $trackedTime)
	{
		if (!$this->BatteryExists($batteryId))
		{
			throw new \Exception('Battery does not exist');
		}

		$battery = $this->DB->batteries($batteryId);

		if ($battery->rechargeable != 1)
		{
			throw new \Exception('This battery is not rechargeable');
		}

		$logRow = $this->DB->battery_charge_cycles()->createRow([
			'battery_id' => $batteryId,
			'tracked_time' => $trackedTime
		]);
		$logRow->save();

		$battery->update([
			'is_charged' => 1
		]);

		return $this->DB->lastInsertId();
	}

	public function UndoChargeCycle($chargeCycleId)
	{
		$logRow = $this->DB->battery_charge_cycles()->where('id = :1 AND undone = 0', $chargeCycleId)->fetch();

		if ($logRow == null)
		{
			throw new \Exception('Charge cycle does not exist or was already undone');
		}

		// Update log entry
		$logRow->update([
			'undone' => 1,
			'undone_timestamp' => date('Y-m-d H:i:s')
		]);
	}

	public function ReplaceBattery(
		int $batteryId,
		int $replacementBatteryId
	)
	{
		if (!$this->BatteryExists($batteryId))
		{
			throw new \Exception('Battery does not exist');
		}

		if (!$this->BatteryExists($replacementBatteryId))
		{
			throw new \Exception('Replacement battery does not exist');
		}

		if ($batteryId === $replacementBatteryId)
		{
			throw new \Exception('A battery cannot replace itself');
		}

		$currentBattery = $this->DB->batteries()->where('id = :1', $batteryId)->fetch();

		$replacementBattery = $this->DB->batteries()->where('id = :1', $replacementBatteryId)->fetch();

		if (empty($currentBattery->used_in))
		{
			throw new \Exception('The battery is currently not used in a device');
		}

		if (!empty($replacementBattery->used_in))
		{
			throw new \Exception('The replacement battery is already in use');
		}

		if ($replacementBattery->active != 1)
		{
			throw new \Exception('The replacement battery is inactive');
		}

		if (
			$replacementBattery->rechargeable == 1 &&
			$replacementBattery->is_charged != 1
		)
		{
			throw new \Exception('The replacement battery needs to be charged first');
		}

		$usedIn = $currentBattery->used_in;

		$db = DatabaseService::GetInstance()->GetDbConnectionRaw();

		$db->beginTransaction();

		try
		{
			if ($currentBattery->rechargeable == 1)
			{
				$currentBattery->update([
					'used_in' => null,
					'is_charged' => 0
				]);
			}
			else
			{
				$currentBattery->update([
					'used_in' => null,
					'active' => 0
				]);
			}

			$replacementBattery->update([
				'used_in' => $usedIn
			]);

			$db->commit();
		}
		catch (\Throwable $ex)
		{
			if ($db->inTransaction())
    		{
        		$db->rollBack();
    		}

			throw $ex;
		}

		return [
			'replaced_battery_id' => $batteryId,
			'replacement_battery_id' => $replacementBatteryId,
			'used_in' => $usedIn
		];
	}

	private function GetBatteryState($battery)
	{
		if ($battery->active == 0)
		{
			return 'inactive';
		}

		if (!empty($battery->used_in))
		{
			return 'in_use';
		}

		if ($battery->rechargeable == 1 && $battery->is_charged == 0)
		{
			return 'needs_charging';
		}

		return 'ready';
	}

	private function BatteryExists($batteryId)
	{
		$batteryRow = $this->DB->batteries()->where('id = :1', $batteryId)->fetch();
		return $batteryRow !== null;
	}
}
