<?php

namespace Tests\Feature;

use App\Models\Eleve;
use App\Models\Utilisateur;
use App\Services\SchoolSettingsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_soft_delete_a_student(): void
    {
        $eleve = Eleve::factory()->create();

        $this->actingAs(Utilisateur::factory()->create())
            ->deleteJson("/api/students/{$eleve->id_eleve}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id_eleve', $eleve->id_eleve);

        $this->assertSoftDeleted('eleves', [
            'id_eleve' => $eleve->id_eleve,
        ]);

        $this->actingAs(Utilisateur::factory()->create())
            ->getJson('/api/students')
            ->assertOk()
            ->assertJsonMissing(['id_eleve' => $eleve->id_eleve]);
    }

    public function test_deleting_an_unknown_or_already_deleted_student_returns_not_found(): void
    {
        $admin = Utilisateur::factory()->create();
        $eleve = Eleve::factory()->create();
        $eleve->delete();

        $this->actingAs($admin)
            ->deleteJson("/api/students/{$eleve->id_eleve}")
            ->assertNotFound()
            ->assertJsonPath('success', false);

        $this->actingAs($admin)
            ->deleteJson('/api/students/999999')
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_student_deletion_requires_authentication_and_an_administrator_role(): void
    {
        $eleve = Eleve::factory()->create();

        $this->deleteJson("/api/students/{$eleve->id_eleve}")
            ->assertUnauthorized();

        $nonAdministrator = new Utilisateur();
        $nonAdministrator->role = 'teacher';

        $this->actingAs($nonAdministrator)
            ->deleteJson("/api/students/{$eleve->id_eleve}")
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('eleves', [
            'id_eleve' => $eleve->id_eleve,
            'deleted_at' => null,
        ]);
    }

    public function test_deleted_student_list_only_includes_students_within_the_grace_period(): void
    {
        $this->travelTo(Carbon::parse('2026-10-09 12:00:00'));
        app(SchoolSettingsService::class)->updateSettings([
            'student_deletion_delay_days' => 30,
        ]);

        $eligible = Eleve::factory()->create();
        $eligible->delete();
        $eligible->deleted_at = now()->subDays(29);
        $eligible->saveQuietly();

        $expired = Eleve::factory()->create();
        $expired->delete();
        $expired->deleted_at = now()->subDays(31);
        $expired->saveQuietly();

        $active = Eleve::factory()->create();

        $this->actingAs(Utilisateur::factory()->create())
            ->getJson('/api/students/deleted')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id_eleve', $eligible->id_eleve)
            ->assertJsonMissing(['id_eleve' => $expired->id_eleve])
            ->assertJsonMissing(['id_eleve' => $active->id_eleve])
            ->assertJsonPath('pagination.total', 1);
    }

    public function test_deleted_student_list_uses_the_configured_grace_period_and_requires_an_administrator(): void
    {
        $this->travelTo(Carbon::parse('2026-10-09 12:00:00'));
        app(SchoolSettingsService::class)->updateSettings([
            'student_deletion_delay_days' => 5,
        ]);

        $eleve = Eleve::factory()->create();
        $eleve->delete();
        $eleve->deleted_at = now()->subDays(6);
        $eleve->saveQuietly();

        $admin = Utilisateur::factory()->create();

        $this->actingAs($admin)
            ->getJson('/api/students/deleted')
            ->assertOk()
            ->assertJsonPath('data', [])
            ->assertJsonPath('pagination.total', 0);

        $nonAdministrator = new Utilisateur();
        $nonAdministrator->role = 'teacher';

        $this->actingAs($nonAdministrator)
            ->getJson('/api/students/deleted')
            ->assertForbidden();
    }
}
