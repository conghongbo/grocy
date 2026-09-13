<?php

namespace Grocy\Services;

final class IcalChoreDescriptionService
{
	const STATUS_DUE_TODAY = 'due-today';
	const STATUS_OVERDUE = 'overdue';
	const STATUS_UPCOMING = 'upcoming';

	public static function GetStatus(string $nextDueDate, ?\DateTimeImmutable $now = null): string
	{
		$now = $now ?? new \DateTimeImmutable();
		$nextDue = new \DateTimeImmutable($nextDueDate, $now->getTimezone());

		if ($nextDue < $now)
		{
			return self::STATUS_OVERDUE;
		}

		if ($nextDue->format('Y-m-d') === $now->format('Y-m-d'))
		{
			return self::STATUS_DUE_TODAY;
		}

		return self::STATUS_UPCOMING;
	}

	public static function BuildDescription(array $event, array $labels, array $actionLinks, ?\DateTimeImmutable $now = null): string
	{
		$statusLabels = [
			self::STATUS_DUE_TODAY => $labels[self::STATUS_DUE_TODAY],
			self::STATUS_OVERDUE => $labels[self::STATUS_OVERDUE],
			self::STATUS_UPCOMING => $labels[self::STATUS_UPCOMING]
		];
		$status = self::GetStatus($event['start'], $now);
		$dateFormat = !empty($event['allDay']) ? 'Y-m-d' : 'Y-m-d H:i:s';

		$details = [
			$labels['status'] . ': ' . $statusLabels[$status],
			$labels['next-due-date'] . ': ' . (new \DateTimeImmutable($event['start']))->format($dateFormat),
			$labels['last-tracked'] . ': ' . (empty($event['last_tracked_time'])
				? $labels['never']
				: (new \DateTimeImmutable($event['last_tracked_time']))->format($dateFormat))
		];

		$sections = [implode(PHP_EOL, $details)];
		if (!empty($event['description']))
		{
			$sections[] = $event['description'];
		}
		$sections[] = implode(PHP_EOL, $actionLinks);

		return implode(PHP_EOL . PHP_EOL, $sections);
	}
}
