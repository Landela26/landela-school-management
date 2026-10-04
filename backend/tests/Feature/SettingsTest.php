<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_read_default_settings(): void
    {
        $this->actingAs(Utilisateur::factory()->create())
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.late_after', '08:00')
            ->assertJsonPath('data.student_deletion_delay_days', 30);
    }

    public function test_administrator_can_update_and_read_settings(): void
    {
        $admin = Utilisateur::factory()->create();

        $this->actingAs($admin)
            ->putJson('/api/settings', [
                'late_after' => '08:30',
                'student_deletion_delay_days' => 45,
            ])
            ->assertOk()
            ->assertJsonPath('data.late_after', '08:30')
            ->assertJsonPath('data.student_deletion_delay_days', 45);

        $this->actingAs($admin)
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.late_after', '08:30')
            ->assertJsonPath('data.student_deletion_delay_days', 45);
    }

    public function test_settings_update_requires_valid_values(): void
    {
        $this->actingAs(Utilisateur::factory()->create())
            ->putJson('/api/settings', ['late_after' => '8:30'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('late_after');

        $this->actingAs(Utilisateur::factory()->create())
            ->putJson('/api/settings', ['student_deletion_delay_days' => 0])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('student_deletion_delay_days');

        $this->actingAs(Utilisateur::factory()->create())
            ->putJson('/api/settings', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['late_after', 'student_deletion_delay_days']);
    }

    public function test_settings_are_only_available_to_administrators(): void
    {
        $this->getJson('/api/settings')->assertUnauthorized();
    }
}
