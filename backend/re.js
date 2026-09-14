//payload de post creation d'un eleve
//le payload doit etre un objet form-data pas un objet json
//  donc pas'content-type': 'application/json' dans le header de la requete
// mais 'content-type': 'multipart/form-data' pour que le fichier photo soit bien transmis
const payload = {
    nom: "Doe",
    postnom: "Smith",
    prenom: "John",
    sexe: "M",
    dateNaissance: "2005-05-15",
    adresse: "123 Main St",
    photo: {}, //object fichier photo
    matricule: "ELEVE123",
};

//reponse de la requete post creation d'un eleve
//Response OK code 200
const response = {
    success: true,
    message: "Élève créé avec succès",
    data: {
        id_eleve: 1,
        matricule: "ELEVE123",
        nom: "Doe",
        postnom: "Smith",
        prenom: "John",
        sexe: "M",
        date_naissance: "2024-06-01T12:00:00.000000Z",
        adresse: "123 Main St",
        photo: "eleves/photo123.jpg",
        date_creation: "2024-06-01T12:00:00.000000Z",
    },
};
//reponse avec erreur de validations
const responseEreur = {
    success: false,
    message: "Les données fournies sont invalides.",
    errors: {
        sexe: ["Le sexe doit être M ou F."],
    },
};
