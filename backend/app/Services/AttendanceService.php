<?php

namespace App\Services;

use App\Exceptions\AttendanceAlreadyRecordedException;
use App\Models\AttributionCarte;
use App\Models\CarteNfc;
use App\Models\Eleve;
use App\Models\Presence;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class AttendanceService
{
    public function listerCartesNfc(): array
    {
        return CarteNfc::query()
            ->select(['id', 'uid', 'numero_carte', 'statut'])
            ->orderBy('id')
            ->get()
            ->map(fn(CarteNfc $carte): array => [
                'id' => $carte->id,
                'uid' => $carte->uid,
                'numero' => $carte->numero_carte,
                'statut' => $carte->statut,
            ])
            ->all();
    }

    public function verifierCarteNfc(string $uid): bool
    {
        return CarteNfc::query()
            ->where('uid', $uid)
            ->where('statut', 'actif')
            ->whereHas('attributions', function (Builder $requete) {
                $requete
                    ->where('statut', 'actif')
                    ->whereNotNull('id_eleve')
                    ->whereHas('eleve', function (Builder $eleve) {
                        $eleve->where('statut', 'actif');
                    });
            })
            ->exists();
    }

    public function enregistrerPointageManuel(int $studentId, string $status, ?string $remark = null, ?string $heure = null): Presence
    {
        $eleve = Eleve::with('classe')->findOrFail($studentId);
        $attribution = $eleve->attributionsCartes()
            ->where('statut', 'actif')
            ->latest('date_attribution')
            ->first();

        return $this->pointage($eleve, $status, 'manuel', $attribution, $remark, $heure, false);
    }

    public function scannerBadgeNfc(string $uid, string $status, ?string $remark = null, ?string $heure = null): ?Presence
    {
        $carte = CarteNfc::where('uid', $uid)->first();



        $attribution = AttributionCarte::with('eleve.classe')
            ->where('id_carte', $carte->id)
            ->where('statut', 'actif')
            ->whereNotNull('id_eleve')
            ->latest('date_attribution')
            ->first();

        if (!$attribution?->eleve) {
            abort(404, 'Ce badge NFC n’est associé à aucun élève actif.');
        }

        return $this->pointage($attribution->eleve, $status, 'nfc', $attribution, $remark, $heure, true);
    }

    private function pointage(
        Eleve $eleve,
        string $status,
        string $source,
        ?AttributionCarte $attribution,
        ?string $remark,
        ?string $heure = null,
        bool $autoClassifyLate = false
    ): Presence {
        $dateHeure = $heure ? Carbon::parse($heure) : now();

        $alreadyRecorded = Presence::query()
            ->whereDate('date_heure', $dateHeure->toDateString())
            ->where(function (Builder $query) use ($eleve) {
                $query->where('id_eleve', $eleve->id_eleve)
                    ->orWhereHas('attribution', function (Builder $attributionQuery) use ($eleve) {
                        $attributionQuery->where('id_eleve', $eleve->id_eleve);
                    });
            })
            ->exists();

        if ($alreadyRecorded) {
            throw new AttendanceAlreadyRecordedException(
                'Cet élève a déjà été pointé aujourd’hui.'
            );
        }

        $statut = $this->classifyStatus($status, $dateHeure, $autoClassifyLate);
        $nom = trim(implode(' ', array_filter([
            $eleve->nom,
            $eleve->postnom,
            $eleve->prenom,
        ])));
        $classe = $eleve->classe?->nom_classe ?? 'Sans classe';

        return Presence::create([
            'id_attribution' => $attribution?->id,
            'id_eleve' => $eleve->id_eleve,
            'date_heure' => $dateHeure,
            'statut_presence' => $statut,
            'nom_eleve_snapshot' => $nom,
            'classe_snapshot' => $classe,
            'source_pointage' => $source,
            'snapshot' => [
                'nom_eleve' => $nom,
                'classe' => $classe,
            ],
            'remarque' => $remark,
        ]);
    }

    private function classifyStatus(string $status, Carbon $dateHeure, bool $autoClassifyLate): string
    {
        if (!$autoClassifyLate || $status !== 'present') {
            return $status;
        }

        $lateAfter = Carbon::createFromFormat(
            'H:i',
            (string) config('attendance.late_after', '08:00'),
            $dateHeure->getTimezone()
        )->setDate(
            $dateHeure->year,
            $dateHeure->month,
            $dateHeure->day
        );

        return $dateHeure->greaterThanOrEqualTo($lateAfter) ? 'retard' : 'present';
    }
}
