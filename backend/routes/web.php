<?php

use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});



// Route::post('/auth/login', [AuthController::class, 'login']);
