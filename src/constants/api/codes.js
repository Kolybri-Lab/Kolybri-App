// 200
// 250
// 505
// 2250
//

/**
 * Code: 250
Problème : Il faut vérifier la connexion du compte (nouvel appareil ajouté).
Solution : Il faut remplir un QCM (voir "⚠ Concernant la connexion (QCM)").

Code: 505
Problème: Les identifiants donnés à l'api sont erronés
Solution: Il faut vérifier le nom d'utilisateur et/ou le mot de passe (cf Login)

Code: 517
Problème: La version de l'API utilisée est invalide (ou plus supportée ?)
Solution: Il faut utiliser une version valide dans les paramètres de la requête, après le "?" (https://api.ecoldirecte.com/v3/login.awp?v=6.17.0 par exemple)

Code: 520
Problème: Le token est invalide
Solution: Il faut regénérer un token (cf Login)

Code: 525
Problème: Le token est expiré
Solution: Il faut regénérer un token (cf Login)

Code : 535
Problème : L'établissement n'est pas disponible sur EcoleDirecte
Solution : Si la tentative de connexion est effectuée pendant des vacances scolaires, attendre la reprise des cours

Code: 40129
Problème: Format JSON invalide
Solution: Vérifier que le body de la requete a bien été envoyé en raw (ou plain text) et qu'il respecte le formatage donné dans la documentation
 */

export const API_CODES = {
    auth: {
        250: "Authentification à deux facteurs requise",
        505: "Identifiant et/ou mot de passe invalide",
        522: "Identifiant et/ou mot de passe invalide",
    },
    general: {
        200: "succes",
    },
    token: {
        520: "Token invalide",
        525: "Token expiré, connexion nécessaire",
    },

    programGeneratedCodes: {
        1005: "Choix et/ou propositions inéxistantes dans le process A2F",
    },
    api: {
        403: "L'API refuse de répondre",
        517: "API périmée",
        535: "Données verrouillées (souvent établissement fermé)",
        40129: "Format JSON invalide",
    },
};

export const getApiMessage = (code) => {
    for (const category of Object.values(API_CODES)) {
        if (code in category) {
            return category[code];
        }
    }
};

