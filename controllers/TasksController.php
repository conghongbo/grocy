<?php

namespace Grocy\Controllers;

use Grocy\Services\TasksService;
use Grocy\Services\UserfieldsService;
use Grocy\Services\UsersService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TasksController extends BaseController
{
	private function RenderTasksPage($response, $viewName, $data = [])
	{
		$assets = \Grocy\Helpers\ReactAssets::Load(__DIR__ . '/../public/react');
		$enabled = defined('GROCY_REACT_TASKS') && GROCY_REACT_TASKS;
		if (!$enabled || $assets === null || isset($_GET['legacy']) || $viewName === 'taskssettings')
		{
			return $this->RenderPage($response, $viewName, $data);
		}
		$url = $this->AppContainer->get('UrlManager');
		$permissions = [];
		foreach (['TASKS', 'TASKS_MARK_COMPLETED', 'TASKS_UNDO_EXECUTION', 'MASTER_DATA_EDIT'] as $permission)
		{
			$permissions[$permission] = \Grocy\Controllers\Users\User::HasPermissions($permission);
		}
		$bootstrap = [
			'page' => $viewName,
			'apiBase' => $url->ConstructUrl('/api'),
			'routeBase' => rtrim($url->ConstructUrl('/'), '/'),
			'resourceBase' => rtrim($url->ConstructUrl('/', true), '/'),
			'userId' => GROCY_USER_ID,
			'users' => UsersService::GetInstance()->GetUsersAsDto(),
			'featureFlags' => ['tasks' => GROCY_FEATURE_FLAG_TASKS],
			'permissions' => $permissions,
			'settings' => UsersService::GetInstance()->GetUserSettings(GROCY_USER_ID),
			'locale' => GROCY_LOCALE,
			'currency' => GROCY_CURRENCY,
			'embedded' => isset($_GET['embedded']),
			'objectId' => isset($data['task']) ? $data['task']->id : (isset($data['category']) ? $data['category']->id : null)
		];
		$this->View->set('reactAssets', $assets);
		$this->View->set('reactBootstrap', json_encode($bootstrap, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR));
		$this->View->set('reactPage', true);
		$legacyPath = ['tasks' => '/tasks', 'taskcategories' => '/taskcategories', 'taskform' => '/task/' . ($bootstrap['objectId'] ?? 'new'), 'taskcategoryform' => '/taskcategory/' . ($bootstrap['objectId'] ?? 'new')][$viewName];
		$query = $_GET;
		$query['legacy'] = '1';
		$this->View->set('reactLegacyUrl', $url->ConstructUrl($legacyPath) . '?' . http_build_query($query));
		$this->View->set('reactTitle', ['tasks' => 'Tasks', 'taskcategories' => 'Task categories', 'taskform' => isset($data['task']) ? 'Edit task' : 'Create task', 'taskcategoryform' => isset($data['category']) ? 'Edit task category' : 'Create task category'][$viewName]);
		return $this->RenderPage($response, 'reacttasks', ['reactViewName' => $viewName]);
	}

	public function Overview(Request $request, Response $response, array $args)
	{
		$usersService = UsersService::GetInstance();
		$nextXDays = $usersService->GetUserSettings(GROCY_USER_ID)['tasks_due_soon_days'];

		if (isset($request->getQueryParams()['include_done']))
		{
			$tasks = $this->DB->tasks()->orderBy('name', 'COLLATE NOCASE');
		}
		else
		{
			$tasks = TasksService::GetInstance()->GetCurrent();
		}

		foreach ($tasks as $task)
		{
			if (empty($task->due_date))
			{
				$task->due_type = '';
			}
			elseif ($task->due_date < date('Y-m-d 23:59:59', strtotime('-1 days')))
			{
				$task->due_type = 'overdue';
			}
			elseif ($task->due_date <= date('Y-m-d 23:59:59'))
			{
				$task->due_type = 'duetoday';
			}
			elseif ($nextXDays > 0 && $task->due_date <= date('Y-m-d 23:59:59', strtotime('+' . $nextXDays . ' days')))
			{
				$task->due_type = 'duesoon';
			}
		}

		return $this->RenderTasksPage($response, 'tasks', [
			'tasks' => $tasks,
			'nextXDays' => $nextXDays,
			'taskCategories' => $this->DB->task_categories()->where('active = 1')->orderBy('name', 'COLLATE NOCASE'),
			'users' => $usersService->GetUsersAsDto(),
			'userfields' => UserfieldsService::GetInstance()->GetFields('tasks'),
			'userfieldValues' => UserfieldsService::GetInstance()->GetAllValues('tasks')
		]);
	}

	public function TaskCategoriesList(Request $request, Response $response, array $args)
	{
		if (isset($request->getQueryParams()['include_disabled']))
		{
			$categories = $this->DB->task_categories()->orderBy('name', 'COLLATE NOCASE');
		}
		else
		{
			$categories = $this->DB->task_categories()->where('active = 1')->orderBy('name', 'COLLATE NOCASE');
		}

		return $this->RenderTasksPage($response, 'taskcategories', [
			'taskCategories' => $categories,
			'userfields' => UserfieldsService::GetInstance()->GetFields('task_categories'),
			'userfieldValues' => UserfieldsService::GetInstance()->GetAllValues('task_categories')
		]);
	}

	public function TaskCategoryEditForm(Request $request, Response $response, array $args)
	{
		if ($args['categoryId'] == 'new')
		{
			return $this->RenderTasksPage($response, 'taskcategoryform', [
				'mode' => 'create',
				'userfields' => UserfieldsService::GetInstance()->GetFields('task_categories')
			]);
		}
		else
		{
			return $this->RenderTasksPage($response, 'taskcategoryform', [
				'category' => $this->DB->task_categories($args['categoryId']),
				'mode' => 'edit',
				'userfields' => UserfieldsService::GetInstance()->GetFields('task_categories')
			]);
		}
	}

	public function TaskEditForm(Request $request, Response $response, array $args)
	{
		if ($args['taskId'] == 'new')
		{
			return $this->RenderTasksPage($response, 'taskform', [
				'mode' => 'create',
				'taskCategories' => $this->DB->task_categories()->where('active = 1')->orderBy('name', 'COLLATE NOCASE'),
				'users' => $this->DB->users()->orderBy('username'),
				'userfields' => UserfieldsService::GetInstance()->GetFields('tasks')
			]);
		}
		else
		{
			return $this->RenderTasksPage($response, 'taskform', [
				'task' => $this->DB->tasks($args['taskId']),
				'mode' => 'edit',
				'taskCategories' => $this->DB->task_categories()->where('active = 1')->orderBy('name', 'COLLATE NOCASE'),
				'users' => $this->DB->users()->orderBy('username'),
				'userfields' => UserfieldsService::GetInstance()->GetFields('tasks')
			]);
		}
	}

	public function TasksSettings(Request $request, Response $response, array $args)
	{
		return $this->RenderTasksPage($response, 'taskssettings');
	}
}
