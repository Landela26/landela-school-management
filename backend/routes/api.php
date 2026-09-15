<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EleveController;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

Route::middleware([StartSession::class])->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    //dashboard route
    Route::middleware('auth:sanctum')->get('/dashboard', [DashboardController::class, 'index']);

    //eleve route
    Route::middleware('auth:sanctum')->get("/students", [EleveController::class, 'index']);
    Route::middleware('auth:sanctum')->post("/students", [EleveController::class, 'store']);
    Route::middleware('auth:sanctum')->put("/students/{id}", [EleveController::class, 'update']);
    Route::middleware('auth:sanctum')->get("/students/{id}", [EleveController::class, 'show']);
});
