<?php

require_once __DIR__ . '/../services/IcalChoreDescriptionService.php';

use Grocy\Services\IcalChoreDescriptionService;

$labels = [
	'status' => 'Status',
	IcalChoreDescriptionService::STATUS_DUE_TODAY => 'Due today',
	IcalChoreDescriptionService::STATUS_OVERDUE => 'Overdue',
	IcalChoreDescriptionService::STATUS_UPCOMING => 'Upcoming',
	'next-due-date' => 'Next due date',
	'last-tracked' => 'Last tracked',
	'never' => 'Never'
];
$actions = [
	'Mark as done: https://example.test/done',
	'Skip this iteration: https://example.test/skip'
];
$now = new DateTimeImmutable('2026-09-13 12:00:00');

function assertSameValue($expected, $actual, string $message): void
{
	if ($expected !== $actual)
	{
		fwrite(STDERR, $message . PHP_EOL . 'Expected: ' . var_export($expected, true) . PHP_EOL . 'Actual: ' . var_export($actual, true) . PHP_EOL);
		exit(1);
	}
}

function assertContainsText(string $needle, string $haystack, string $message): void
{
	if (strpos($haystack, $needle) === false)
	{
		fwrite(STDERR, $message . PHP_EOL . 'Missing: ' . $needle . PHP_EOL);
		exit(1);
	}
}

assertSameValue(IcalChoreDescriptionService::STATUS_OVERDUE, IcalChoreDescriptionService::GetStatus('2026-09-13 11:59:59', $now), 'Past chores must be overdue');
assertSameValue(IcalChoreDescriptionService::STATUS_DUE_TODAY, IcalChoreDescriptionService::GetStatus('2026-09-13 18:00:00', $now), 'Later chores on the current day must be due today');
assertSameValue(IcalChoreDescriptionService::STATUS_UPCOMING, IcalChoreDescriptionService::GetStatus('2026-09-14 09:00:00', $now), 'Future chores must be upcoming');

$description = IcalChoreDescriptionService::BuildDescription([
	'start' => '2026-09-14 09:00:00',
	'allDay' => false,
	'last_tracked_time' => '2026-09-07 08:30:00',
	'description' => 'Clean all shelves'
], $labels, $actions, $now);

assertContainsText('Status: Upcoming' . PHP_EOL . 'Next due date: 2026-09-14 09:00:00' . PHP_EOL . 'Last tracked: 2026-09-07 08:30:00', $description, 'The status and recurring chore dates must be grouped first');
assertContainsText(PHP_EOL . PHP_EOL . 'Clean all shelves' . PHP_EOL . PHP_EOL . 'Mark as done: https://example.test/done' . PHP_EOL . 'Skip this iteration: https://example.test/skip', $description, 'The chore details and both action links must remain available in separate sections');

$completedOccurrence = IcalChoreDescriptionService::BuildDescription([
	'start' => '2026-09-20 09:00:00',
	'allDay' => true,
	'last_tracked_time' => '2026-09-13 12:00:00',
	'description' => ''
], $labels, $actions, $now);

assertContainsText('Status: Upcoming', $completedOccurrence, 'After completion, the recurring event status must be recalculated for its next occurrence');
assertContainsText('Next due date: 2026-09-20', $completedOccurrence, 'After completion, the recurring event must show its newly calculated next date');
assertContainsText('Last tracked: 2026-09-13', $completedOccurrence, 'After completion, the latest tracking date must be shown');

$notTracked = IcalChoreDescriptionService::BuildDescription([
	'start' => '2026-09-13 23:59:59',
	'allDay' => true,
	'last_tracked_time' => null,
	'description' => ''
], $labels, $actions, $now);

assertContainsText('Status: Due today', $notTracked, 'All-day chores must use the due-today status until the end of the day');
assertContainsText('Last tracked: Never', $notTracked, 'Never-tracked chores must have a clear fallback');

echo "All iCal chore description tests passed" . PHP_EOL;
