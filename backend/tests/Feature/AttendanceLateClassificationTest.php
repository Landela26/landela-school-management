<?php

namespace Tests\Feature;

use App\Models\AttributionCarte;
use App\Models\Eleve;
use App\Services\AttendanceService;
use App\Services\SchoolSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceLateClassificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_attendance_uses_the_school_late_threshold(): void
    {
        app(SchoolSettingsService::class)->updateSettings([
            'late_after' => '08:30',
        ]);

        $eleve = Eleve::factory()->create();

        $presence = app(AttendanceService::class)->enregistrerPointageManuel(
            $eleve->id_eleve,
            'present',
            null,
            '2026-10-04 08:30:00'
        );

        $this->assertSame('retard', $presence->statut_presence);
    }

    public function test_nfc_attendance_uses_the_school_late_threshold(): void
    {
        app(SchoolSettingsService::class)->updateSettings([
            'late_after' => '08:30',
        ]);

        $attribution = AttributionCarte::factory()->create();

        $presence = app(AttendanceService::class)->scannerBadgeNfc(
            $attribution->carte->uid,
            'present',
            null,
            '2026-10-04 08:30:00'
        );

        $this->assertSame('retard', $presence->statut_presence);
    }
}
