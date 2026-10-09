<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SchoolSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(private readonly SchoolSettingsService $settingsService) {}

    public function show(Request $request): JsonResponse
    {
        if ($response = $this->authorizeAdministrator($request)) {
            return $response;
        }

        return response()->json([
            'success' => true,
            'message' => 'Paramètres récupérés avec succès.',
            'data' => $this->settingsService->getSettings(),
        ]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        if ($response = $this->authorizeAdministrator($request)) {
            return $response;
        }

        return response()->json([
            'success' => true,
            'message' => 'Paramètres mis à jour avec succès.',
            'data' => $this->settingsService->updateSettings($request->validated()),
        ]);
    }

    private function authorizeAdministrator(Request $request): ?JsonResponse
    {
        if (in_array($request->user()?->role, ['admin', 'super_admin'], true)) {
            return null;
        }

        return response()->json([
            'success' => false,
            'message' => 'Accès réservé aux administrateurs.',
        ], 403);
    }
}
