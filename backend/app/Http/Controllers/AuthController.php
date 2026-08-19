<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    /**
     * Connexion de l'utilisateur.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        $request->session()->regenerate();

        /** @var \App\Models\Utilisateur $user */
        $user = Auth::user();

        $user->update([
            'derniere_connexion' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie.',
            'data' => [
                'user' => [
                    'id_utilisateur' => $user->id_utilisateur,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
        ]);
    }

    /**
     * Retourne l'utilisateur actuellement connecté.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var \App\Models\Utilisateur|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Informations de l’utilisateur récupérées avec succès.',
            'data' => [
                'id_utilisateur' => $user->id_utilisateur,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'actif' => $user->actif,
            ],
        ]);
    }

    /**
     * Déconnexion.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie.',
        ]);
    }
}
