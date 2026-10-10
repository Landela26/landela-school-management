<?php

namespace Tests\Feature;

use App\Models\Eleve;
use App\Models\Presence;
use App\Services\SchoolSettingsService;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class StudentPurgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_purges_students_when_the_grace_period_has_expired(): void
    {
        app(SchoolSettingsService::class)->updateSettings([
            'student_deletion_delay_days' => 5,
        ]);

        $eleve = Eleve::factory()->create();
        $eleve->delete();
        $eleve->deleted_at = now()->subDays(6);
        $eleve->saveQuietly();

        Artisan::call('students:purge-expired');

        $this->assertDatabaseMissing('eleves', [
            'id_eleve' => $eleve->id_eleve,
        ]);
        $this->assertSame(0, Artisan::call('students:purge-expired'));
    }

    public function test_it_keeps_students_within_the_grace_period(): void
    {
        app(SchoolSettingsService::class)->updateSettings([
            'student_deletion_delay_days' => 5,
        ]);

        $eleve = Eleve::factory()->create();
        $eleve->delete();
        $eleve->deleted_at = now()->subDays(2);
        $eleve->saveQuietly();

        Artisan::call('students:purge-expired');

        $this->assertSoftDeleted('eleves', [
            'id_eleve' => $eleve->id_eleve,
        ]);
    }

    public function test_it_does_not_remove_active_students(): void
    {
        $eleve = Eleve::factory()->create();

        Artisan::call('students:purge-expired');

        $this->assertDatabaseHas('eleves', [
            'id_eleve' => $eleve->id_eleve,
            'deleted_at' => null,
        ]);
    }

    public function test_it_preserves_attendance_history_when_students_are_purged(): void
    {
        app(SchoolSettingsService::class)->updateSettings([
            'student_deletion_delay_days' => 5,
        ]);

        $eleve = Eleve::factory()->create([
            'nom' => 'Kavula',
            'postnom' => 'Mputu',
            'prenom' => 'Jean',
        ]);
        $eleve->delete();
        $eleve->deleted_at = now()->subDays(6);
        $eleve->saveQuietly();

        $presence = Presence::factory()->create([
            'id_eleve' => $eleve->id_eleve,
            'id_attribution' => null,
            'nom_eleve_snapshot' => 'Jean Kavula',
            'classe_snapshot' => '6A',
            'date_heure' => now()->subDay(),
        ]);

        Artisan::call('students:purge-expired');

        $this->assertDatabaseMissing('eleves', [
            'id_eleve' => $eleve->id_eleve,
        ]);

        $historique = Presence::query()->find($presence->id_presence);

        $this->assertNotNull($historique);
        $this->assertSame('Jean Kavula', $historique->nom_eleve_snapshot);
        $this->assertSame('6A', $historique->classe_snapshot);
    }

    public function test_it_uses_the_configured_grace_period_from_f10(): void
    {
        app(SchoolSettingsService::class)->updateSettings([
            'student_deletion_delay_days' => 30,
        ]);

        $configured = Eleve::factory()->create();
        $configured->delete();
        $configured->deleted_at = now()->subDays(31);
        $configured->saveQuietly();

        app(SchoolSettingsService::class)->updateSettings([
            'student_deletion_delay_days' => 60,
        ]);

        Artisan::call('students:purge-expired');

        $this->assertDatabaseHas('eleves', [
            'id_eleve' => $configured->id_eleve,
        ]);
    }

    public function test_it_registers_the_purge_command_in_the_scheduler(): void
    {
        $events = app(Schedule::class)->events();

        $this->assertNotEmpty($events);
        $this->assertTrue(collect($events)->contains(
            fn ($event) => str_contains($event->command, 'students:purge-expired')
        ));
    }
}
