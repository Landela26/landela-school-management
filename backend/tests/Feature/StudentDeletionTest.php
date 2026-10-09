<?php

namespace Tests\Feature;

use App\Models\Eleve;
use App\Models\Utilisateur;
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
}
