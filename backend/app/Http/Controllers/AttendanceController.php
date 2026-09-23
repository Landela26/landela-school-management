<?php

namespace App\Http\Controllers;

use App\Exceptions\AttendanceAlreadyRecordedException;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\StoreNfcScanRequest;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function __construct(private readonly AttendanceService $attendanceService) {}

    public function listerCartesNfc(): JsonResponse
    {
        $cartes = $this->attendanceService->listerCartesNfc();

        return response()->json([
            'success' => true,
            'message' => 'Liste des cartes NFC récupérée avec succès.',
            'data' => $cartes,
        ]);
    }

    public function verifierCarteNfc(string $uid): JsonResponse
    {
        $verifiee = $this->attendanceService->verifierCarteNfc($uid);

        return response()->json([
            'success' => true,
            'message' => 'Vérification de la carte NFC effectuée.',
            'data' => $verifiee,
        ]);
    }

    public function enregistrerPointageManuel(StoreAttendanceRequest $request): JsonResponse
    {
        try {
            $presence = $this->attendanceService->enregistrerPointageManuel(
                $request->integer('student_id'),
                $request->string('status')->toString(),
                $request->input('remarque'),
                $request->input('heure')
            );
        } catch (AttendanceAlreadyRecordedException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Présence enregistrée avec succès.',
            'data' => $presence->load('attribution'),
        ], 201);
    }

    public function scannerBadgeNfc(StoreNfcScanRequest $request): JsonResponse
    {
        //verify the NFC card and record attendance
        if (!$this->attendanceService->verifierCarteNfc($request->string('uid')->toString())) {
            return response()->json([
                'success' => false,
                'message' => 'Carte NFC invalide ou inactive.',
            ], 404);
        }
        try {
            $presence = $this->attendanceService->scannerBadgeNfc(
                $request->string('uid')->toString(),
                $request->string('status')->toString(),
                $request->input('remarque'),
                $request->input('heure')
            );
        } catch (AttendanceAlreadyRecordedException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pointage NFC enregistré avec succès.',
            'data' => $presence->load('attribution'),
        ], 201);
    }
}
