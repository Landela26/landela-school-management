<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PersonnelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('personnels')->delete();

        $now = Carbon::now();

        DB::table('personnels')->insert([
            [
                'id_personnel' => 1,
                'matricule' => 'PER-0001',
                'id_classe' => null,
                'nom' => 'Mbuyi',
                'postnom' => 'Kabeya',
                'prenom' => 'Jean',
                'fonction' => 'Promoteur',
                'telephone' => '0810000001',
                'email' => 'jean.mbuyi@landela.test',
                'estEnseignant' => false,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_personnel' => 2,
                'matricule' => 'PER-0002',
                'id_classe' => 1,
                'nom' => 'Kabasele',
                'postnom' => 'Mwamba',
                'prenom' => 'Daniel',
                'fonction' => 'Enseignant',
                'telephone' => '0810000002',
                'email' => 'daniel.kabasele@landela.test',
                'estEnseignant' => true,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_personnel' => 3,
                'matricule' => 'PER-0003',
                'id_classe' => 2,
                'nom' => 'Mukendi',
                'postnom' => 'Nsiala',
                'prenom' => 'Grace',
                'fonction' => 'Enseignant',
                'telephone' => '0810000003',
                'email' => 'grace.mukendi@landela.test',
                'estEnseignant' => true,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_personnel' => 4,
                'matricule' => 'PER-0004',
                'id_classe' => 3,
                'nom' => 'Ilunga',
                'postnom' => 'Kalala',
                'prenom' => 'Patrick',
                'fonction' => 'Enseignant',
                'telephone' => '0810000004',
                'email' => 'patrick.ilunga@landela.test',
                'estEnseignant' => true,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_personnel' => 5,
                'matricule' => 'PER-0005',
                'id_classe' => null,
                'nom' => 'Tshisekedi',
                'postnom' => 'Mbuyi',
                'prenom' => 'Paul',
                'fonction' => 'Secrétaire',
                'telephone' => '0810000005',
                'email' => 'paul.tshisekedi@landela.test',
                'estEnseignant' => false,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
        ]);

        // Affectation des enseignants aux classes
        DB::table('classes')
            ->where('id_classe', 1)
            ->update([
                'id_enseignant' => 2,
            ]);

        DB::table('classes')
            ->where('id_classe', 2)
            ->update([
                'id_enseignant' => 3,
            ]);

        DB::table('classes')
            ->where('id_classe', 3)
            ->update([
                'id_enseignant' => 4,
            ]);
    }
}
