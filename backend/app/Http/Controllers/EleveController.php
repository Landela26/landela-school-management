<?php

namespace App\Http\Controllers;


use App\Http\Requests\StoreEleveRequest;
use App\Http\Requests\UpdateEleveRequest;
use App\Models\Eleve;
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

    /**
     * Modifier un élève existant.
     */
    public function update(UpdateEleveRequest $request, $id): JsonResponse
    {

        $eleve = Eleve::find($id);
        if (!$eleve) {
            return response()->json([
                'success' => false,
                'message' => 'Élève non trouvé.',
            ], 404);
        }
        $eleve_updated = $this->eleveService->modifier(
            $eleve,
            $request->validated()
        );
        return response()->json([
            'success' => true,
            'message' => 'Élève modifié avec succès.',
            'data' => $eleve_updated,
        ], 200);
    }
}
