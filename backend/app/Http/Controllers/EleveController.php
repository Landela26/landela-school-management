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
     *
     * Filtres disponibles :
     * - nom
     * - postnom
     * - prenom
     * - matricule
     * - sexe
     * - date de naissance
     * - adresse
     * - statut
     */
    public function index(Request $request): JsonResponse
    {
        $query = Eleve::query();

        /*
         * Nettoyage des paramètres de recherche.
         *
         * trim() permet notamment d'éviter qu'une valeur composée
         * uniquement d'espaces soit considérée comme une recherche.
         */
        $nom = trim((string) $request->input('nom', ''));
        $postnom = trim((string) $request->input('postnom', ''));
        $prenom = trim((string) $request->input('prenom', ''));
        $matricule = trim((string) $request->input('matricule', ''));
        $sexe = trim((string) $request->input('sexe', ''));
        $dateNaissance = trim((string) $request->input('dateNaissance', ''));
        $adresse = trim((string) $request->input('adresse', ''));
        $statut = trim((string) $request->input('statut', ''));

        /*
         * Filtres textuels.
         */
        if ($nom !== '') {
            $query->where('nom', 'like', "%{$nom}%");
        }

        if ($postnom !== '') {
            $query->where('postnom', 'like', "%{$postnom}%");
        }

        if ($prenom !== '') {
            $query->where('prenom', 'like', "%{$prenom}%");
        }

        if ($matricule !== '') {
            $query->where('matricule', 'like', "%{$matricule}%");
        }

        /*
         * Filtres exacts.
         */
        if ($sexe !== '') {
            $query->where('sexe', $sexe);
        }

        if ($dateNaissance !== '') {
            $query->whereDate('date_naissance', $dateNaissance);
        }

        if ($adresse !== '') {
            $query->where('adresse', 'like', "%{$adresse}%");
        }

        if ($statut !== '') {
            $query->where('statut', $statut);
        }

        /*
         * Nombre d'éléments par page.
         *
         * Valeur par défaut : 20
         * Minimum : 1
         * Maximum : 100
         */
        $parPage = min(
            max((int) $request->input('per_page', 20), 1),
            100
        );

        /*
         * Numéro de page demandé.
         */
        $pageDemandee = max(
            (int) $request->input('page', 1),
            1
        );

        /*
         * Calcul du nombre total de résultats.
         */
        $total = (clone $query)->count();

        /*
         * Aucun résultat.
         */
        if ($total === 0) {
            return response()->json([
                'success' => true,
                'message' => 'Aucun élève ne correspond aux critères de recherche.',
                'data' => [],
                'pagination' => [
                    'page_courante' => 1,
                    'derniere_page' => 1,
                    'par_page' => $parPage,
                    'total' => 0,
                    'de' => null,
                    'a' => null,
                ],
            ]);
        }

        /*
         * Calcul de la dernière page.
         */
        $dernierePage = (int) ceil($total / $parPage);

        /*
         * Si la page demandée dépasse la dernière page,
         * on utilise automatiquement la dernière page disponible.
         *
         * Exemple :
         * page demandée = 4
         * dernière page = 2
         * page utilisée = 2
         */
        $pageCourante = min(
            $pageDemandee,
            $dernierePage
        );

        /*
         * Récupération des élèves.
         */
        $eleves = $query
            ->orderByDesc('id_eleve')
            ->paginate(
                $parPage,
                ['*'],
                'page',
                $pageCourante
            );

        return response()->json([
            'success' => true,
            'message' => 'Liste des élèves récupérée avec succès.',
            'data' => $eleves->items(),
            'pagination' => [
                'page_courante' => $eleves->currentPage(),
                'derniere_page' => $eleves->lastPage(),
                'par_page' => $eleves->perPage(),
                'total' => $eleves->total(),
                'de' => $eleves->firstItem(),
                'a' => $eleves->lastItem(),
            ],
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
