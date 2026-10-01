<?php

namespace Grocy\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

/** Opt-in migration shell; authentication uses the existing page middleware. */
class ReactController extends BaseController
{
	public function Index(Request $request, Response $response, array $args)
	{
		if (!file_exists(__DIR__ . '/../public/react/app.js'))
		{
			$response->getBody()->write('React assets are missing. Run npm ci and npm run build in frontend/.');
			return $response->withStatus(503)->withHeader('Content-Type', 'text/plain; charset=utf-8');
		}
		return $this->Render($response, 'react');
	}
}
