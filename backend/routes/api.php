<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EleveController;
use Illuminate\Support\Facades\Route;
use Illuminate\Session\Middleware\StartSession;

Route::middleware([StartSession::class])->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    //dashboard route
    Route::middleware('auth:sanctum')->get('/dashboard', [DashboardController::class, 'index']);

    //eleve route
    Route::middleware('auth:sanctum')->post("/students", [EleveController::class, 'store']);
});
