<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $personnels = Personnel::all();
        return response()->json([
            'success' => true,
            'message' => 'Liste des personnels récupérée avec succès.',
            'data' => $personnels,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $personnel = Personnel::find($id);

        if (!$personnel) {
            return response()->json([
                'success' => false,
                'message' => 'Personnel non trouvé.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Détails du personnel récupérés avec succès.',
            'data' => $personnel,
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Personnel $personnel)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Personnel $personnel)
    {
        //
    }
}
