<?php

namespace App\Services;

use App\Models\Eleve;
use App\Models\Personnel;
use App\Models\Classe;
use App\Models\Presence;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Retourne toutes les données nécessaires au tableau de bord.
     */
    public function obtenirTableauDeBord(): array
    {
        return [
            'indicateurs_generaux' => $this->obtenirIndicateursGeneraux(),
            'pointage_du_jour' => $this->obtenirPointageDuJour(),
            'pointage_par_classe' => $this->obtenirPointageParClasse(),
        ];
    }

    /**
     * Retourne les indicateurs généraux.
     */
    private function obtenirIndicateursGeneraux(): array
    {
        $aujourdHui = now()->toDateString();

        return [
            'total_eleves' => Eleve::where('statut', 'actif')->count(),

            'total_personnel' => Personnel::where('statut', 'actif')->count(),

            'total_presences' => Presence::whereDate(
                'date_heure',
                $aujourdHui
            )->count(),
        ];
    }

    /**
     * Retourne les statistiques de présence du jour.
     */
    private function obtenirPointageDuJour(): array
    {
        $aujourdHui = now()->toDateString();

        $presences = Presence::whereDate(
            'date_heure',
            $aujourdHui
        );

        return [
            'presents' => (clone $presences)
                ->where('statut_presence', 'present')
                ->count(),

            'retards' => (clone $presences)
                ->where('statut_presence', 'retard')
                ->count(),

            'absents' => (clone $presences)
                ->where('statut_presence', 'absent')
                ->count(),
        ];
    }

    /**
     * Retourne les statistiques de pointage par classe.
     */
    private function obtenirPointageParClasse(): array
    {
        $aujourdHui = now()->toDateString();

        $classes = Classe::query()
            ->where('statut', 'active')
            ->withCount([
                'inscriptions as total_eleves' => function ($requete) {
                    $requete->where('statut', 'active');
                },
            ])
            ->get();

        return $classes->map(function ($classe) use ($aujourdHui) {

            $eleveIds = $classe->inscriptions()
                ->where('statut', 'active')
                ->pluck('id_eleve');

            $totalPointes = DB::table('presences')
                ->join(
                    'attribution_cartes',
                    'attribution_cartes.id',
                    '=',
                    'presences.id_attribution'
                )
                ->whereIn(
                    'attribution_cartes.id_eleve',
                    $eleveIds
                )
                ->whereDate(
                    'presences.date_heure',
                    $aujourdHui
                )
                ->count();

            return [
                'id_classe' => $classe->id_classe,
                'nom_classe' => $classe->nom_classe,
                'total_eleves' => $classe->total_eleves,
                'eleves_pointes' => $totalPointes,
            ];
        })->values()->toArray();
    }
}
