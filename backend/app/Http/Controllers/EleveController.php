<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Services\EleveService;
use Illuminate\Http\JsonResponse;

class EleveController extends Controller
{
    public function __construct(
        private readonly EleveService $eleveService
    ) {}

    /**
     * Créer un nouvel élève.
     */
    public function store(StoreEleveRequest $request): JsonResponse
    {
        $eleve = $this->eleveService->creer(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Élève créé avec succès.',
            'data' => $eleve,
        ], 201);
    }
}
