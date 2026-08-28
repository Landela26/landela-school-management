<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DashboardController extends Controller
{

    public function index(Request $request, Response $response)
    {
        $classes = Classe::all()->toArray();
        return $classes;
    }
}
