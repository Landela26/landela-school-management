<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class AuthController extends Controller
{
   public function login(LoginRequest $request)
{
    $credentials = $request->validated();

    if (!Auth::attempt($credentials)) {
        return response()->json([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect.',
        ], 401);
    }

    $request->session()->regenerate();

    /** @var \App\Models\User $user */
    $user = Auth::user();

    return response()->json([
        'success' => true,
        'message' => 'Connexion réussie.',
        'data' => [
            'user' => [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ],
    ], 200);
}
    public function me()
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'message' => 'Informations de l’utilisateur récupérées avec succès.',
            'data' => [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 200);
    }


    public function logout(Request $request)
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

