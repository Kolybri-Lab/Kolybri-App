import { Text } from "@/components/core";
import { CopyLeft } from "@/components/svg";
import { CONFIG } from "@/constants/config";
import { useTheme } from "@react-navigation/native";
import { fetch } from "expo/fetch";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { logger } from "@/utils/logger";
import packageJson from "../../../package.json";
import {
    GoBackHeader,
    LinkText,
    ScreenStack,
    Separation,
    Subtitle,
    Title,
} from "../../components";

const GITHUB_REPO = "as2pick/EcoleDirectePlus-Mobile";
const MAIN_DEVS_LOGINS = ["as2pick", "Lucilus78"];

const Paragraph = ({ children }) => {
    return <Text style={styles.paragraph}>{children}</Text>;
};

const Link = ({ href, isPeople = false, children }) => {
    const { colors } = useTheme();
    return (
        <LinkText
            href={String(href)}
            color={isPeople ? colors.accent : colors.main}
            underline={isPeople}
        >
            {children}
        </LinkText>
    );
};

function useContributors(repo) {
    const [contributors, setContributors] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const url = `https://api.github.com/repos/${repo}/contributors?per_page=100`;
        logger.log(`[FETCH] GET ${url}`);

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Erreur GitHub API");
                return res.json();
            })
            .then((data) => {
                if (!cancelled) setContributors(data);
            })
            .catch((e) => {
                if (!cancelled) setError(e.message);
            });

        return () => {
            cancelled = true;
        };
    }, [repo]);

    return { contributors, error };
}

const ContributorsCredit = ({ title, people }) => {
    if (people.length === 0) return null;

    return (
        <Paragraph>
            {title}
            {people.map((c) => (
                <Paragraph key={c.id}>
                    {"\n- "}
                    <Link href={c.html_url} isPeople>
                        {c.login}
                    </Link>
                </Paragraph>
            ))}
        </Paragraph>
    );
};

export default function PrivacyPolicyScreen() {
    const { colors } = useTheme();
    const { contributors, error } = useContributors(GITHUB_REPO);

    const mainDevs =
        contributors?.filter((c) => MAIN_DEVS_LOGINS.includes(c.login)) ?? [];
    const otherContributors =
        contributors?.filter((c) => !MAIN_DEVS_LOGINS.includes(c.login)) ?? [];

    const dependenciesList = Object.keys(packageJson.dependencies);

    return (
        <ScreenStack style={{ flex: 1, backgroundColor: colors.background.login }}>
            <View style={{ marginHorizontal: 20 }}>
                <GoBackHeader />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <Title>Politique de confidentialité – Kolybri</Title>
                    <Paragraph style={{ fontStyle: "italic" }}>
                        Dernière mise à jour : 12 septembre 2026
                    </Paragraph>

                    <Subtitle>1. Présentation</Subtitle>
                    <Paragraph>
                        Kolybri est une application développée et maintenue par les
                        développeurs de l'organisation Kolybri Lab.
                    </Paragraph>
                    <Paragraph>
                        L'application permet aux élèves de consulter certaines
                        informations scolaires associées à leur compte Ecole Directe,
                        notamment leurs notes, devoirs, emploi du temps et messages.
                    </Paragraph>
                    <Paragraph>
                        Kolybri Lab ne dispose d'aucun serveur ni d'aucune
                        infrastructure destinée à recevoir, transmettre ou stocker
                        des données. L'application fonctionne exclusivement selon un
                        modèle de communication directe entre l'appareil de
                        l'utilisateur et les services Ecole Directe : à aucun moment
                        une donnée ne transite par une infrastructure appartenant à
                        ou exploitée par Kolybri Lab. Il n'existe donc aucun serveur
                        intermédiaire, aucune base de données distante et aucun point
                        de collecte central où des données personnelles ou scolaires
                        pourraient circuler, être interceptées, consultées ou
                        conservées par Kolybri Lab.
                    </Paragraph>
                    <Paragraph>
                        Cette politique explique quelles données sont utilisées par
                        l'application, comment elles sont traitées et comment elles
                        sont stockées, en gardant à l'esprit cette caractéristique
                        structurelle de l'application.
                    </Paragraph>
                </View>

                <Separation />
                <Subtitle>2. Base légale du traitement</Subtitle>
                <Paragraph>
                    • Le traitement des données effectué par Kolybri repose sur
                    l'exécution du service demandé par l'utilisateur : la connexion à
                    son compte Ecole Directe et l'accès à ses informations scolaires
                    ne sont possibles que si ces données sont traitées,
                    temporairement et localement, à cette fin (article 6.1.b du
                    RGPD).
                </Paragraph>
                <Paragraph>
                    • Certains traitements liés à la sécurité de l'application (par
                    exemple le chiffrement local des identifiants) reposent sur
                    l'intérêt légitime de Kolybri Lab et de l'utilisateur à assurer
                    la protection des données stockées sur l'appareil.
                </Paragraph>
                <Paragraph>
                    • Aucun traitement de Kolybri ne repose sur un consentement à des
                    fins commerciales, publicitaires ou de profilage, puisqu'aucun
                    traitement de cette nature n'est effectué.
                </Paragraph>

                <Separation />
                <Subtitle>3. Informations d'authentification</Subtitle>
                <Paragraph>
                    • Pour permettre la connexion au compte Ecole Directe de
                    l'utilisateur, Kolybri utilise les informations
                    d'authentification saisies par l'utilisateur, notamment son nom
                    d'utilisateur et son mot de passe.
                </Paragraph>
                <Paragraph>
                    • Ces informations sont transmises aux services Ecole Directe
                    afin de permettre l'authentification.
                </Paragraph>
                <Paragraph>
                    • Kolybri Lab ne possédant aucun serveur, ces informations ne
                    peuvent techniquement pas y être reçues.
                </Paragraph>
                <Paragraph>
                    • Afin de permettre le renouvellement de la session, Kolybri
                    conserve localement sur l'appareil les informations nécessaires à
                    l'authentification.
                </Paragraph>
                <Paragraph>
                    • Ces informations sont chiffrées avant leur stockage et
                    conservées à l'aide du stockage sécurisé fourni par le système
                    Android via Expo SecureStore.
                </Paragraph>

                <Separation />
                <Subtitle>4. Identifiant utilisateur et token de session</Subtitle>
                <Paragraph>
                    • Kolybri utilise également l'identifiant associé au compte Ecole
                    Directe ainsi qu'un token de session fourni par les services
                    Ecole Directe.
                </Paragraph>
                <Paragraph>
                    • Ces informations sont utilisées pour maintenir la session et
                    permettre la synchronisation des données scolaires.
                </Paragraph>
                <Paragraph>
                    • L'identifiant et le token sont stockés localement sur
                    l'appareil dans un stockage sécurisé et sous une forme chiffrée.
                </Paragraph>
                <Paragraph>
                    • Kolybri Lab ne possédant aucun serveur, ces informations ne
                    peuvent techniquement pas y être transmises.
                </Paragraph>

                <Separation />
                <Subtitle>5. Données scolaires</Subtitle>
                <Paragraph>
                    • Kolybri récupère depuis les services Ecole Directe les
                    informations nécessaires aux fonctionnalités proposées par
                    l'application. Ces informations peuvent notamment comprendre :
                    {"\n"}- les notes ;{"\n"}- les devoirs ;{"\n"}- l'emploi du temps
                    ;{"\n"}- les messages de la messagerie scolaire.
                </Paragraph>
                <Paragraph>
                    • Ces informations sont stockées localement sur l'appareil afin
                    de permettre leur consultation dans l'application et, lorsque
                    cela est prévu par l'application, leur consultation sans
                    connexion.
                </Paragraph>
                <Paragraph>
                    • Kolybri Lab ne possédant aucun serveur, ces données ne peuvent
                    techniquement pas y être stockées.
                </Paragraph>

                <Separation />
                <Subtitle>6. Messagerie</Subtitle>
                <Paragraph>
                    • Kolybri permet de consulter les messages disponibles dans la
                    messagerie Ecole Directe.
                </Paragraph>
                <Paragraph>
                    • L'application ne permet pas actuellement d'envoyer des
                    messages.
                </Paragraph>
                <Paragraph>
                    • Les messages récupérés sont stockés localement sur l'appareil
                    de l'utilisateur.
                </Paragraph>

                <Separation />
                <Subtitle>
                    7. Absence de serveur Kolybri et impossibilité structurelle de
                    circulation des données
                </Subtitle>
                <Paragraph>
                    • Kolybri Lab ne possède, n'exploite et ne loue aucun serveur,
                    aucune base de données ni aucune infrastructure d'hébergement
                    destinée à recevoir, transmettre, centraliser ou stocker des
                    données personnelles ou scolaires des utilisateurs.
                </Paragraph>
                <Paragraph>
                    • Cette absence de serveur n'est pas seulement une pratique
                    déclarée : elle constitue une caractéristique structurelle de
                    l'architecture de l'application. Kolybri fonctionne selon un
                    modèle exclusivement local et direct, dans lequel les seuls
                    échanges de données ont lieu entre l'appareil de l'utilisateur et
                    les services Ecole Directe. Aucune donnée ne transite, même
                    temporairement ou techniquement, par une infrastructure contrôlée
                    par Kolybri Lab.
                </Paragraph>
                <Paragraph>
                    • En conséquence, Kolybri Lab ne stocke, ne collecte, ne consulte
                    et ne peut techniquement recevoir :{"\n"}- les noms d'utilisateur
                    ;{"\n"}- les mots de passe ;{"\n"}- les tokens de session ;{"\n"}
                    - les identifiants Ecole Directe ;{"\n"}- les notes ;{"\n"}- les
                    devoirs ;{"\n"}- les emplois du temps ;{"\n"}- les messages
                    scolaires.
                </Paragraph>
                <Paragraph>
                    • Cette absence de serveur signifie également qu'aucune violation
                    de données ne peut survenir du côté de l'infrastructure de
                    Kolybri Lab, puisqu'aucune donnée n'y est ni transmise ni
                    stockée.
                </Paragraph>

                <Separation />
                <Subtitle>8. Services Ecole Directe</Subtitle>
                <Paragraph>
                    • Kolybri communique avec les services Ecole Directe afin
                    d'effectuer l'authentification et de récupérer les informations
                    scolaires nécessaires au fonctionnement de l'application.
                </Paragraph>
                <Paragraph>
                    • Les données transmises ou récupérées auprès d'Ecole Directe
                    peuvent être soumises aux conditions d'utilisation et à la
                    politique de confidentialité applicables aux services Ecole
                    Directe.
                </Paragraph>
                <Paragraph>
                    • Kolybri Lab n'est pas responsable des pratiques de traitement
                    des données effectuées directement par Ecole Directe.
                </Paragraph>

                <Separation />
                <Subtitle>9. Stockage et suppression</Subtitle>
                <Paragraph>
                    • Les données nécessaires au fonctionnement de Kolybri sont
                    stockées localement sur l'appareil de l'utilisateur.
                </Paragraph>
                <Paragraph>
                    • La déconnexion de l'utilisateur entraîne la suppression des
                    informations locales associées à son utilisation de Kolybri,
                    notamment les informations d'authentification, le token de
                    session, l'identifiant utilisateur et les données scolaires
                    stockées localement.
                </Paragraph>
                <Paragraph>
                    • La désinstallation de l'application peut également entraîner la
                    suppression des données locales de l'application conformément au
                    fonctionnement du système Android.
                </Paragraph>
                <Paragraph>
                    • Kolybri Lab ne possédant aucun serveur, aucune copie de ces
                    données ne peut y être conservée.
                </Paragraph>

                <Separation />
                <Subtitle>10. Sécurité</Subtitle>
                <Paragraph>
                    • Kolybri chiffre les informations sensibles stockées localement
                    et utilise le stockage sécurisé fourni par Android via Expo
                    SecureStore.
                </Paragraph>
                <Paragraph>
                    • Les données sont utilisées uniquement dans le cadre des
                    fonctionnalités proposées par l'application.
                </Paragraph>
                <Paragraph>
                    • Kolybri Lab ne vend, ne loue et n'utilise pas les données des
                    utilisateurs à des fins publicitaires ou commerciales.
                </Paragraph>

                <Separation />
                <Subtitle>11. Création de compte</Subtitle>
                <Paragraph>
                    • Kolybri ne propose pas de création de compte Kolybri.
                </Paragraph>
                <Paragraph>
                    • L'utilisateur utilise son compte existant auprès d'Ecole
                    Directe.
                </Paragraph>

                <Separation />
                <Subtitle>
                    12. Services d'analyse, publicité et journaux techniques
                </Subtitle>
                <Paragraph>
                    • Kolybri n'utilise actuellement aucun service publicitaire ou
                    outil d'analyse destiné à suivre le comportement des utilisateurs
                    à des fins commerciales ou de profilage.
                </Paragraph>
                <Paragraph>
                    • L'application peut toutefois générer, via les outils techniques
                    utilisés pour son fonctionnement (notamment le framework
                    Expo/React Native et les services associés tels qu'EAS), des
                    journaux techniques ou rapports de plantage (crash reports)
                    destinés uniquement à identifier et corriger des
                    dysfonctionnements de l'application.
                </Paragraph>
                <Paragraph>
                    • Ces journaux, lorsqu'ils existent, ne contiennent pas
                    volontairement de données scolaires, d'identifiants Ecole Directe
                    ou de mots de passe, et ne sont pas utilisés à des fins
                    publicitaires ou de suivi du comportement de l'utilisateur.
                </Paragraph>

                <Separation />
                <Subtitle>13. Droits des utilisateurs</Subtitle>
                <Paragraph>
                    • Conformément au Règlement Général sur la Protection des Données
                    (RGPD), tout utilisateur dispose des droits suivants concernant
                    les données le concernant :{"\n"}- droit d'accès ;{"\n"}- droit
                    de rectification ;{"\n"}- droit à l'effacement ;{"\n"}- droit à
                    la limitation du traitement ;{"\n"}- droit d'opposition ;{"\n"}-
                    droit à la portabilité des données, lorsqu'applicable.
                </Paragraph>
                <Paragraph>
                    • Dans la mesure où Kolybri Lab ne possède aucun serveur et où
                    les données traitées par Kolybri sont exclusivement stockées
                    localement sur l'appareil de l'utilisateur, l'exercice de ces
                    droits s'effectue le plus souvent directement par l'utilisateur,
                    via la déconnexion de l'application ou sa désinstallation, qui
                    entraînent la suppression des données locales.
                </Paragraph>
                <Paragraph>
                    • Pour toute question relative à ces droits ou pour toute demande
                    spécifique, l'utilisateur peut contacter Kolybri Lab aux adresses
                    indiquées à la section 17.
                </Paragraph>
                <Paragraph>
                    • L'utilisateur dispose également du droit d'introduire une
                    réclamation auprès de la Commission Nationale de l'Informatique
                    et des Libertés (CNIL), autorité de contrôle compétente en
                    France, si il ou elle estime que ses droits ne sont pas
                    respectés.
                </Paragraph>

                <Separation />
                <Subtitle>14. Utilisateurs mineurs</Subtitle>
                <Paragraph>
                    • Kolybri peut être utilisée par des élèves, y compris des
                    utilisateurs mineurs.
                </Paragraph>
                <Paragraph>
                    • L'application ne collecte pas volontairement de données
                    supplémentaires à des fins publicitaires ou commerciales.
                </Paragraph>
                <Paragraph>
                    • Les informations utilisées sont limitées à celles nécessaires
                    au fonctionnement des fonctionnalités scolaires de l'application.
                </Paragraph>
                <Paragraph>
                    • L'utilisation de Kolybri par un mineur suppose que celui-ci
                    dispose déjà d'un compte Ecole Directe, dont la création et les
                    conditions d'utilisation relèvent de l'établissement scolaire
                    et/ou des représentants légaux du mineur, conformément aux règles
                    applicables à Ecole Directe.
                </Paragraph>

                <Separation />
                <Subtitle>15. Indépendance vis-à-vis d'Ecole Directe</Subtitle>
                <Paragraph>
                    • Kolybri est une application indépendante, développée par
                    Kolybri Lab.
                </Paragraph>
                <Paragraph>
                    • Kolybri n'est ni édité, ni détenu, ni approuvé, ni parrainé par
                    Ecole Directe ou par la société qui exploite ce service.
                </Paragraph>
                <Paragraph>
                    • Toute référence à Ecole Directe dans la présente politique ou
                    dans l'application a pour seul objet de décrire
                    l'interopérabilité technique entre Kolybri et les services Ecole
                    Directe.
                </Paragraph>

                <Separation />
                <Subtitle>16. Modifications</Subtitle>
                <Paragraph>
                    • Cette politique peut être mise à jour en cas de modification
                    des fonctionnalités de Kolybri ou de ses pratiques de traitement
                    des données.
                </Paragraph>
                <Paragraph>
                    • La date de dernière mise à jour sera alors modifiée.
                </Paragraph>

                <Separation />
                <Subtitle>17. Contact</Subtitle>
                <Paragraph>
                    • Pour toute question concernant la confidentialité ou le
                    traitement des données, vous pouvez contacter Kolybri Lab :{"\n"}
                    <Link href={"mailto:as2pick.card@outlook.fr"} isPeople>
                        as2pick.card@outlook.fr
                    </Link>
                    {"\n"}
                    <Link href={"mailto:lucas.mage@proton.me"} isPeople>
                        lucas.mage@proton.me
                    </Link>
                </Paragraph>

                <Separation />
                <Subtitle>18. Responsable</Subtitle>
                <Paragraph>
                    • L'application Kolybri est développée et maintenue par les
                    développeurs de l'organisation Kolybri Lab.
                </Paragraph>

                <Separation />
                <Title>Conditions d'utilisation</Title>
                <Subtitle>1. Généralités</Subtitle>
                <Paragraph>
                    • Les termes "Kolybri", "le service", "nous", "notre/nos"
                    désignent l'application Kolybri, développée par l'organisation
                    Kolybri Lab et totalement indépendante d'EcoleDirecte. Les
                    présentes conditions encadrent l'accès et l'usage du service
                    Kolybri. Dès lors que vous consultez ou utilisez une quelconque
                    partie de l'application, vous reconnaissez avoir pris
                    connaissance de ces dispositions, les avoir comprises, et y
                    adhérer pleinement.
                </Paragraph>
                <Subtitle>2. Description du service</Subtitle>
                <Paragraph>
                    • Kolybri a pour vocation d'offrir à ses utilisateurs une
                    expérience simple et agréable pour consulter leurs informations
                    scolaires. Kolybri Lab se réserve le droit, à sa seule
                    appréciation et à tout moment, de faire évoluer, ajuster,
                    suspendre, enrichir ou mettre fin à tout ou partie du service, de
                    façon temporaire ou définitive.
                </Paragraph>
                <Subtitle>3. Usage raisonnable du service</Subtitle>
                <Paragraph>
                    • Chaque utilisateur reste responsable de l'usage qu'il fait du
                    service ainsi que des actions réalisées depuis son compte. Notre
                    ambition est de proposer un service plaisant, utile et sûr pour
                    l'ensemble de la communauté. Dans cette optique, tout
                    comportement malveillant, irrespectueux envers d'autres
                    utilisateurs ou envers l'équipe de Kolybri Lab est proscrit. Par
                    ailleurs, même si Kolybri cherche constamment à s'enrichir et à
                    gagner en fiabilité, elle ne saurait remplacer intégralement
                    EcoleDirecte, notamment pour certaines fonctionnalités avancées
                    (QCM, visioconférences, vie de classe, et autres services encore
                    absents de Kolybri). Il est donc recommandé de ne pas s'appuyer
                    exclusivement sur Kolybri.
                </Paragraph>
                <Subtitle>4. Connexion au compte</Subtitle>
                <Paragraph>
                    • En vous identifiant sur Kolybri avec votre compte EcoleDirecte,
                    vous autorisez l'application (uniquement sur votre appareil, en
                    local) à accéder aux informations liées à votre compte via l'API
                    d'EcoleDirecte. Afin de préserver la confidentialité de vos
                    données, celles-ci ne sont ni partagées, ni conservées sur un
                    quelconque serveur : les seules données stockées le sont par
                    Aplim (EcoleDirecte). Vous demeurez par ailleurs seul responsable
                    de l'usage fait de vos informations.
                </Paragraph>
                <Subtitle>5. Liens et services tiers</Subtitle>
                <Paragraph>
                    • Le service peut renvoyer vers des sites, services ou contenus
                    tiers qui ne sont ni la propriété ni sous le contrôle de Kolybri.
                    Nous n'approuvons pas ces éléments et déclinons toute
                    responsabilité à leur égard. Si vous accédez à un site, un
                    service ou un contenu externe depuis Kolybri, sachez que nos
                    présentes conditions et notre politique de confidentialité ne s'y
                    appliquent pas. Vous reconnaissez et acceptez expressément que
                    Kolybri ne pourra être tenue pour responsable, ni directement ni
                    indirectement, d'un préjudice ou d'une perte découlant de l'usage
                    d'un site, service ou contenu tiers.
                </Paragraph>
                <Subtitle>6. Fin d'utilisation</Subtitle>
                <Paragraph>
                    • Kolybri peut mettre un terme à votre accès et à votre usage du
                    service à tout moment, pour quelque motif que ce soit ; vous
                    perdez alors le droit d'utiliser l'application. Notez bien que la
                    perte d'accès à Kolybri n'implique en aucune façon la résiliation
                    de votre accès à EcoleDirecte, les deux services étant totalement
                    indépendants l'un de l'autre.
                </Paragraph>

                <Separation />
                <Title>Crédits</Title>

                {error ? (
                    <Paragraph>
                        Impossible de charger la liste des contributeurs pour le
                        moment.
                    </Paragraph>
                ) : !contributors ? (
                    <Paragraph>Chargement des contributeurs...</Paragraph>
                ) : (
                    <>
                        <ContributorsCredit
                            title="Développeurs principaux :"
                            people={mainDevs}
                        />
                        <ContributorsCredit
                            title="Autres contributeurs :"
                            people={otherContributors}
                        />
                    </>
                )}

                <Paragraph>
                    {"APIs et services tiers :\n"}
                    {"- EcoleDirecte\n"}
                </Paragraph>
                <Paragraph>
                    {"Dépendances \n"}
                    {dependenciesList.map((name) => `- ${name}\n`).join("")}
                </Paragraph>
                <Paragraph>{"Testeurs de pré-lancement :\n"}</Paragraph>
                <Paragraph>
                    {"Remerciements spéciaux :\n"}
                    <Text weight="bold">Internet</Text>
                </Paragraph>
                <Paragraph>
                    • Curieux et motivé ? Rejoignez nous et participez au
                    développement de Kolybri à travers le{" "}
                    <Link
                        href={
                            "https://github.com/Kolybri-Lab/EcoleDirectePlus-Mobile"
                        }
                    >
                        dépôt Github
                    </Link>
                    .
                </Paragraph>
                <Paragraph>
                    • Rencontrez la communauté de Kolybri en rejoignant le{" "}
                    <Link href={CONFIG.discordInviteLink}>serveur Discord.</Link>
                </Paragraph>
                <Separation />
                <Title>License (MIT)</Title>
                <Paragraph>
                    • Permission is hereby granted, free of charge, to any person
                    obtaining a copy of this software and associated documentation
                    files (the "Software"), to deal in the Software without
                    restriction, including without limitation the rights to use,
                    copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the
                    Software is furnished to do so, subject to the following
                    conditions: The above copyright notice and this permission notice
                    shall be included in all copies or substantial portions of the
                    Software.{"\n\n"}THE SOFTWARE IS PROVIDED "AS IS", WITHOUT
                    WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                    LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                    PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
                    OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
                    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                </Paragraph>
                <Paragraph>
                    Dernière révision le 12 septembre 2026{"\n"}
                    Nous contacter :{" "}
                    <Link href={"mailto:as2pick.card@outlook.fr"} isPeople={true}>
                        as2pick.card@outlook.fr
                    </Link>
                </Paragraph>

                <SafeAreaView
                    edges={["bottom"]}
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 6,
                        alignItems: "center",
                        marginTop: 14,
                    }}
                >
                    <Text>Copyleft 2026</Text>
                    <CopyLeft size={17} />
                    <Text>Kolybri</Text>
                </SafeAreaView>
            </ScrollView>
        </ScreenStack>
    );
}

const styles = StyleSheet.create({
    paragraph: {
        marginLeft: 30,
        marginRight: 20,
        marginVertical: 4,
    },
    separationParent: {
        alignItems: "center",
        marginVertical: 14,
    },
    separationChildren: {
        width: "92%",
        height: 1.8,
        borderRadius: 999,
        marginLeft: 30,
        marginRight: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 10,
        marginHorizontal: 5,
        position: "relative",
    },
});

