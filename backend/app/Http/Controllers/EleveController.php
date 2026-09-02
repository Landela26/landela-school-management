<?php

namespace App\Http\Controllers;


use App\Http\Requests\StoreEleveRequest;
use App\Http\Requests\UpdateEleveRequest;
use App\Models\Eleve;
use App\Services\EleveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EleveController extends Controller
{
    public function __construct(
        private readonly EleveService $eleveService
    ) {}

    /**
     * Liste des élèves avec pagination et filtres.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Eleve::query();

        if ($request->filled('nom')) {
            $query->where('nom', 'like', '%' . $request->nom . '%');
        }

        if ($request->filled('postnom')) {
            $query->where('postnom', 'like', '%' . $request->postnom . '%');
        }

        if ($request->filled('prenom')) {
            $query->where('prenom', 'like', '%' . $request->prenom . '%');
        }

        if ($request->filled('matricule')) {
            $query->where('matricule', 'like', '%' . $request->matricule . '%');
        }

        if ($request->filled('sexe')) {
            $query->where('sexe', $request->sexe);
        }

        if ($request->filled('dateNaissance')) {
            $query->whereDate('date_naissance', $request->dateNaissance);
        }

        if ($request->filled('adresse')) {
            $query->where('adresse', 'like', '%' . $request->adresse . '%');
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $eleves = $query
            ->orderByDesc('id_eleve')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $eleves,
        ]);
    }
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
