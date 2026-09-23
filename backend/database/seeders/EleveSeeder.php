<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class EleveSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        DB::table('eleves')->truncate();

        $now = Carbon::now();

        DB::table('eleves')->insert([
            [
                'id_eleve' => 1,
                'matricule' => 'ELV-0001',
                'classe_id' => 1,
                'nom' => 'Bondo',
                'postnom' => 'Kisinza',
                'prenom' => 'Josue',
                'sexe' => 'M',
                'date_naissance' => '2009-01-15',
                'adresse' => 'Kinshasa',
                'photo' => null,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_eleve' => 2,
                'matricule' => 'ELV-0002',
                'classe_id' => 1,
                'nom' => 'Kabesele',
                'postnom' => 'Mwamba',
                'prenom' => 'Daniel',
                'sexe' => 'M',
                'date_naissance' => '2009-03-20',
                'adresse' => 'Kinshasa',
                'photo' => null,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_eleve' => 3,
                'matricule' => 'ELV-0003',
                'classe_id' => 2,
                'nom' => 'Mukendi',
                'postnom' => 'Nsiala',
                'prenom' => 'Grace',
                'sexe' => 'F',
                'date_naissance' => '2009-07-11',
                'adresse' => 'Kinshasa',
                'photo' => null,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_eleve' => 4,
                'matricule' => 'ELV-0004',
                'classe_id' => 2,
                'nom' => 'Mbuyi',
                'postnom' => 'Nsimba',
                'prenom' => 'Sarah',
                'sexe' => 'F',
                'date_naissance' => '2009-09-05',
                'adresse' => 'Kinshasa',
                'photo' => null,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id_eleve' => 5,
                'matricule' => 'ELV-0005',
                'classe_id' => 3,
                'nom' => 'Kabila',
                'postnom' => 'Pierre',
                'prenom' => 'Pierre',
                'sexe' => 'M',
                'date_naissance' => '2009-12-01',
                'adresse' => 'Kinshasa',
                'photo' => null,
                'statut' => 'actif',
                'date_creation' => $now,
            ],
        ]);

        Schema::enableForeignKeyConstraints();
    }
}
