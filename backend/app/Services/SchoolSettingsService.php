<?php

namespace App\Services;

use App\Models\SchoolSetting;
use Illuminate\Support\Facades\DB;

class SchoolSettingsService
{
    private const DEFAULT_DELETION_DELAY_DAYS = 30;

    public function getSettings(): array
    {
        $storedSettings = SchoolSetting::query()
            ->pluck('setting_value', 'setting_key');

        return [
            'late_after' => $storedSettings->get('late_after', config('attendance.late_after', '08:00')),
            'student_deletion_delay_days' => (int) $storedSettings->get(
                'student_deletion_delay_days',
                self::DEFAULT_DELETION_DELAY_DAYS
            ),
        ];
    }

    public function updateSettings(array $settings): array
    {
        DB::transaction(function () use ($settings): void {
            foreach ($settings as $key => $value) {
                SchoolSetting::query()->updateOrCreate(
                    ['setting_key' => $key],
                    ['setting_value' => (string) $value]
                );
            }
        });

        return $this->getSettings();
    }
}
