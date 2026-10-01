# Grocy API route catalogue
Baseline: commit 5555e15070c17ff0a14b8460928525c0c6a5c1b5, local version 4.6.0. Coverage: **91 registered method/path pairs under /api**, plus the OPTIONS wildcard. Every entry has input, response, permission, error and dependency information. See [plan](react-rewrite-plan.md), [schema dictionary](react-api-schemas.md) and [verification scenarios](react-rewrite-verification.md).
## Shared contract
Paths below include /api; prepend the configured deployment base path. All operations pass global authentication except configured auth bypass modes. Default authentication tries GROCY-API-KEY header (also supported as query parameter) then session cookie. Calendar secret works only on named iCal/action routes. No permission listed means no explicit controller action check, not public access.
Send exactly Content-Type: application/json for filtered JSON bodies (charset suffix is rejected). Use {} for optional-body commands that parse JSON. File uploads are raw streams. R means required; O means optional. Required path values are always required even when repeated body notes focus on fields.
Q means repeated query[]=fieldOPvalue, order=field:asc|desc, limit integer, offset integer. Conditions combine through SQL where; operators =, !=, ~, !~, <, >, <=, >=, § (regexp). No OR expression language, arbitrary SQL, count envelope or cursor. Missing limit with offset becomes -1. The parser has restricted value syntax, so encoded full timestamps/complex values need verification; do not assume every string can be filtered. Q only applies where explicitly marked.
Success: JSON is unwrapped; 200 by default. 204 means no usable body, even where handler wrote JSON before changing status. Binary/iCal routes preserve MIME via Content-Disposition. JSON number/string/boolean/null handling must be checked against fixtures; do not silently coerce absent and zero values.
Common errors E: unauthenticated API request generally empty 401; uncaught HttpException keeps its status (including 400 bad content type, 403 permission denial); uncaught other Throwable uses 500 JSON {error_message,error_details?}. Error details are enabled by current app.php. Caught Exception typically becomes 400 JSON {error_message}. TypeErrors can escape to global 500. Subdirectory paths may be misclassified as HTML by the literal /api/ prefix check: validate redirects/content-type at deployment base path. Not every missing resource is 404.
The per-route error notes distinguish local catches and list source throw messages from reachable controller/service methods. They are not an exhaustive list of PDO, filesystem, plugin, network or PHP messages. Source links permit inspection of conditional errors and side effects. OpenAPI response/body descriptions below are declarations; runtime notes override discrepancies.
## Route index
| ID | Method and path | Handler |
| --- | --- | --- |
| A001 | [GET /api/openapi/specification](#a001) | OpenApiController::DocumentationSpec |
| A002 | [GET /api/system/info](#a002) | SystemApiController::GetSystemInfo |
| A003 | [GET /api/system/time](#a003) | SystemApiController::GetSystemTime |
| A004 | [GET /api/system/db-changed-time](#a004) | SystemApiController::GetDbChangedTime |
| A005 | [GET /api/system/config](#a005) | SystemApiController::GetConfig |
| A006 | [POST /api/system/log-missing-localization](#a006) | SystemApiController::LogMissingLocalization |
| A007 | [GET /api/system/localization-strings](#a007) | SystemApiController::GetLocalizationStrings |
| A008 | [GET /api/objects/{entity}](#a008) | GenericEntityApiController::GetObjects |
| A009 | [GET /api/objects/{entity}/{objectId}](#a009) | GenericEntityApiController::GetObject |
| A010 | [POST /api/objects/{entity}](#a010) | GenericEntityApiController::AddObject |
| A011 | [PUT /api/objects/{entity}/{objectId}](#a011) | GenericEntityApiController::EditObject |
| A012 | [DELETE /api/objects/{entity}/{objectId}](#a012) | GenericEntityApiController::DeleteObject |
| A013 | [GET /api/userfields/{entity}/{objectId}](#a013) | GenericEntityApiController::GetUserfields |
| A014 | [PUT /api/userfields/{entity}/{objectId}](#a014) | GenericEntityApiController::SetUserfields |
| A015 | [PUT /api/files/{group}/{fileName}](#a015) | FilesApiController::UploadFile |
| A016 | [GET /api/files/{group}/{fileName}](#a016) | FilesApiController::ServeFile |
| A017 | [DELETE /api/files/{group}/{fileName}](#a017) | FilesApiController::DeleteFile |
| A018 | [GET /api/users](#a018) | UsersApiController::GetUsers |
| A019 | [POST /api/users](#a019) | UsersApiController::CreateUser |
| A020 | [PUT /api/users/{userId}](#a020) | UsersApiController::EditUser |
| A021 | [DELETE /api/users/{userId}](#a021) | UsersApiController::DeleteUser |
| A022 | [GET /api/users/{userId}/permissions](#a022) | UsersApiController::ListPermissions |
| A023 | [POST /api/users/{userId}/permissions](#a023) | UsersApiController::AddPermission |
| A024 | [PUT /api/users/{userId}/permissions](#a024) | UsersApiController::SetPermissions |
| A025 | [GET /api/user](#a025) | UsersApiController::CurrentUser |
| A026 | [GET /api/user/settings](#a026) | UsersApiController::GetUserSettings |
| A027 | [GET /api/user/settings/{settingKey}](#a027) | UsersApiController::GetUserSetting |
| A028 | [PUT /api/user/settings/{settingKey}](#a028) | UsersApiController::SetUserSetting |
| A029 | [DELETE /api/user/settings/{settingKey}](#a029) | UsersApiController::DeleteUserSetting |
| A030 | [GET /api/stock](#a030) | StockApiController::CurrentStock |
| A031 | [GET /api/stock/entry/{entryId}](#a031) | StockApiController::StockEntry |
| A032 | [PUT /api/stock/entry/{entryId}](#a032) | StockApiController::EditStockEntry |
| A033 | [GET /api/stock/volatile](#a033) | StockApiController::CurrentVolatileStock |
| A034 | [GET /api/stock/products/{productId}](#a034) | StockApiController::ProductDetails |
| A035 | [GET /api/stock/products/{productId}/entries](#a035) | StockApiController::ProductStockEntries |
| A036 | [GET /api/stock/products/{productId}/locations](#a036) | StockApiController::ProductStockLocations |
| A037 | [GET /api/stock/products/{productId}/price-history](#a037) | StockApiController::ProductPriceHistory |
| A038 | [POST /api/stock/products/{productId}/add](#a038) | StockApiController::AddProduct |
| A039 | [POST /api/stock/products/{productId}/consume](#a039) | StockApiController::ConsumeProduct |
| A040 | [POST /api/stock/products/{productId}/transfer](#a040) | StockApiController::TransferProduct |
| A041 | [POST /api/stock/products/{productId}/inventory](#a041) | StockApiController::InventoryProduct |
| A042 | [POST /api/stock/products/{productId}/open](#a042) | StockApiController::OpenProduct |
| A043 | [POST /api/stock/products/{productIdToKeep}/merge/{productIdToRemove}](#a043) | StockApiController::MergeProducts |
| A044 | [GET /api/stock/products/by-barcode/{barcode}](#a044) | StockApiController::ProductDetailsByBarcode |
| A045 | [POST /api/stock/products/by-barcode/{barcode}/add](#a045) | StockApiController::AddProductByBarcode |
| A046 | [POST /api/stock/products/by-barcode/{barcode}/consume](#a046) | StockApiController::ConsumeProductByBarcode |
| A047 | [POST /api/stock/products/by-barcode/{barcode}/transfer](#a047) | StockApiController::TransferProductByBarcode |
| A048 | [POST /api/stock/products/by-barcode/{barcode}/inventory](#a048) | StockApiController::InventoryProductByBarcode |
| A049 | [POST /api/stock/products/by-barcode/{barcode}/open](#a049) | StockApiController::OpenProductByBarcode |
| A050 | [GET /api/stock/locations/{locationId}/entries](#a050) | StockApiController::LocationStockEntries |
| A051 | [GET /api/stock/bookings/{bookingId}](#a051) | StockApiController::StockBooking |
| A052 | [POST /api/stock/bookings/{bookingId}/undo](#a052) | StockApiController::UndoBooking |
| A053 | [GET /api/stock/transactions/{transactionId}](#a053) | StockApiController::StockTransactions |
| A054 | [POST /api/stock/transactions/{transactionId}/undo](#a054) | StockApiController::UndoTransaction |
| A055 | [GET /api/stock/barcodes/external-lookup/{barcode}](#a055) | StockApiController::ExternalBarcodeLookup |
| A056 | [GET /api/stock/products/{productId}/printlabel](#a056) | StockApiController::ProductPrintLabel |
| A057 | [GET /api/stock/entry/{entryId}/printlabel](#a057) | StockApiController::StockEntryPrintLabel |
| A058 | [POST /api/stock/shoppinglist/add-missing-products](#a058) | StockApiController::AddMissingProductsToShoppingList |
| A059 | [POST /api/stock/shoppinglist/add-overdue-products](#a059) | StockApiController::AddOverdueProductsToShoppingList |
| A060 | [POST /api/stock/shoppinglist/add-expired-products](#a060) | StockApiController::AddExpiredProductsToShoppingList |
| A061 | [POST /api/stock/shoppinglist/clear](#a061) | StockApiController::ClearShoppingList |
| A062 | [POST /api/stock/shoppinglist/add-product](#a062) | StockApiController::AddProductToShoppingList |
| A063 | [POST /api/stock/shoppinglist/remove-product](#a063) | StockApiController::RemoveProductFromShoppingList |
| A064 | [POST /api/recipes/mealplan/add-shopping-requirements](#a064) | RecipesApiController::AddMealPlanShoppingRequirementsToShoppingList |
| A065 | [POST /api/recipes/{recipeId}/add-not-fulfilled-products-to-shoppinglist](#a065) | RecipesApiController::AddNotFulfilledProductsToShoppingList |
| A066 | [GET /api/recipes/{recipeId}/fulfillment](#a066) | RecipesApiController::GetRecipeFulfillment |
| A067 | [POST /api/recipes/{recipeId}/consume](#a067) | RecipesApiController::ConsumeRecipe |
| A068 | [GET /api/recipes/fulfillment](#a068) | RecipesApiController::GetRecipeFulfillment |
| A069 | [POST /api/recipes/{recipeId}/copy](#a069) | RecipesApiController::CopyRecipe |
| A070 | [GET /api/recipes/{recipeId}/printlabel](#a070) | RecipesApiController::RecipePrintLabel |
| A071 | [GET /api/chores](#a071) | ChoresApiController::Current |
| A072 | [GET /api/chores/{choreId}](#a072) | ChoresApiController::ChoreDetails |
| A073 | [POST /api/chores/{choreId}/execute](#a073) | ChoresApiController::TrackChoreExecution |
| A074 | [POST /api/chores/executions/{executionId}/undo](#a074) | ChoresApiController::UndoChoreExecution |
| A075 | [POST /api/chores/executions/calculate-next-assignments](#a075) | ChoresApiController::CalculateNextExecutionAssignments |
| A076 | [GET /api/chores/{choreId}/printlabel](#a076) | ChoresApiController::ChorePrintLabel |
| A077 | [POST /api/chores/{choreIdToKeep}/merge/{choreIdToRemove}](#a077) | ChoresApiController::MergeChores |
| A078 | [GET /api/print/shoppinglist/thermal](#a078) | PrintApiController::PrintShoppingListThermal |
| A079 | [GET /api/batteries](#a079) | BatteriesApiController::Current |
| A080 | [GET /api/batteries/{batteryId}](#a080) | BatteriesApiController::BatteryDetails |
| A081 | [POST /api/batteries/{batteryId}/charge](#a081) | BatteriesApiController::TrackChargeCycle |
| A082 | [POST /api/batteries/{batteryId}/replace](#a082) | BatteriesApiController::ReplaceBattery |
| A083 | [POST /api/batteries/charge-cycles/{chargeCycleId}/undo](#a083) | BatteriesApiController::UndoChargeCycle |
| A084 | [GET /api/batteries/{batteryId}/printlabel](#a084) | BatteriesApiController::BatteryPrintLabel |
| A085 | [GET /api/tasks](#a085) | TasksApiController::Current |
| A086 | [POST /api/tasks/{taskId}/complete](#a086) | TasksApiController::MarkTaskAsCompleted |
| A087 | [POST /api/tasks/{taskId}/undo](#a087) | TasksApiController::UndoTask |
| A088 | [GET /api/calendar/ical](#a088) | CalendarApiController::Ical |
| A089 | [GET /api/calendar/ical/sharing-link](#a089) | CalendarApiController::IcalSharingLink |
| A090 | [GET /api/calendar/ical/chores/{choreId}/mark-as-done](#a090) | CalendarApiController::IcalChoreMarkAsDone |
| A091 | [GET /api/calendar/ical/chores/{choreId}/skip](#a091) | CalendarApiController::IcalChoreSkip |
| AOPT | [OPTIONS /api/{routes:.+}](#aopt) | CorsMiddleware |

<a id="a001"></a>
## A001 GET /api/openapi/specification

**Implementation:** [OpenApiController::DocumentationSpec](../controllers/Api/OpenApiController.php#L48).

**Request and success response:** No request body. 200 OpenAPI document with deployment server URL, version and generated userentity enums. Reads checked-in specification and UserfieldsService; this does not add runtime routes.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [UserfieldsService::GetEntities](../services/UserfieldsService.php#L40)

Referenced database relations: `userentities`.

**OpenAPI discrepancy:** No matching operation in checked-in specification; use implementation contract above.

<a id="a002"></a>
## A002 GET /api/system/info

**Implementation:** [SystemApiController::GetSystemInfo](../controllers/Api/SystemApiController.php#L47).

**Request and success response:** No parameters. 200 object: grocy_version {Version, ReleaseDate}, php_version, sqlite_version, db_version, os, client.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [ApplicationService::GetSystemInfo](../services/ApplicationService.php#L62), [ApplicationService::GetInstalledVersion](../services/ApplicationService.php#L52)

Referenced database relations: `migrations`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "An DbChangedTimeResponse object",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "grocy_version": {
                "type": "object",
                "properties": {
                  "Version": {
                    "type": "string"
                  },
                  "ReleaseDate": {
                    "type": "string",
                    "format": "date"
                  }
                }
              },
              "php_version": {
                "type": "string"
              },
              "sqlite_version": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
}
```

<a id="a003"></a>
## A003 GET /api/system/time

**Implementation:** [SystemApiController::GetSystemTime](../controllers/Api/SystemApiController.php#L52).

**Request and success response:** O query offset: integer seconds, default 0. 200 {timezone,time_local,time_local_sqlite3,time_utc,timestamp,offset}. Invalid integer: 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Query parameter `.

**Dependencies:** [ApplicationService::GetSystemTime](../services/ApplicationService.php#L98)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "$ref": "#/components/parameters/offsettime"
    }
  ],
  "responses": {
    "200": {
      "description": "A TimeResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/TimeResponse"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a004"></a>
## A004 GET /api/system/db-changed-time

**Implementation:** [SystemApiController::GetDbChangedTime](../controllers/Api/SystemApiController.php#L40).

**Request and success response:** No parameters. 200 {changed_time}; suitable as an invalidation signal, not a per-record version.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [DatabaseService::GetDbChangedTime](../services/DatabaseService.php#L59), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "An DbChangedTimeResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/DbChangedTimeResponse"
          }
        }
      }
    }
  }
}
```

<a id="a005"></a>
## A005 GET /api/system/config

**Implementation:** [SystemApiController::GetConfig](../controllers/Api/SystemApiController.php#L13).

**Request and success response:** No parameters. 200 object of GROCY_* constants with prefix removed, excluding AUTHENTICATED, DATAPATH, IS_EMBEDDED_INSTALL, USER_ID. Not a dedicated safe bootstrap DTO; consume only needed fields.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** Direct database/specification access in the implementation; shared BaseApiController, database schema/triggers and authentication apply.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "Key/value pairs of config settings",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "Key/value pairs of config settings"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a006"></a>
## A006 POST /api/system/log-missing-localization

**Implementation:** [SystemApiController::LogMissingLocalization](../controllers/Api/SystemApiController.php#L76).

**Request and success response:** R JSON text:string in dev mode; 204. Outside dev mode the handler returns no Response, so do not call it in production; likely framework error, requires runtime confirmation.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "description": "A valid MissingLocalizationRequest object",
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/MissingLocalizationRequest"
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a007"></a>
## A007 GET /api/system/localization-strings

**Implementation:** [SystemApiController::GetLocalizationStrings](../controllers/Api/SystemApiController.php#L94).

**Request and success response:** No parameters. 200 PO-derived translation object, Cache-Control max-age=2592000. Does not supply the separate quantity-unit catalogue injected by Blade.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [LocalizationService::GetPoAsJsonString](../services/LocalizationService.php#L65)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "A gettext JSON representation"
          }
        }
      }
    }
  }
}
```

<a id="a008"></a>
## A008 GET /api/objects/{entity}

**Implementation:** [GenericEntityApiController::GetObjects](../controllers/Api/GenericEntityApiController.php#L223).

**Request and success response:** R entity path. O Q query parameters. 200 array of database rows; userfields added only when definitions exist. Entity API schema below defines fields. Invalid/unlistable entity 400; uncaught SQL/filter failures use global errors.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

Source-defined error messages: `Entity does not exist or is not exposed`.

**Dependencies:** [UserfieldsService::GetFields](../services/UserfieldsService.php#L66), [UserfieldsService::IsValidExposedEntity](../services/UserfieldsService.php#L149), [UserfieldsService::GetEntities](../services/UserfieldsService.php#L40), [UserfieldsService::GetAllValues](../services/UserfieldsService.php#L29), [GenericEntityApiController::IsValidExposedEntity](../controllers/Api/GenericEntityApiController.php#L321), [GenericEntityApiController::IsEntityWithNoListing](../controllers/Api/GenericEntityApiController.php#L306)

Referenced database relations: `userentities`, `userfield_values_resolved`, `userfields`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entity",
      "required": true,
      "description": "A valid entity name",
      "schema": {
        "$ref": "#/components/schemas/ExposedEntity_NotIncludingNotListable"
      }
    },
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An entity object",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "oneOf": [
                {
                  "$ref": "#/components/schemas/Product"
                },
                {
                  "$ref": "#/components/schemas/Chore"
                },
                {
                  "$ref": "#/components/schemas/Battery"
                },
                {
                  "$ref": "#/components/schemas/Location"
                },
                {
                  "$ref": "#/components/schemas/QuantityUnit"
                },
                {
                  "$ref": "#/components/schemas/ShoppingListItem"
                },
                {
                  "$ref": "#/components/schemas/StockEntry"
                },
                {
                  "$ref": "#/components/schemas/ProductBarcode"
                }
              ]
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a009"></a>
## A009 GET /api/objects/{entity}/{objectId}

**Implementation:** [GenericEntityApiController::GetObject](../controllers/Api/GenericEntityApiController.php#L194).

**Request and success response:** R entity and objectId paths. 200 database row with userfields map or null; missing row 404; invalid/unlistable entity 400. Stock userfields use stock_id instead of numeric row id.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

Source-defined error messages: `Entity does not exist or is not exposed`.

**Dependencies:** [UserfieldsService::GetValues](../services/UserfieldsService.php#L76), [UserfieldsService::IsValidExposedEntity](../services/UserfieldsService.php#L149), [UserfieldsService::GetEntities](../services/UserfieldsService.php#L40), [UserfieldsService::GetFields](../services/UserfieldsService.php#L66), [GenericEntityApiController::IsValidExposedEntity](../controllers/Api/GenericEntityApiController.php#L321), [GenericEntityApiController::IsEntityWithNoListing](../controllers/Api/GenericEntityApiController.php#L306)

Referenced database relations: `userentities`, `userfield_values_resolved`, `userfields`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entity",
      "required": true,
      "description": "A valid entity name",
      "schema": {
        "$ref": "#/components/schemas/ExposedEntity_NotIncludingNotListable"
      }
    },
    {
      "in": "path",
      "name": "objectId",
      "required": true,
      "description": "A valid object id of the given entity",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "An entity object",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "oneOf": [
              {
                "$ref": "#/components/schemas/Product"
              },
              {
                "$ref": "#/components/schemas/Chore"
              },
              {
                "$ref": "#/components/schemas/Battery"
              },
              {
                "$ref": "#/components/schemas/Location"
              },
              {
                "$ref": "#/components/schemas/QuantityUnit"
              },
              {
                "$ref": "#/components/schemas/ShoppingListItem"
              },
              {
                "$ref": "#/components/schemas/StockEntry"
              },
              {
                "$ref": "#/components/schemas/ProductBarcode"
              }
            ]
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    },
    "404": {
      "description": "Object not found",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a010"></a>
## A010 POST /api/objects/{entity}

**Implementation:** [GenericEntityApiController::AddObject](../controllers/Api/GenericEntityApiController.php#L14).

**Request and success response:** R entity path and JSON column/value object (see entity dictionary). 200 {created_object_id}; not 201. Database constraints apply; no universal DTO validator. Product creation may auto-add missing products to shopping lists according to user settings.

**Permissions:** Entity-dependent mutation policy in [schema dictionary](react-api-schemas.md#generic-entity-policies).

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `Shopping list does not exist`.

**Dependencies:** [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [GenericEntityApiController::IsValidExposedEntity](../controllers/Api/GenericEntityApiController.php#L321), [GenericEntityApiController::IsEntityWithNoEdit](../controllers/Api/GenericEntityApiController.php#L311), [GenericEntityApiController::IsEntityWithEditRequiresAdmin](../controllers/Api/GenericEntityApiController.php#L301)

Referenced database relations: `lastInsertId`, `products`, `shopping_list`, `shopping_lists`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entity",
      "required": true,
      "description": "A valid entity name",
      "schema": {
        "$ref": "#/components/schemas/ExposedEntity_NotIncludingNotEditable"
      }
    }
  ],
  "requestBody": {
    "description": "A valid entity object of the entity specified in parameter *entity*",
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "oneOf": [
            {
              "$ref": "#/components/schemas/Product"
            },
            {
              "$ref": "#/components/schemas/Chore"
            },
            {
              "$ref": "#/components/schemas/Battery"
            },
            {
              "$ref": "#/components/schemas/Location"
            },
            {
              "$ref": "#/components/schemas/QuantityUnit"
            },
            {
              "$ref": "#/components/schemas/ShoppingListItem"
            },
            {
              "$ref": "#/components/schemas/StockEntry"
            },
            {
              "$ref": "#/components/schemas/ProductBarcode"
            }
          ]
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "created_object_id": {
                "type": "integer",
                "description": "The id of the created object"
              }
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a011"></a>
## A011 PUT /api/objects/{entity}/{objectId}

**Implementation:** [GenericEntityApiController::EditObject](../controllers/Api/GenericEntityApiController.php#L128).

**Request and success response:** R entity/objectId paths and JSON column/value object; supplied columns updated, 204. Missing row 400. Product updates may auto-add missing products. Do not PUT enriched response fields or userfields inside this object.

**Permissions:** Entity-dependent mutation policy in [schema dictionary](react-api-schemas.md#generic-entity-policies).

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `Shopping list does not exist`.

**Dependencies:** [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [GenericEntityApiController::IsValidExposedEntity](../controllers/Api/GenericEntityApiController.php#L321), [GenericEntityApiController::IsEntityWithNoEdit](../controllers/Api/GenericEntityApiController.php#L311), [GenericEntityApiController::IsEntityWithEditRequiresAdmin](../controllers/Api/GenericEntityApiController.php#L301)

Referenced database relations: `products`, `shopping_list`, `shopping_lists`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entity",
      "required": true,
      "description": "A valid entity name",
      "schema": {
        "$ref": "#/components/schemas/ExposedEntity_NotIncludingNotEditable"
      }
    },
    {
      "in": "path",
      "name": "objectId",
      "required": true,
      "description": "A valid object id of the given entity",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "description": "A valid entity object of the entity specified in parameter *entity*",
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "oneOf": [
            {
              "$ref": "#/components/schemas/Product"
            },
            {
              "$ref": "#/components/schemas/Chore"
            },
            {
              "$ref": "#/components/schemas/Battery"
            },
            {
              "$ref": "#/components/schemas/Location"
            },
            {
              "$ref": "#/components/schemas/QuantityUnit"
            },
            {
              "$ref": "#/components/schemas/ShoppingListItem"
            },
            {
              "$ref": "#/components/schemas/StockEntry"
            },
            {
              "$ref": "#/components/schemas/ProductBarcode"
            }
          ]
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a012"></a>
## A012 DELETE /api/objects/{entity}/{objectId}

**Implementation:** [GenericEntityApiController::DeleteObject](../controllers/Api/GenericEntityApiController.php#L78).

**Request and success response:** R entity/objectId paths; no body required. 204; missing object 400. Database triggers/cascades apply. SQL delete failures are not wrapped by a local catch.

**Permissions:** Entity-dependent mutation policy in [schema dictionary](react-api-schemas.md#generic-entity-policies).

**Errors:** Common E. No generic local catch; unhandled failures → global errors. Permission denial → 403 (check occurs outside the generic catch).

**Dependencies:** [GenericEntityApiController::IsValidExposedEntity](../controllers/Api/GenericEntityApiController.php#L321), [GenericEntityApiController::IsEntityWithNoDelete](../controllers/Api/GenericEntityApiController.php#L316), [GenericEntityApiController::IsEntityWithEditRequiresAdmin](../controllers/Api/GenericEntityApiController.php#L301)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entity",
      "required": true,
      "description": "A valid entity name",
      "schema": {
        "$ref": "#/components/schemas/ExposedEntity_NotIncludingNotDeletable"
      }
    },
    {
      "in": "path",
      "name": "objectId",
      "required": true,
      "description": "A valid object id of the given entity",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a013"></a>
## A013 GET /api/userfields/{entity}/{objectId}

**Implementation:** [GenericEntityApiController::GetUserfields](../controllers/Api/GenericEntityApiController.php#L267).

**Request and success response:** R entity/objectId paths; entity accepts users and userentity-NAME in addition to exposed entities. 200 field-name/value map; empty definitions encode as [] rather than {}. No per-object existence check.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Entity does not exist or is not exposed`.

**Dependencies:** [UserfieldsService::GetValues](../services/UserfieldsService.php#L76), [UserfieldsService::IsValidExposedEntity](../services/UserfieldsService.php#L149), [UserfieldsService::GetEntities](../services/UserfieldsService.php#L40), [UserfieldsService::GetFields](../services/UserfieldsService.php#L66)

Referenced database relations: `userentities`, `userfield_values_resolved`, `userfields`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entity",
      "required": true,
      "description": "A valid entity name",
      "schema": {
        "$ref": "#/components/schemas/ExposedEntity_IncludingUserEntities"
      }
    },
    {
      "in": "path",
      "name": "objectId",
      "required": true,
      "description": "A valid object id of the given entity",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "Key/value pairs of userfields",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "Key/value pairs of userfields"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a014"></a>
## A014 PUT /api/userfields/{entity}/{objectId}

**Implementation:** [GenericEntityApiController::SetUserfields](../controllers/Api/GenericEntityApiController.php#L279).

**Request and success response:** R entity/objectId and JSON field-name/value map. 204. Unknown entity/field 400. Writes supplied values individually; no all-or-nothing guarantee. For stock use stock_id; for custom objects use userentity-NAME with userobjects.id.

**Permissions:** MASTER_DATA_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `Entity does not exist or is not exposed`; `Field $key is not a valid userfield of the given entity`.

**Dependencies:** [UserfieldsService::SetValues](../services/UserfieldsService.php#L103), [UserfieldsService::IsValidExposedEntity](../services/UserfieldsService.php#L149), [UserfieldsService::GetEntities](../services/UserfieldsService.php#L40)

Referenced database relations: `userentities`, `userfield_values`, `userfields`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entity",
      "required": true,
      "description": "A valid entity name",
      "schema": {
        "$ref": "#/components/schemas/ExposedEntity_IncludingUserEntities_NotIncludingNotEditable"
      }
    },
    {
      "in": "path",
      "name": "objectId",
      "required": true,
      "description": "A valid object id of the given entity",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "description": "A valid entity object of the entity specified in parameter *entity*",
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "description": "Key/value pairs of userfields"
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a015"></a>
## A015 PUT /api/files/{group}/{fileName}

**Implementation:** [FilesApiController::UploadFile](../controllers/Api/FilesApiController.php#L82).

**Request and success response:** R group and Base64 filename path; URL-encode the Base64 segment. Raw binary body, NOT JSON or multipart. 204. Exclusive file creation refuses overwrite; invalid group/name or I/O errors 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Invalid file group`; `Error while creating file $fileName`; `Error while writing file $fileName`; `Error while closing file $fileName`; `Invalid filename`.

**Dependencies:** [FilesService::GetFilePath](../services/FilesService.php#L105), [FilesApiController::CheckFileName](../controllers/Api/FilesApiController.php#L122)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "group",
      "required": true,
      "description": "The file group",
      "schema": {
        "$ref": "#/components/schemas/FileGroups"
      }
    },
    {
      "in": "path",
      "name": "fileName",
      "required": true,
      "description": "The file name (including extension)<br>**BASE64 encoded**",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "content": {
      "application/octet-stream": {
        "schema": {
          "type": "string",
          "format": "binary"
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a016"></a>
## A016 GET /api/files/{group}/{fileName}

**Implementation:** [FilesApiController::ServeFile](../controllers/Api/FilesApiController.php#L41).

**Request and success response:** R group/Base64 filename. Optional Base64-stored-name_Base64-download-name syntax. O query force_serve_as=picture, best_fit_width, best_fit_height numeric. 200 binary with MIME type, inline Content-Disposition and 30-day cache. All caught failures become 404.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Invalid file group`; `Invalid filename`.

**Dependencies:** [FilesApiController::CheckFileName](../controllers/Api/FilesApiController.php#L122), [FilesApiController::GetFilePath](../controllers/Api/FilesApiController.php#L136), [FilesService::DownscaleImage](../services/FilesService.php#L39), [FilesService::GetFilePath](../services/FilesService.php#L105)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "group",
      "required": true,
      "description": "The file group",
      "schema": {
        "$ref": "#/components/schemas/FileGroups"
      }
    },
    {
      "in": "path",
      "name": "fileName",
      "required": true,
      "description": "The file name (including extension)<br>**BASE64 encoded**",
      "schema": {
        "type": "string"
      }
    },
    {
      "in": "query",
      "name": "force_serve_as",
      "required": false,
      "description": "Force the file to be served as the given type",
      "schema": {
        "type": "string",
        "enum": [
          "picture"
        ]
      }
    },
    {
      "in": "query",
      "name": "best_fit_height",
      "required": false,
      "description": "Only when using `force_serve_as` = `picture`: Downscale the picture to the given height while maintaining the aspect ratio",
      "schema": {
        "type": "number"
      }
    },
    {
      "in": "query",
      "name": "best_fit_width",
      "required": false,
      "description": "Only when using `force_serve_as` = `picture`: Downscale the picture to the given width while maintaining the aspect ratio",
      "schema": {
        "type": "number"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The binary file contents (Content-Type header is automatically set based on the file type)",
      "content": {
        "application/octet-stream": {
          "schema": {
            "type": "string",
            "format": "binary"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a017"></a>
## A017 DELETE /api/files/{group}/{fileName}

**Implementation:** [FilesApiController::DeleteFile](../controllers/Api/FilesApiController.php#L13).

**Request and success response:** R group/Base64 filename; no body. 204; invalid group/name/I/O 400. Allowed groups in entity dictionary.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Invalid file group`; `Invalid filename`.

**Dependencies:** [FilesService::DeleteFile](../services/FilesService.php#L78), [FilesService::GetFilePath](../services/FilesService.php#L105)

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "group",
      "required": true,
      "description": "The file group",
      "schema": {
        "$ref": "#/components/schemas/FileGroups"
      }
    },
    {
      "in": "path",
      "name": "fileName",
      "required": true,
      "description": "The file name (including extension)<br>**BASE64 encoded**",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a018"></a>
## A018 GET /api/users

**Implementation:** [UsersApiController::GetUsers](../controllers/Api/UsersApiController.php#L131).

**Request and success response:** O Q. 200 array of UserDto rows, not password records. UsersService DTO selection is authoritative.

**Permissions:** USERS_READ

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

**Dependencies:** [UsersService::GetUsersAsDto](../services/UsersService.php#L117)

Referenced database relations: `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "A list of user objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/UserDto"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a019"></a>
## A019 POST /api/users

**Implementation:** [UsersApiController::CreateUser](../controllers/Api/UsersApiController.php#L35).

**Request and success response:** R JSON username, first_name, last_name, password, picture_file_name (controller directly reads all). password_base64 optionally replaces password after decoding. 204. UsersService hashes the supplied password and inserts configured default permissions; database constraints apply. Userfield save is separate.

**Permissions:** USERS_CREATE

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`.

**Dependencies:** [UsersService::CreateUser](../services/UsersService.php#L9)

Referenced database relations: `permission_hierarchy`, `user_permissions`, `users`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "description": "A valid user object",
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/User"
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a020"></a>
## A020 PUT /api/users/{userId}

**Implementation:** [UsersApiController::EditUser](../controllers/Api/UsersApiController.php#L76).

**Request and success response:** R userId and JSON username, first_name, last_name, password, picture_file_name; password_base64 optionally replaces password. 204. Self uses USERS_EDIT_SELF, others USERS_EDIT. Empty/null password preserves the old password; a nonempty password is rehashed.

**Permissions:** USERS_EDIT_SELF for self; USERS_EDIT for other user.

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `User does not exist`.

**Dependencies:** [UsersService::EditUser](../services/UsersService.php#L40), [UsersService::UserExists](../services/UsersService.php#L160)

Referenced database relations: `users`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "userId",
      "required": true,
      "description": "A valid user id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "description": "A valid user object",
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/User"
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a021"></a>
## A021 DELETE /api/users/{userId}

**Implementation:** [UsersApiController::DeleteUser](../controllers/Api/UsersApiController.php#L62).

**Request and success response:** R userId. No body. 204. UsersService constraints/errors apply.

**Permissions:** USERS_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

**Dependencies:** [UsersService::DeleteUser](../services/UsersService.php#L34)

Referenced database relations: `users`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "userId",
      "required": true,
      "description": "A valid user id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a022"></a>
## A022 GET /api/users/{userId}/permissions

**Implementation:** [UsersApiController::ListPermissions](../controllers/Api/UsersApiController.php#L156).

**Request and success response:** R userId. 200 raw user_permissions row array, not resolved current-user permissions. ADMIN only.

**Permissions:** ADMIN

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (specialized HTTP catch preserves status). HttpSpecializedException is explicitly caught with its status, so permission denial remains 403.

**Dependencies:** Direct database/specification access in the implementation; shared BaseApiController, database schema/triggers and authentication apply.

Referenced database relations: `user_permissions`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "userId",
      "required": true,
      "description": "A valid user id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A list of user permission objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "permission_id": {
                  "type": "integer"
                },
                "user_id": {
                  "type": "integer"
                }
              }
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a023"></a>
## A023 POST /api/users/{userId}/permissions

**Implementation:** [UsersApiController::AddPermission](../controllers/Api/UsersApiController.php#L12).

**Request and success response:** R userId and JSON permission_id. 204; inserts assignment.

**Permissions:** ADMIN

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (specialized HTTP catch preserves status). HttpSpecializedException is explicitly caught with its status, so permission denial remains 403.

**Dependencies:** Direct database/specification access in the implementation; shared BaseApiController, database schema/triggers and authentication apply.

Referenced database relations: `user_permissions`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "userId",
      "required": true,
      "description": "A valid user id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "permissions_id": {
              "type": "integer",
              "description": "A permission ids"
            }
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a024"></a>
## A024 PUT /api/users/{userId}/permissions

**Implementation:** [UsersApiController::SetPermissions](../controllers/Api/UsersApiController.php#L177).

**Request and success response:** R userId and JSON permissions: array of permission IDs. 204; deletes old assignments then inserts replacements, no explicit transaction. Demo/prerelease force ADMIN instead of supplied list. Uses parsed body directly.

**Permissions:** ADMIN

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (specialized HTTP catch preserves status). HttpSpecializedException is explicitly caught with its status, so permission denial remains 403.

**Dependencies:** Direct database/specification access in the implementation; shared BaseApiController, database schema/triggers and authentication apply.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "userId",
      "required": true,
      "description": "A valid user id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "permissions": {
              "type": "array",
              "items": {
                "type": "integer"
              },
              "description": "A list of permission ids"
            }
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a025"></a>
## A025 GET /api/user

**Implementation:** [UsersApiController::CurrentUser](../controllers/Api/UsersApiController.php#L144).

**Request and success response:** No parameters. 200 filtered collection of UserDto rows for current ID, NOT a singleton object.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [UsersService::GetUsersAsDto](../services/UsersService.php#L117)

Referenced database relations: `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "A user object",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "items": {
              "$ref": "#/components/schemas/UserDto"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a026"></a>
## A026 GET /api/user/settings

**Implementation:** [UsersApiController::GetUserSettings](../controllers/Api/UsersApiController.php#L119).

**Request and success response:** No parameters. 200 key/value settings map including service defaults.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [UsersService::GetUserSettings](../services/UsersService.php#L103)

Referenced database relations: `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "Key/value pairs of user settings",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "Key/value pairs of user settings"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a027"></a>
## A027 GET /api/user/settings/{settingKey}

**Implementation:** [UsersApiController::GetUserSetting](../controllers/Api/UsersApiController.php#L106).

**Request and success response:** R settingKey. 200 {value:...}; value type follows setting/default.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [UsersService::GetUserSetting](../services/UsersService.php#L71)

Referenced database relations: `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "settingKey",
      "required": true,
      "description": "The key of the user setting",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A UserSetting object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/UserSetting"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a028"></a>
## A028 PUT /api/user/settings/{settingKey}

**Implementation:** [UsersApiController::SetUserSetting](../controllers/Api/UsersApiController.php#L222).

**Request and success response:** R settingKey and JSON value. 204; scalar settings are sanitized. Current user only.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [UsersService::SetUserSetting](../services/UsersService.php#L122)

Referenced database relations: `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "settingKey",
      "required": true,
      "description": "The key of the user setting",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "description": "A valid UserSetting object",
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/UserSetting"
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a029"></a>
## A029 DELETE /api/user/settings/{settingKey}

**Implementation:** [UsersApiController::DeleteUserSetting](../controllers/Api/UsersApiController.php#L237).

**Request and success response:** R settingKey. 204; deletes override, so defaults may reappear on refetch.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [UsersService::DeleteUserSetting](../services/UsersService.php#L149)

Referenced database relations: `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "settingKey",
      "required": true,
      "description": "The key of the user setting",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a030"></a>
## A030 GET /api/stock

**Implementation:** [StockApiController::CurrentStock](../controllers/Api/StockApiController.php#L353).

**Request and success response:** No implemented query options. 200 current stock row array enriched with product data; see service and schema dictionary. UI overview uses a different SQL view and additional filtering.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `products`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "An array of CurrentStockResponse objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CurrentStockResponse"
            }
          }
        }
      }
    }
  }
}
```

<a id="a031"></a>
## A031 GET /api/stock/entry/{entryId}

**Implementation:** [StockApiController::StockEntry](../controllers/Api/StockApiController.php#L787).

**Request and success response:** R entryId numeric stock row ID. 200 stock row or null from GetStockEntry; no explicit missing-row error.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [StockService::GetStockEntry](../services/StockService.php#L917)

Referenced database relations: `stock`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entryId",
      "required": true,
      "description": "A valid stock entry id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A StockEntry Response object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/StockEntry"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a032"></a>
## A032 PUT /api/stock/entry/{entryId}

**Implementation:** [StockApiController::EditStockEntry](../controllers/Api/StockApiController.php#L379).

**Request and success response:** R entryId and JSON amount, open, purchased_date (last two directly read although not explicitly validated). O best_before_date, price, location_id, shopping_location_id, note default null. 200 StockLogEntry[] through StockTransactions. Preserve existing values when editing; this is not a sparse patch.

**Permissions:** STOCK_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `Stock does not exist`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::EditStockEntry](../services/StockService.php#L533), [StockService::CompactStockEntries](../services/StockService.php#L1738), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `stock`, `stock_log`, `stock_splits`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entryId",
      "required": true,
      "description": "A valid stock entry id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to add - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "best_before_date": {
              "type": "string",
              "format": "date",
              "description": "The due date of the product to add, when omitted, the current date is used"
            },
            "price": {
              "type": "number",
              "description": "The price per stock quantity unit in configured currency"
            },
            "open": {
              "type": "boolean",
              "description": "If the stock entry was already opened or not"
            },
            "location_id": {
              "type": "integer",
              "description": "If omitted, the default location of the product is used"
            },
            "shopping_location_id": {
              "type": "integer",
              "description": "If omitted, no store will be affected"
            },
            "purchased_date": {
              "type": "string",
              "format": "date",
              "description": "The date when this stock entry was purchased"
            }
          },
          "example": {
            "id": "2",
            "amount": "1",
            "best_before_date": "2021-07-19",
            "purchased_date": "2020-01-01",
            "price": "22.03",
            "open": false,
            "location_id": "4"
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, invalid transaction type)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a033"></a>
## A033 GET /api/stock/volatile

**Implementation:** [StockApiController::CurrentVolatileStock](../controllers/Api/StockApiController.php#L358).

**Request and success response:** O query due_soon_days numeric and nonempty, default 5 (0 falls back to 5). 200 {due_products,overdue_products,expired_products,missing_products}, each an array.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [StockService::GetDueProducts](../services/StockService.php#L732), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetExpiredProducts](../services/StockService.php#L744), [StockService::GetMissingProducts](../services/StockService.php#L749)

Referenced database relations: `products`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "query",
      "name": "due_soon_days",
      "required": false,
      "description": "The number of days in which products are considered to be due soon",
      "schema": {
        "type": "integer",
        "default": 5
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A CurrentVolatilStockResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CurrentVolatilStockResponse"
          }
        }
      }
    }
  }
}
```

<a id="a034"></a>
## A034 GET /api/stock/products/{productId}

**Implementation:** [StockApiController::ProductDetails](../controllers/Api/StockApiController.php#L606).

**Request and success response:** R productId. 200 ProductDetailsResponse with product/barcodes, units, locations, stock quantities/value, prices and dates. Missing/inactive product 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Product does not exist or is inactive`.

**Dependencies:** [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A ProductDetailsResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/ProductDetailsResponse"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a035"></a>
## A035 GET /api/stock/products/{productId}/entries

**Implementation:** [StockApiController::ProductStockEntries](../controllers/Api/StockApiController.php#L643).

**Request and success response:** R productId; O include_sub_products boolean query, default false, and Q. 200 StockEntry[].

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [StockService::GetProductStockEntries](../services/StockService.php#L873)

Referenced database relations: `stock_next_use`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    },
    {
      "in": "query",
      "name": "include_sub_products",
      "required": false,
      "description": "If sub products should be included (if the given product is a parent product and in addition to the ones of the given product)",
      "schema": {
        "type": "boolean"
      }
    },
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An array of StockEntry objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a036"></a>
## A036 GET /api/stock/products/{productId}/locations

**Implementation:** [StockApiController::ProductStockLocations](../controllers/Api/StockApiController.php#L659).

**Request and success response:** R productId; O include_sub_products boolean query, default false, and Q. 200 StockLocation[].

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [StockService::GetProductStockLocations](../services/StockService.php#L906)

Referenced database relations: `stock_current_locations`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    },
    {
      "in": "query",
      "name": "include_sub_products",
      "required": false,
      "description": "If sub product locations should be included (if the given product is a parent product and in addition to the ones of the given product)",
      "schema": {
        "type": "boolean"
      }
    },
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An array of StockLocation objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLocation"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a037"></a>
## A037 GET /api/stock/products/{productId}/price-history

**Implementation:** [StockApiController::ProductPriceHistory](../controllers/Api/StockApiController.php#L631).

**Request and success response:** R productId. 200 array of {date,price,shopping_location}; invalid/inactive product 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Product does not exist or is inactive`.

**Dependencies:** [StockService::GetProductPriceHistory](../services/StockService.php#L850), [StockService::ProductExists](../services/StockService.php#L1819)

Referenced database relations: `products`, `products_price_history`, `shopping_locations`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "An array of ProductPriceHistory objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProductPriceHistory"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a038"></a>
## A038 POST /api/stock/products/{productId}/add

**Implementation:** [StockApiController::AddProduct](../controllers/Api/StockApiController.php#L85).

**Request and success response:** R productId and JSON amount:number >0 in stock units (tare mode uses gross weight). O best_before_date:date default service-derived; purchased_date:date default today; price, location_id, shopping_location_id default null; transaction_type default purchase; stock_label_type default 0; note default null. 200 StockLogEntry[]. Date defaults include shelf-life/freezer rules, not always today.

**Permissions:** STOCK_PURCHASE

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `The amount cannot be lower or equal than the defined tare weight + current stock amount`; `Location does not exist`; `Transaction type $transactionType is not valid (StockService.AddProduct)`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::AddProduct](../services/StockService.php#L112), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::CompactStockEntries](../services/StockService.php#L1738), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `stock`, `stock_log`, `stock_splits`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to add - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "best_before_date": {
              "type": "string",
              "format": "date",
              "description": "The due date of the product to add, when omitted, the current date is used"
            },
            "transaction_type": {
              "$ref": "#/components/schemas/StockTransactionType"
            },
            "price": {
              "type": "number",
              "description": "The price per stock quantity unit in configured currency"
            },
            "location_id": {
              "type": "integer",
              "description": "If omitted, the default location of the product is used"
            },
            "shopping_location_id": {
              "type": "integer",
              "description": "If omitted, no store will be affected"
            },
            "stock_label_type": {
              "type": "integer",
              "description": "`1` = No label, `2` = Single label, `3` = Label per unit"
            },
            "note": {
              "type": "string",
              "description": "An optional note for the corresponding stock entry"
            }
          },
          "example": {
            "amount": 1,
            "best_before_date": "2019-01-19",
            "transaction_type": "purchase",
            "price": "1.99"
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, invalid transaction type)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a039"></a>
## A039 POST /api/stock/products/{productId}/consume

**Implementation:** [StockApiController::ConsumeProduct](../controllers/Api/StockApiController.php#L257).

**Request and success response:** R productId and amount:number. O spoiled=false, stock_entry_id="default", location_id=null, recipe_id=null, exact_amount=false, allow_subproduct_substitution=false. 200 StockLogEntry[]. transaction_type is checked but transactiontype is read: preserve as a known defect, do not promise a supported override. Amount uses stock units; service handles tare, shortage, substitution and entry ordering.

**Permissions:** STOCK_CONSUME

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `Location does not exist`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to remove - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "transaction_type": {
              "$ref": "#/components/schemas/StockTransactionType"
            },
            "spoiled": {
              "type": "boolean",
              "description": "True when the given product was spoiled, defaults to false"
            },
            "stock_entry_id": {
              "type": "string",
              "description": "A specific stock entry id to consume, if used, the amount has to be 1"
            },
            "recipe_id": {
              "type": "integer",
              "description": "A valid recipe id for which this product was used (for statistical purposes only)"
            },
            "location_id": {
              "type": "integer",
              "description": "A valid location id (if supplied, only stock at the given location is considered, if ommitted, stock of any location is considered)"
            },
            "exact_amount": {
              "type": "boolean",
              "description": "For tare weight handling enabled products, `true` when the given is the absolute amount to be consumed, not the amount including the container weight"
            },
            "allow_subproduct_substitution": {
              "type": "boolean",
              "description": "`true` when any in stock sub product should be used when the given product is a parent product and currently not in stock"
            }
          },
          "example": {
            "amount": 1,
            "transaction_type": "consume",
            "spoiled": false
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, invalid transaction type, given amount > current stock amount)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a040"></a>
## A040 POST /api/stock/products/{productId}/transfer

**Implementation:** [StockApiController::TransferProduct](../controllers/Api/StockApiController.php#L810).

**Request and success response:** R productId and JSON amount, location_id_from, location_id_to. O stock_entry_id="default". 200 StockLogEntry[]. Service validates source stock and locations, applies freezer/thawing date rules.

**Permissions:** STOCK_TRANSFER

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `A transfer from location is required`; `A transfer to location is required`; `Product does not exist or is inactive`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `The amount cannot be lower than the defined tare weight`; `Amount to be transferred cannot be > current stock amount at the source location`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::TransferProduct](../services/StockService.php#L1272), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to transfer - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "location_id_from": {
              "type": "integer",
              "description": "A valid location id, the location from where the product should be transfered"
            },
            "location_id_to": {
              "type": "integer",
              "description": "A valid location id, the location to where the product should be transfered"
            },
            "stock_entry_id": {
              "type": "string",
              "description": "A specific stock entry id to transfer, if used, the amount has to be 1"
            }
          },
          "example": {
            "amount": 1,
            "location_id_from": 1,
            "location_id_to": 2
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, no existing from or to location, given amount > current stock amount at the source location)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a041"></a>
## A041 POST /api/stock/products/{productId}/inventory

**Implementation:** [StockApiController::InventoryProduct](../controllers/Api/StockApiController.php#L457).

**Request and success response:** R productId and new_amount (not amount). O best_before_date, purchased_date, location_id, price, shopping_location_id, note default null; stock_label_type=0. 200 StockLogEntry[]. Equal current amount errors; service selects purchase/consume adjustment.

**Permissions:** STOCK_INVENTORY

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An new amount is required`; `Product does not exist or is inactive`; `The new amount cannot equal the current stock amount`; `Amount can\'t be <= 0`; `The amount cannot be lower or equal than the defined tare weight + current stock amount`; `Location does not exist`; `Transaction type $transactionType is not valid (StockService.AddProduct)`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::InventoryProduct](../services/StockService.php#L922), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::AddProduct](../services/StockService.php#L112), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::CompactStockEntries](../services/StockService.php#L1738), [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `stock_splits`, `uihelper_product_details`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "new_amount": {
              "type": "number",
              "description": "The new current amount for the given product - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "best_before_date": {
              "type": "string",
              "format": "date",
              "description": "The due date which applies to added products"
            },
            "shopping_location_id": {
              "type": "integer",
              "description": "If omitted, no store will be affected"
            },
            "location_id": {
              "type": "integer",
              "description": "If omitted, the default location of the product is used (only applies to added products)"
            },
            "price": {
              "type": "number",
              "description": "If omitted, the last price of the product is used (only applies to added products)"
            },
            "stock_label_type": {
              "type": "integer",
              "description": "`1` = No label, `2` = Single label, `3` = Label per unit (only applies to added products)"
            },
            "note": {
              "type": "string",
              "description": "An optional note for the corresponding stock entry (only applies to added products)"
            }
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a042"></a>
## A042 POST /api/stock/products/{productId}/open

**Implementation:** [StockApiController::OpenProduct](../controllers/Api/StockApiController.php#L540).

**Request and success response:** R productId and amount. O stock_entry_id="default", allow_subproduct_substitution=false. 200 StockLogEntry[]. Opening can split entries/change due dates; disabled opening, tare products or shortage can fail.

**Permissions:** STOCK_OPEN

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `Product does not exist or is inactive`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `The amount cannot be lower than the defined tare weight`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to mark as opened"
            },
            "stock_entry_id": {
              "type": "string",
              "description": "A specific stock entry id to open, if used, the amount has to be 1"
            },
            "allow_subproduct_substitution": {
              "type": "boolean",
              "description": "`true` when any in stock sub product should be used when the given product is a parent product and currently not in stock"
            }
          },
          "example": {
            "amount": 1
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, given amount > current unopened stock amount)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a043"></a>
## A043 POST /api/stock/products/{productIdToKeep}/merge/{productIdToRemove}

**Implementation:** [StockApiController::MergeProducts](../controllers/Api/StockApiController.php#L910).

**Request and success response:** R productIdToKeep/productIdToRemove integer paths; no body. 204; validates both active, distinct products. Related database records migrate; refetch master data and stock.

**Permissions:** STOCK_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Provided {productIdToKeep} or {productIdToRemove} is not a valid integer`; `$productIdToKeep does not exist or is inactive`; `$productIdToRemove does not exist or is inactive`; `$productIdToKeep cannot equal $productIdToRemove`.

**Dependencies:** [StockService::MergeProducts](../services/StockService.php#L1691), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::ProductExists](../services/StockService.php#L1819)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `products`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productIdToKeep",
      "required": true,
      "description": "A valid product id of the product to keep",
      "schema": {
        "type": "integer"
      }
    },
    {
      "in": "path",
      "name": "productIdToRemove",
      "required": true,
      "description": "A valid product id of the product to remove",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Invalid product id)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a044"></a>
## A044 GET /api/stock/products/by-barcode/{barcode}

**Implementation:** [StockApiController::ProductDetailsByBarcode](../controllers/Api/StockApiController.php#L618).

**Request and success response:** R barcode string path, preserve leading zeros and URL-encode. Resolves barcode/Grocycode to product then returns ProductDetailsResponse; invalid/unknown barcode 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400. This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Invalid Grocycode`; `No product with barcode $barcode found`; `Product does not exist or is inactive`.

**Dependencies:** [StockService::GetProductIdFromBarcode](../services/StockService.php#L828), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "barcode",
      "required": true,
      "description": "Barcode",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A ProductDetailsResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/ProductDetailsResponse"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Unknown barcode)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a045"></a>
## A045 POST /api/stock/products/by-barcode/{barcode}/add

**Implementation:** [StockApiController::AddProductByBarcode](../controllers/Api/StockApiController.php#L162).

**Request and success response:** R barcode string path instead of productId. Same JSON fields and 200 response as AddProduct. Resolves barcode before delegating; outer catch maps delegated exceptions, including permission failures, to 400. JSON amount:number >0 in stock units (tare mode uses gross weight). O best_before_date:date default service-derived; purchased_date:date default today; price, location_id, shopping_location_id default null; transaction_type default purchase; stock_label_type default 0; note default null. 200 StockLogEntry[]. Date defaults include shelf-life/freezer rules, not always today.

**Permissions:** STOCK_PURCHASE

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Invalid Grocycode`; `No product with barcode $barcode found`; `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `The amount cannot be lower or equal than the defined tare weight + current stock amount`; `Location does not exist`; `Transaction type $transactionType is not valid (StockService.AddProduct)`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::GetProductIdFromBarcode](../services/StockService.php#L828), [StockApiController::AddProduct](../controllers/Api/StockApiController.php#L85), [StockService::AddProduct](../services/StockService.php#L112), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::CompactStockEntries](../services/StockService.php#L1738), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `stock`, `stock_log`, `stock_splits`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "barcode",
      "required": true,
      "description": "Barcode",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to add - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "best_before_date": {
              "type": "string",
              "format": "date",
              "description": "The due date of the product to add, when omitted, the current date is used"
            },
            "transaction_type": {
              "$ref": "#/components/schemas/StockTransactionType"
            },
            "price": {
              "type": "number",
              "description": "The price per stock quantity unit in configured currency"
            },
            "location_id": {
              "type": "integer",
              "description": "If omitted, the default location of the product is used"
            }
          },
          "example": {
            "amount": 1,
            "best_before_date": "2019-01-19",
            "transaction_type": "purchase",
            "price": "1.99"
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, invalid transaction type)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a046"></a>
## A046 POST /api/stock/products/by-barcode/{barcode}/consume

**Implementation:** [StockApiController::ConsumeProductByBarcode](../controllers/Api/StockApiController.php#L328).

**Request and success response:** R barcode string path instead of productId. Same JSON fields and 200 response as ConsumeProduct. Grocycode extra data overrides body stock_entry_id. Resolves barcode before delegating; outer catch maps delegated exceptions, including permission failures, to 400. amount:number. O spoiled=false, stock_entry_id="default", location_id=null, recipe_id=null, exact_amount=false, allow_subproduct_substitution=false. 200 StockLogEntry[]. transaction_type is checked but transactiontype is read: preserve as a known defect, do not promise a supported override. Amount uses stock units; service handles tare, shortage, substitution and entry ordering.

**Permissions:** STOCK_CONSUME

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Invalid Grocycode`; `No product with barcode $barcode found`; `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `Location does not exist`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::GetProductIdFromBarcode](../services/StockService.php#L828), [StockApiController::ConsumeProduct](../controllers/Api/StockApiController.php#L257), [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "barcode",
      "required": true,
      "description": "Barcode",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to remove - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "transaction_type": {
              "$ref": "#/components/schemas/StockTransactionType"
            },
            "spoiled": {
              "type": "boolean",
              "description": "True when the given product was spoiled, defaults to false"
            },
            "stock_entry_id": {
              "type": "string",
              "description": "A specific stock entry id to consume, if used, the amount has to be 1"
            },
            "recipe_id": {
              "type": "integer",
              "description": "A valid recipe id for which this product was used (for statistical purposes only)"
            },
            "location_id": {
              "type": "integer",
              "description": "A valid location id (if supplied, only stock at the given location is considered, if ommitted, stock of any location is considered)"
            },
            "exact_amount": {
              "type": "boolean",
              "description": "For tare weight handling enabled products, `true` when the given is the absolute amount to be consumed, not the amount including the container weight"
            },
            "allow_subproduct_substitution": {
              "type": "boolean",
              "description": "`rue` when any in stock sub product should be used when the given product is a parent product and currently not in stock"
            }
          },
          "example": {
            "amount": 1,
            "transaction_type": "consume",
            "spoiled": false
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, invalid transaction type, given amount > current stock amount)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a047"></a>
## A047 POST /api/stock/products/by-barcode/{barcode}/transfer

**Implementation:** [StockApiController::TransferProductByBarcode](../controllers/Api/StockApiController.php#L855).

**Request and success response:** R barcode string path instead of productId. Same JSON fields and 200 response as TransferProduct. Grocycode extra data overrides body stock_entry_id. Resolves barcode before delegating; outer catch maps delegated exceptions, including permission failures, to 400. JSON amount, location_id_from, location_id_to. O stock_entry_id="default". 200 StockLogEntry[]. Service validates source stock and locations, applies freezer/thawing date rules.

**Permissions:** STOCK_TRANSFER

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Invalid Grocycode`; `No product with barcode $barcode found`; `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `A transfer from location is required`; `A transfer to location is required`; `Product does not exist or is inactive`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `The amount cannot be lower than the defined tare weight`; `Amount to be transferred cannot be > current stock amount at the source location`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::GetProductIdFromBarcode](../services/StockService.php#L828), [StockApiController::TransferProduct](../controllers/Api/StockApiController.php#L810), [StockService::TransferProduct](../services/StockService.php#L1272), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "barcode",
      "required": true,
      "description": "Barcode",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to transfer - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "location_id_from": {
              "type": "integer",
              "description": "A valid location id, the location from where the product should be transfered"
            },
            "location_id_to": {
              "type": "integer",
              "description": "A valid location id, the location to where the product should be transfered"
            },
            "stock_entry_id": {
              "type": "string",
              "description": "A specific stock entry id to transfer, if used, the amount has to be 1"
            }
          },
          "example": {
            "amount": 1,
            "location_id_from": 1,
            "location_id_to": 2
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, no existing from or to location, given amount > current stock amount at the source location)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a048"></a>
## A048 POST /api/stock/products/by-barcode/{barcode}/inventory

**Implementation:** [StockApiController::InventoryProductByBarcode](../controllers/Api/StockApiController.php#L527).

**Request and success response:** R barcode string path instead of productId. Same JSON fields and 200 response as InventoryProduct. Resolves barcode before delegating; outer catch maps delegated exceptions, including permission failures, to 400. new_amount (not amount). O best_before_date, purchased_date, location_id, price, shopping_location_id, note default null; stock_label_type=0. 200 StockLogEntry[]. Equal current amount errors; service selects purchase/consume adjustment.

**Permissions:** STOCK_INVENTORY

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Invalid Grocycode`; `No product with barcode $barcode found`; `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An new amount is required`; `Product does not exist or is inactive`; `The new amount cannot equal the current stock amount`; `Amount can\'t be <= 0`; `The amount cannot be lower or equal than the defined tare weight + current stock amount`; `Location does not exist`; `Transaction type $transactionType is not valid (StockService.AddProduct)`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::GetProductIdFromBarcode](../services/StockService.php#L828), [StockApiController::InventoryProduct](../controllers/Api/StockApiController.php#L457), [StockService::InventoryProduct](../services/StockService.php#L922), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::AddProduct](../services/StockService.php#L112), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::CompactStockEntries](../services/StockService.php#L1738), [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `stock_splits`, `uihelper_product_details`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "barcode",
      "required": true,
      "description": "Barcode",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "new_amount": {
              "type": "number",
              "description": "The new current amount for the given product - please note that when tare weight handling for the product is enabled, this needs to be the amount including the container weight (gross), the amount to be posted will be automatically calculated based on what is in stock and the defined tare weight"
            },
            "best_before_date": {
              "type": "string",
              "format": "date",
              "description": "The due date which applies to added products"
            },
            "location_id": {
              "type": "integer",
              "description": "If omitted, the default location of the product is used (only applies to added products)"
            },
            "price": {
              "type": "number",
              "description": "If omitted, the last price of the product is used (only applies to added products)"
            }
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a049"></a>
## A049 POST /api/stock/products/by-barcode/{barcode}/open

**Implementation:** [StockApiController::OpenProductByBarcode](../controllers/Api/StockApiController.php#L581).

**Request and success response:** R barcode string path instead of productId. Same JSON fields and 200 response as OpenProduct. Grocycode extra data overrides body stock_entry_id. Resolves barcode before delegating; outer catch maps delegated exceptions, including permission failures, to 400. amount. O stock_entry_id="default", allow_subproduct_substitution=false. 200 StockLogEntry[]. Opening can split entries/change due dates; disabled opening, tare products or shortage can fail.

**Permissions:** STOCK_OPEN

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Invalid Grocycode`; `No product with barcode $barcode found`; `Request body could not be parsed (probably invalid JSON format or missing/wrong Content-Type header)`; `An amount is required`; `Product does not exist or is inactive`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `The amount cannot be lower than the defined tare weight`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`; `No transaction was found by the given transaction id`.

**Dependencies:** [StockService::GetProductIdFromBarcode](../services/StockService.php#L828), [StockApiController::OpenProduct](../controllers/Api/StockApiController.php#L540), [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "barcode",
      "required": true,
      "description": "Barcode",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "amount": {
              "type": "number",
              "description": "The amount to mark as opened"
            },
            "stock_entry_id": {
              "type": "string",
              "description": "A specific stock entry id to open, if used, the amount has to be 1"
            },
            "allow_subproduct_substitution": {
              "type": "boolean",
              "description": "`rue` when any in stock sub product should be used when the given product is a parent product and currently not in stock"
            }
          },
          "example": {
            "amount": 1
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, given amount > current unopened stock amount)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a050"></a>
## A050 GET /api/stock/locations/{locationId}/entries

**Implementation:** [StockApiController::LocationStockEntries](../controllers/Api/StockApiController.php#L654).

**Request and success response:** R locationId; O Q. 200 StockEntry[]; service exceptions are uncaught here (global 500), unlike many other missing-ID endpoints.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

Source-defined error messages: `Location does not exist`.

**Dependencies:** [StockService::GetLocationStockEntries](../services/StockService.php#L890), [StockService::LocationExists](../services/StockService.php#L1813)

Referenced database relations: `locations`, `stock`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "locationId",
      "required": true,
      "description": "A valid location id",
      "schema": {
        "type": "integer"
      }
    },
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An array of StockEntry objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing location)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a051"></a>
## A051 GET /api/stock/bookings/{bookingId}

**Implementation:** [StockApiController::StockBooking](../controllers/Api/StockApiController.php#L768).

**Request and success response:** R bookingId numeric stock_log ID. 200 StockLogEntry; missing 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Stock booking does not exist`.

**Dependencies:** Direct database/specification access in the implementation; shared BaseApiController, database schema/triggers and authentication apply.

Referenced database relations: `stock_log`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "bookingId",
      "required": true,
      "description": "A valid stock booking id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A StockLogEntry object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/StockLogEntry"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Invalid stock booking id)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a052"></a>
## A052 POST /api/stock/bookings/{bookingId}/undo

**Implementation:** [StockApiController::UndoBooking](../controllers/Api/StockApiController.php#L880).

**Request and success response:** R bookingId. No body. 204 (handler writes JSON before setting 204; client must ignore body). Dependent/already-undone bookings fail; related correlated bookings may be affected.

**Permissions:** STOCK_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Booking does not exist or was already undone`; `Booking has subsequent dependent bookings, undo not possible`; `This booking cannot be undone`.

**Dependencies:** [StockService::UndoBooking](../services/StockService.php#L1491)

Referenced database relations: `stock`, `stock_log`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "bookingId",
      "required": true,
      "description": "A valid stock booking id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing booking)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a053"></a>
## A053 GET /api/stock/transactions/{transactionId}

**Implementation:** [StockApiController::StockTransactions](../controllers/Api/StockApiController.php#L792).

**Request and success response:** R transactionId string; no body. 200 StockLogEntry[]; missing/empty transaction 400. Distinguish transaction ID from booking ID, numeric stock row ID and string stock_id.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `No transaction was found by the given transaction id`.

**Dependencies:** Direct database/specification access in the implementation; shared BaseApiController, database schema/triggers and authentication apply.

Referenced database relations: `stock_log`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "transactionId",
      "required": true,
      "description": "A valid stock transaction id",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "An array of StockLogEntry objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StockLogEntry"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing transaction)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a054"></a>
## A054 POST /api/stock/transactions/{transactionId}/undo

**Implementation:** [StockApiController::UndoTransaction](../controllers/Api/StockApiController.php#L895).

**Request and success response:** R transactionId. No body. 204; already undone/missing or dependent bookings fail. Do not automatically retry uncertain mutations.

**Permissions:** STOCK_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `This transaction was not found or already undone`; `Booking does not exist or was already undone`; `Booking has subsequent dependent bookings, undo not possible`; `This booking cannot be undone`.

**Dependencies:** [StockService::UndoTransaction](../services/StockService.php#L1676), [StockService::UndoBooking](../services/StockService.php#L1491)

Referenced database relations: `stock`, `stock_log`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "transactionId",
      "required": true,
      "description": "A valid stock transaction id",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing transaction)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a055"></a>
## A055 GET /api/stock/barcodes/external-lookup/{barcode}

**Implementation:** [StockApiController::ExternalBarcodeLookup](../controllers/Api/StockApiController.php#L437).

**Request and success response:** R barcode. O query add: literal "true" reliably enables insertion; code also checks integer 1, so do not rely on query string "1". 200 plugin-derived object, potentially creating product, barcode, picture and conversion. Depends on configured plugin/network; missing plugin/duplicate product can fail.

**Permissions:** MASTER_DATA_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Product `; `No barcode lookup plugin defined`; `Plugin $pluginName was not found`.

**Dependencies:** [StockService::ExternalBarcodeLookup](../services/StockService.php#L614), [ApplicationService::GetInstalledVersion](../services/ApplicationService.php#L52), [FilesService::GetFilePath](../services/FilesService.php#L105), [StockService::LoadExternalBarcodeLookupPlugin](../services/StockService.php#L1786), [UsersService::GetUserSettings](../services/UsersService.php#L103)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_unit_conversions`, `quantity_units`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "barcode",
      "required": true,
      "description": "The barcode to lookup up",
      "schema": {
        "type": "string"
      }
    },
    {
      "in": "query",
      "name": "add",
      "required": false,
      "description": "When true, the product is added to the database on a successful lookup and the new product id is in included in the response",
      "schema": {
        "type": "boolean",
        "default": false
      }
    }
  ],
  "responses": {
    "200": {
      "description": "An ExternalBarcodeLookupResponse object or null, when nothing was found for the given barcode",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/ExternalBarcodeLookupResponse"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Plugin error)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a056"></a>
## A056 GET /api/stock/products/{productId}/printlabel

**Implementation:** [StockApiController::ProductPrintLabel](../controllers/Api/StockApiController.php#L670).

**Request and success response:** R path ID; no body/query. 200 object {product,grocycode,details} merged with configured label-printer parameters. GET executes webhook when LABEL_PRINTER_RUN_SERVER is enabled; otherwise frontend must invoke configured hook with returned data. Disable caching/prefetch/retries for this action; errors 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Product does not exist or is inactive`.

**Dependencies:** [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "productId",
      "required": true,
      "description": "A valid product id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "WebHook data"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing product, error on WebHook execution)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a057"></a>
## A057 GET /api/stock/entry/{entryId}/printlabel

**Implementation:** [StockApiController::StockEntryPrintLabel](../controllers/Api/StockApiController.php#L695).

**Request and success response:** R path ID; no body/query. 200 object {product,grocycode,details,stock_entry,due_date?} merged with configured label-printer parameters. GET executes webhook when LABEL_PRINTER_RUN_SERVER is enabled; otherwise frontend must invoke configured hook with returned data. Disable caching/prefetch/retries for this action; errors 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Product does not exist or is inactive`.

**Dependencies:** [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28)

Referenced database relations: `locations`, `product_barcodes`, `products`, `quantity_units`, `stock`, `uihelper_product_details`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "entryId",
      "required": true,
      "description": "A valid stock entry id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "WebHook data"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing stock entry, error on WebHook execution)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a058"></a>
## A058 POST /api/stock/shoppinglist/add-missing-products

**Implementation:** [StockApiController::AddMissingProductsToShoppingList](../controllers/Api/StockApiController.php#L15).

**Request and success response:** JSON {} allowed. O list_id numeric/nonempty default 1. 204. Uses minimum-stock requirements and purchase-unit conversions.

**Permissions:** SHOPPINGLIST_ITEMS_ADD

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Shopping list does not exist`.

**Dependencies:** [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `products`, `shopping_list`, `shopping_lists`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "required": false,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "list_id": {
              "type": "integer",
              "description": "The shopping list to use, when omitted, the default shopping list (with id 1) is used"
            }
          },
          "example": {
            "list_id": 2
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing shopping list)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a059"></a>
## A059 POST /api/stock/shoppinglist/add-overdue-products

**Implementation:** [StockApiController::AddOverdueProductsToShoppingList](../controllers/Api/StockApiController.php#L39).

**Request and success response:** JSON {} allowed. O list_id default 1. 204. Adds overdue products through service, distinct from expired products.

**Permissions:** SHOPPINGLIST_ITEMS_ADD

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Shopping list does not exist`.

**Dependencies:** [StockService::AddOverdueProductsToShoppingList](../services/StockService.php#L60), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetDueProducts](../services/StockService.php#L732), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `products`, `shopping_list`, `shopping_lists`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "required": false,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "list_id": {
              "type": "integer",
              "description": "The shopping list to use, when omitted, the default shopping list (with id 1) is used"
            }
          },
          "example": {
            "list_id": 2
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing shopping list)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a060"></a>
## A060 POST /api/stock/shoppinglist/add-expired-products

**Implementation:** [StockApiController::AddExpiredProductsToShoppingList](../controllers/Api/StockApiController.php#L62).

**Request and success response:** JSON {} allowed. O list_id default 1. 204. Adds expired products through service.

**Permissions:** SHOPPINGLIST_ITEMS_ADD

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Shopping list does not exist`.

**Dependencies:** [StockService::AddExpiredProductsToShoppingList](../services/StockService.php#L86), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetExpiredProducts](../services/StockService.php#L744), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `products`, `shopping_list`, `shopping_lists`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "required": false,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "list_id": {
              "type": "integer",
              "description": "The shopping list to use, when omitted, the default shopping list (with id 1) is used"
            }
          },
          "example": {
            "list_id": 2
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing shopping list)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a061"></a>
## A061 POST /api/stock/shoppinglist/clear

**Implementation:** [StockApiController::ClearShoppingList](../controllers/Api/StockApiController.php#L228).

**Request and success response:** JSON {} allowed. O list_id=1, done_only=false. 204. Clear all or checked items; invalid list 400.

**Permissions:** SHOPPINGLIST_ITEMS_DELETE

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Shopping list does not exist`.

**Dependencies:** [StockService::ClearShoppingList](../services/StockService.php#L348), [StockService::ShoppingListExists](../services/StockService.php#L1825)

Referenced database relations: `shopping_list`, `shopping_lists`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "required": false,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "list_id": {
              "type": "integer",
              "description": "The shopping list id to clear, when omitted, the default shopping list (with id 1) is used"
            },
            "done_only": {
              "type": "boolean",
              "description": "When `true`, only done items will be removed (defaults to `false` when ommited)"
            }
          },
          "example": {
            "list_id": 2,
            "done_only": false
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing shopping list)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a062"></a>
## A062 POST /api/stock/shoppinglist/add-product

**Implementation:** [StockApiController::AddProductToShoppingList](../controllers/Api/StockApiController.php#L175).

**Request and success response:** R JSON product_id numeric/nonempty. O product_amount=1, list_id=1, qu_id=-1, note=null. 204. Updates/creates matching entry through service; zero/empty amount falls back to 1.

**Permissions:** SHOPPINGLIST_ITEMS_ADD

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `No product id was supplied`; `Shopping list does not exist`; `Product does not exist or is inactive`.

**Dependencies:** [StockService::AddProductToShoppingList](../services/StockService.php#L307), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::ProductExists](../services/StockService.php#L1819)

Referenced database relations: `products`, `shopping_list`, `shopping_lists`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "product_id": {
              "type": "integer",
              "description": "A valid product id of the product to be added"
            },
            "qu_id": {
              "type": "integer",
              "description": "A valid quantity unit id (used only for display; the amount needs to be related to the products stock QU), when omitted, the products stock QU is used"
            },
            "list_id": {
              "type": "integer",
              "description": "A valid shopping list id, when omitted, the default shopping list (with id 1) is used"
            },
            "product_amount": {
              "type": "number",
              "description": "The amount (related to the products stock QU) to add, when omitted, the default amount of 1 is used"
            },
            "note": {
              "type": "string",
              "description": "The note of the shopping list item"
            }
          },
          "example": {
            "product_id": 3,
            "list_id": 2,
            "product_amount": 5,
            "note": "This is the note of the shopping list item..."
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing shopping list, Invalid product id supplied)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a063"></a>
## A063 POST /api/stock/shoppinglist/remove-product

**Implementation:** [StockApiController::RemoveProductFromShoppingList](../controllers/Api/StockApiController.php#L727).

**Request and success response:** R JSON product_id numeric/nonempty. O product_amount=1, list_id=1. 204. Decrements/removes through service; zero/empty amount falls back to 1.

**Permissions:** SHOPPINGLIST_ITEMS_DELETE

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `No product id was supplied`; `Shopping list does not exist`.

**Dependencies:** [StockService::RemoveProductFromShoppingList](../services/StockService.php#L1163), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ShoppingListExists](../services/StockService.php#L1825)

Referenced database relations: `shopping_list`, `shopping_lists`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "product_id": {
              "type": "integer",
              "description": "A valid product id of the item on the shopping list"
            },
            "list_id": {
              "type": "integer",
              "description": "A valid shopping list id, when omitted, the default shopping list (with id 1) is used"
            },
            "product_amount": {
              "type": "number",
              "description": "The amount of product units to remove, when omitted, the default amount of 1 is used"
            }
          },
          "example": {
            "product_id": 3,
            "list_id": 2,
            "product_amount": 5
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing shopping list, Invalid product id supplied)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a064"></a>
## A064 POST /api/recipes/mealplan/add-shopping-requirements

**Implementation:** [RecipesApiController::AddMealPlanShoppingRequirementsToShoppingList](../controllers/Api/RecipesApiController.php#L110).

**Request and success response:** R JSON from/to dates YYYY-MM-DD, from<=to. O shopping_list_id positive numeric cast to integer, default 1; preserve_min_stock must be JSON boolean, default false. 200 {from,to,shopping_list_id,preserve_min_stock,requirements:Requirement[],written_items:WrittenItem[]}. Validates list/conversions and writes in transaction. See custom response dictionary.

**Permissions:** SHOPPINGLIST_ITEMS_ADD

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Request body could not be parsed `; `A valid from date is required`; `A valid to date is required`; `preserve_min_stock must be a boolean`; `The from date must not be after the to date`; `A valid shopping_list_id is required`; `Shopping list does not exist: `; `No quantity unit conversion found for product `.

**Dependencies:** [RecipesService::AddMealPlanShoppingRequirementsToShoppingList](../services/RecipesService.php#L379), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [RecipesService::GetMealPlanShoppingRequirements](../services/RecipesService.php#L142)

Referenced database relations: `products`.

**OpenAPI discrepancy:** No matching operation in checked-in specification; use implementation contract above.

<a id="a065"></a>
## A065 POST /api/recipes/{recipeId}/add-not-fulfilled-products-to-shoppinglist

**Implementation:** [RecipesApiController::AddNotFulfilledProductsToShoppingList](../controllers/Api/RecipesApiController.php#L14).

**Request and success response:** R recipeId; JSON {} allowed, O excludedProductIds array. 204. Uses recipe desired servings, stock fulfillment and shopping-list settings. No shopping_list_id parameter in this handler. Service exceptions are uncaught (global 500).

**Permissions:** SHOPPINGLIST_ITEMS_ADD

**Errors:** Common E. No generic local catch; unhandled failures → global errors. Permission denial → 403 (check occurs outside the generic catch).

**Dependencies:** [RecipesService::AddNotFulfilledProductsToShoppingList](../services/RecipesService.php#L14), [RecipesService::GetRecipesPosResolved](../services/RecipesService.php#L134), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `products`, `recipes`, `shopping_list`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "recipeId",
      "required": true,
      "description": "A valid recipe id",
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "required": false,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "excludedProductIds": {
              "type": "array",
              "items": {
                "type": "integer"
              },
              "description": "An optional array of product ids to exclude them from being put on the shopping list"
            }
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    }
  }
}
```

<a id="a066"></a>
## A066 GET /api/recipes/{recipeId}/fulfillment

**Implementation:** [RecipesApiController::GetRecipeFulfillment](../controllers/Api/RecipesApiController.php#L45).

**Request and success response:** Optional recipeId path distinguishes two registered routes. No ID: O Q, 200 RecipeFulfillmentResponse[]. With ID: 200 RecipeFulfillmentResponse; missing recipe 400. Do not add servings query parameters; persisted recipe desired_servings drives calculations.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Recipe does not exist`.

**Dependencies:** [RecipesService::GetRecipesResolved](../services/RecipesService.php#L519)

Referenced database relations: `recipes_resolved`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "recipeId",
      "required": true,
      "description": "A valid recipe id",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A RecipeFulfillmentResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/RecipeFulfillmentResponse"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a067"></a>
## A067 POST /api/recipes/{recipeId}/consume

**Implementation:** [RecipesApiController::ConsumeRecipe](../controllers/Api/RecipesApiController.php#L30).

**Request and success response:** R recipeId; no body used. 204. Reads resolved positions, consumes ingredients and may create self-produced product stock. Refetch stock, logs, recipes, shopping and calendar.

**Permissions:** STOCK_CONSUME

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Recipe does not exist`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `Location does not exist`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`; `The amount cannot be lower or equal than the defined tare weight + current stock amount`; `Transaction type $transactionType is not valid (StockService.AddProduct)`.

**Dependencies:** [RecipesService::ConsumeRecipe](../services/RecipesService.php#L80), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [StockService::AddProduct](../services/StockService.php#L112), [StockService::CompactStockEntries](../services/StockService.php#L1738), [RecipesService::RecipeExists](../services/RecipesService.php#L548)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `locations`, `meal_plan`, `product_barcodes`, `products`, `quantity_units`, `recipes`, `recipes_pos_resolved`, `recipes_resolved`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `stock_splits`, `uihelper_product_details`, `user_settings`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "recipeId",
      "required": true,
      "description": "A valid recipe id",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Invalid recipe id, recipe need is not fulfilled)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a068"></a>
## A068 GET /api/recipes/fulfillment

**Implementation:** [RecipesApiController::GetRecipeFulfillment](../controllers/Api/RecipesApiController.php#L45).

**Request and success response:** Optional recipeId path distinguishes two registered routes. No ID: O Q, 200 RecipeFulfillmentResponse[]. With ID: 200 RecipeFulfillmentResponse; missing recipe 400. Do not add servings query parameters; persisted recipe desired_servings drives calculations.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Recipe does not exist`.

**Dependencies:** [RecipesService::GetRecipesResolved](../services/RecipesService.php#L519)

Referenced database relations: `recipes_resolved`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An array of RecipeFulfillmentResponse objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/RecipeFulfillmentResponse"
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a069"></a>
## A069 POST /api/recipes/{recipeId}/copy

**Implementation:** [RecipesApiController::CopyRecipe](../controllers/Api/RecipesApiController.php#L71).

**Request and success response:** R recipeId, no body used. 200 {created_object_id}; copies recipe, positions and nestings through service. No explicit permission check in this route; do not claim RECIPES is enforced here.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Recipe does not exist`.

**Dependencies:** [RecipesService::CopyRecipe](../services/RecipesService.php#L531), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [RecipesService::RecipeExists](../services/RecipesService.php#L548)

Referenced database relations: `lastInsertId`, `recipes`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "recipeId",
      "required": true,
      "description": "A valid recipe id of the recipe to copy",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "created_object_id": {
                "type": "integer",
                "description": "The id of the created recipe"
              }
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Invalid recipe id)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a070"></a>
## A070 GET /api/recipes/{recipeId}/printlabel

**Implementation:** [RecipesApiController::RecipePrintLabel](../controllers/Api/RecipesApiController.php#L85).

**Request and success response:** R path ID; no body/query. 200 object {recipe,grocycode,details} merged with configured label-printer parameters. GET executes webhook when LABEL_PRINTER_RUN_SERVER is enabled; otherwise frontend must invoke configured hook with returned data. Disable caching/prefetch/retries for this action; errors 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** Direct database/specification access in the implementation; shared BaseApiController, database schema/triggers and authentication apply.

Referenced database relations: `recipes`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "recipeId",
      "required": true,
      "description": "A valid recipe id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "WebHook data"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing recipe, error on WebHook execution)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a071"></a>
## A071 GET /api/chores

**Implementation:** [ChoresApiController::Current](../controllers/Api/ChoresApiController.php#L59).

**Request and success response:** O Q. 200 CurrentChoreResponse[] enriched next_execution_assigned_user; overview due_type is added by HTML controller, not this API.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [ChoresService::GetCurrent](../services/ChoresService.php#L143), [UsersService::GetUsersAsDto](../services/UsersService.php#L117)

Referenced database relations: `chores_current`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An array of CurrentChoreResponse objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CurrentChoreResponse"
            }
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a072"></a>
## A072 GET /api/chores/{choreId}

**Implementation:** [ChoresApiController::ChoreDetails](../controllers/Api/ChoresApiController.php#L47).

**Request and success response:** R choreId. 200 {chore,last_tracked,tracked_count,last_done_by,next_estimated_execution_time,next_execution_assigned_user,average_execution_frequency_hours}. Missing chore 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Chore does not exist`.

**Dependencies:** [ChoresService::GetChoreDetails](../services/ChoresService.php#L104), [UsersService::GetUsersAsDto](../services/UsersService.php#L117), [ChoresService::ChoreExists](../services/ChoresService.php#L277)

Referenced database relations: `chores`, `chores_current`, `chores_execution_average_frequency`, `chores_log`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "choreId",
      "required": true,
      "description": "A valid chore id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A ChoreDetailsResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/ChoreDetailsResponse"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing chore)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a073"></a>
## A073 POST /api/chores/{choreId}/execute

**Implementation:** [ChoresApiController::TrackChoreExecution](../controllers/Api/ChoresApiController.php#L64).

**Request and success response:** R choreId; JSON {} allowed. O tracked_time date or YYYY-MM-DD HH:mm:ss default now; done_by default current user; skipped=false. 200 ChoreLogEntry. Manual chores cannot skip. May consume stock and recalculate assignments; save log custom fields using returned execution id.

**Permissions:** CHORE_TRACK_EXECUTION

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Chore does not exist`; `User does not exist`; `Chores without a schedule can\'t be skipped`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `Location does not exist`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`.

**Dependencies:** [ChoresService::TrackChore](../services/ChoresService.php#L163), [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [ChoresService::ChoreExists](../services/ChoresService.php#L277), [ChoresService::CalculateNextExecutionAssignment](../services/ChoresService.php#L19), [UsersService::GetUsersAsDto](../services/UsersService.php#L117)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `chores`, `chores_current`, `chores_execution_users_statistics`, `chores_log`, `lastInsertId`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`, `user_settings`, `users`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "choreId",
      "required": true,
      "description": "A valid chore id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "tracked_time": {
              "type": "string",
              "format": "date-time",
              "description": "The time of when the chore was executed, when omitted, the current time is used"
            },
            "done_by": {
              "type": "integer",
              "description": "A valid user id of who executed this chore, when omitted, the currently authenticated user will be used"
            },
            "skipped": {
              "type": "boolean",
              "default": false,
              "description": "`true` when the execution should be tracked as skipped, defaults to `false` when omitted"
            }
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/ChoreLogEntry"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing chore)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a074"></a>
## A074 POST /api/chores/executions/{executionId}/undo

**Implementation:** [ChoresApiController::UndoChoreExecution](../controllers/Api/ChoresApiController.php#L104).

**Request and success response:** R executionId, not choreId. No body. 204. Missing/already undone 400; recalculates schedule/assignment. Does not imply stock consumed by execution is restored.

**Permissions:** CHORE_UNDO_EXECUTION

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Execution does not exist or was already undone`; `Chore does not exist`.

**Dependencies:** [ChoresService::UndoChoreExecution](../services/ChoresService.php#L226), [ChoresService::CalculateNextExecutionAssignment](../services/ChoresService.php#L19), [UsersService::GetUsersAsDto](../services/UsersService.php#L117), [ChoresService::ChoreExists](../services/ChoresService.php#L277)

Referenced database relations: `chores`, `chores_execution_users_statistics`, `chores_log`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "executionId",
      "required": true,
      "description": "A valid chore execution id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing booking)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a075"></a>
## A075 POST /api/chores/executions/calculate-next-assignments

**Implementation:** [ChoresApiController::CalculateNextExecutionAssignments](../controllers/Api/ChoresApiController.php#L14).

**Request and success response:** JSON {} allowed. O chore_id numeric/nonempty: one chore; absent recalculates all. 204. No explicit action permission check.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Chore does not exist`.

**Dependencies:** [ChoresService::CalculateNextExecutionAssignment](../services/ChoresService.php#L19), [UsersService::GetUsersAsDto](../services/UsersService.php#L117), [ChoresService::ChoreExists](../services/ChoresService.php#L277)

Referenced database relations: `chores`, `chores_execution_users_statistics`, `chores_log`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "requestBody": {
    "required": false,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "chore_id": {
              "type": "integer",
              "description": "The chore id of the chore which next user assignment should be (re)calculated, when omitted, the next user assignments of all chores will (re)caluclated"
            }
          },
          "example": {
            "chore_id": 1
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a076"></a>
## A076 GET /api/chores/{choreId}/printlabel

**Implementation:** [ChoresApiController::ChorePrintLabel](../controllers/Api/ChoresApiController.php#L119).

**Request and success response:** R path ID; no body/query. 200 object {chore,grocycode,details} merged with configured label-printer parameters. GET executes webhook when LABEL_PRINTER_RUN_SERVER is enabled; otherwise frontend must invoke configured hook with returned data. Disable caching/prefetch/retries for this action; errors 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Chore does not exist`.

**Dependencies:** [ChoresService::GetChoreDetails](../services/ChoresService.php#L104), [UsersService::GetUsersAsDto](../services/UsersService.php#L117), [ChoresService::ChoreExists](../services/ChoresService.php#L277)

Referenced database relations: `chores`, `chores_current`, `chores_execution_average_frequency`, `chores_log`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "choreId",
      "required": true,
      "description": "A valid chore id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "WebHook data"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing chore, error on WebHook execution)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a077"></a>
## A077 POST /api/chores/{choreIdToKeep}/merge/{choreIdToRemove}

**Implementation:** [ChoresApiController::MergeChores](../controllers/Api/ChoresApiController.php#L144).

**Request and success response:** R choreIdToKeep/choreIdToRemove integer paths; no body. 204. Both active and distinct; moves history and deletes removed chore.

**Permissions:** MASTER_DATA_EDIT

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Provided {choreIdToKeep} or {choreIdToRemove} is not a valid integer`; `$choreIdToKeep does not exist or is inactive`; `$choreIdToRemove does not exist or is inactive`; `$choreIdToKeep cannot equal $choreIdToRemove`.

**Dependencies:** [ChoresService::MergeChores](../services/ChoresService.php#L243), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [ChoresService::ChoreExists](../services/ChoresService.php#L277)

Referenced database relations: `chores`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "choreIdToKeep",
      "required": true,
      "description": "A valid chore id of the chore to keep",
      "schema": {
        "type": "integer"
      }
    },
    {
      "in": "path",
      "name": "choreIdToRemove",
      "required": true,
      "description": "A valid chore id of the chore to remove",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Invalid chore id)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a078"></a>
## A078 GET /api/print/shoppinglist/thermal

**Implementation:** [PrintApiController::PrintShoppingListThermal](../controllers/Api/PrintApiController.php#L13).

**Request and success response:** O query list default 1; printHeader default true, only literal "true" enables it when supplied. 200 {result:"OK"}. Sends ESC/POS output to configured network/file printer; failures 400; never retry/prefetch automatically.

**Permissions:** SHOPPINGLIST

**Errors:** Common E. Caught Exception → 400. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Shopping list does not exist`; `Unable to connect to printer`.

**Dependencies:** [StockService::GetShoppinglistInPrintableStrings](../services/StockService.php#L1189), [StockService::ShoppingListExists](../services/StockService.php#L1825), [PrintService::printShoppingList](../services/PrintService.php#L12)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `products`, `shopping_lists`, `uihelper_shopping_list`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "query",
      "name": "list",
      "required": false,
      "description": "Shopping list id",
      "schema": {
        "type": "integer",
        "default": 1
      }
    },
    {
      "in": "query",
      "name": "printHeader",
      "required": false,
      "description": "Prints Grocy logo if true",
      "schema": {
        "type": "boolean",
        "default": true
      }
    }
  ],
  "responses": {
    "200": {
      "description": "Returns OK if the printing was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "result": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a079"></a>
## A079 GET /api/batteries

**Implementation:** [BatteriesApiController::Current](../controllers/Api/BatteriesApiController.php#L27).

**Request and success response:** O Q. 200 CurrentBatteryResponse[] with nested battery; local schema includes battery state additions.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [BatteriesService::GetCurrent](../services/BatteriesService.php#L28)

Referenced database relations: `batteries`, `batteries_current`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An array of CurrentBatteryResponse objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CurrentBatteryResponse"
            }
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a080"></a>
## A080 GET /api/batteries/{batteryId}

**Implementation:** [BatteriesApiController::BatteryDetails](../controllers/Api/BatteriesApiController.php#L14).

**Request and success response:** R batteryId. 200 {battery,state,last_charged,charge_cycles_count,next_estimated_charge_time}; missing battery 400. state is a local extension.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Battery does not exist`.

**Dependencies:** [BatteriesService::GetBatteryDetails](../services/BatteriesService.php#L7), [BatteriesService::BatteryExists](../services/BatteriesService.php#L196), [BatteriesService::GetBatteryState](../services/BatteriesService.php#L176)

Referenced database relations: `batteries`, `batteries_current`, `battery_charge_cycles`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "batteryId",
      "required": true,
      "description": "A valid battery id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "A BatteryDetailsResponse object",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/BatteryDetailsResponse"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing battery)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a081"></a>
## A081 POST /api/batteries/{batteryId}/charge

**Implementation:** [BatteriesApiController::TrackChargeCycle](../controllers/Api/BatteriesApiController.php#L32).

**Request and success response:** R batteryId; JSON {} allowed. O tracked_time YYYY-MM-DD HH:mm:ss, default now. 200 BatteryChargeCycleEntry, marks battery charged. Non-rechargeable battery fails. Save cycle custom fields separately.

**Permissions:** BATTERIES_TRACK_CHARGE_CYCLE

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Battery does not exist`; `This battery is not rechargeable`.

**Dependencies:** [BatteriesService::TrackChargeCycle](../services/BatteriesService.php#L40), [BatteriesService::BatteryExists](../services/BatteriesService.php#L196)

Referenced database relations: `batteries`, `battery_charge_cycles`, `lastInsertId`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "batteryId",
      "required": true,
      "description": "A valid battery id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "tracked_time": {
              "type": "string",
              "format": "date-time",
              "description": "The time of when the battery was charged, when omitted, the current time is used"
            }
          }
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/BatteryChargeCycleEntry"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing battery)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a082"></a>
## A082 POST /api/batteries/{batteryId}/replace

**Implementation:** [BatteriesApiController::ReplaceBattery](../controllers/Api/BatteriesApiController.php#L55).

**Request and success response:** R batteryId and JSON replacement_battery_id. 200 {replaced_battery_id,replacement_battery_id,used_in}. Transaction clears original device and discharges rechargeable original or deactivates disposable original; assigns device to replacement. No dedicated replacement undo route.

**Permissions:** BATTERIES_TRACK_CHARGE_CYCLE

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Replacement battery is required`; `Battery does not exist`; `Replacement battery does not exist`; `A battery cannot replace itself`; `The battery is currently not used in a device`; `The replacement battery is already in use`; `The replacement battery is inactive`; `The replacement battery needs to be charged first`.

**Dependencies:** [BatteriesService::ReplaceBattery](../services/BatteriesService.php#L83), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [BatteriesService::BatteryExists](../services/BatteriesService.php#L196)

Referenced database relations: `batteries`.

**OpenAPI discrepancy:** No matching operation in checked-in specification; use implementation contract above.

<a id="a083"></a>
## A083 POST /api/batteries/charge-cycles/{chargeCycleId}/undo

**Implementation:** [BatteriesApiController::UndoChargeCycle](../controllers/Api/BatteriesApiController.php#L78).

**Request and success response:** R chargeCycleId, not batteryId. 204. Missing/already undone cycle 400. Marks log undone; does not reset is_charged in this implementation.

**Permissions:** BATTERIES_UNDO_CHARGE_CYCLE

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Charge cycle does not exist or was already undone`.

**Dependencies:** [BatteriesService::UndoChargeCycle](../services/BatteriesService.php#L67)

Referenced database relations: `battery_charge_cycles`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "chargeCycleId",
      "required": true,
      "description": "A valid charge cycle id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing booking)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a084"></a>
## A084 GET /api/batteries/{batteryId}/printlabel

**Implementation:** [BatteriesApiController::BatteryPrintLabel](../controllers/Api/BatteriesApiController.php#L93).

**Request and success response:** R path ID; no body/query. 200 object {battery,grocycode,details} merged with configured label-printer parameters. GET executes webhook when LABEL_PRINTER_RUN_SERVER is enabled; otherwise frontend must invoke configured hook with returned data. Disable caching/prefetch/retries for this action; errors 400.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

Source-defined error messages: `Battery does not exist`.

**Dependencies:** [BatteriesService::GetBatteryDetails](../services/BatteriesService.php#L7), [BatteriesService::BatteryExists](../services/BatteriesService.php#L196), [BatteriesService::GetBatteryState](../services/BatteriesService.php#L176)

Referenced database relations: `batteries`, `batteries_current`, `battery_charge_cycles`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "batteryId",
      "required": true,
      "description": "A valid battery id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "description": "WebHook data"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing battery, error on WebHook execution)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a085"></a>
## A085 GET /api/tasks

**Implementation:** [TasksApiController::Current](../controllers/Api/TasksApiController.php#L12).

**Request and success response:** O Q. 200 CurrentTaskResponse[] (unfinished tasks only), enriched assigned_to_user and category. Completed list uses generic tasks; no include_done option.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. No generic local catch; unhandled failures → global errors.

**Dependencies:** [TasksService::GetCurrent](../services/TasksService.php#L9), [UsersService::GetUsersAsDto](../services/UsersService.php#L117)

Referenced database relations: `task_categories`, `tasks_current`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "$ref": "#/components/parameters/query"
    },
    {
      "$ref": "#/components/parameters/order"
    },
    {
      "$ref": "#/components/parameters/limit"
    },
    {
      "$ref": "#/components/parameters/offset"
    }
  ],
  "responses": {
    "200": {
      "description": "An array of CurrentTaskResponse objects",
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CurrentTaskResponse"
            }
          }
        }
      }
    },
    "500": {
      "description": "The operation was not successful (possible errors are invalid field names or conditions in filter parameters provided)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error500"
          }
        }
      }
    }
  }
}
```

<a id="a086"></a>
## A086 POST /api/tasks/{taskId}/complete

**Implementation:** [TasksApiController::MarkTaskAsCompleted](../controllers/Api/TasksApiController.php#L17).

**Request and success response:** R taskId; JSON {} allowed. O done_time YYYY-MM-DD HH:mm:ss, default now if missing/invalid. 204. Updates done=1 and done_timestamp.

**Permissions:** TASKS_MARK_COMPLETED

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Task does not exist`.

**Dependencies:** [TasksService::MarkTaskAsCompleted](../services/TasksService.php#L39), [TasksService::TaskExists](../services/TasksService.php#L71)

Referenced database relations: `tasks`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "taskId",
      "required": true,
      "description": "A valid task id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "done_time": {
              "type": "string",
              "format": "date-time",
              "description": "The time of when the task was completed, when omitted, the current time is used"
            }
          }
        }
      }
    }
  },
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing task)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a087"></a>
## A087 POST /api/tasks/{taskId}/undo

**Implementation:** [TasksApiController::UndoTask](../controllers/Api/TasksApiController.php#L41).

**Request and success response:** R taskId. No body. 204. Sets done=0 and done_timestamp=null; missing task 400.

**Permissions:** TASKS_UNDO_EXECUTION

**Errors:** Common E. Caught Exception → 400. Permission denial → 403 (check occurs outside the generic catch).

Source-defined error messages: `Task does not exist`.

**Dependencies:** [TasksService::UndoTask](../services/TasksService.php#L55), [TasksService::TaskExists](../services/TasksService.php#L71)

Referenced database relations: `tasks`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "taskId",
      "required": true,
      "description": "A valid task id",
      "schema": {
        "type": "integer"
      }
    }
  ],
  "responses": {
    "204": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful (possible errors are: Not existing task)",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a088"></a>
## A088 GET /api/calendar/ical

**Implementation:** [CalendarApiController::Ical](../controllers/Api/CalendarApiController.php#L24).

**Request and success response:** O secret query special-purpose calendar key (or ordinary auth). 200 text/calendar; charset=utf-8, attachment Grocy.ics. Server-generated events include chore description and action links. Not a JSON event API.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [CalendarService::GetEvents](../services/CalendarService.php#L17), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [TasksService::GetCurrent](../services/TasksService.php#L9), [UsersService::GetUsersAsDto](../services/UsersService.php#L117), [ChoresService::GetCurrent](../services/ChoresService.php#L143), [BatteriesService::GetCurrent](../services/BatteriesService.php#L28), [CalendarApiController::BuildIcalChoreDescription](../controllers/Api/CalendarApiController.php#L141), [ApiKeyService::GetOrCreateApiKey](../services/ApiKeyService.php#L34), [ApiKeyService::CreateApiKey](../services/ApiKeyService.php#L10), [ApiKeyService::GenerateApiKey](../services/ApiKeyService.php#L101)

Referenced database relations: `api_keys`, `batteries`, `batteries_current`, `chores`, `chores_current`, `meal_plan`, `meal_plan_sections`, `products`, `recipes`, `task_categories`, `tasks_current`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "The iCal file contents",
      "content": {
        "text/calendar": {
          "schema": {
            "type": "string"
          }
        }
      }
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a089"></a>
## A089 GET /api/calendar/ical/sharing-link

**Implementation:** [CalendarApiController::IcalSharingLink](../controllers/Api/CalendarApiController.php#L102).

**Request and success response:** No parameters. 200 {url}; GET may create a special-purpose API key. Treat URL as a credential.

**Permissions:** Authenticated; no explicit action permission check.

**Errors:** Common E. Caught Exception → 400.

**Dependencies:** [ApiKeyService::GetOrCreateApiKey](../services/ApiKeyService.php#L34), [ApiKeyService::CreateApiKey](../services/ApiKeyService.php#L10), [ApiKeyService::GenerateApiKey](../services/ApiKeyService.php#L101)

Referenced database relations: `api_keys`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "responses": {
    "200": {
      "description": "The (public) sharing link for the calendar in iCal format",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "url": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
}
```

<a id="a090"></a>
## A090 GET /api/calendar/ical/chores/{choreId}/mark-as-done

**Implementation:** [CalendarApiController::IcalChoreMarkAsDone](../controllers/Api/CalendarApiController.php#L116).

**Request and success response:** R choreId. O secret calendar key or normal auth. No body. 200 ChoreLogEntry using now/current authenticated key owner; delegated helper checks CHORE_TRACK_EXECUTION. Mutating GET: never prefetch.

**Permissions:** CHORE_TRACK_EXECUTION

**Errors:** Common E. No generic local catch; unhandled failures → global errors. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Chore does not exist`; `User does not exist`; `Chores without a schedule can\'t be skipped`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `Location does not exist`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`.

**Dependencies:** [CalendarApiController::TrackChoreFromIcal](../controllers/Api/CalendarApiController.php#L126), [ChoresService::TrackChore](../services/ChoresService.php#L163), [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [ChoresService::ChoreExists](../services/ChoresService.php#L277), [ChoresService::CalculateNextExecutionAssignment](../services/ChoresService.php#L19), [UsersService::GetUsersAsDto](../services/UsersService.php#L117)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `chores`, `chores_current`, `chores_execution_users_statistics`, `chores_log`, `lastInsertId`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`, `user_settings`, `users`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "choreId",
      "required": true,
      "description": "A valid chore id",
      "schema": {
        "type": "integer"
      }
    },
    {
      "in": "query",
      "name": "secret",
      "required": true,
      "description": "A valid special-purpose calendar iCal API key",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="a091"></a>
## A091 GET /api/calendar/ical/chores/{choreId}/skip

**Implementation:** [CalendarApiController::IcalChoreSkip](../controllers/Api/CalendarApiController.php#L121).

**Request and success response:** R choreId. O secret calendar key or normal auth. No body. 200 ChoreLogEntry with skipped=true; delegated helper checks CHORE_TRACK_EXECUTION. Manual chore skip fails. Mutating GET: never prefetch.

**Permissions:** CHORE_TRACK_EXECUTION

**Errors:** Common E. No generic local catch; unhandled failures → global errors. Permission denial → 400 (generic catch around permission check or delegated handler). This action catches delegated permission denial as 400 where an action permission is checked.

Source-defined error messages: `Chore does not exist`; `User does not exist`; `Chores without a schedule can\'t be skipped`; `Product does not exist or is inactive`; `Amount can\'t be <= 0`; `Location does not exist`; `The amount cannot be lower than the defined tare weight`; `Amount to be consumed cannot be > current stock amount (if supplied, at the desired location)`; `Transaction type $transactionType is not valid (StockService.ConsumeProduct)`; `Product can\'t be opened`; `Opening tare weight handling enabled products is not supported`; `Amount to be opened cannot be > current unopened stock amount`; `Source location does not exist`; `Destination location does not exist`; `Transferring tare weight enabled products is not yet possible`; `Amount to be transferred cannot be > current stock amount at the source location`; `Shopping list does not exist`.

**Dependencies:** [CalendarApiController::TrackChoreFromIcal](../controllers/Api/CalendarApiController.php#L126), [ChoresService::TrackChore](../services/ChoresService.php#L163), [StockService::ConsumeProduct](../services/StockService.php#L365), [UsersService::GetUserSetting](../services/UsersService.php#L71), [StockService::ProductExists](../services/StockService.php#L1819), [StockService::LocationExists](../services/StockService.php#L1813), [StockService::GetProductDetails](../services/StockService.php#L762), [StockService::GetCurrentStock](../services/StockService.php#L699), [DatabaseService::ExecuteDbQuery](../services/DatabaseService.php#L14), [DatabaseService::GetDbConnectionRaw](../services/DatabaseService.php#L86), [DatabaseService::GetDbFilePath](../services/DatabaseService.php#L135), [DatabaseService::ExecuteDbStatement](../services/DatabaseService.php#L26), [StockService::GetProductStockEntries](../services/StockService.php#L873), [StockService::GetProductStockEntriesForLocation](../services/StockService.php#L900), [StockService::OpenProduct](../services/StockService.php#L986), [LocalizationService::__t](../services/LocalizationService.php#L94), [LocalizationService::CheckAndAddMissingTranslationToPot](../services/LocalizationService.php#L28), [StockService::TransferProduct](../services/StockService.php#L1272), [StockService::AddMissingProductsToShoppingList](../services/StockService.php#L21), [StockService::ShoppingListExists](../services/StockService.php#L1825), [StockService::GetMissingProducts](../services/StockService.php#L749), [ChoresService::ChoreExists](../services/ChoresService.php#L277), [ChoresService::CalculateNextExecutionAssignment](../services/ChoresService.php#L19), [UsersService::GetUsersAsDto](../services/UsersService.php#L117)

Referenced database relations: `cache__quantity_unit_conversions_resolved`, `chores`, `chores_current`, `chores_execution_users_statistics`, `chores_log`, `lastInsertId`, `locations`, `product_barcodes`, `products`, `quantity_units`, `shopping_list`, `shopping_lists`, `stock`, `stock_log`, `stock_next_use`, `uihelper_product_details`, `user_settings`, `users`, `users_dto`.

**Local OpenAPI declaration** (not proof of runtime behavior; references resolve in schema dictionary):
```json
{
  "parameters": [
    {
      "in": "path",
      "name": "choreId",
      "required": true,
      "description": "A valid chore id",
      "schema": {
        "type": "integer"
      }
    },
    {
      "in": "query",
      "name": "secret",
      "required": true,
      "description": "A valid special-purpose calendar iCal API key",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "description": "The operation was successful"
    },
    "400": {
      "description": "The operation was not successful",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/Error400"
          }
        }
      }
    }
  }
}
```

<a id="aopt"></a>
## AOPT OPTIONS /api/{routes:.+}
R routes path suffix; browser may send Origin, Access-Control-Request-Method and Access-Control-Request-Headers. No body. CorsMiddleware returns 204 with Access-Control-Allow-Origin: *, methods GET, POST, PUT, DELETE, OPTIONS and Allow-Headers: *. No Access-Control-Allow-Credentials. Global auth may intercept before route CORS: verify unauthenticated preflight. No action permission. Dependencies: app.php middleware ordering, AuthMiddleware, CorsMiddleware. Common E can apply before handler.
