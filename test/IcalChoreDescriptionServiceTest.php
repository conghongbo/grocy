<?php

require_once __DIR__ . '/../services/IcalChoreDescriptionService.php';
require_once __DIR__ . '/../packages/autoload.php';

use Eluceo\iCal\Domain\Entity\Calendar;
use Eluceo\iCal\Domain\Entity\Event;
use Eluceo\iCal\Domain\ValueObject\Date;
use Eluceo\iCal\Domain\ValueObject\SingleDay;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use Grocy\Services\IcalChoreDescriptionService;

$labels = [
	'status' => 'Status',
	IcalChoreDescriptionService::STATUS_DUE_TODAY => 'Due today',
	IcalChoreDescriptionService::STATUS_NOT_SCHEDULED => 'Not scheduled',
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

function assertNotContainsText(string $needle, string $haystack, string $message): void
{
	if (strpos($haystack, $needle) !== false)
	{
		fwrite(STDERR, $message . PHP_EOL . 'Unexpected: ' . $needle . PHP_EOL);
		exit(1);
	}
}

function assertOccurrenceCount(int $expected, string $needle, string $haystack, string $message): void
{
	assertSameValue($expected, substr_count($haystack, $needle), $message);
}

assertSameValue(IcalChoreDescriptionService::STATUS_OVERDUE, IcalChoreDescriptionService::GetStatus('2026-09-13 11:59:59', $now), 'Past chores must be overdue');
assertSameValue(IcalChoreDescriptionService::STATUS_DUE_TODAY, IcalChoreDescriptionService::GetStatus('2026-09-13 18:00:00', $now), 'Later chores on the current day must be due today');
assertSameValue(IcalChoreDescriptionService::STATUS_DUE_TODAY, IcalChoreDescriptionService::GetStatus('2026-09-13 00:00:00', $now, true), 'All-day chores must remain due today for the whole day');
assertSameValue(IcalChoreDescriptionService::STATUS_UPCOMING, IcalChoreDescriptionService::GetStatus('2026-09-14 09:00:00', $now), 'Future chores must be upcoming');
assertSameValue(IcalChoreDescriptionService::STATUS_NOT_SCHEDULED, IcalChoreDescriptionService::GetStatus(null, $now), 'Chores without a next due date must be reported as not scheduled');
assertSameValue(IcalChoreDescriptionService::STATUS_NOT_SCHEDULED, IcalChoreDescriptionService::GetStatus('', $now), 'Blank next due dates must be reported as not scheduled');

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
assertNotContainsText('Status: Overdue', $completedOccurrence, 'A completed recurring occurrence must not retain its previous overdue status');
assertOccurrenceCount(1, 'Status: ', $completedOccurrence, 'Exactly one status must be displayed for a recurring chore');

$notTracked = IcalChoreDescriptionService::BuildDescription([
	'start' => '2026-09-13 23:59:59',
	'allDay' => true,
	'last_tracked_time' => null,
	'description' => ''
], $labels, $actions, $now);

assertContainsText('Status: Due today', $notTracked, 'All-day chores must use the due-today status until the end of the day');
assertContainsText('Last tracked: Never', $notTracked, 'Never-tracked chores must have a clear fallback');

$notScheduled = IcalChoreDescriptionService::BuildDescription([
	'allDay' => true,
	'last_tracked_time' => null,
	'description' => ''
], $labels, $actions, $now);

assertContainsText('Status: Not scheduled', $notScheduled, 'Missing next due dates must have a clear status');
assertContainsText('Next due date: Never', $notScheduled, 'Missing next due dates must have a clear fallback');
assertOccurrenceCount(1, 'Status: ', $notScheduled, 'An unscheduled chore must have exactly one status');

$specialCharacters = IcalChoreDescriptionService::BuildDescription([
	'start' => '2026-09-14 09:00:00',
	'allDay' => false,
	'last_tracked_time' => null,
	'description' => "Kitchen, bathroom; floor\\shelves\r\nSecond line\rThird line"
], $labels, $actions, $now);

assertContainsText("Kitchen, bathroom; floor\\shelves\nSecond line\nThird line", $specialCharacters, 'Punctuation and special characters must be preserved while line endings are normalized');
assertNotContainsText("floor\\shelves\r", $specialCharacters, 'Raw carriage returns from the chore description must be normalized');
assertOccurrenceCount(1, 'Mark as done: https://example.test/done', $specialCharacters, 'The Mark as done action link must remain present exactly once');
assertOccurrenceCount(1, 'Skip this iteration: https://example.test/skip', $specialCharacters, 'The Skip this iteration action link must remain present exactly once');

$vEvent = new Event();
$vEvent->setOccurrence(new SingleDay(new Date(new DateTimeImmutable('2026-09-14'))))
	->setSummary("Chore due: Kitchen, bathroom; floor\nBasement")
	->setDescription($specialCharacters);
$serializedCalendar = (string)(new CalendarFactory())->createCalendar(new Calendar([$vEvent]));
$unfoldedCalendar = str_replace("\r\n ", '', $serializedCalendar);

assertContainsText('SUMMARY:Chore due: Kitchen\\, bathroom\\; floor\\nBasement', $unfoldedCalendar, 'Special characters in chore names must be escaped in the serialized iCal summary');
assertContainsText('Kitchen\\, bathroom\\; floor\\\\shelves\\nSecond line\\nThird line', $unfoldedCalendar, 'Special characters and line breaks in chore descriptions must be escaped in serialized iCal output');
assertContainsText('Mark as done: https://example.test/done', $unfoldedCalendar, 'The serialized iCal description must contain the Mark as done URL');
assertContainsText('Skip this iteration: https://example.test/skip', $unfoldedCalendar, 'The serialized iCal description must contain the Skip this iteration URL');

echo "All iCal chore description tests passed" . PHP_EOL;
