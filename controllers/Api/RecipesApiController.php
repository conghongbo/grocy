<?php

namespace Grocy\Controllers\Api;

use Grocy\Controllers\Users\User;
use Grocy\Helpers\Grocycode;
use Grocy\Helpers\WebhookRunner;
use Grocy\Services\RecipesService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class RecipesApiController extends BaseApiController
{
	public function AddNotFulfilledProductsToShoppingList(Request $request, Response $response, array $args)
	{
		User::CheckPermission($request, User::PERMISSION_SHOPPINGLIST_ITEMS_ADD);

		$requestBody = $this->GetParsedAndFilteredRequestBody($request);
		$excludedProductIds = null;

		if ($requestBody !== null && array_key_exists('excludedProductIds', $requestBody))
		{
			$excludedProductIds = $requestBody['excludedProductIds'];
		}

		RecipesService::GetInstance()->AddNotFulfilledProductsToShoppingList($args['recipeId'], $excludedProductIds);
		return $this->EmptyApiResponse($response);
	}

	public function ConsumeRecipe(Request $request, Response $response, array $args)
	{
		User::CheckPermission($request, User::PERMISSION_STOCK_CONSUME);

		try
		{
			RecipesService::GetInstance()->ConsumeRecipe($args['recipeId']);
			return $this->EmptyApiResponse($response);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function GetRecipeFulfillment(Request $request, Response $response, array $args)
	{
		try
		{
			if (!isset($args['recipeId']))
			{
				return $this->FilteredApiResponse($response, RecipesService::GetInstance()->GetRecipesResolved(), $request->getQueryParams());
			}

			$recipeResolved = FindObjectInArrayByPropertyValue(RecipesService::GetInstance()->GetRecipesResolved(), 'recipe_id', $args['recipeId']);

			if (!$recipeResolved)
			{
				throw new \Exception('Recipe does not exist');
			}
			else
			{
				return $this->ApiResponse($response, $recipeResolved);
			}
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function CopyRecipe(Request $request, Response $response, array $args)
	{
		try
		{
			return $this->ApiResponse($response, [
				'created_object_id' => RecipesService::GetInstance()->CopyRecipe($args['recipeId'])
			]);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function RecipePrintLabel(Request $request, Response $response, array $args)
	{
		try
		{
			$recipe = $this->DB->recipes()->where('id', $args['recipeId'])->fetch();

			$webhookData = array_merge([
				'recipe' => $recipe->name,
				'grocycode' => (string)(new Grocycode(Grocycode::RECIPE, $args['recipeId'])),
				'details' => $recipe
			], GROCY_LABEL_PRINTER_PARAMS);

			if (GROCY_LABEL_PRINTER_RUN_SERVER)
			{
				(new WebhookRunner())->run(GROCY_LABEL_PRINTER_WEBHOOK, $webhookData, GROCY_LABEL_PRINTER_HOOK_JSON);
			}

			return $this->ApiResponse($response, $webhookData);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function AddMealPlanShoppingRequirementsToShoppingList(
		Request $request,
		Response $response,
		array $args
	){
		User::CheckPermission(
			$request,
			User::PERMISSION_SHOPPINGLIST_ITEMS_ADD
		);

		try
		{
			$requestBody =
				$this->GetParsedAndFilteredRequestBody($request);

			if ($requestBody === null)
			{
				throw new \Exception(
					'Request body could not be parsed '
					. '(probably invalid JSON format or '
					. 'missing/wrong Content-Type header)'
				);
			}

			if (
				!array_key_exists('from', $requestBody)
				|| !IsIsoDate($requestBody['from'])
			)
			{
				throw new \Exception(
					'A valid from date is required'
				);
			}

			if (
				!array_key_exists('to', $requestBody)
				|| !IsIsoDate($requestBody['to'])
			)
			{
				throw new \Exception(
					'A valid to date is required'
				);
			}

			$from = $requestBody['from'];
			$to = $requestBody['to'];

			$preserveMinStock = false;

			if (array_key_exists('preserve_min_stock', $requestBody))
			{
				if (!is_bool($requestBody['preserve_min_stock']))
				{
					throw new \Exception(
						'preserve_min_stock must be a boolean'
					);
				}

				$preserveMinStock =
					$requestBody['preserve_min_stock'];
			}

			if ($from > $to)
			{
				throw new \Exception(
					'The from date must not be after the to date'
				);
			}

			$listId = 1;

			if (
				array_key_exists(
					'shopping_list_id',
					$requestBody
				)
			)
			{
				if (
					!is_numeric(
						$requestBody['shopping_list_id']
					)
					|| (int)$requestBody['shopping_list_id'] <= 0
				)
				{
					throw new \Exception(
						'A valid shopping_list_id is required'
					);
				}

				$listId =
					(int)$requestBody['shopping_list_id'];
			}

			$result = RecipesService::GetInstance()
				->AddMealPlanShoppingRequirementsToShoppingList(
					$from,
					$to,
					$listId,
					$preserveMinStock
				);

			return $this->ApiResponse(
				$response,
				[
					'from' => $from,
					'to' => $to,
					'shopping_list_id' => $listId,
					'preserve_min_stock' => $preserveMinStock,
					'requirements' => $result['requirements'],
					'written_items' => $result['written_items']
				]
			);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse(
				$response,
				$ex->getMessage()
			);
		}
	}
}
