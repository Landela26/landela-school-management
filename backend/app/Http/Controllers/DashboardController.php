<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Retourne les données du tableau de bord.
     */
    public function index(): JsonResponse
    {
        try {
            $tableauDeBord = $this->dashboardService->obtenirTableauDeBord();

            return response()->json([
                'success' => true,
                'message' => 'Données du tableau de bord récupérées avec succès.',
                'data' => $tableauDeBord,
            ], 200);
        } catch (Throwable $exception) {

            Log::error('Erreur lors de la récupération du tableau de bord.', [
                'message' => $exception->getMessage(),
                'fichier' => $exception->getFile(),
                'ligne' => $exception->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Impossible de récupérer les données du tableau de bord.',
                'data' => null,
            ], 500);
        }
    }
}
