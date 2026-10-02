# Grocy API schema and entity dictionary
This companion to [the implementation plan](react-rewrite-plan.md) supplies generic request columns, response fields and restrictions. SQL schema was reconstructed in an isolated in-memory SQLite database from every checked-in SQL migration; no application database was opened. PHP migrations were inspected and skipped because they update data/files, not table definitions. This is schema inspection, not endpoint execution. SQLite affinities are not guarantees of JSON scalar types.
## Generic entity policies
GET collection and GET item are allowed unless NoListing. POST and PUT are allowed unless NoEdit. DELETE is allowed unless NoDelete. Actual database view writability and constraints still apply; an absent restriction does not make a view writable. POST passes supplied columns to LessQL; PUT updates supplied columns. Omit generated id and timestamps on creates; do not send display joins, userfields, or computed fields as columns. Required input below means NOT NULL without a default, excluding generated integer primary keys; frontend forms may impose additional nonempty/value rules.
| Entity | GET | POST PUT | DELETE |
| --- | --- | --- | --- |
| products | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| chores | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| product_barcodes | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| batteries | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| locations | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| quantity_units | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| quantity_unit_conversions | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| shopping_list | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| shopping_lists | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| shopping_locations | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| recipes | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| recipes_pos | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| recipes_nestings | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| tasks | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| task_categories | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| product_groups | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| equipment | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| api_keys | Denied | Denied | Allowed by whitelist |
| userfields | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| userentities | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| userobjects | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| meal_plan | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| stock_log | Allowed by whitelist | Denied | Denied |
| stock | Allowed by whitelist | Denied | Denied |
| stock_current_locations | Allowed by whitelist | Denied | Denied |
| chores_log | Allowed by whitelist | Denied | Denied |
| meal_plan_sections | Allowed by whitelist | Allowed by whitelist | Allowed by whitelist |
| products_last_purchased | Allowed by whitelist | Denied | Denied |
| products_average_price | Allowed by whitelist | Denied | Denied |
| quantity_unit_conversions_resolved | Allowed by whitelist | Denied | Denied |
| recipes_pos_resolved | Allowed by whitelist | Denied | Denied |
| battery_charge_cycles | Allowed by whitelist | Denied | Denied |
| product_barcodes_view | Allowed by whitelist | Denied | Denied |
| permission_hierarchy | Allowed by whitelist | Denied | Denied |

Mutation permissions: shopping_list/shopping_lists POST/PUT require SHOPPINGLIST_ITEMS_ADD and DELETE requires SHOPPINGLIST_ITEMS_DELETE; recipes/recipes_pos/recipes_nestings require RECIPES; meal_plan requires RECIPES_MEALPLAN; equipment requires EQUIPMENT; all other writes require MASTER_DATA_EDIT, except api_keys DELETE has no explicit permission check. ExposedEntityEditRequiresAdmin is empty. This is the actual policy, including task CRUD and meal_plan_sections using MASTER_DATA_EDIT. Reads have no entity-specific permission checks in the controller. Do not infer row ownership enforcement for API key deletion from the HTML key-list filtering.
File groups: equipmentmanuals, recipepictures, productpictures, userfiles, userpictures.
## Database row fields

### products

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `product_group_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |
| `location_id` | INTEGER | No | `None` | Required |
| `shopping_location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `qu_id_purchase` | INTEGER | No | `None` | Required |
| `qu_id_stock` | INTEGER | No | `None` | Required |
| `min_stock_amount` | INTEGER | No | `0` | Optional/defaulted |
| `default_best_before_days` | INTEGER | No | `0` | Optional/defaulted |
| `default_best_before_days_after_open` | INTEGER | No | `0` | Optional/defaulted |
| `default_best_before_days_after_freezing` | INTEGER | No | `0` | Optional/defaulted |
| `default_best_before_days_after_thawing` | INTEGER | No | `0` | Optional/defaulted |
| `picture_file_name` | TEXT | Yes | `None` | Optional/defaulted |
| `enable_tare_weight_handling` | TINYINT | No | `0` | Optional/defaulted |
| `tare_weight` | REAL | No | `0` | Optional/defaulted |
| `not_check_stock_fulfillment_for_recipes` | TINYINT | Yes | `0` | Optional/defaulted |
| `parent_product_id` | INT | Yes | `None` | Optional/defaulted |
| `calories` | INTEGER | Yes | `None` | Optional/defaulted |
| `cumulate_min_stock_amount_of_sub_products` | TINYINT | Yes | `0` | Optional/defaulted |
| `due_type` | TINYINT | No | `1` | Optional/defaulted |
| `quick_consume_amount` | REAL | No | `1` | Optional/defaulted |
| `hide_on_stock_overview` | TINYINT | No | `0` | Optional/defaulted |
| `default_stock_label_type` | INTEGER | No | `0` | Optional/defaulted |
| `should_not_be_frozen` | TINYINT | No | `0` | Optional/defaulted |
| `treat_opened_as_out_of_stock` | TINYINT | No | `1` | Optional/defaulted |
| `no_own_stock` | TINYINT | No | `0` | Optional/defaulted |
| `default_consume_location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `move_on_open` | TINYINT | No | `0` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `qu_id_consume` | INTEGER | Yes | `None` | Optional/defaulted |
| `auto_reprint_stock_label` | TINYINT | No | `0` | Optional/defaulted |
| `quick_open_amount` | REAL | No | `1` | Optional/defaulted |
| `qu_id_price` | INTEGER | Yes | `None` | Optional/defaulted |
| `disable_open` | TINYINT | No | `0` | Optional/defaulted |
| `default_purchase_price_type` | TINYINT | No | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE products (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	product_group_id INTEGER,
	active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)),
	location_id INTEGER NOT NULL,
	shopping_location_id INTEGER,
	qu_id_purchase INTEGER NOT NULL,
	qu_id_stock INTEGER NOT NULL,
	min_stock_amount INTEGER NOT NULL DEFAULT 0,
	default_best_before_days INTEGER NOT NULL DEFAULT 0,
	default_best_before_days_after_open INTEGER NOT NULL DEFAULT 0,
	default_best_before_days_after_freezing INTEGER NOT NULL DEFAULT 0,
	default_best_before_days_after_thawing INTEGER NOT NULL DEFAULT 0,
	picture_file_name TEXT,
	enable_tare_weight_handling TINYINT NOT NULL DEFAULT 0,
	tare_weight REAL NOT NULL DEFAULT 0,
	not_check_stock_fulfillment_for_recipes TINYINT DEFAULT 0,
	parent_product_id INT,
	calories INTEGER,
	cumulate_min_stock_amount_of_sub_products TINYINT DEFAULT 0,
	due_type TINYINT NOT NULL DEFAULT 1 CHECK(due_type IN (1, 2)),
	quick_consume_amount REAL NOT NULL DEFAULT 1,
	hide_on_stock_overview TINYINT NOT NULL DEFAULT 0 CHECK(hide_on_stock_overview IN (0, 1)),
	default_stock_label_type INTEGER NOT NULL DEFAULT 0,
	should_not_be_frozen TINYINT NOT NULL DEFAULT 0 CHECK(should_not_be_frozen IN (0, 1)),
	treat_opened_as_out_of_stock TINYINT NOT NULL DEFAULT 1 CHECK(treat_opened_as_out_of_stock IN (0, 1)),
	no_own_stock TINYINT NOT NULL DEFAULT 0 CHECK(no_own_stock IN (0, 1)),
	default_consume_location_id INTEGER,
	move_on_open TINYINT NOT NULL DEFAULT 0 CHECK(move_on_open IN (0, 1)),
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, qu_id_consume INTEGER, auto_reprint_stock_label TINYINT NOT NULL DEFAULT 0 CHECK(auto_reprint_stock_label IN (0, 1)), quick_open_amount REAL NOT NULL DEFAULT 1, qu_id_price INTEGER, disable_open TINYINT NOT NULL DEFAULT 0 CHECK(disable_open IN (0, 1)), default_purchase_price_type TINYINT NOT NULL DEFAULT 1 CHECK(default_purchase_price_type IN (1, 2, 3)))
```

### chores

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `period_type` | TEXT | No | `None` | Required |
| `period_days` | INTEGER | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `period_config` | TEXT | Yes | `None` | Optional/defaulted |
| `track_date_only` | TINYINT | Yes | `0` | Optional/defaulted |
| `rollover` | TINYINT | Yes | `0` | Optional/defaulted |
| `assignment_type` | TEXT | Yes | `None` | Optional/defaulted |
| `assignment_config` | TEXT | Yes | `None` | Optional/defaulted |
| `next_execution_assigned_to_user_id` | INT | Yes | `None` | Optional/defaulted |
| `consume_product_on_execution` | TINYINT | No | `0` | Optional/defaulted |
| `product_id` | TINYINT | Yes | `None` | Optional/defaulted |
| `product_amount` | REAL | Yes | `None` | Optional/defaulted |
| `period_interval` | INTEGER | No | `1` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |
| `start_date` | DATETIME | Yes | `None` | Optional/defaulted |
| `rescheduled_date` | DATETIME | Yes | `None` | Optional/defaulted |
| `rescheduled_next_execution_assigned_to_user_id` | INT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE "chores" (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	period_type TEXT NOT NULL,
	period_days INTEGER,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, period_config TEXT, track_date_only TINYINT DEFAULT 0, rollover TINYINT DEFAULT 0, assignment_type TEXT, assignment_config TEXT, next_execution_assigned_to_user_id INT, consume_product_on_execution TINYINT NOT NULL DEFAULT 0, product_id TINYINT, product_amount REAL, period_interval INTEGER NOT NULL DEFAULT 1 CHECK(period_interval > 0), active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)), start_date DATETIME, rescheduled_date DATETIME, rescheduled_next_execution_assigned_to_user_id INT)
```

### product_barcodes

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `product_id` | INT | No | `None` | Required |
| `barcode` | TEXT | No | `None` | Required |
| `qu_id` | INT | Yes | `None` | Optional/defaulted |
| `amount` | REAL | Yes | `None` | Optional/defaulted |
| `shopping_location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `last_price` | DECIMAL(15, 2) | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `note` | TEXT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE product_barcodes (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	product_id INT NOT NULL,
	barcode TEXT NOT NULL,
	qu_id INT,
	amount REAL,
	shopping_location_id INTEGER,
	last_price DECIMAL(15, 2),
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, note TEXT)
```

### batteries

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `used_in` | TEXT | Yes | `None` | Optional/defaulted |
| `charge_interval_days` | INTEGER | No | `0` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |
| `rechargeable` | INTEGER | No | `1` | Optional/defaulted |
| `is_charged` | INTEGER | No | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE batteries (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	used_in TEXT,
	charge_interval_days INTEGER NOT NULL DEFAULT 0,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)), rechargeable INTEGER NOT NULL DEFAULT 1 CHECK (rechargeable IN (0, 1)), is_charged INTEGER NOT NULL DEFAULT 1 CHECK (is_charged IN (0, 1)))
```

### locations

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `is_freezer` | TINYINT | No | `0` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE locations (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, is_freezer TINYINT NOT NULL DEFAULT 0, active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)))
```

### quantity_units

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `name_plural` | TEXT | Yes | `None` | Optional/defaulted |
| `plural_forms` | TEXT | Yes | `None` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE quantity_units (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, name_plural TEXT, plural_forms TEXT, active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)))
```

### quantity_unit_conversions

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `from_qu_id` | INT | No | `None` | Required |
| `to_qu_id` | INT | No | `None` | Required |
| `factor` | REAL | No | `None` | Required |
| `product_id` | INT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE quantity_unit_conversions (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	from_qu_id INT NOT NULL,
	to_qu_id INT NOT NULL,
	factor REAL NOT NULL,
	product_id INT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
)
```

### shopping_list

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `product_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `note` | TEXT | Yes | `None` | Optional/defaulted |
| `amount` | DECIMAL(15, 2) | No | `0` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `shopping_list_id` | INT | Yes | `1` | Optional/defaulted |
| `done` | INT | Yes | `0` | Optional/defaulted |
| `qu_id` | INTEGER | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE shopping_list (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	product_id INTEGER,
	note TEXT,
	amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, shopping_list_id INT DEFAULT 1, done INT DEFAULT 0, qu_id INTEGER)
```

### shopping_lists

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE shopping_lists (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
)
```

### shopping_locations

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE shopping_locations (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)))
```

### recipes

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `picture_file_name` | TEXT | Yes | `None` | Optional/defaulted |
| `base_servings` | INTEGER | Yes | `1` | Optional/defaulted |
| `desired_servings` | INTEGER | Yes | `1` | Optional/defaulted |
| `not_check_shoppinglist` | TINYINT | No | `0` | Optional/defaulted |
| `type` | TEXT | Yes | `'normal'` | Optional/defaulted |
| `product_id` | INTEGER | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE recipes (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL,
	description TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, picture_file_name TEXT, base_servings INTEGER DEFAULT 1, desired_servings INTEGER DEFAULT 1, not_check_shoppinglist TINYINT NOT NULL DEFAULT 0, type TEXT DEFAULT 'normal', product_id INTEGER)
```

### recipes_pos

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `recipe_id` | INTEGER | No | `None` | Required |
| `product_id` | INTEGER | No | `None` | Required |
| `amount` | REAL | No | `0` | Optional/defaulted |
| `note` | TEXT | Yes | `None` | Optional/defaulted |
| `qu_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `only_check_single_unit_in_stock` | TINYINT | No | `0` | Optional/defaulted |
| `ingredient_group` | TEXT | Yes | `None` | Optional/defaulted |
| `not_check_stock_fulfillment` | TINYINT | No | `0` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `variable_amount` | TEXT | Yes | `None` | Optional/defaulted |
| `price_factor` | REAL | No | `1` | Optional/defaulted |
| `round_up` | TINYINT | No | `0` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE recipes_pos (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	recipe_id INTEGER NOT NULL,
	product_id INTEGER NOT NULL,
	amount REAL NOT NULL DEFAULT 0,
	note TEXT,
	qu_id INTEGER,
	only_check_single_unit_in_stock TINYINT NOT NULL DEFAULT 0,
	ingredient_group TEXT,
	not_check_stock_fulfillment TINYINT NOT NULL DEFAULT 0,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, variable_amount TEXT, price_factor REAL NOT NULL DEFAULT 1, round_up TINYINT NOT NULL DEFAULT 0 CHECK(round_up IN (0, 1)))
```

### recipes_nestings

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `recipe_id` | INTEGER | No | `None` | Required |
| `includes_recipe_id` | INTEGER | No | `None` | Required |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `servings` | INTEGER | Yes | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE recipes_nestings (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	recipe_id INTEGER NOT NULL,
	includes_recipe_id INTEGER NOT NULL,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime')), servings INTEGER DEFAULT 1,

	UNIQUE(recipe_id, includes_recipe_id)
)
```

### tasks

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `due_date` | DATETIME | Yes | `None` | Optional/defaulted |
| `done` | TINYINT | No | `0` | Optional/defaulted |
| `done_timestamp` | DATETIME | Yes | `None` | Optional/defaulted |
| `category_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `assigned_to_user_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE tasks (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL,
	description TEXT,
	due_date DATETIME,
	done TINYINT NOT NULL DEFAULT 0 CHECK(done IN (0, 1)),
	done_timestamp DATETIME,
	category_id INTEGER,
	assigned_to_user_id INTEGER,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
)
```

### task_categories

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE task_categories (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)))
```

### product_groups

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `active` | TINYINT | No | `1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE product_groups (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, active TINYINT NOT NULL DEFAULT 1 CHECK(active IN (0, 1)))
```

### equipment

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `instruction_manual_file_name` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE equipment (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	instruction_manual_file_name TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
)
```

### api_keys

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `api_key` | TEXT | No | `None` | Required |
| `user_id` | INTEGER | No | `None` | Required |
| `expires` | DATETIME | Yes | `None` | Optional/defaulted |
| `last_used` | DATETIME | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `key_type` | TEXT | No | `'default'` | Optional/defaulted |
| `description` | TEXT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE api_keys (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	api_key TEXT NOT NULL UNIQUE,
	user_id INTEGER NOT NULL,
	expires DATETIME,
	last_used DATETIME,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, key_type TEXT NOT NULL DEFAULT 'default', description TEXT)
```

### userfields

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `entity` | TEXT | No | `None` | Required |
| `name` | TEXT | No | `None` | Required |
| `caption` | TEXT | No | `None` | Required |
| `type` | TEXT | No | `None` | Required |
| `show_as_column_in_tables` | TINYINT | No | `0` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `config` | TEXT | Yes | `None` | Optional/defaulted |
| `sort_number` | INTEGER | Yes | `None` | Optional/defaulted |
| `input_required` | TINYINT | No | `0` | Optional/defaulted |
| `default_value` | TEXT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE userfields (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	entity TEXT NOT NULL,
	name TEXT NOT NULL,
	caption TEXT NOT NULL,
	type TEXT NOT NULL,
	show_as_column_in_tables TINYINT NOT NULL DEFAULT 0,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime')), config TEXT, sort_number INTEGER, input_required TINYINT NOT NULL DEFAULT 0 CHECK(input_required IN (0, 1)), default_value TEXT,

	UNIQUE(entity, name)
)
```

### userentities

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `caption` | TEXT | No | `None` | Required |
| `description` | TEXT | Yes | `None` | Optional/defaulted |
| `show_in_sidebar_menu` | TINYINT | No | `1` | Optional/defaulted |
| `icon_css_class` | TEXT | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE userentities (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL,
	caption TEXT NOT NULL,
	description TEXT,
	show_in_sidebar_menu TINYINT NOT NULL DEFAULT 1,
	icon_css_class TEXT,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime')),

	UNIQUE(name)
)
```

### userobjects

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `userentity_id` | INTEGER | No | `None` | Required |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE userobjects (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	userentity_id INTEGER NOT NULL,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
)
```

### meal_plan

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `day` | DATE | No | `None` | Required |
| `type` | TEXT | Yes | `'recipe'` | Optional/defaulted |
| `recipe_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `recipe_servings` | INTEGER | Yes | `1` | Optional/defaulted |
| `note` | TEXT | Yes | `None` | Optional/defaulted |
| `product_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `product_amount` | REAL | Yes | `0` | Optional/defaulted |
| `product_qu_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `done` | TINYINT | No | `0` | Optional/defaulted |
| `section_id` | INTEGER | No | `-1` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE meal_plan (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	day DATE NOT NULL,
	type TEXT DEFAULT 'recipe',
	recipe_id INTEGER,
	recipe_servings INTEGER DEFAULT 1,
	note TEXT,
	product_id INTEGER,
	product_amount REAL DEFAULT 0,
	product_qu_id INTEGER,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, done TINYINT NOT NULL DEFAULT 0 CHECK(done IN (0, 1)), section_id INTEGER NOT NULL DEFAULT -1)
```

### stock_log

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `product_id` | INTEGER | No | `None` | Required |
| `amount` | DECIMAL(15, 2) | No | `None` | Required |
| `best_before_date` | DATE | Yes | `None` | Optional/defaulted |
| `purchased_date` | DATE | Yes | `None` | Optional/defaulted |
| `used_date` | DATE | Yes | `None` | Optional/defaulted |
| `spoiled` | INTEGER | No | `0` | Optional/defaulted |
| `stock_id` | TEXT | No | `None` | Required |
| `transaction_type` | TEXT | No | `None` | Required |
| `price` | DECIMAL(15, 2) | Yes | `None` | Optional/defaulted |
| `undone` | TINYINT | No | `0` | Optional/defaulted |
| `undone_timestamp` | DATETIME | Yes | `None` | Optional/defaulted |
| `opened_date` | DATETIME | Yes | `None` | Optional/defaulted |
| `location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `recipe_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `correlation_id` | TEXT | Yes | `None` | Optional/defaulted |
| `transaction_id` | TEXT | Yes | `None` | Optional/defaulted |
| `stock_row_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `shopping_location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `user_id` | INTEGER | No | `None` | Required |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `note` | TEXT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE stock_log (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	product_id INTEGER NOT NULL,
	amount DECIMAL(15, 2) NOT NULL,
	best_before_date DATE,
	purchased_date DATE,
	used_date DATE,
	spoiled INTEGER NOT NULL DEFAULT 0,
	stock_id TEXT NOT NULL,
	transaction_type TEXT NOT NULL,
	price DECIMAL(15, 2),
	undone TINYINT NOT NULL DEFAULT 0 CHECK(undone IN (0, 1)),
	undone_timestamp DATETIME,
	opened_date DATETIME,
	location_id INTEGER,
	recipe_id INTEGER,
	correlation_id TEXT,
	transaction_id TEXT,
	stock_row_id INTEGER,
	shopping_location_id INTEGER,
	user_id INTEGER NOT NULL,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, note TEXT)
```

### stock

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `product_id` | INTEGER | No | `None` | Required |
| `amount` | DECIMAL(15, 2) | No | `None` | Required |
| `best_before_date` | DATE | Yes | `None` | Optional/defaulted |
| `purchased_date` | DATE | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `stock_id` | TEXT | No | `None` | Required |
| `price` | DECIMAL(15, 2) | Yes | `None` | Optional/defaulted |
| `open` | TINYINT | No | `0` | Optional/defaulted |
| `opened_date` | DATETIME | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `shopping_location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `note` | TEXT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE stock (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	product_id INTEGER NOT NULL,
	amount DECIMAL(15, 2) NOT NULL,
	best_before_date DATE,
	purchased_date DATE DEFAULT (datetime('now', 'localtime')),
	stock_id TEXT NOT NULL,
	price DECIMAL(15, 2),
	open TINYINT NOT NULL DEFAULT 0 CHECK(open IN (0, 1)),
	opened_date DATETIME,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, location_id INTEGER, shopping_location_id INTEGER, note TEXT)
```

### stock_current_locations

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | Derived | Yes | `None` | Optional/defaulted |
| `product_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `amount` | Derived | Yes | `None` | Optional/defaulted |
| `location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `location_name` | TEXT | Yes | `None` | Optional/defaulted |
| `location_is_freezer` | TINYINT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE VIEW stock_current_locations
AS
SELECT
	1 AS id, -- Dummy, LessQL needs an id column
	s.product_id,
        SUM(s.amount) as amount,
	s.location_id AS location_id,
	l.name AS location_name,
	l.is_freezer AS location_is_freezer
FROM stock s
JOIN locations l
	ON s.location_id = l.id
GROUP BY s.product_id, s.location_id, l.name
```

### chores_log

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `chore_id` | INTEGER | No | `None` | Required |
| `tracked_time` | DATETIME | Yes | `None` | Optional/defaulted |
| `done_by_user_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `undone` | TINYINT | No | `0` | Optional/defaulted |
| `undone_timestamp` | DATETIME | Yes | `None` | Optional/defaulted |
| `skipped` | TINYINT | No | `0` | Optional/defaulted |
| `scheduled_execution_time` | DATETIME | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE chores_log (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	chore_id INTEGER NOT NULL,
	tracked_time DATETIME,
	done_by_user_id INTEGER,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, undone TINYINT NOT NULL DEFAULT 0 CHECK(undone IN (0, 1)), undone_timestamp DATETIME, skipped TINYINT NOT NULL DEFAULT 0 CHECK(skipped IN (0, 1)), scheduled_execution_time DATETIME)
```

### meal_plan_sections

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `sort_number` | INTEGER | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |
| `time_info` | TEXT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE meal_plan_sections (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	sort_number INTEGER,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
, time_info TEXT)
```

### products_last_purchased

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | Derived | Yes | `None` | Optional/defaulted |
| `product_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `amount` | DECIMAL(15, 2) | Yes | `None` | Optional/defaulted |
| `best_before_date` | DATE | Yes | `None` | Optional/defaulted |
| `purchased_date` | DATE | Yes | `None` | Optional/defaulted |
| `location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `shopping_location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `price` | Derived | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE VIEW products_last_purchased
AS
SELECT
	1 AS id, -- Dummy, LessQL needs an id column
	sl.product_id,
	sl.amount,
	sl.best_before_date,
	sl.purchased_date,
	sl.location_id,
	sl.shopping_location_id,
	IFNULL((SELECT price FROM products_price_history WHERE product_id = sl.product_id ORDER BY purchased_date DESC LIMIT 1), 0) AS price
FROM stock_log sl
JOIN (
	/*
		This subquery gets the ID of the stock_log row (per product) which referes to the last purchase transaction,
		while taking undone and edited transactions into account
	*/
	SELECT
		sl1.product_id,
		MAX(sl1.id) stock_log_id_of_last_purchase
	FROM stock_log sl1
	JOIN (
		/*
			This subquery finds the last purchased date per product,
			there can be multiple purchase transactions per day, therefore a JOIN by purchased_date
			for the outer query on this and then take MAX id of stock_log (of that day)
		*/
		SELECT
			sl2.product_id,
			MAX(sl2.purchased_date) AS last_purchased_date
		FROM stock_log sl2
		WHERE sl2.undone = 0
			AND (
				(sl2.transaction_type IN ('purchase', 'inventory-correction', 'self-production') AND sl2.stock_id NOT IN (SELECT stock_id FROM stock_edited_entries))
				OR (sl2.transaction_type = 'stock-edit-new' AND sl2.stock_id IN (SELECT stock_id FROM stock_edited_entries) AND sl2.id IN (SELECT stock_log_id_of_newest_edited_entry FROM stock_edited_entries))
			)
		GROUP BY sl2.product_id
	) x2
		ON sl1.product_id = x2.product_id
		AND sl1.purchased_date = x2.last_purchased_date
	WHERE sl1.undone = 0
		AND (
			(sl1.transaction_type IN ('purchase', 'inventory-correction', 'self-production') AND sl1.stock_id NOT IN (SELECT stock_id FROM stock_edited_entries))
			OR (sl1.transaction_type = 'stock-edit-new' AND sl1.stock_id IN (SELECT stock_id FROM stock_edited_entries) AND sl1.id IN (SELECT stock_log_id_of_newest_edited_entry FROM stock_edited_entries))
		)
	GROUP BY sl1.product_id
) x
	ON sl.product_id = x.product_id
	AND sl.id = x.stock_log_id_of_last_purchase
```

### products_average_price

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | Derived | Yes | `None` | Optional/defaulted |
| `product_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `price` | Derived | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE VIEW products_average_price
AS
SELECT
	1 AS id, -- Dummy, LessQL needs an id column
	sl.product_id,
	SUM(IFNULL(sl.edited_origin_amount, sl.amount) * sl.price) / SUM(IFNULL(sl.edited_origin_amount, sl.amount)) as price
FROM (
	SELECT sl.*, CASE WHEN sl.transaction_type = 'stock-edit-new' THEN see.edited_origin_amount END AS edited_origin_amount
	FROM stock_log sl
	LEFT JOIN stock_edited_entries see
		ON sl.stock_id = see.stock_id
) sl
WHERE sl.undone = 0
	AND (
		(sl.transaction_type IN ('purchase', 'inventory-correction', 'self-production') AND sl.stock_id NOT IN (SELECT stock_id FROM stock_edited_entries)) -- Unedited origin entries
		OR (sl.transaction_type = 'stock-edit-new' AND sl.id IN (SELECT stock_log_id_of_newest_edited_entry FROM stock_edited_entries)) -- Edited origin entries => take the newest "stock-edit-new" one
	)
	AND IFNULL(sl.price, 0) > 0
	AND IFNULL(sl.amount, 0) > 0
GROUP BY sl.product_id
```

### quantity_unit_conversions_resolved

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | Derived | Yes | `None` | Optional/defaulted |
| `product_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `from_qu_id` | INT | Yes | `None` | Optional/defaulted |
| `from_qu_name` | TEXT | Yes | `None` | Optional/defaulted |
| `from_qu_name_plural` | TEXT | Yes | `None` | Optional/defaulted |
| `to_qu_id` | INT | Yes | `None` | Optional/defaulted |
| `to_qu_name` | TEXT | Yes | `None` | Optional/defaulted |
| `to_qu_name_plural` | TEXT | Yes | `None` | Optional/defaulted |
| `factor` | Derived | Yes | `None` | Optional/defaulted |
| `path` | Derived | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE VIEW quantity_unit_conversions_resolved
AS

WITH RECURSIVE

-- Default QU conversions are handled in a later CTE, as we can't determine yet, for which products they are applicable.
default_conversions(from_qu_id, to_qu_id, factor)
AS (
	SELECT
		from_qu_id,
		to_qu_id,
		factor
	FROM quantity_unit_conversions
	WHERE product_id IS NULL
),

-- First find the closure for all default conversions. This will allow for further pruning when looking for product closure.
default_closure(depth, from_qu_id, to_qu_id, factor, path)
AS (
	-- As a base case, select all available default conversions
	SELECT
		1 as depth,
		from_qu_id,
		to_qu_id,
		factor,
		'/' || from_qu_id || '/' || to_qu_id || '/' -- We need to keep track of the conversion path in order to prevent cycles
	FROM default_conversions

	UNION

	-- Recursive case: Find all paths
	SELECT
		c.depth + 1,
		c.from_qu_id,
		s.to_qu_id,
		c.factor * s.factor,
		c.path || s.to_qu_id || '/'
	FROM default_closure c
	JOIN default_conversions s
		ON c.to_qu_id = s.from_qu_id
	WHERE c.path NOT LIKE ('%/' || s.to_qu_id || '/%') -- Prevent cycles
		AND NOT EXISTS(SELECT 1 FROM default_conversions ci WHERE ci.from_qu_id = c.from_qu_id AND ci.to_qu_id = s.to_qu_id) -- Prune if one of the existing conversions repeats (saves a lot of processing time)

),

default_closure_distinct(from_qu_id, to_qu_id, factor, path)
AS (
	SELECT DISTINCT
		from_qu_id,
		to_qu_id,
		FIRST_VALUE(factor) OVER win AS factor,
		FIRST_VALUE(path) OVER win AS path
	FROM default_closure
	GROUP BY from_qu_id, to_qu_id
	WINDOW win AS (PARTITION BY from_qu_id, to_qu_id ORDER BY depth)
	ORDER BY from_qu_id, to_qu_id
),

product_conversions(product_id, from_qu_id, to_qu_id, factor)
AS (
	-- Priority 1: Product-specific QU overrides
	-- Note that the quantity_unit_conversions table already contains both conversion directions for every conversion.
	SELECT
		product_id,
		from_qu_id,
		to_qu_id,
		factor
	FROM quantity_unit_conversions
	WHERE product_id IS NOT NULL

	UNION

	-- Priority 2: QU conversions with a factor of 1.0 from the stock unit to the stock unit
	SELECT
		id,
		qu_id_stock,
		qu_id_stock,
		1.0
	FROM products
),

product_closure(depth, product_id, from_qu_id, to_qu_id, factor, path)
AS (
	-- As a base case, select all available product-specific conversions
	SELECT
		1 as depth,
		product_id,
		from_qu_id,
		to_qu_id,
		factor,
		'/' || from_qu_id || '/' || to_qu_id || '/' -- We need to keep track of the conversion path in order to prevent cycles
	FROM product_conversions

	UNION

	-- Recursive case: Find all paths
	SELECT
		c.depth + 1,
		c.product_id,
		c.from_qu_id,
		s.to_qu_id,
		c.factor * s.factor,
		c.path || s.to_qu_id || '/'
	FROM product_closure c
	JOIN product_conversions s
		ON c.product_id = s.product_id
		AND c.to_qu_id = s.from_qu_id
	WHERE c.path NOT LIKE ('%/' || s.to_qu_id || '/%') -- Prevent cycles
		AND NOT EXISTS(SELECT 1 FROM product_conversions ci WHERE ci.product_id = c.product_id AND ci.from_qu_id = c.from_qu_id AND ci.to_qu_id = s.to_qu_id) -- Prune if one of the existing conversions repeats (saves a lot of processing time)
),

product_closure_distinct(product_id, from_qu_id, to_qu_id, factor, path)
AS (
	SELECT DISTINCT
		product_id,
		from_qu_id,
		to_qu_id,
		FIRST_VALUE(factor) OVER win AS factor,
		FIRST_VALUE(path) OVER win AS path
	FROM product_closure
	GROUP BY product_id, from_qu_id, to_qu_id
	WINDOW win AS (PARTITION BY product_id, from_qu_id, to_qu_id ORDER BY depth)
	ORDER BY product_id, from_qu_id, to_qu_id
),

-- Now we connect the two closures by adding the reachable conversions from product specific conversions to default conversions
product_reachable(product_id, from_qu_id, to_qu_id, factor, path)
AS (
	SELECT
		product_id,
		from_qu_id,
		to_qu_id,
		factor,
		path
	FROM product_closure_distinct

	UNION

	SELECT
		cd.product_id,
		dcd.from_qu_id,
		dcd.to_qu_id,
		dcd.factor,
		'/' || dcd.from_qu_id || '/' || dcd.to_qu_id || '/'
	FROM product_closure_distinct cd
	JOIN default_closure_distinct dcd
		ON cd.to_qu_id = dcd.from_qu_id
		OR cd.to_qu_id = dcd.to_qu_id
	WHERE NOT EXISTS(SELECT 1 FROM product_closure_distinct ci WHERE ci.product_id = cd.product_id AND ci.from_qu_id = dcd.from_qu_id AND ci.to_qu_id = dcd.to_qu_id)
),

product_reachable_distinct(product_id, from_qu_id, to_qu_id, factor, path)
AS (
	SELECT DISTINCT
		product_id,
		from_qu_id,
		to_qu_id,
		FIRST_VALUE(factor) OVER win AS factor,
		FIRST_VALUE(path) OVER win AS path
	FROM product_reachable
	GROUP BY product_id, from_qu_id, to_qu_id
	WINDOW win AS (PARTITION BY product_id, from_qu_id, to_qu_id)
	ORDER BY product_id, from_qu_id, to_qu_id
),

-- Finally we build the combined closure
closure_final(depth, product_id, from_qu_id, to_qu_id, factor, path)
AS (
	-- As a base case, select the product closure
	SELECT
		1,
		product_id,
		from_qu_id,
		to_qu_id,
		factor,
		path -- We need to keep track of the conversion path in order to prevent cycles
	FROM product_reachable_distinct

	UNION

	-- Add a default unit conversion to the *end* of the conversion chain
	SELECT
		c.depth + 1,
		c.product_id,
		c.from_qu_id,
		s.to_qu_id,
		c.factor * s.factor,
		c.path || s.to_qu_id || '/'
	FROM closure_final c
	JOIN product_reachable_distinct s
		ON c.product_id = s.product_id
		AND c.to_qu_id = s.from_qu_id
	WHERE c.path NOT LIKE ('%/' || s.to_qu_id || '/%') -- Prevent cycles
		AND NOT EXISTS(SELECT 1 FROM product_reachable_distinct ci WHERE ci.product_id = c.product_id AND ci.from_qu_id = c.from_qu_id AND ci.to_qu_id = s.to_qu_id) -- Prune (if already exists)
)

SELECT DISTINCT
	-1 AS id, -- Dummy, LessQL needs an id column
	c.product_id,
	c.from_qu_id,
	qu_from.name AS from_qu_name,
	qu_from.name_plural AS from_qu_name_plural,
	c.to_qu_id,
	qu_to.name AS to_qu_name,
	qu_to.name_plural AS to_qu_name_plural,
	FIRST_VALUE(c.factor) OVER win AS factor,
	FIRST_VALUE(c.path) OVER win AS path
FROM closure_final c
JOIN quantity_units qu_from
	ON c.from_qu_id = qu_from.id
JOIN quantity_units qu_to
	ON c.to_qu_id = qu_to.id
GROUP BY c.product_id, c.from_qu_id, c.to_qu_id
WINDOW win AS (PARTITION BY c.product_id, c.from_qu_id, c.to_qu_id ORDER BY c.depth)
ORDER BY c.product_id, c.from_qu_id, c.to_qu_id
```

### recipes_pos_resolved
Schema resolution needs runtime functions: no such function: grocy_user_setting

### battery_charge_cycles

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `battery_id` | INTEGER | No | `None` | Required |
| `tracked_time` | DATETIME | Yes | `None` | Optional/defaulted |
| `undone` | TINYINT | No | `0` | Optional/defaulted |
| `undone_timestamp` | DATETIME | Yes | `None` | Optional/defaulted |
| `row_created_timestamp` | DATETIME | Yes | `datetime('now', 'localtime')` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE battery_charge_cycles (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	battery_id INTEGER NOT NULL,
	tracked_time DATETIME,
	undone TINYINT NOT NULL DEFAULT 0 CHECK(undone IN (0, 1)),
	undone_timestamp DATETIME,
	row_created_timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
)
```

### product_barcodes_view

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | Yes | `None` | Optional/defaulted |
| `product_id` | INT | Yes | `None` | Optional/defaulted |
| `barcode` | TEXT | Yes | `None` | Optional/defaulted |
| `qu_id` | INT | Yes | `None` | Optional/defaulted |
| `amount` | REAL | Yes | `None` | Optional/defaulted |
| `shopping_location_id` | INTEGER | Yes | `None` | Optional/defaulted |
| `last_price` | DECIMAL(15, 2) | Yes | `None` | Optional/defaulted |
| `note` | TEXT | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE VIEW product_barcodes_view
AS
SELECT
	pb.id,
	pb.product_id,
	pb.barcode,
	pb.qu_id,
	pb.amount,
	pb.shopping_location_id,
	pb.last_price,
	pb.note
FROM product_barcodes pb

UNION ALL

-- Product Grocycodes
SELECT
	p.id,
	p.id AS product_id,
	'grcy:p:' || CAST(p.id AS TEXT) AS barcode,
	p.qu_id_stock AS qu_id,
	NULL AS amount,
	NULL AS shopping_location_id,
	NULL AS last_price,
	NULL AS note
FROM products p
```

### permission_hierarchy

| Column | SQLite type | Null allowed | Default | Create input |
| --- | --- | --- | --- | --- |
| `id` | INTEGER | No | `None` | Generated/identifier |
| `name` | TEXT | No | `None` | Required |
| `parent` | INTEGER | Yes | `None` | Optional/defaulted |

DDL and view calculation (source-derived):
```sql
CREATE TABLE permission_hierarchy
(
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	name TEXT NOT NULL UNIQUE,
	parent INTEGER NULL -- If the user has the parent permission, the user also has the child permission
)
```

## Declared OpenAPI DTOs
These are local OpenAPI declarations, not runtime validation. The catalogue runtime notes and actual SQL columns take precedence. `$ref` names point to other headings here. Unknown/additional properties must be tolerated; computed DTO enrichment is described by each route.

### Product declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "location_id": {
      "type": "integer"
    },
    "qu_id_purchase": {
      "type": "integer"
    },
    "qu_id_stock": {
      "type": "integer"
    },
    "enable_tare_weight_handling": {
      "type": "integer"
    },
    "not_check_stock_fulfillment_for_recipes": {
      "type": "integer"
    },
    "product_group_id": {
      "type": "integer"
    },
    "tare_weight": {
      "type": "number"
    },
    "min_stock_amount": {
      "type": "number",
      "minimum": 0,
      "default": 0
    },
    "default_best_before_days": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "default_best_before_days_after_open": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "picture_file_name": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "shopping_location_id": {
      "type": "integer"
    },
    "treat_opened_as_out_of_stock": {
      "type": "integer"
    },
    "auto_reprint_stock_label": {
      "type": "integer"
    },
    "no_own_stock": {
      "type": "integer"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    },
    "should_not_be_frozen": {
      "type": "integer"
    },
    "default_consume_location_id": {
      "type": "integer"
    },
    "move_on_open": {
      "type": "integer"
    }
  },
  "example": {
    "id": "1",
    "name": "Cookies",
    "description": null,
    "location_id": "4",
    "qu_id_purchase": "3",
    "qu_id_stock": "3",
    "min_stock_amount": "8",
    "default_best_before_days": "0",
    "row_created_timestamp": "2019-05-02 20:12:26",
    "product_group_id": "1",
    "picture_file_name": "cookies.jpg",
    "default_best_before_days_after_open": "0",
    "enable_tare_weight_handling": "0",
    "tare_weight": "0.0",
    "not_check_stock_fulfillment_for_recipes": "0",
    "shopping_location_id": null,
    "userfields": null,
    "should_not_be_frozen": "1",
    "default_consume_location_id": "5",
    "move_on_open": "1"
  }
}
```

### ProductWithoutUserfields declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "location_id": {
      "type": "integer"
    },
    "qu_id_purchase": {
      "type": "integer"
    },
    "qu_id_stock": {
      "type": "integer"
    },
    "enable_tare_weight_handling": {
      "type": "integer"
    },
    "not_check_stock_fulfillment_for_recipes": {
      "type": "integer"
    },
    "product_group_id": {
      "type": "integer"
    },
    "tare_weight": {
      "type": "number"
    },
    "min_stock_amount": {
      "type": "number",
      "minimum": 0,
      "default": 0
    },
    "default_best_before_days": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "default_best_before_days_after_open": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "picture_file_name": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "shopping_location_id": {
      "type": "integer"
    },
    "treat_opened_as_out_of_stock": {
      "type": "integer"
    },
    "auto_reprint_stock_label": {
      "type": "integer"
    },
    "no_own_stock": {
      "type": "integer"
    },
    "should_not_be_frozen": {
      "type": "integer"
    },
    "default_consume_location_id": {
      "type": "integer"
    },
    "move_on_open": {
      "type": "integer"
    }
  },
  "example": {
    "id": "1",
    "name": "Cookies",
    "description": null,
    "location_id": "4",
    "qu_id_purchase": "3",
    "qu_id_stock": "3",
    "min_stock_amount": "8",
    "default_best_before_days": "0",
    "row_created_timestamp": "2019-05-02 20:12:26",
    "product_group_id": "1",
    "picture_file_name": "cookies.jpg",
    "default_best_before_days_after_open": "0",
    "enable_tare_weight_handling": "0",
    "tare_weight": "0.0",
    "not_check_stock_fulfillment_for_recipes": "0",
    "shopping_location_id": null,
    "userfields": null,
    "should_not_be_frozen": "1",
    "default_consume_location_id": "5",
    "move_on_open": "1"
  }
}
```

### QuantityUnit declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "name_plural": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "plural_forms": {
      "type": "string"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    }
  },
  "example": {
    "id": "2",
    "name": "Piece",
    "description": null,
    "row_created_timestamp": "2019-05-02 20:12:25",
    "name_plural": "Pieces",
    "plural_forms": null,
    "userfields": null
  }
}
```

### Location declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    }
  },
  "example": {
    "id": "2",
    "name": "0",
    "description": null,
    "row_created_timestamp": "2019-05-02 20:12:25",
    "userfields": null
  }
}
```

### ShoppingLocation declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    }
  },
  "example": {
    "id": "2",
    "name": "0",
    "description": null,
    "row_created_timestamp": "2019-05-02 20:12:25",
    "userfields": null
  }
}
```

### StockLocation declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "product_id": {
      "type": "integer"
    },
    "amount": {
      "type": "number"
    },
    "location_id": {
      "type": "integer"
    },
    "location_name": {
      "type": "string"
    },
    "location_is_freezer": {
      "type": "integer"
    }
  },
  "example": {
    "id": "1",
    "product_id": "3",
    "amount": "2",
    "location_id": "1",
    "name": "Fridge"
  }
}
```

### StockEntry declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "product_id": {
      "type": "integer"
    },
    "location_id": {
      "type": "integer"
    },
    "shopping_location_id": {
      "type": "integer"
    },
    "amount": {
      "type": "number"
    },
    "best_before_date": {
      "type": "string",
      "format": "date"
    },
    "purchased_date": {
      "type": "string",
      "format": "date"
    },
    "stock_id": {
      "type": "string",
      "description": "A unique id which references this stock entry during its lifetime"
    },
    "price": {
      "type": "number"
    },
    "open": {
      "type": "integer"
    },
    "opened_date": {
      "type": "string",
      "format": "date"
    },
    "note": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  },
  "example": {
    "id": "77",
    "product_id": "1",
    "amount": "2",
    "best_before_date": "2019-07-07",
    "purchased_date": "2019-05-03",
    "stock_id": "5ccc6b2421979",
    "price": null,
    "open": "0",
    "opened_date": null,
    "row_created_timestamp": "2019-05-03 18:24:04",
    "location_id": "4",
    "shopping_location_id": null
  }
}
```

### RecipeFulfillmentResponse declaration
```json
{
  "type": "object",
  "properties": {
    "recipe_id": {
      "type": "integer"
    },
    "need_fulfilled": {
      "type": "boolean"
    },
    "need_fulfilled_with_shopping_list": {
      "type": "boolean"
    },
    "missing_products_count": {
      "type": "integer"
    },
    "costs": {
      "type": "number"
    }
  },
  "example": {
    "recipe_id": "1",
    "need_fulfilled": "0",
    "need_fulfilled_with_shopping_list": "0",
    "missing_products_count": "2",
    "costs": "17.74"
  }
}
```

### ProductDetailsResponse declaration
```json
{
  "type": "object",
  "properties": {
    "product": {
      "$ref": "#/components/schemas/Product"
    },
    "product_barcodes": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ProductBarcode"
      }
    },
    "quantity_unit_stock": {
      "$ref": "#/components/schemas/QuantityUnit"
    },
    "default_quantity_unit_purchase": {
      "$ref": "#/components/schemas/QuantityUnit"
    },
    "default_quantity_unit_consume": {
      "$ref": "#/components/schemas/QuantityUnit"
    },
    "quantity_unit_price": {
      "$ref": "#/components/schemas/QuantityUnit"
    },
    "last_purchased": {
      "type": "string",
      "format": "date"
    },
    "last_used": {
      "type": "string",
      "format": "date"
    },
    "stock_amount": {
      "type": "number"
    },
    "stock_amount_opened": {
      "type": "number"
    },
    "next_due_date": {
      "type": "string",
      "format": "date"
    },
    "last_price": {
      "type": "number",
      "description": "The price of the last purchase of the corresponding product"
    },
    "avg_price": {
      "type": "number",
      "description": "The average price af all stock entries currently in stock of the corresponding product"
    },
    "current_price": {
      "type": "number",
      "description": "The current price of the corresponding product, based on the stock entry to use next (defined by the default consume rule \"Opened first, then first due first, then first in first out\") or on the last price if the product is currently not in stock"
    },
    "oldest_price": {
      "type": "number",
      "description": "This field is deprecated and will be removed in a future version (currently returns the same as `current_price`)",
      "deprecated": true
    },
    "last_shopping_location_id": {
      "type": "integer"
    },
    "location": {
      "$ref": "#/components/schemas/Location"
    },
    "average_shelf_life_days": {
      "type": "number"
    },
    "spoil_rate_percent": {
      "type": "number"
    },
    "has_childs": {
      "type": "boolean",
      "description": "True when the product is a parent product of others"
    },
    "default_location": {
      "$ref": "#/components/schemas/Location"
    },
    "qu_conversion_factor_purchase_to_stock": {
      "type": "number",
      "description": "The conversion factor of the corresponding QU conversion from the product's qu_id_purchase to qu_id_stock"
    },
    "qu_conversion_factor_price_to_stock": {
      "type": "number",
      "description": "The conversion factor of the corresponding QU conversion from the product's qu_id_price to qu_id_stock"
    }
  },
  "example": {
    "product": {
      "id": "1",
      "name": "Cookies",
      "description": null,
      "location_id": "4",
      "qu_id_purchase": "3",
      "qu_id_stock": "3",
      "min_stock_amount": "8",
      "default_best_before_days": "0",
      "row_created_timestamp": "2019-05-02 20:12:26",
      "product_group_id": "1",
      "picture_file_name": "cookies.jpg",
      "default_best_before_days_after_open": "0",
      "enable_tare_weight_handling": "0",
      "tare_weight": "0.0",
      "not_check_stock_fulfillment_for_recipes": "0",
      "last_shopping_location_id": null
    },
    "product_barcodes": [
      {
        "id": "1",
        "product_id": "13",
        "barcode": "01321230213",
        "qu_id": "1",
        "shopping_location_id": "2",
        "amount": "10"
      }
    ],
    "last_purchased": null,
    "last_used": null,
    "stock_amount": "2",
    "stock_amount_opened": null,
    "default_quantity_unit_purchase": {
      "id": "3",
      "name": "Pack",
      "description": null,
      "row_created_timestamp": "2019-05-02 20:12:25",
      "name_plural": "Packs",
      "plural_forms": null
    },
    "quantity_unit_stock": {
      "id": "3",
      "name": "Pack",
      "description": null,
      "row_created_timestamp": "2019-05-02 20:12:25",
      "name_plural": "Packs",
      "plural_forms": null
    },
    "quantity_unit_price": {
      "id": "3",
      "name": "Pack",
      "description": null,
      "row_created_timestamp": "2019-05-02 20:12:25",
      "name_plural": "Packs",
      "plural_forms": null
    },
    "last_price": null,
    "avg_price": null,
    "current_price": null,
    "last_shopping_location_id": null,
    "next_due_date": "2019-07-07",
    "location": {
      "id": "4",
      "name": "Candy cupboard",
      "description": null,
      "row_created_timestamp": "2019-05-02 20:12:25"
    },
    "average_shelf_life_days": -1,
    "spoil_rate_percent": 0,
    "default_consume_location": null
  }
}
```

### ProductPriceHistory declaration
```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date-time"
    },
    "price": {
      "type": "number"
    },
    "shopping_location": {
      "$ref": "#/components/schemas/ShoppingLocation"
    }
  }
}
```

### ProductBarcode declaration
```json
{
  "type": "object",
  "properties": {
    "product_id": {
      "type": "integer"
    },
    "barcode": {
      "type": "string"
    },
    "qu_id": {
      "type": "integer"
    },
    "shopping_location_id": {
      "type": "integer"
    },
    "amount": {
      "type": "number"
    },
    "last_price": {
      "type": "number"
    },
    "note": {
      "type": "string"
    }
  }
}
```

### ExternalBarcodeLookupResponse declaration
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "location_id": {
      "type": "integer"
    },
    "qu_id_purchase": {
      "type": "integer"
    },
    "qu_id_stock": {
      "type": "integer"
    },
    "qu_factor_purchase_to_stock": {
      "type": "number"
    },
    "barcode": {
      "type": "string",
      "description": "Can contain multiple barcodes separated by comma"
    },
    "id": {
      "type": "integer",
      "description": "The id of the added product, only included when the producted was added to the database"
    }
  }
}
```

### ChoreDetailsResponse declaration
```json
{
  "type": "object",
  "properties": {
    "chore": {
      "$ref": "#/components/schemas/Chore"
    },
    "last_tracked": {
      "type": "string",
      "format": "date-time",
      "description": "When this chore was last tracked"
    },
    "track_count": {
      "type": "integer",
      "description": "How often this chore was tracked so far"
    },
    "last_done_by": {
      "$ref": "#/components/schemas/UserDto"
    },
    "next_estimated_execution_time": {
      "type": "string",
      "format": "date-time"
    },
    "next_execution_assigned_user": {
      "$ref": "#/components/schemas/UserDto"
    },
    "average_execution_frequency_hours": {
      "type": "integer",
      "description": "Contains the average past execution frequency in hours or `null`, when the chore was never executed before"
    }
  },
  "example": {
    "chore": {
      "id": 0,
      "name": "string",
      "description": "string",
      "period_type": "manually",
      "period_days": 0,
      "row_created_timestamp": "2019-05-04T11:31:04.563Z"
    },
    "last_tracked": "2019-05-04T11:31:04.563Z",
    "track_count": 0,
    "last_done_by": {
      "id": 0,
      "username": "string",
      "first_name": "string",
      "last_name": "string",
      "display_name": "string",
      "row_created_timestamp": "2019-05-04T11:31:04.564Z"
    },
    "next_estimated_execution_time": "2019-05-04T11:31:04.564Z"
  }
}
```

### BatteryDetailsResponse declaration
```json
{
  "type": "object",
  "properties": {
    "chore": {
      "$ref": "#/components/schemas/Battery"
    },
    "last_charged": {
      "type": "string",
      "format": "date-time",
      "description": "When this battery was last charged"
    },
    "charge_cycles_count": {
      "type": "integer",
      "description": "How often this battery was charged so far"
    },
    "next_estimated_charge_time": {
      "type": "string",
      "format": "date-time"
    }
  },
  "example": {
    "battery": {
      "id": "1",
      "name": "Battery1",
      "description": "Warranty ends 2023",
      "used_in": "TV remote control",
      "charge_interval_days": "0",
      "row_created_timestamp": "2019-05-02 20:12:26"
    },
    "last_charged": "2019-03-13 18:12:28",
    "charge_cycles_count": 4,
    "next_estimated_charge_time": "2999-12-31 23:59:59"
  }
}
```

### Session declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "session_key": {
      "type": "string"
    },
    "expires": {
      "type": "string",
      "format": "date-time"
    },
    "last_used": {
      "type": "string",
      "format": "date-time"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### User declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "username": {
      "type": "string"
    },
    "first_name": {
      "type": "string"
    },
    "last_name": {
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "picture_file_name": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### UserDto declaration
```json
{
  "type": "object",
  "description": "A user object without the *password* and with an additional *display_name* property",
  "properties": {
    "id": {
      "type": "integer"
    },
    "username": {
      "type": "string"
    },
    "first_name": {
      "type": "string"
    },
    "last_name": {
      "type": "string"
    },
    "display_name": {
      "type": "string"
    },
    "picture_file_name": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### ApiKey declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "api_key": {
      "type": "string"
    },
    "expires": {
      "type": "string",
      "format": "date-time"
    },
    "last_used": {
      "type": "string",
      "format": "date-time"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### ShoppingListItem declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "shopping_list_id": {
      "type": "integer"
    },
    "product_id": {
      "type": "integer"
    },
    "note": {
      "type": "string"
    },
    "amount": {
      "type": "number",
      "minimum": 0,
      "default": 0,
      "description": "The manual entered amount"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    }
  }
}
```

### Battery declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "used_in": {
      "type": "string"
    },
    "charge_interval_days": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    }
  }
}
```

### BatteryChargeCycleEntry declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "battery_id": {
      "type": "integer"
    },
    "tracked_time": {
      "type": "string",
      "format": "date-time"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Chore declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "period_type": {
      "type": "string",
      "enum": [
        "manually",
        "hourly",
        "daily",
        "weekly",
        "monthly"
      ]
    },
    "period_config": {
      "type": "string"
    },
    "period_days": {
      "type": "integer"
    },
    "track_date_only": {
      "type": "boolean"
    },
    "rollover": {
      "type": "boolean"
    },
    "assignment_type": {
      "type": "string",
      "enum": [
        "no-assignment",
        "who-least-did-first",
        "random",
        "in-alphabetical-order"
      ]
    },
    "assignment_config": {
      "type": "string"
    },
    "next_execution_assigned_to_user_id": {
      "type": "integer"
    },
    "start_date": {
      "type": "string",
      "format": "date-time"
    },
    "rescheduled_date": {
      "type": "string",
      "format": "date-time"
    },
    "rescheduled_next_execution_assigned_to_user_id": {
      "type": "integer"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    }
  }
}
```

### ChoreLogEntry declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "chore_id": {
      "type": "integer"
    },
    "tracked_time": {
      "type": "string",
      "format": "date-time"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### StockLogEntry declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "product_id": {
      "type": "integer"
    },
    "amount": {
      "type": "number"
    },
    "best_before_date": {
      "type": "string",
      "format": "date"
    },
    "purchased_date": {
      "type": "string",
      "format": "date"
    },
    "used_date": {
      "type": "string",
      "format": "date"
    },
    "spoiled": {
      "type": "boolean",
      "default": false
    },
    "stock_id": {
      "type": "string"
    },
    "transaction_id": {
      "type": "string"
    },
    "transaction_type": {
      "$ref": "#/components/schemas/StockTransactionType"
    },
    "note": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### StockJournal declaration
```json
{
  "type": "object",
  "properties": {
    "correlation_id": {
      "type": "string"
    },
    "undone": {
      "type": "integer"
    },
    "undone_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "amount": {
      "type": "number"
    },
    "location_id": {
      "type": "integer"
    },
    "location_name": {
      "type": "string"
    },
    "product_name": {
      "type": "string"
    },
    "qu_name": {
      "type": "string"
    },
    "qu_name_plural": {
      "type": "string"
    },
    "user_display_name": {
      "type": "string"
    },
    "spoiled": {
      "type": "boolean",
      "default": false
    },
    "transaction_type": {
      "$ref": "#/components/schemas/StockTransactionType"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  },
  "example": {
    "id": "1",
    "correlation_id": null,
    "undone": "0",
    "undone_timestamp": null,
    "transaction_type": "purchase",
    "spoiled": "0",
    "amount": "1",
    "location_id": "4",
    "location_name": "Candy cupboard",
    "product_name": "Gummy bears",
    "qu_name": "Pack",
    "qu_name_plural": "Packs",
    "user_display_name": "Demo User",
    "row_created_timestamp": "2020-11-14 16:42:21"
  }
}
```

### StockJournalSummary declaration
```json
{
  "type": "object",
  "properties": {
    "amount": {
      "type": "number"
    },
    "user_id": {
      "type": "integer"
    },
    "product_name": {
      "type": "string"
    },
    "product_id": {
      "type": "integer"
    },
    "qu_name": {
      "type": "string"
    },
    "qu_name_plural": {
      "type": "string"
    },
    "user_display_name": {
      "type": "string"
    },
    "transaction_type": {
      "$ref": "#/components/schemas/StockTransactionType"
    }
  },
  "example": {
    "id": "1",
    "user_id": "1",
    "user_display_name": "Demo User",
    "product_name": "Chocolate",
    "product_id": "2",
    "transaction_type": "purchase",
    "qu_name": "Pack",
    "qu_name_plural": "Packs",
    "amount": "1"
  }
}
```

### Error400 declaration
```json
{
  "type": "object",
  "properties": {
    "error_message": {
      "type": "string"
    }
  },
  "example": {
    "error_message": "The error message..."
  }
}
```

### Error500 declaration
```json
{
  "type": "object",
  "properties": {
    "error_message": {
      "type": "string"
    },
    "error_details": {
      "type": "object",
      "properties": {
        "stack_trace": {
          "type": "string"
        },
        "file": {
          "type": "string"
        },
        "line": {
          "type": "integer"
        }
      }
    }
  },
  "example": {
    "error_message": "The error message..."
  }
}
```

### CurrentStockResponse declaration
```json
{
  "type": "object",
  "properties": {
    "product_id": {
      "type": "integer"
    },
    "amount": {
      "type": "number"
    },
    "amount_aggregated": {
      "type": "number"
    },
    "amount_opened": {
      "type": "number"
    },
    "amount_opened_aggregated": {
      "type": "number"
    },
    "best_before_date": {
      "type": "string",
      "format": "date",
      "description": "The next due date for this product"
    },
    "is_aggregated_amount": {
      "type": "boolean",
      "description": "Indicates wheter this product has sub-products or not / if the fields `amount_aggregated` and `amount_opened_aggregated` are filled"
    },
    "product": {
      "$ref": "#/components/schemas/ProductWithoutUserfields"
    }
  }
}
```

### CurrentChoreResponse declaration
```json
{
  "type": "object",
  "properties": {
    "chore_id": {
      "type": "integer"
    },
    "chore_name": {
      "type": "string"
    },
    "last_tracked_time": {
      "type": "string",
      "format": "date-time"
    },
    "track_date_only": {
      "type": "boolean"
    },
    "next_estimated_execution_time": {
      "type": "string",
      "format": "date-time",
      "description": "The next estimated execution time of this chore, 2999-12-31 23:59:59 when the given chore has a period_type of manually"
    },
    "next_execution_assigned_to_user_id": {
      "type": "integer"
    },
    "is_rescheduled": {
      "type": "boolean"
    },
    "is_reassigned": {
      "type": "boolean"
    },
    "next_execution_assigned_user": {
      "$ref": "#/components/schemas/UserDto"
    }
  }
}
```

### CurrentBatteryResponse declaration
```json
{
  "type": "object",
  "properties": {
    "battery_id": {
      "type": "integer"
    },
    "last_tracked_time": {
      "type": "string",
      "format": "date-time"
    },
    "next_estimated_charge_time": {
      "type": "string",
      "format": "date-time",
      "description": "The next estimated charge time of this battery, 2999-12-31 23:59:59 when the given battery has no charge_interval_days defined"
    }
  }
}
```

### CurrentVolatilStockResponse declaration
```json
{
  "type": "object",
  "properties": {
    "due_products": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CurrentStockResponse"
      }
    },
    "overdue_products": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CurrentStockResponse"
      }
    },
    "expired_products": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CurrentStockResponse"
      }
    },
    "missing_products": {
      "type": "array",
      "items": {
        "properties": {
          "id": {
            "type": "integer"
          },
          "name": {
            "type": "string"
          },
          "amount_missing": {
            "type": "number"
          },
          "is_partly_in_stock": {
            "type": "integer"
          }
        }
      }
    }
  }
}
```

### Task declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "due_date": {
      "type": "string",
      "format": "date-time"
    },
    "done": {
      "type": "integer"
    },
    "done_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "category_id": {
      "type": "integer"
    },
    "assigned_to_user_id": {
      "type": "integer"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "userfields": {
      "type": "object",
      "description": "Key/value pairs of userfields"
    }
  }
}
```

### TaskCategory declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### CurrentTaskResponse declaration
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "due_date": {
      "type": "string",
      "format": "date-time"
    },
    "done": {
      "type": "integer"
    },
    "done_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "category_id": {
      "type": "integer"
    },
    "assigned_to_user_id": {
      "type": "integer"
    },
    "row_created_timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "assigned_to_user": {
      "$ref": "#/components/schemas/UserDto"
    },
    "category": {
      "$ref": "#/components/schemas/TaskCategory"
    }
  }
}
```

### DbChangedTimeResponse declaration
```json
{
  "type": "object",
  "properties": {
    "changed_time": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### TimeResponse declaration
```json
{
  "type": "object",
  "properties": {
    "timezone": {
      "type": "string"
    },
    "time_local": {
      "type": "string",
      "format": "date-time"
    },
    "time_local_sqlite3": {
      "type": "string",
      "format": "date-time"
    },
    "time_utc": {
      "type": "string",
      "format": "date-time"
    },
    "timestamp": {
      "type": "integer"
    },
    "offset": {
      "type": "integer"
    }
  }
}
```

### UserSetting declaration
```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "string"
    }
  }
}
```

### MissingLocalizationRequest declaration
```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string"
    }
  }
}
```

### ExposedEntity declaration
```json
{
  "type": "string",
  "enum": [
    "products",
    "chores",
    "product_barcodes",
    "batteries",
    "locations",
    "quantity_units",
    "quantity_unit_conversions",
    "shopping_list",
    "shopping_lists",
    "shopping_locations",
    "recipes",
    "recipes_pos",
    "recipes_nestings",
    "tasks",
    "task_categories",
    "product_groups",
    "equipment",
    "api_keys",
    "userfields",
    "userentities",
    "userobjects",
    "meal_plan",
    "stock_log",
    "stock",
    "stock_current_locations",
    "chores_log",
    "meal_plan_sections",
    "products_last_purchased",
    "products_average_price",
    "quantity_unit_conversions_resolved",
    "recipes_pos_resolved",
    "battery_charge_cycles",
    "product_barcodes_view",
    "permission_hierarchy"
  ]
}
```

### ExposedEntityNoListing declaration
```json
{
  "type": "string",
  "enum": [
    "api_keys"
  ]
}
```

### ExposedEntityNoEdit declaration
```json
{
  "type": "string",
  "enum": [
    "stock_log",
    "api_keys",
    "stock",
    "stock_current_locations",
    "chores_log",
    "products_last_purchased",
    "products_average_price",
    "quantity_unit_conversions_resolved",
    "recipes_pos_resolved",
    "battery_charge_cycles",
    "product_barcodes_view",
    "permission_hierarchy"
  ]
}
```

### ExposedEntityNoDelete declaration
```json
{
  "type": "string",
  "enum": [
    "stock_log",
    "stock",
    "stock_current_locations",
    "chores_log",
    "products_last_purchased",
    "products_average_price",
    "quantity_unit_conversions_resolved",
    "recipes_pos_resolved",
    "battery_charge_cycles",
    "product_barcodes_view",
    "permission_hierarchy"
  ]
}
```

### ExposedEntityEditRequiresAdmin declaration
```json
{
  "type": "string",
  "enum": []
}
```

### StockTransactionType declaration
```json
{
  "type": "string",
  "enum": [
    "purchase",
    "consume",
    "inventory-correction",
    "product-opened"
  ]
}
```

### FileGroups declaration
```json
{
  "type": "string",
  "enum": [
    "equipmentmanuals",
    "recipepictures",
    "productpictures",
    "userfiles",
    "userpictures"
  ]
}
```

### StringEnumTemplate declaration
```json
{
  "type": "string",
  "enum": [
    ""
  ]
}
```

## Custom response fields
`Requirement` from RecipesService::GetMealPlanShoppingRequirements: product_id, product_name, stock_qu_id, purchase_qu_id, minimum_stock_amount, required_amount_stock, stock_amount, missing_amount_stock, shopping_list_amount_stock, still_need_to_buy_stock, still_need_to_buy_purchase, sources[]. Each source has meal_plan_entry_id, day, recipe_id, recipe_name, required_amount_stock. `WrittenItem`: product_id, action (insert/update), amount_added, qu_id. Units matter: written amounts use purchase or existing item units, not universally stock units.
Battery `state` is service-derived; inspect GetBatteryState for values. The database battery fields, including used_in, rechargeable, is_charged and active, take precedence over the older OpenAPI Battery declaration.

## Runtime computed rows and DTO enrichment

These source-reconstructed view fields are not additional generic API entities. They complement and may differ from declared OpenAPI DTOs. Grocy SQLite function names were registered with placeholder implementations solely to resolve view metadata; no calculated row values were evaluated or validated. Do not submit computed fields in writes.

### stock_current

Fields: `product_id`, `amount`, `amount_aggregated`, `value`, `best_before_date`, `amount_opened`, `amount_opened_aggregated`, `is_aggregated_amount`, `due_type`.

```sql
CREATE VIEW stock_current
AS
SELECT
	pr.parent_product_id AS product_id,
	IFNULL((SELECT SUM(amount) FROM stock WHERE product_id = pr.parent_product_id), 0) AS amount,
	SUM(s.amount * IFNULL(qucr.factor, 1.0)) AS amount_aggregated,
	IFNULL(ROUND((SELECT SUM(IFNULL(price,0) * amount) FROM stock WHERE product_id = pr.parent_product_id), 2), 0)  AS value,
	MIN(s.best_before_date) AS best_before_date,
	IFNULL((SELECT SUM(amount) FROM stock WHERE product_id = pr.parent_product_id AND open = 1), 0) AS amount_opened,
	IFNULL((SELECT SUM(amount) FROM stock WHERE product_id IN (SELECT sub_product_id FROM products_resolved WHERE parent_product_id = pr.parent_product_id) AND open = 1), 0) * IFNULL(qucr.factor, 1) AS amount_opened_aggregated,
	CASE WHEN COUNT(p_sub.parent_product_id) > 0  THEN 1 ELSE 0 END AS is_aggregated_amount,
	MAX(p_parent.due_type) AS due_type
FROM products_resolved pr
JOIN stock s
	ON pr.sub_product_id = s.product_id
JOIN products p_parent
	ON pr.parent_product_id = p_parent.id
	AND p_parent.active = 1
JOIN products p_sub
	ON pr.sub_product_id = p_sub.id
	AND p_sub.active = 1
LEFT JOIN cache__quantity_unit_conversions_resolved qucr
	ON pr.sub_product_id = qucr.product_id
	AND p_sub.qu_id_stock = qucr.from_qu_id
	AND p_parent.qu_id_stock = qucr.to_qu_id
GROUP BY pr.parent_product_id
HAVING SUM(s.amount) > 0

UNION

-- This is the same as above but sub products not rolled up (no QU conversion and column is_aggregated_amount = 0 here)
SELECT
	pr.sub_product_id AS product_id,
	SUM(s.amount) AS amount,
	SUM(s.amount) AS amount_aggregated,
	ROUND(SUM(IFNULL(s.price, 0) * s.amount), 2) AS value,
	MIN(s.best_before_date) AS best_before_date,
	IFNULL((SELECT SUM(amount) FROM stock WHERE product_id = s.product_id AND open = 1), 0) AS amount_opened,
	IFNULL((SELECT SUM(amount) FROM stock WHERE product_id = s.product_id AND open = 1), 0) AS amount_opened_aggregated,
	0 AS is_aggregated_amount,
	MAX(p_sub.due_type) AS due_type
FROM products_resolved pr
JOIN stock s
	ON pr.sub_product_id = s.product_id
JOIN products p_sub
	ON pr.sub_product_id = p_sub.id
	AND p_sub.active = 1
WHERE pr.parent_product_id != pr.sub_product_id
GROUP BY pr.sub_product_id
HAVING SUM(s.amount) > 0
```

### chores_current

Fields: `id`, `chore_id`, `chore_name`, `last_tracked_time`, `next_estimated_execution_time`, `track_date_only`, `next_execution_assigned_to_user_id`, `is_rescheduled`, `is_reassigned`.

```sql
CREATE VIEW chores_current
AS
SELECT
	x.chore_id AS id, -- Dummy, LessQL needs an id column
	x.chore_id,
	x.chore_name,
	x.last_tracked_time,
	CASE WHEN x.rollover = 1 AND DATETIME('now', 'localtime') > x.next_estimated_execution_time THEN
		CASE WHEN IFNULL(x.track_date_only, 0) = 1 THEN
			DATETIME(STRFTIME('%Y-%m-%d', DATETIME('now', 'localtime')) || ' 23:59:59')
		ELSE
			DATETIME(STRFTIME('%Y-%m-%d', DATETIME('now', 'localtime')) || ' ' || STRFTIME('%H:%M:%S', x.next_estimated_execution_time))
		END
	ELSE
		CASE WHEN IFNULL(x.track_date_only, 0) = 1 THEN
			DATETIME(STRFTIME('%Y-%m-%d', x.next_estimated_execution_time) || ' 23:59:59')
		ELSE
			x.next_estimated_execution_time
		END
	END AS next_estimated_execution_time,
	x.track_date_only,
	x.next_execution_assigned_to_user_id,
	CASE WHEN IFNULL(x.rescheduled_date, '') != '' THEN 1 ELSE 0 END AS is_rescheduled,
	CASE WHEN IFNULL(x.rescheduled_next_execution_assigned_to_user_id, '') != '' THEN 1 ELSE 0 END AS is_reassigned
FROM (

SELECT
	h.id AS chore_id,
	h.name AS chore_name,
	MAX(l.tracked_time) AS last_tracked_time,
	CASE WHEN IFNULL(h.rescheduled_date, '') != '' THEN
		h.rescheduled_date
	ELSE
		CASE WHEN MAX(l.tracked_time) IS NULL AND h.period_type != 'manually' THEN
			h.start_date
		ELSE
			CASE h.period_type
				WHEN 'manually' THEN NULL
				WHEN 'hourly' THEN DATETIME(MAX(l.tracked_time), '+' || CAST(h.period_interval AS TEXT) || ' hour')
				WHEN 'daily' THEN DATETIME(SUBSTR(CAST(DATETIME(MAX(l.tracked_time), '+' || CAST(h.period_interval AS TEXT) || ' days') AS TEXT), 1, 11) || SUBSTR(CAST(h.start_date AS TEXT), -8))
				WHEN 'weekly' THEN (
					SELECT next
						FROM (
						SELECT 'sunday' AS day, DATETIME((SELECT tracked_time FROM chores_log WHERE chore_id = h.id ORDER BY tracked_time DESC LIMIT 1), '1 days', '+' || CAST((h.period_interval - 1) * 7 AS TEXT) || ' days', 'weekday 0') AS next
						UNION
						SELECT 'monday' AS day, DATETIME((SELECT tracked_time FROM chores_log WHERE chore_id = h.id ORDER BY tracked_time DESC LIMIT 1), '1 days', '+' || CAST((h.period_interval - 1) * 7 AS TEXT) || ' days', 'weekday 1') AS next
						UNION
						SELECT 'tuesday' AS day, DATETIME((SELECT tracked_time FROM chores_log WHERE chore_id = h.id ORDER BY tracked_time DESC LIMIT 1), '1 days', '+' || CAST((h.period_interval - 1) * 7 AS TEXT) || ' days', 'weekday 2') AS next
						UNION
						SELECT 'wednesday' AS day, DATETIME((SELECT tracked_time FROM chores_log WHERE chore_id = h.id ORDER BY tracked_time DESC LIMIT 1), '1 days', '+' || CAST((h.period_interval - 1) * 7 AS TEXT) || ' days', 'weekday 3') AS next
						UNION
						SELECT 'thursday' AS day, DATETIME((SELECT tracked_time FROM chores_log WHERE chore_id = h.id ORDER BY tracked_time DESC LIMIT 1), '1 days', '+' || CAST((h.period_interval - 1) * 7 AS TEXT) || ' days', 'weekday 4') AS next
						UNION
						SELECT 'friday' AS day, DATETIME((SELECT tracked_time FROM chores_log WHERE chore_id = h.id ORDER BY tracked_time DESC LIMIT 1), '1 days', '+' || CAST((h.period_interval - 1) * 7 AS TEXT) || ' days', 'weekday 5') AS next
						UNION
						SELECT 'saturday' AS day, DATETIME((SELECT tracked_time FROM chores_log WHERE chore_id = h.id ORDER BY tracked_time DESC LIMIT 1), '1 days', '+' || CAST((h.period_interval - 1) * 7 AS TEXT) || ' days', 'weekday 6') AS next
					)
					WHERE INSTR(period_config, day) > 0
					ORDER BY next
					LIMIT 1
				)
				WHEN 'monthly' THEN DATETIME(MAX(l.tracked_time), 'start of month', '+' || CAST(h.period_interval AS TEXT) || ' month', '+' || CAST(h.period_days - 1 AS TEXT) || ' day')
				WHEN 'yearly' THEN DATETIME(SUBSTR(CAST(DATETIME(MAX(l.tracked_time), '+' || CAST(h.period_interval AS TEXT) || ' years') AS TEXT), 1, 4) || SUBSTR(CAST(h.start_date AS TEXT), 5, 6) || SUBSTR(CAST(DATETIME(MAX(l.tracked_time), '+' || CAST(h.period_interval AS TEXT) || ' years') AS TEXT), -9))
				WHEN 'adaptive' THEN DATETIME(MAX(l.tracked_time), '+' || CAST(IFNULL((SELECT average_frequency_hours FROM chores_execution_average_frequency WHERE chore_id = h.id), 0) AS TEXT) || ' hour')
			END
		END
	END AS next_estimated_execution_time,
	h.track_date_only,
	h.rollover,
	h.next_execution_assigned_to_user_id,
	h.rescheduled_date,
	h.rescheduled_next_execution_assigned_to_user_id
FROM chores h
LEFT JOIN chores_log l
	ON h.id = l.chore_id
	AND l.undone = 0
WHERE h.active = 1
GROUP BY h.id, h.name, h.period_days
) x
```

### batteries_current

Fields: `id`, `battery_id`, `last_tracked_time`, `next_estimated_charge_time`.

```sql
CREATE VIEW batteries_current
AS
SELECT
	b.id, -- Dummy, LessQL needs an id column
	b.id AS battery_id,
	MAX(l.tracked_time) AS last_tracked_time,
	CASE WHEN b.charge_interval_days = 0
		THEN '2999-12-31 23:59:59'
		ELSE datetime(MAX(l.tracked_time), '+' || CAST(b.charge_interval_days AS TEXT) || ' day')
	END AS next_estimated_charge_time
FROM batteries b
LEFT JOIN battery_charge_cycles l
	ON b.id = l.battery_id
	AND l.undone = 0
WHERE b.active = 1
GROUP BY b.id, b.charge_interval_days
```

### tasks_current

Fields: `id`, `name`, `description`, `due_date`, `done`, `done_timestamp`, `category_id`, `assigned_to_user_id`, `row_created_timestamp`.

```sql
CREATE VIEW tasks_current
AS
SELECT *
FROM tasks
WHERE done = 0
```

### recipes_resolved

Fields: `id`, `recipe_id`, `need_fulfilled`, `need_fulfilled_with_shopping_list`, `missing_products_count`, `costs`, `costs_per_serving`, `calories`, `due_score`, `product_names_comma_separated`, `prices_incomplete`.

```sql
CREATE VIEW recipes_resolved
AS
SELECT
	1 AS id, -- Dummy, LessQL needs an id column
	r.id AS recipe_id,
	IFNULL(MIN(rpr.need_fulfilled), 1) AS need_fulfilled,
	IFNULL(MIN(rpr.need_fulfilled_with_shopping_list), 1) AS need_fulfilled_with_shopping_list,
	IFNULL(rmpc.missing_products_count, 0) AS missing_products_count,
	IFNULL(SUM(rpr.costs), 0) AS costs,
	IFNULL(SUM(rpr.costs) / CASE WHEN IFNULL(r.desired_servings, 0) = 0 THEN 1 ELSE r.desired_servings END, 0) AS costs_per_serving,
	IFNULL(SUM(rpr.calories), 0) AS calories,
	IFNULL(SUM(rpr.due_score), 0) AS due_score,
	GROUP_CONCAT(rpr.product_name) AS product_names_comma_separated,
	CASE WHEN MIN(IFNULL(rpr.costs, 0)) = 0 THEN 1 ELSE 0 END AS prices_incomplete
FROM recipes r
LEFT JOIN recipes_pos_resolved rpr
	ON r.id = rpr.recipe_id
LEFT JOIN recipes_missing_product_counts rmpc
	ON r.id = rmpc.recipe_id
GROUP BY r.id
```

### users_dto

Fields: `id`, `username`, `first_name`, `last_name`, `row_created_timestamp`, `display_name`, `picture_file_name`.

```sql
CREATE VIEW users_dto
AS
SELECT
	id,
	username,
	first_name,
	last_name,
	row_created_timestamp,
	(CASE
		WHEN IFNULL(first_name, '') = '' AND IFNULL(last_name, '') != '' THEN last_name
		WHEN IFNULL(last_name, '') = '' AND IFNULL(first_name, '') != '' THEN first_name
		WHEN IFNULL(last_name, '') != '' AND IFNULL(first_name, '') != '' THEN first_name || ' ' || last_name
		ELSE username
	END
	) AS display_name,
	picture_file_name
FROM users
```

### products_price_history

Fields: `id`, `product_id`, `price`, `amount`, `purchased_date`, `shopping_location_id`, `transaction_type`.

```sql
CREATE VIEW products_price_history
AS
SELECT
	sl.product_id AS id, -- Dummy, LessQL needs an id column
	sl.product_id,
	sl.price,
	IFNULL(sl.edited_origin_amount, sl.amount) AS amount,
	sl.purchased_date,
	sl.shopping_location_id,
	sl.transaction_type
FROM (
	SELECT sl.*, CASE WHEN sl.transaction_type = 'stock-edit-new' THEN see.edited_origin_amount END AS edited_origin_amount
	FROM stock_log sl
	LEFT JOIN stock_edited_entries see
		ON sl.stock_id = see.stock_id
) sl
WHERE sl.undone = 0
	AND (
		(sl.transaction_type IN ('purchase', 'inventory-correction', 'self-production') AND sl.stock_id NOT IN (SELECT stock_id FROM stock_edited_entries)) -- Unedited origin entries
		OR (sl.transaction_type = 'stock-edit-new' AND sl.id IN (SELECT stock_log_id_of_newest_edited_entry FROM stock_edited_entries)) -- Edited origin entries => take the newest "stock-edit-new" one
	)
	AND IFNULL(sl.price, 0) > 0
	AND IFNULL(sl.amount, 0) > 0
```

### uihelper_stock_current_overview

Fields: `id`, `amount_opened`, `tare_weight`, `enable_tare_weight_handling`, `amount`, `value`, `product_id`, `best_before_date`, `product_missing`, `product_name`, `product_group_name`, `default_store_name`, `on_shopping_list`, `qu_stock_name`, `qu_stock_name_plural`, `qu_purchase_name`, `qu_purchase_name_plural`, `qu_consume_name`, `qu_consume_name_plural`, `qu_price_name`, `qu_price_name_plural`, `is_aggregated_amount`, `amount_opened_aggregated`, `amount_aggregated`, `product_calories`, `calories`, `calories_aggregated`, `quick_consume_amount`, `quick_consume_amount_qu_consume`, `quick_open_amount`, `quick_open_amount_qu_consume`, `due_type`, `last_purchased`, `last_price`, `average_price`, `min_stock_amount`, `product_barcodes`, `product_description`, `product_default_location_name`, `parent_product_id`, `parent_product_name`, `product_picture_file_name`, `product_no_own_stock`, `product_qu_factor_purchase_to_stock`, `product_qu_factor_price_to_stock`, `is_in_stock_or_below_min_stock`, `disable_open`.

```sql
CREATE VIEW uihelper_stock_current_overview
AS
SELECT
	p.id,
	sc.amount_opened AS amount_opened,
	p.tare_weight AS tare_weight,
	p.enable_tare_weight_handling AS enable_tare_weight_handling,
	sc.amount AS amount,
	sc.value as value,
	sc.product_id AS product_id,
	IFNULL(sc.best_before_date, '2888-12-31') AS best_before_date,
	EXISTS(SELECT id FROM stock_missing_products WHERE id = sc.product_id) AS product_missing,
	p.name AS product_name,
	pg.name AS product_group_name,
	sl.name AS default_store_name,
	EXISTS(SELECT * FROM shopping_list WHERE shopping_list.product_id = sc.product_id) AS on_shopping_list,
	qu_stock.name AS qu_stock_name,
	qu_stock.name_plural AS qu_stock_name_plural,
	qu_purchase.name AS qu_purchase_name,
	qu_purchase.name_plural AS qu_purchase_name_plural,
	qu_consume.name AS qu_consume_name,
	qu_consume.name_plural AS qu_consume_name_plural,
	qu_price.name AS qu_price_name,
	qu_price.name_plural AS qu_price_name_plural,
	sc.is_aggregated_amount,
	sc.amount_opened_aggregated,
	sc.amount_aggregated,
	p.calories AS product_calories,
	sc.amount * p.calories AS calories,
	sc.amount_aggregated * p.calories AS calories_aggregated,
	p.quick_consume_amount,
	p.quick_consume_amount / p.qu_factor_consume_to_stock AS quick_consume_amount_qu_consume,
	p.quick_open_amount,
	p.quick_open_amount / p.qu_factor_consume_to_stock AS quick_open_amount_qu_consume,
	p.due_type,
	plp.purchased_date AS last_purchased,
	plp.price AS last_price,
	pap.price as average_price,
	p.min_stock_amount,
	pbcs.barcodes AS product_barcodes,
	p.description AS product_description,
	l.name AS product_default_location_name,
	p_parent.id AS parent_product_id,
	p_parent.name AS parent_product_name,
	p.picture_file_name AS product_picture_file_name,
	p.no_own_stock AS product_no_own_stock,
	p.qu_factor_purchase_to_stock AS product_qu_factor_purchase_to_stock,
	p.qu_factor_price_to_stock AS product_qu_factor_price_to_stock,
	sc.is_in_stock_or_below_min_stock,
	p.disable_open
FROM (
	SELECT *, 1 AS is_in_stock_or_below_min_stock
	FROM stock_current
	WHERE best_before_date IS NOT NULL
	UNION
	SELECT m.id, 0, 0, 0, null, 0, 0, 0, p.due_type, 1 AS is_in_stock_or_below_min_stock
	FROM stock_missing_products m
	JOIN products p
		ON m.id = p.id
	WHERE m.id NOT IN (SELECT product_id FROM stock_current)
	UNION
	SELECT p2.id, 0, 0, 0, null, 0, 0, 0, p2.due_type, 0 AS is_in_stock_or_below_min_stock
	FROM products p2
	WHERE active = 1
		AND p2.id NOT IN (SELECT product_id FROM stock_current UNION SELECT id FROM stock_missing_products)
	) sc
JOIN products_view p
    ON sc.product_id = p.id
JOIN locations l
	ON p.location_id = l.id
JOIN quantity_units qu_stock
	ON p.qu_id_stock = qu_stock.id
JOIN quantity_units qu_purchase
	ON p.qu_id_purchase = qu_purchase.id
JOIN quantity_units qu_consume
	ON p.qu_id_consume = qu_consume.id
JOIN quantity_units qu_price
	ON p.qu_id_price = qu_price.id
LEFT JOIN product_groups pg
	ON p.product_group_id = pg.id
LEFT JOIN shopping_locations sl
	ON p.shopping_location_id = sl.id
LEFT JOIN cache__products_last_purchased plp
	ON sc.product_id = plp.product_id
LEFT JOIN cache__products_average_price pap
	ON sc.product_id = pap.product_id
LEFT JOIN product_barcodes_comma_separated pbcs
	ON sc.product_id = pbcs.product_id
LEFT JOIN products p_parent
	ON p.parent_product_id = p_parent.id
WHERE p.hide_on_stock_overview = 0
```

### uihelper_stock_journal

Fields: `id`, `row_created_timestamp`, `correlation_id`, `undone`, `undone_timestamp`, `transaction_type`, `spoiled`, `amount`, `location_id`, `location_name`, `product_name`, `qu_name`, `qu_name_plural`, `user_display_name`, `product_id`, `note`, `stock_id`.

```sql
CREATE VIEW uihelper_stock_journal
AS
SELECT
	sl.id,
	sl.row_created_timestamp,
	sl.correlation_id,
	sl.undone,
	sl.undone_timestamp,
	sl.transaction_type,
	sl.spoiled,
	sl.amount,
	sl.location_id,
	l.name AS location_name,
	p.name AS product_name,
	qu.name AS qu_name,
	qu.name_plural AS qu_name_plural,
	u.display_name AS user_display_name,
	p.id AS product_id,
	sl.note,
	sl.stock_id
FROM stock_log sl
LEFT JOIN users_dto u
	ON sl.user_id = u.id
JOIN products p
	ON sl.product_id = p.id
JOIN locations l
	ON sl.location_id = l.id
JOIN quantity_units qu
	ON p.qu_id_stock = qu.id
```

### uihelper_stock_journal_summary

Fields: `id`, `user_id`, `user_display_name`, `product_name`, `product_id`, `transaction_type`, `qu_name`, `qu_name_plural`, `amount`.

```sql
CREATE VIEW uihelper_stock_journal_summary
AS
SELECT
	user_id AS id, -- Dummy, LessQL needs an id column
	user_id, u.display_name AS user_display_name,
	p.name AS product_name,
	product_id,
	transaction_type,
	qu.name AS qu_name,
	qu.name_plural AS qu_name_plural,
	SUM(amount) AS amount
FROM stock_log sl
JOIN users_dto u
	on sl.user_id = u.id
JOIN products p
	ON sl.product_id = p.id
JOIN quantity_units qu
	ON p.qu_id_stock = qu.id
WHERE undone = 0
GROUP BY user_id, product_id, transaction_type
```

Service enrichment: GetCurrentStock adds `product`; TasksService::GetCurrent adds `assigned_to_user` and `category`; BatteriesService::GetCurrent adds `battery`; ChoresService::GetCurrent adds `next_execution_assigned_user`. Product detail fields follow StockService::GetProductDetails as well as the declared DTO. Battery detail state enum is `inactive`, `in_use`, `needs_charging`, `ready`, evaluated in that precedence. Chore detail includes `average_execution_frequency_hours`. Price history returns `date`, `price`, nested `shopping_location`. UserDto fields come from users_dto, not the users table.

## Entity trigger dependencies

Generic writes can activate these database triggers. Inspect the latest definition in migrations for conditional effects; do not implement a second copy in React.

| Exposed entity | Attached triggers |
| --- | --- |
| products | `cascade_change_qu_id_stock`, `cascade_change_qu_id_stock2`, `cascade_product_removal`, `default_qu_id_consume`, `default_qu_id_price`, `enforce_min_stock_amount_for_cumulated_childs_INS`, `enforce_min_stock_amount_for_cumulated_childs_UPD`, `enforce_parent_product_id_null_when_empty_INS`, `enforce_parent_product_id_null_when_empty_UPD`, `enfore_product_nesting_level`, `products_DELETE`, `products_INS`, `products_UPD`, `products_default_qu_conversions_INS`, `products_default_qu_conversions_UPD` |
| chores | `cascade_chore_removal`, `default_start_date_when_empty_INS`, `default_start_date_when_empty_UPD` |
| product_barcodes | `default_qu_INS`, `default_qu_UPD`, `prevent_adding_barcodes_for_not_existing_products` |
| batteries | `cascade_battery_removal` |
| locations | None attached in reconstructed SQL schema |
| quantity_units | `remove_conversions` |
| quantity_unit_conversions | `qu_conversions_custom_constraint_INS`, `qu_conversions_custom_constraint_UPD`, `quantity_unit_conversions_DEL`, `quantity_unit_conversions_INS`, `quantity_unit_conversions_UPD` |
| shopping_list | `shopping_list_defaults_INS`, `shopping_list_defaults_UPD` |
| shopping_lists | `remove_items_from_deleted_shopping_list` |
| shopping_locations | None attached in reconstructed SQL schema |
| recipes | `recipes_desired_servings_default`, `remove_recipe_from_meal_plans` |
| recipes_pos | `recipes_pos_qu_id_default` |
| recipes_nestings | `prevent_infinite_nested_recipes_INS`, `prevent_infinite_nested_recipes_UPD`, `prevent_self_nested_recipes_INS`, `prevent_self_nested_recipes_UPD` |
| tasks | None attached in reconstructed SQL schema |
| task_categories | None attached in reconstructed SQL schema |
| product_groups | None attached in reconstructed SQL schema |
| equipment | None attached in reconstructed SQL schema |
| api_keys | None attached in reconstructed SQL schema |
| userfields | `cascade_userfield_removal` |
| userentities | None attached in reconstructed SQL schema |
| userobjects | None attached in reconstructed SQL schema |
| meal_plan | `create_internal_recipe`, `remove_internal_recipe`, `update_internal_recipe` |
| stock_log | `set_products_default_location_if_empty_stock_log`, `stock_log_DEL`, `stock_log_INS`, `stock_log_UPD` |
| stock | `prevent_adding_no_own_stock_products_to_stock`, `set_products_default_location_if_empty_stock` |
| stock_current_locations | None attached in reconstructed SQL schema |
| chores_log | None attached in reconstructed SQL schema |
| meal_plan_sections | `prevent_internal_meal_plan_section_removal` |
| products_last_purchased | None attached in reconstructed SQL schema |
| products_average_price | None attached in reconstructed SQL schema |
| quantity_unit_conversions_resolved | None attached in reconstructed SQL schema |
| recipes_pos_resolved | None attached in reconstructed SQL schema |
| battery_charge_cycles | None attached in reconstructed SQL schema |
| product_barcodes_view | None attached in reconstructed SQL schema |
| permission_hierarchy | None attached in reconstructed SQL schema |
