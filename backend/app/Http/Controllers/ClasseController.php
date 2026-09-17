<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClasseRequest;
use App\Http\Requests\UpdateClasseRequest;
use App\Models\Classe;
use App\Services\ClasseService;
use Illuminate\Http\JsonResponse;

class ClasseController extends Controller
{
    public function __construct(
        private readonly ClasseService $classeService
    ) {}
    public function index(): JsonResponse
    {
        $classes = $this->classeService->getliste();

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $classe = $this->classeService->getById($id);

        if (!$classe) {
            return response()->json([
                'success' => false,
                'message' => 'Classe non trouvée.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $classe,
        ]);
    }

    public function store(StoreClasseRequest $request): JsonResponse
    {
        $classe = $this->classeService->creer($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Classe créée avec succès.',
            'data' => $classe,
        ], 201);
    }

    public function update(UpdateClasseRequest $request, int $id): JsonResponse
    {
        $classe = Classe::find($id);

        if (!$classe) {
            return response()->json([
                'success' => false,
                'message' => 'Classe non trouvée.',
            ], 404);
        }

        $classeModifiee = $this->classeService->modifier(
            $classe,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Classe modifiée avec succès.',
            'data' => $classeModifiee,
        ]);
    }
}
