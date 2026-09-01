<?php

namespace Grocy\Controllers\Api;

use Eluceo\iCal\Domain\Entity\Calendar;
use Eluceo\iCal\Domain\Entity\Event;
use Eluceo\iCal\Domain\Entity\TimeZone;
use Eluceo\iCal\Domain\ValueObject\Date;
use Eluceo\iCal\Domain\ValueObject\DateTime;
use Eluceo\iCal\Domain\ValueObject\SingleDay;
use Eluceo\iCal\Domain\ValueObject\TimeSpan;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use Grocy\Controllers\Users\User;
use Grocy\Services\ApiKeyService;
use Grocy\Services\CalendarService;
use Grocy\Services\ChoresService;
use Grocy\Services\LocalizationService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CalendarApiController extends BaseApiController
{
	public function Ical(Request $request, Response $response, array $args)
	{
		try
		{
			$events = CalendarService::GetInstance()->GetEvents();
			$minDate = null;
			$maxDate = null;

			$vCalendar = new Calendar();
			$vCalendar->setProductIdentifier('Grocy');

			foreach ($events as $event)
			{
				if (!isset($event['start']) || empty($event['start']))
				{
					continue;
				}

				$description = '';
				if (isset($event['description']))
				{
					$description = $event['description'];
				}
				if (isset($event['type']) && $event['type'] === 'chore')
				{
					$description = $this->AppendIcalChoreActionLinks($description, $event['chore_id']);
				}

				if ($event['date_format'] === 'date' || (isset($event['allDay']) && $event['allDay']))
				{
					// All-day event
					$date = new Date(\DateTimeImmutable::createFromFormat('Y-m-d', substr($event['start'], 0, 10)));
					$vEventOccurrence = new SingleDay($date);

					$compareDate = \DateTimeImmutable::createFromFormat('Y-m-d', substr($event['start'], 0, 10));
				}
				else
				{
					// Time-point event
					$start = new DateTime(\DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $event['start']), true);
					$end = new DateTime(\DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $event['start']), true);
					$vEventOccurrence = new TimeSpan($start, $end);

					$compareDate = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $event['start']);
				}

				$vEvent = new Event();
				$vEvent->setOccurrence($vEventOccurrence)
					->setSummary($event['title'])
					->setDescription($description);

				$vCalendar->addEvent($vEvent);

				if ($minDate == null || $compareDate < $minDate)
				{
					$minDate = $compareDate;
				}
				if ($maxDate == null || $compareDate > $maxDate)
				{
					$maxDate = $compareDate;
				}
			}

			if ($minDate != null && $maxDate != null)
			{
				$vCalendar->addTimeZone(TimeZone::createFromPhpDateTimeZone(new \DateTimeZone(date_default_timezone_get()), $minDate, $maxDate));
			}

			$response->write((new CalendarFactory())->createCalendar($vCalendar));
			$response = $response->withHeader('Content-Type', 'text/calendar; charset=utf-8');
			return $response->withHeader('Content-Disposition', 'attachment; filename="Grocy.ics"');
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function IcalSharingLink(Request $request, Response $response, array $args)
	{
		try
		{
			return $this->ApiResponse($response, [
				'url' => $this->AppContainer->get('UrlManager')->ConstructUrl('/api/calendar/ical?secret=' . ApiKeyService::GetInstance()->GetOrCreateApiKey(ApiKeyService::API_KEY_TYPE_SPECIAL_PURPOSE_CALENDAR_ICAL))
			]);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function IcalChoreMarkAsDone(Request $request, Response $response, array $args)
	{
		return $this->TrackChoreFromIcal($request, $response, $args, false);
	}

	public function IcalChoreSkip(Request $request, Response $response, array $args)
	{
		return $this->TrackChoreFromIcal($request, $response, $args, true);
	}

	private function TrackChoreFromIcal(Request $request, Response $response, array $args, bool $skipped)
	{
		try
		{
			User::CheckPermission($request, User::PERMISSION_CHORE_TRACK_EXECUTION);

			$choreExecutionId = ChoresService::GetInstance()->TrackChore($args['choreId'], date('Y-m-d H:i:s'), GROCY_USER_ID, $skipped);
			return $this->ApiResponse($response, $this->DB->chores_log($choreExecutionId));
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	private function AppendIcalChoreActionLinks(string $description, int $choreId)
	{
		$iCalApiKey = ApiKeyService::GetInstance()->GetOrCreateApiKey(ApiKeyService::API_KEY_TYPE_SPECIAL_PURPOSE_CALENDAR_ICAL);
		$urlManager = $this->AppContainer->get('UrlManager');

		$actionLinks = [
			LocalizationService::GetInstance()->__t('Mark as done') . ': ' . $urlManager->ConstructUrl('/api/calendar/ical/chores/' . $choreId . '/mark-as-done?secret=' . $iCalApiKey),
			LocalizationService::GetInstance()->__t('Skip this iteration') . ': ' . $urlManager->ConstructUrl('/api/calendar/ical/chores/' . $choreId . '/skip?secret=' . $iCalApiKey)
		];

		if (!empty($description))
		{
			$description .= PHP_EOL . PHP_EOL;
		}

		return $description . implode(PHP_EOL, $actionLinks);
	}
}
