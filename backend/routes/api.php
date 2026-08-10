<?php

use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/auth/login', function (Request $request) {
    $user = User::all()->toArray();
    return response()->json($user);
});

Route::post('/auth/login', [AuthController::class, 'login']);
