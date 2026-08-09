-----

<div align="center">
<img alt="Logo" height="50" src="https://raw.githubusercontent.com/grocy/grocy/master/public/img/logo.svg?sanitize=true" />
<h2>ERP beyond your fridge</h2>
<h3>Grocy is a web-based self-hosted groceries & household management solution for your home</h3>
<em><h4>This is a hobby project by <a href="https://berrnd.de">Bernd Bestel</a></h4></em>
</div>

-----

## Give it a try

- Public demo of the latest stable version (`release` branch) &rarr; [https://demo.grocy.info](https://demo.grocy.info)
- Public demo of the current development version (`master` branch) &rarr; [https://demo-prerelease.grocy.info](https://demo-prerelease.grocy.info)

## Features

See the website. &rarr; <https://grocy.info>

## Questions / Help / Bug Reports / Feature Requests

- General help and usage questions &rarr;  [r/grocy on Reddit](https://www.reddit.com/r/grocy)
- Bug Reports and Feature Requests &rarr; [Issue Tracker](https://github.com/grocy/grocy/issues/new/choose)

_Please don't send me private messages or call me regarding anything Grocy. I check the issue tracker and the subreddit pretty much daily, but don't provide any support beyond that._

## Community contributions

See the website for a list of community contributed Add-ons / Tools. &rarr; [https://grocy.info/addons](https://grocy.info/addons)

## How to install

> Checkout [Grocy Desktop](https://github.com/grocy/grocy-desktop), if you want to run Grocy without having to manage a webserver just like a normal (Windows) desktop application.
>
> Directly download the [latest release](https://releases.grocy.info/latest-desktop) (also [available via the Microsoft Store](https://apps.microsoft.com/detail/9NWB1TRNNKSF)) - the installation is nothing more than just clicking 2 times "next".

- Unpack the [latest release](https://releases.grocy.info/latest)
- Ensure that the `data` directory is writable
- Include `try_files $uri /index.php$is_args$query_string;` in your location block if you use nginx
  - Or disable URL rewriting (see the option `DISABLE_URL_REWRITING` in `data/config.php`)

### Installing from the Git repository

If you clone this repository instead of downloading a release package, additional development dependencies must be installed manually. The `release` branch always references the latest released version.

#### 1. Install PHP and required extensions

Grocy requires PHP 8.5 and the PHP extensions listed in the [Platform support](#platform-support) section below.

Before installing dependencies, verify which `php.ini` is used by the command-line PHP:

```powershell
php --ini
```

On Windows, especially when PHP was installed through WinGet, make sure the required extensions are enabled in that exact `php.ini`. Missing extensions can cause Composer or Grocy to fail with messages such as `ext-fileinfo`, `ext-intl`, `ext-gd`, `pdo_sqlite`, or `mbstring` not being installed.

You can verify loaded extensions with:

```powershell
php -m
```

#### 2. Install Composer dependencies

Install [Composer](https://getcomposer.org/) and run it from the repository root:

```powershell
composer install
```

If Composer is available only as a PHAR file, for example on Windows:

```powershell
php C:\path\to\composer.phar install
```

**Important:** Grocy intentionally configures Composer's `vendor-dir` as `packages`, so the PHP dependencies are installed into:

```text
packages/
```

After a successful installation, this file must exist:

```text
packages/autoload.php
```

On PowerShell you can verify it with:

```powershell
Test-Path .\packages\autoload.php
```

The result should be `True`.

If Composer reports that the ZIP extension and `unzip`/`7z` are missing, enable PHP's `zip` extension or install an extraction tool such as 7-Zip, then run `composer install` again.

#### 3. Install Yarn dependencies

Install Yarn and run:

```powershell
yarn install
```

Grocy's `.yarnrc` intentionally installs frontend dependencies into:

```text
public/packages/
```

This is different from Composer's `packages/` directory. The expected structure is therefore:

```text
grocy/
├── packages/              # Composer / PHP dependencies
│   └── autoload.php
├── public/
│   └── packages/          # Yarn / frontend dependencies
├── data/
│   └── config.php
└── ...
```

Do **not** create a symlink or directory junction between `packages/` and `public/packages/`. They contain different dependency sets and must remain separate.

A frontend dependency can be checked on PowerShell, for example:

```powershell
Test-Path .\public\packages\bootstrap\dist\css\bootstrap.min.css
```

The result should be `True`.

#### 4. Configure the data directory

If `data/config.php` does not exist, create it from the distributed configuration:

```powershell
Copy-Item .\config-dist.php .\data\config.php
```

Make sure `data/` is writable. Grocy stores its SQLite database and runtime data there.

#### 5. Run Grocy locally

The webserver document root must be `public`, not the repository root. For local development with PHP's built-in server, run this command from the repository root:

```powershell
php -S localhost:8000 -t public
```

Then open `http://localhost:8000` in your browser.

Running `php index.php` manually is not the recommended way to serve Grocy. Likewise, starting the PHP server without `-t public` can cause incorrect routing or missing assets.

### Common installation problems

| Error | Likely cause | Fix |
| --- | --- | --- |
| `packages/autoload.php not found. Have you run Composer?` | Composer dependencies are missing or `packages/` contains the wrong files | Run `composer install` from the repository root and verify `packages/autoload.php` exists |
| `config.php in data directory ... not found` | `data/config.php` has not been created | Copy `config-dist.php` to `data/config.php` |
| `PHP module 'pdo_sqlite' not installed` | SQLite PDO extension is disabled | Enable `pdo_sqlite` in the CLI PHP configuration |
| `PHP module 'mbstring' not installed` | `mbstring` is disabled | Enable `mbstring` in `php.ini` |
| Composer reports missing `ext-fileinfo`, `ext-intl`, or `ext-gd` | Required PHP extensions are disabled | Enable the corresponding extensions in the `php.ini` shown by `php --ini` |
| Composer reports ZIP/unzip/7z missing | No supported archive extraction method is available | Enable PHP `zip` or install 7-Zip/unzip |
| `404` for `/packages/bootstrap/...`, Font Awesome, Roboto, etc. | Yarn dependencies are missing from `public/packages/` | Run `yarn install` and verify `public/packages/` contains the frontend packages |
| Login page loads but login/API requests return `401` | Installation/configuration may be incomplete, or credentials/session state are invalid | First verify PHP dependencies, frontend dependencies, `data/config.php`, and the database; the default credentials are `admin` / `admin` for a fresh installation |

For a repository installation on Windows, a useful final check is:

```powershell
Test-Path .\packages\autoload.php
Test-Path .\public\packages\bootstrap\dist\css\bootstrap.min.css
Test-Path .\data\config.php
Test-Path .\data\grocy.db
```

Once the application has initialized, these checks should return `True` (the database is created/initialized as part of running Grocy).

See the website for more installation guides and troubleshooting help. &rarr; [https://grocy.info/links](https://grocy.info/links)


### macOS (source installation)

The following steps are intended for contributors or developers who want to run Grocy directly from the source repository on macOS.

#### 1. Install PHP, Composer, Node.js and Yarn

Using Homebrew is the simplest approach:

```bash
brew install php composer node
corepack enable
```

Verify the tools:

```bash
php -v
composer --version
node --version
yarn --version
```

Check that the PHP extensions required by Grocy are available:

```bash
php -m | grep -E 'fileinfo|pdo_sqlite|gd|ctype|intl|zlib|mbstring'
```

Grocy requires `fileinfo`, `pdo_sqlite`, `gd`, `ctype`, `intl`, `zlib` and `mbstring`. If an extension is missing, check which configuration file the CLI PHP installation uses:

```bash
php --ini
```

When multiple PHP installations exist, make sure the PHP executable used in the terminal and Composer use the same PHP installation.

#### 2. Clone the repository

```bash
git clone https://github.com/grocy/grocy.git
cd grocy
```

For the latest stable release source:

```bash
git checkout release
```

#### 3. Install PHP dependencies

From the Grocy project root:

```bash
composer install
```

This project configures Composer's `vendor-dir` as `packages`, so the PHP autoloader should be created at:

```text
packages/autoload.php
```

Verify it with:

```bash
test -f packages/autoload.php && echo "Composer dependencies OK"
```

#### 4. Install frontend dependencies

```bash
yarn install
```

Frontend packages are installed under `public/packages`.

Do not replace `public/packages` with a symlink to the root `packages` directory. They contain different dependency sets:

```text
packages/         -> PHP / Composer dependencies
public/packages/  -> JavaScript/CSS / Yarn dependencies
```

#### 5. Create the configuration file

```bash
cp config-dist.php data/config.php
```

Ensure the data directory is writable:

```bash
chmod -R u+rwX data
```

#### 6. Start Grocy

From the project root:

```bash
php -S localhost:8000 -t public
```

Then open `http://localhost:8000` in your browser.

The default login is:

```text
Username: admin
Password: admin
```

Change the default password immediately after logging in.

---

### Linux (source installation)

The exact package names can vary between distributions. The example below uses Ubuntu/Debian-style package names.

#### 1. Install system dependencies

```bash
sudo apt update
sudo apt install git curl unzip php php-cli php-sqlite3 php-gd php-intl php-mbstring php-zip composer nodejs npm
```

If your distribution provides PHP extensions as version-specific packages, install the packages matching the PHP version used by the CLI.

Verify PHP:

```bash
php -v
php --ini
php -m | grep -E 'fileinfo|pdo_sqlite|gd|ctype|intl|zlib|mbstring'
```

Install or enable any missing extension before continuing.

#### 2. Install Yarn

If Corepack is available with your Node.js installation:

```bash
sudo corepack enable
yarn --version
```

If `corepack` is unavailable, install Yarn using the method recommended for your Node.js/distribution environment.

#### 3. Clone Grocy

```bash
git clone https://github.com/grocy/grocy.git
cd grocy
git checkout release
```

#### 4. Install PHP dependencies

```bash
composer install
```

Verify the Composer autoloader:

```bash
test -f packages/autoload.php && echo "Composer dependencies OK"
```

#### 5. Install frontend dependencies

```bash
yarn install
```

Again, keep these directories separate:

```text
packages/         -> Composer dependencies
public/packages/  -> Yarn frontend dependencies
```

#### 6. Configure Grocy

```bash
cp config-dist.php data/config.php
chmod -R u+rwX data
```

For a local development environment, your current user must be able to write to `data`.

For a production Apache/nginx/PHP-FPM installation, grant the webserver/PHP-FPM user the required write access instead of making the directory globally writable.

#### 7. Start the local development server

```bash
php -S localhost:8000 -t public
```

Open `http://localhost:8000`.

Default credentials:

```text
Username: admin
Password: admin
```

#### 8. Production webserver note

PHP's built-in server is intended for local development/testing. For a normal Linux deployment, configure Apache or nginx so that the document root points to Grocy's `public` directory.

For nginx, the existing Grocy installation instructions require the following routing rule:

```nginx
try_files $uri /index.php$is_args$query_string;
```

Alternatively, URL rewriting can be disabled using `DISABLE_URL_REWRITING` in `data/config.php`.

---

### Cross-platform source installation checklist

After installation on Windows, macOS or Linux, the following items should exist:

```text
data/config.php
packages/autoload.php
public/packages/
```

Useful checks on macOS/Linux:

```bash
test -f data/config.php && echo "config.php OK"
test -f packages/autoload.php && echo "Composer OK"
test -d public/packages && echo "Frontend packages OK"
php -m | grep -E 'fileinfo|pdo_sqlite|gd|ctype|intl|zlib|mbstring'
```

If the application reports:

```text
Unable to run Grocy: /packages/autoload.php not found. Have you run Composer?
```

run `composer install` from the project root.

If CSS, Bootstrap, FontAwesome or other frontend resources return `404`, run `yarn install` and verify that `public/packages` contains the frontend dependencies.

If Grocy reports that a PHP module such as `pdo_sqlite`, `gd`, `intl` or `mbstring` is missing, install/enable that module for the same PHP CLI installation shown by `php --ini`.


### Platform support

- PHP 8.5 (with SQLite 3.40+)
  - Required PHP extensions: `fileinfo`, `pdo_sqlite`, `gd`, `ctype`, `intl`, `zlib`, `mbstring`
- Recent Firefox, Chrome or Edge

## How to run using Docker

&rarr; https://hub.docker.com/r/linuxserver/grocy

## How to update

- Overwrite everything with the [latest release](https://releases.grocy.info/latest) while keeping the `data` directory
- Check `config-dist.php` for new configuration options and add them to your `data/config.php` where appropriate (the default values from `config-dist.php` will be used for not in `data/config.php` defined settings)

If you run Grocy on Linux, there is also `update.sh` (remember to make the script executable via `chmod +x update.sh` and ensure that you have `unzip` installed) which does exactly this and additionally creates a backup (`.tgz` archive) of the current installation in `data/backups` (backups older than 60 days will be deleted during the update).

## Localization

Grocy is fully localizable - the default language is English (integrated into code), a German localization is always maintained by me.

You can easily help translating Grocy on [Transifex](https://explore.transifex.com/grocy/grocy/) if your language is incomplete or not available yet.

The default language can be set in `data/config.php`, e. g. `Setting('DEFAULT_LOCALE', 'de');` and there is also a user setting (see the user settings page) to set a different language per user.

The [pre-release demo](https://demo-prerelease.grocy.info) is available for any translation which is at least 70 % complete and will pull the translations from Transifex 10 minutes past every hour, so you can have a kind of instant preview of your contributed translations. Thank you!

Also any translation which once reached a completion level of 70 % ([`strings` resource](https://app.transifex.com/grocy/grocy/strings/)) will be included in releases.

_RTL languages are not yet supported._

## Motivation

A household needs to be managed. Before Grocy I did this (for almost 10 years) using my first self written software (a C# Windows forms application) and with a bunch of Excel sheets. The software was a pain to use at the end and Excel is Excel. So I searched for and tried different things for a (very) long time, nothing 100 % fitted, so this is my aim for a "complete household management"-thing. ERP your fridge!

## Things worth to know

### REST API

See the integrated Swagger UI instance on [/api](https://demo.grocy.info/api).

The web frontend uses exactly this API for pretty much everything. So everything you can do there is also possible via the API.

### Barcode readers & camera scanning

Some fields (with a barcode icon) also allow to select a value by scanning a barcode. It works best when your barcode reader prefixes every barcode with a letter which is normally not part of a item name (I use a `$`) and sends a `TAB` after a scan.

Additionally it's also possible to use your device camera to scan a barcode by using the camera button on the right side of the corresponding input field (powered by [ZXing](https://github.com/zxing-js/library), totally offline / client-side camera stream processing. Please note due to browser security restrictions, this only works when serving Grocy via a secure connection (`https://`)). [Here](https://www.youtube.com/watch?v=veezFX4X1JU) and [there](https://www.youtube.com/watch?v=Y5YH6IJFnfc) are quick video demos of that.

_My personal recommendation: Use a USB barcode laser scanner. They are cheap and work 1000% better, faster, under any lighting condition and from any angle._

### Barcode lookup via external services

Products can be directly added to the database via looking them up against external services by a barcode.

This can be done in-place using the product picker workflow "External barcode lookup" (the workflow dialog is displayed when entering something unknown in any product input field) Quick video demo: <https://www.youtube.com/watch?v=-moXPA-VvGc>

A plugin for [Open Food Facts](https://world.openfoodfacts.org/) is included and used by default (see the `data/config.php` option `STOCK_BARCODE_LOOKUP_PLUGIN`).

See that plugin or `plugins/DemoBarcodeLookupPlugin.php` for a commented example implementation if you want to build a plugin.

### Input shorthands for date fields

For (productivity) reasons all date (and time) input (and display) fields use the ISO-8601 format regardless of localization.
The following shorthands are available:
- `MMDD` gets expanded to the given day on the current year, if > today, or to the given day next year, if < today, in proper notation
  - Example: `0517` will be converted to `2026-05-17`
- `YYYYMMDD` gets expanded to the proper ISO-8601 notation
  - Example: `20260417` will be converted to `2026-04-17`
- `YYYYMMe` or `YYYYMM+` gets expanded to the end of the given month in the given year in proper notation
  - Example: `202607e` will be converted to `2026-07-31`
- `[+/-]n[d/m/y]` gets expanded to a date relative to today, while adding (**+**) or subtracting (**-**) the **n**umber of **d**ays/**m**onths/**y**ears, in proper notation
  - Example: `+1m` will be converted to the same day next month
- `x` gets expanded to `2999-12-31` (which is an alias for "never overdue")
- Down/up arrow keys will increase/decrease the date by 1 day
- Right/left arrow keys will increase/decrease the date by 1 week
- Shift + down/up arrow keys will increase/decrease the date by 1 month
- Shift + right/left arrow keys will increase/decrease the date by 1 year

### Keyboard shorthands for buttons

Wherever a button contains a bold highlighted letter, this is a shortcut key.
Example: Button "**P** Add as new product" can be "pressed" by using the `P` key on your keyboard.

### Installable web app (PWA)

Grocy's web frontend is responsive and an "installable web app" ([PWA](https://en.wikipedia.org/wiki/Progressive_web_app), without providing any offline usage capabilities), that provides a pretty native mobile app-like experience without the need for additional tools.

- Quick video demo on Android/Firefox: <https://www.youtube.com/watch?v=L38drVZfwHs>
- Quick video demo on Android/Chrome: <https://www.youtube.com/watch?v=rjLdXUFDNuk>

### Database migrations

Database schema migration is done when visiting the root (`/`) route (click on the logo in the left upper edge) as needed and is also triggered automatically if the version has changed (so when an update has been made).

_Please note: Database migrations are supposed to work between releases, not between every commit. If you want to run the current `master` branch (which is the development version), you need to handle that (and more) yourself._

### Disable certain features

If you don't use certain feature sets of Grocy (for example if you don't need "Chores"), there are feature flags per major feature set to hide/disable the related UI elements (see `config-dist.php`).

### Adding your own CSS or JS without to have to modify the application itself

- When the file `data/custom_js.html` exists, the contents of the file will be added just before `</body>` (end of body) on every page
- When the file `data/custom_css.html` exists, the contents of the file will be added just before `</head>` (end of head) on every page

### Demo mode

When the `MODE` setting is set to `dev`, `demo` or `prerelease`, the application will work in a demo mode which means authentication is disabled and some demo data will be generated during the database schema migration (pass the query parameter `nodemodata`, e.g. `https://grocy.example.com/?nodemodata` to skip that).

### Embedded mode

When the file `embedded.txt` exists, it must contain a valid and writable path which will be used as the data directory instead of `data` and authentication will be disabled (used in [Grocy Desktop](https://github.com/grocy/grocy-desktop)).

In embedded mode, settings can be overridden by text files in `data/settingoverrides`, the file name must be `<SettingName>.txt` (e. g. `BASE_URL.txt`) and the content must be the setting value (normally one single line).

## Contributing / Say Thanks

See <https://grocy.info/#say-thanks> if you just want to say thanks or [Contributing](https://github.com/grocy/grocy?tab=contributing-ov-file#contributing-ov-file) for anything else.

## Roadmap

There is none. The progress of a specific bug/enhancement is always tracked in the corresponding request, at least by commit comment references.

[Milestones](https://github.com/grocy/grocy/milestones) are used to indicate in which version the corresponding request was done (`vNEXT` means it's currently planned to do that for the next release).

## Screenshots

### Stock overview

![Stock overview](https://github.com/grocy/grocy/raw/master/.github/publication_assets/stock.png "Stock overview")

### Shopping List

![Shopping List](https://github.com/grocy/grocy/raw/master/.github/publication_assets/shoppinglist.png "Shopping List")

### Meal Plan

![Meal Plan](https://github.com/grocy/grocy/raw/master/.github/publication_assets/mealplan.png "Meal Plan")

### Chores overview

![Chores overview](https://github.com/grocy/grocy/raw/master/.github/publication_assets/chores.png "Chores overview")

## License

The MIT License (MIT)
