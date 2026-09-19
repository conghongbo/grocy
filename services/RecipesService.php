<?php

namespace Grocy\Services;

use LessQL\Result;

class RecipesService extends BaseService
{
	const RECIPE_TYPE_MEALPLAN_DAY = 'mealplan-day'; // A recipe per meal plan day => name = YYYY-MM-DD
	const RECIPE_TYPE_MEALPLAN_WEEK = 'mealplan-week'; // A recipe per meal plan week => name = YYYY-WW (week number)
	const RECIPE_TYPE_MEALPLAN_SHADOW = 'mealplan-shadow'; // A recipe per meal plan recipe (for separated stock fulfillment checking) => name = YYYY-MM-DD#<meal_plan.id>
	const RECIPE_TYPE_NORMAL = 'normal'; // Normal / manually created recipes

	public function AddNotFulfilledProductsToShoppingList($recipeId, $excludedProductIds = null)
	{
		$recipe = $this->DB->recipes($recipeId);
		$recipePositions = $this->GetRecipesPosResolved();

		if ($excludedProductIds == null)
		{
			$excludedProductIds = [];
		}

		foreach ($recipePositions as $recipePosition)
		{
			if ($recipePosition->recipe_id == $recipeId && !in_array($recipePosition->product_id, $excludedProductIds))
			{
				$product = $this->DB->products($recipePosition->product_id);
				$toOrderAmount = round(($recipePosition->missing_amount - $recipePosition->amount_on_shopping_list), 2);
				$quId = $product->qu_id_purchase;

				if ($recipe->not_check_shoppinglist == 1)
				{
					$toOrderAmount = round($recipePosition->missing_amount, 2);
				}

				// When the recipe ingredient option "Only check if any amount is in stock" is enabled,
				// any QU can be used and the amount is not based on qu_stock then
				// => Do the unit conversion here (if any)
				if ($recipePosition->only_check_single_unit_in_stock == 1)
				{
					$conversion = $this->DB->cache__quantity_unit_conversions_resolved()->where('product_id = :1 AND from_qu_id = :2 AND to_qu_id = :3', $recipePosition->product_id, $recipePosition->qu_id, $product->qu_id_stock)->fetch();
					if ($conversion != null)
					{
						$toOrderAmount = $toOrderAmount * $conversion->factor;
					}
					else
					{
						// No conversion exists => take the amount/unit as is
						$quId = $recipePosition->qu_id;
						$toOrderAmount = $recipePosition->missing_amount;
					}
				}

				if ($toOrderAmount > 0)
				{
					$alreadyExistingEntry = $this->DB->shopping_list()->where('product_id', $recipePosition->product_id)->fetch();
					if ($alreadyExistingEntry)
					{
						// Update
						$alreadyExistingEntry->update([
							'amount' => $alreadyExistingEntry->amount + $toOrderAmount
						]);
					}
					else
					{
						// Insert
						$shoppinglistRow = $this->DB->shopping_list()->createRow([
							'product_id' => $recipePosition->product_id,
							'amount' => $toOrderAmount,
							'qu_id' => $quId
						]);
						$shoppinglistRow->save();
					}
				}
			}
		}
	}

	public function ConsumeRecipe($recipeId)
	{
		if (!$this->RecipeExists($recipeId))
		{
			throw new \Exception('Recipe does not exist');
		}

		$transactionId = uniqid();
		$recipePositions = $this->DB->recipes_pos_resolved()->where('recipe_id', $recipeId)->fetchAll();

		DatabaseService::GetInstance()->GetDbConnectionRaw()->beginTransaction();
		try
		{
			foreach ($recipePositions as $recipePosition)
			{
				if ($recipePosition->only_check_single_unit_in_stock == 0 && $recipePosition->stock_amount > 0)
				{
					$amount = $recipePosition->recipe_amount;
					if ($recipePosition->stock_amount > 0 && $recipePosition->stock_amount < $recipePosition->recipe_amount)
					{
						$amount = $recipePosition->stock_amount;
					}

					StockService::GetInstance()->ConsumeProduct($recipePosition->product_id, $amount, false, StockService::TRANSACTION_TYPE_CONSUME, 'default', $recipeId, null, $transactionId, true, true);
				}
			}
		}
		catch (\Exception $ex)
		{
			DatabaseService::GetInstance()->GetDbConnectionRaw()->rollback();
			throw $ex;
		}
		DatabaseService::GetInstance()->GetDbConnectionRaw()->commit();

		$recipe = $this->DB->recipes()->where('id = :1', $recipeId)->fetch();
		$productId = $recipe->product_id;
		$amount = $recipe->desired_servings;
		if ($recipe->type == self::RECIPE_TYPE_MEALPLAN_SHADOW)
		{
			// Use "Produces product" of the original recipe
			$mealPlanEntry = $this->DB->meal_plan()->where('id = :1', explode('#', $recipe->name)[1])->fetch();
			$recipe = $this->DB->recipes()->where('id = :1', $mealPlanEntry->recipe_id)->fetch();
			$productId = $recipe->product_id;
			$amount = $mealPlanEntry->recipe_servings;
		}

		if (!empty($productId))
		{
			$product = $this->DB->products()->where('id = :1', $productId)->fetch();
			$recipeResolvedRow = $this->DB->recipes_resolved()->where('recipe_id = :1', $recipeId)->fetch();
			StockService::GetInstance()->AddProduct($productId, $amount, null, StockService::TRANSACTION_TYPE_SELF_PRODUCTION, date('Y-m-d'), $recipeResolvedRow->costs_per_serving, null, null, $dummyTransactionId, $product->default_stock_label_type, true, $recipe->name);
		}
	}

	public function GetRecipesPosResolved()
	{
		$sql = 'SELECT * FROM recipes_pos_resolved';
		return DatabaseService::GetInstance()->ExecuteDbQuery($sql)->fetchAll(\PDO::FETCH_OBJ);
	}

	// TODO: Confirm that recipe_amount is normalized to the product stock QU
	// before aggregating products with ingredient units different from stock QU.
	public function GetMealPlanShoppingRequirements(
		$from,
		$to,
		$preserveMinStock = false
	){
		$sql = "
			SELECT
				rpr.*,
				mp.id AS meal_plan_entry_id,
				mp.day AS meal_plan_day,
				source_recipe.id AS source_recipe_id,
				source_recipe.name AS source_recipe_name
			FROM recipes_pos_resolved rpr
			JOIN recipes r
				ON r.id = rpr.recipe_id
			JOIN meal_plan_internal_recipe_relation mpir
				ON mpir.recipe_id = r.id
			JOIN meal_plan mp
				ON mp.day = mpir.day
				AND mp.type = 'recipe'
				AND r.name = CAST(mp.day AS TEXT)
					|| '#'
					|| CAST(mp.id AS TEXT)
			JOIN recipes source_recipe
				ON source_recipe.id = mp.recipe_id
			WHERE r.type = 'mealplan-shadow'
				AND mpir.day BETWEEN :from_date AND :to_date
		";

		$db = DatabaseService::GetInstance()->GetDbConnectionRaw();
		$stmt = $db->prepare($sql);
		$stmt->execute([
			'from_date' => $from,
			'to_date' => $to,
		]);

		$recipePositions = $stmt->fetchAll(\PDO::FETCH_OBJ);
		$requirementsByProduct = [];

		foreach($recipePositions as $recipePosition){
			$productId = (int)$recipePosition->product_id_effective;
			if(!isset($requirementsByProduct[$productId])){
				$product = $this->DB->products($productId);
				$requirementsByProduct[$productId] = [
					'product_id' => $productId,
					'product_name' => $product->name,
					'stock_qu_id' => (int)$product->qu_id_stock,
					'purchase_qu_id' => (int)$product->qu_id_purchase,
					'minimum_stock_amount' => (float)$product->min_stock_amount,
					'required_amount_stock' => 0.0,
					'stock_amount' => (float)$recipePosition->stock_amount,
					'missing_amount_stock' => 0.0,
					'shopping_list_amount_stock' => 0.0,
					'still_need_to_buy_stock' => 0.0,
					'still_need_to_buy_purchase' => 0.0,
					'sources' => []
        		];
			}
			$requirementsByProduct[$productId]['required_amount_stock']
        		+= (float)$recipePosition->recipe_amount;

			$sourceKey = (int)$recipePosition->meal_plan_entry_id;

			if (
				!isset(
					$requirementsByProduct[$productId]['sources'][$sourceKey]
				)
			)
			{
				$requirementsByProduct[$productId]['sources'][$sourceKey] = [
					'meal_plan_entry_id' =>
						(int)$recipePosition->meal_plan_entry_id,

					'day' =>
						$recipePosition->meal_plan_day,

					'recipe_id' =>
						(int)$recipePosition->source_recipe_id,

					'recipe_name' =>
						$recipePosition->source_recipe_name,

					'required_amount_stock' => 0.0
				];
			}

			$requirementsByProduct[$productId]
				['sources'][$sourceKey]
				['required_amount_stock']
					+= (float)$recipePosition->recipe_amount;

		}

		foreach ($requirementsByProduct as &$requirement)
		{
			$requirement['required_amount_stock'] =
				round($requirement['required_amount_stock'], 2);

			$requirement['stock_amount'] =
				round($requirement['stock_amount'], 2);

			$minimumStockAmount = 0.0;

			if ($preserveMinStock)
			{
				$minimumStockAmount =
					(float)$requirement['minimum_stock_amount'];
			}

			$targetAmountStock =
				$requirement['required_amount_stock']
				+ $minimumStockAmount;

			$requirement['target_amount_stock'] =
				round($targetAmountStock, 2);

			$requirement['missing_amount_stock'] = round(
				max(
					$targetAmountStock
					- $requirement['stock_amount'],
					0
				),
				2
			);

			$shoppingListAmountStock = 0.0;

			$shoppingListEntries = $this->DB
				->shopping_list()
				->where('product_id', $requirement['product_id']);

			foreach ($shoppingListEntries as $shoppingListEntry)
			{
				$amount = (float)$shoppingListEntry->amount;
				$fromQuId = (int)$shoppingListEntry->qu_id;
				$stockQuId = (int)$requirement['stock_qu_id'];

				if ($fromQuId == $stockQuId){
					$shoppingListAmountStock += $amount;
				}else{
					$conversion = $this->DB
						->cache__quantity_unit_conversions_resolved()
						->where(
							'product_id = :1 AND from_qu_id = :2 AND to_qu_id = :3',
							$requirement['product_id'],
							$fromQuId,
							$stockQuId
						)
						->fetch();

					if ($conversion == null)
					{
						throw new \RuntimeException(
							'No quantity unit conversion found for product '
							. $requirement['product_id']
							. ' from QU '
							. $fromQuId
							. ' to stock QU '
							. $stockQuId
						);
					}

					$shoppingListAmountStock +=
						$amount * (float)$conversion->factor;
				}
			}

			$requirement['shopping_list_amount_stock'] =
				round($shoppingListAmountStock, 2);

			$requirement['still_need_to_buy_stock'] = round(
				max(
					$requirement['missing_amount_stock']
					- $requirement['shopping_list_amount_stock'],
					0
				),
				2
			);

			$stockQuId = (int)$requirement['stock_qu_id'];
			$purchaseQuId = (int)$requirement['purchase_qu_id'];

			if ($stockQuId == $purchaseQuId)
			{
				$requirement['still_need_to_buy_purchase'] =
					$requirement['still_need_to_buy_stock'];
			}
			else
			{
				$conversion = $this->DB
					->cache__quantity_unit_conversions_resolved()
					->where(
						'product_id = :1 AND from_qu_id = :2 AND to_qu_id = :3',
						$requirement['product_id'],
						$stockQuId,
						$purchaseQuId
					)
					->fetch();

				if ($conversion == null)
				{
					throw new \RuntimeException(
						'No quantity unit conversion found for product '
						. $requirement['product_id']
						. ' from stock QU '
						. $stockQuId
						. ' to purchase QU '
						. $purchaseQuId
					);
				}

				$requirement['still_need_to_buy_purchase'] = round(
					$requirement['still_need_to_buy_stock']
					* (float)$conversion->factor,
					2
				);
			}


			foreach ($requirement['sources'] as &$source)
			{
				$source['required_amount_stock'] = round(
					$source['required_amount_stock'],
					2
				);
			}
			unset($source);

			$requirement['sources'] =
				array_values($requirement['sources']);

		}
		unset($requirement);

		return array_values($requirementsByProduct);
	}

	public function AddMealPlanShoppingRequirementsToShoppingList(
		$from,
		$to,
		$listId = 1,
		$preserveMinStock = false
	){
		$shoppingList = $this->DB
			->shopping_lists()
			->where('id', $listId)
			->fetch();

		if ($shoppingList == null)
		{
			throw new \RuntimeException(
				'Shopping list does not exist: ' . $listId
			);
		}

		$requirements = $this->GetMealPlanShoppingRequirements(
			$from,
			$to,
			$preserveMinStock
		);

		$writtenItems = [];

		$db = DatabaseService::GetInstance()->GetDbConnectionRaw();
		$db->beginTransaction();

		try
		{
			foreach ($requirements as $requirement)
			{
				$amountToAddPurchase =
					(float)$requirement['still_need_to_buy_purchase'];

				if ($amountToAddPurchase <= 0)
				{
					continue;
				}

				$productId = (int)$requirement['product_id'];
				$purchaseQuId =
					(int)$requirement['purchase_qu_id'];

				$existingEntry = $this->DB
					->shopping_list()
					->where(
						'product_id = :1 AND shopping_list_id = :2',
						$productId,
						$listId
					)
					->fetch();

				if ($existingEntry == null)
				{
					$newEntry = $this->DB
						->shopping_list()
						->createRow([
							'product_id' => $productId,
							'amount' => $amountToAddPurchase,
							'qu_id' => $purchaseQuId,
							'shopping_list_id' => $listId
						]);

					$newEntry->save();

					$writtenItems[] = [
						'product_id' => $productId,
						'action' => 'insert',
						'amount_added' => $amountToAddPurchase,
						'qu_id' => $purchaseQuId
					];
				}
				else
				{
					$existingQuId = (int)$existingEntry->qu_id;
					$amountToAddExistingQu = $amountToAddPurchase;

					if ($existingQuId != $purchaseQuId)
					{
						$conversion = $this->DB
							->cache__quantity_unit_conversions_resolved()
							->where(
								'product_id = :1 AND from_qu_id = :2 AND to_qu_id = :3',
								$productId,
								$purchaseQuId,
								$existingQuId
							)
							->fetch();

						if ($conversion == null)
						{
							throw new \RuntimeException(
								'No quantity unit conversion found for product '
								. $productId
								. ' from purchase QU '
								. $purchaseQuId
								. ' to existing Shopping List QU '
								. $existingQuId
							);
						}

						$amountToAddExistingQu =
							$amountToAddPurchase
							* (float)$conversion->factor;
					}

					$amountToAddExistingQu =
						round($amountToAddExistingQu, 2);

					$existingEntry->update([
						'amount' =>
							(float)$existingEntry->amount
							+ $amountToAddExistingQu
					]);

					$writtenItems[] = [
						'product_id' => $productId,
						'action' => 'update',
						'amount_added' => $amountToAddExistingQu,
						'qu_id' => $existingQuId
					];
				}
			}

			$db->commit();
		}
		catch (\Throwable $ex)
		{
			$db->rollBack();
			throw $ex;
		}

			return [
				'requirements' => $requirements,
				'written_items' => $writtenItems
			];
		}

	public function GetRecipesResolved($customWhere = null): Result
	{
		if ($customWhere == null)
		{
			return $this->DB->recipes_resolved();
		}
		else
		{
			return $this->DB->recipes_resolved()->where($customWhere);
		}
	}

	public function CopyRecipe($recipeId)
	{
		if (!$this->RecipeExists($recipeId))
		{
			throw new \Exception('Recipe does not exist');
		}

		$newName = LocalizationService::GetInstance()->__t('Copy of %s', $this->DB->recipes($recipeId)->name);

		DatabaseService::GetInstance()->ExecuteDbStatement('INSERT INTO recipes (name, description, picture_file_name, base_servings, desired_servings, not_check_shoppinglist, type, product_id) SELECT :new_name, description, picture_file_name, base_servings, desired_servings, not_check_shoppinglist, type, product_id FROM recipes WHERE id = :recipe_id', ['recipe_id' => $recipeId, 'new_name' => $newName]);
		$lastInsertId = $this->DB->lastInsertId();
		DatabaseService::GetInstance()->ExecuteDbStatement('INSERT INTO recipes_pos (recipe_id, product_id, amount, note, qu_id, only_check_single_unit_in_stock, ingredient_group, not_check_stock_fulfillment, variable_amount, price_factor) SELECT :last_insert_id, product_id, amount, note, qu_id, only_check_single_unit_in_stock, ingredient_group, not_check_stock_fulfillment, variable_amount, price_factor FROM recipes_pos WHERE recipe_id = :recipe_id', ['recipe_id' => $recipeId, 'last_insert_id' => $lastInsertId]);
		DatabaseService::GetInstance()->ExecuteDbStatement('INSERT INTO recipes_nestings (recipe_id, includes_recipe_id, servings) SELECT :last_insert_id, includes_recipe_id, servings FROM recipes_nestings WHERE recipe_id = :recipe_id', ['recipe_id' => $recipeId, 'last_insert_id' => $lastInsertId]);

		return $lastInsertId;
	}

	private function RecipeExists($recipeId)
	{
		$recipeRow = $this->DB->recipes()->where('id = :1', $recipeId)->fetch();
		return $recipeRow !== null;
	}
}
