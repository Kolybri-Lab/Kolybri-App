import { ScreenStack, Section, Text } from "@/components";
import {
    At,
    Chevron,
    Cross,
    GraduationCap,
    Info,
    Merge,
    Person,
    Phone,
    Power,
    SafetyShield,
    Star,
    Sun,
} from "@/components/svg";
import { useSignIn } from "@/hooks/useSignIn";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { routesNames } from "@/router/config/routesNames";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RADIUS_INT = 5;
const RADIUS_EXT = 12;
const ICON_SIZE = 18;

const formatPhoneNumber = (input) =>
    input.replace(/\D/g, "").replace(/(\d{2})(?=\d)/g, "$1 ");

function SettingsSection({ options }) {
    const navigation = useNavigation();
    return (
        <View style={{ gap: 3, marginTop: 8 }}>
            {options.map((opt, index) => (
                <Section
                    icon={opt.icon}
                    label={opt.label}
                    onPress={() =>
                        navigation.navigate(opt.route, {
                            label: opt.label,
                        })
                    }
                    index={index}
                    totalLength={options.length}
                    radiusExt={RADIUS_EXT}
                    radiusInt={RADIUS_INT}
                    key={opt.label}
                >
                    <Chevron size={16} fill="hsla(0, 0%, 100%, 0.3)" />
                </Section>
            ))}
        </View>
    );
}

export default function SettingsScreen({}) {
    const themeMode = useThemeStore((state) => state.themeMode);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);
    const { signOut } = useSignIn();

    const navigation = useNavigation();
    const profile = useUserStore((state) => state.profile);

    const accountOptions = [
        {
            label: "Compte",
            icon: <Person size={ICON_SIZE} opacity={0.6} />,
            route: routesNames.settings.account_settings.account,
        },
        {
            label: "Données et confidentialité",
            icon: <SafetyShield size={ICON_SIZE} opacity={0.6} />,
            route: routesNames.settings.account_settings.data_and_confidentiality,
        },
    ];
    const appOptions = [
        {
            label: "Thème",
            icon: <Sun size={ICON_SIZE} opacity={0.6} />,
            route: routesNames.settings.app_settings.theme,
        },
    ];
    const aboutOptions = [
        {
            label: "Notes de version",
            icon: <Merge size={ICON_SIZE} opacity={0.6} />,
            route: routesNames.settings.about_settings.release_notes,
        },
        {
            label: "Donnez votre avis !",
            icon: <Star size={ICON_SIZE} opacity={0.6} />,
            route: routesNames.settings.about_settings.feedback,
        },
        {
            label: "À propos",
            icon: <Info size={ICON_SIZE} opacity={0.6} />,
            route: routesNames.settings.about_settings.about,
        },
    ];

    const getProfileImageSource = useCallback(
        () =>
            profile?.localPhotoUri
                ? { uri: profile?.localPhotoUri }
                : require("../../../../assets/custom/default-user-picture.png"),
        [profile?.localPhotoUri]
    );

    if (!profile) {
        return (
            <ScreenStack
                horizontalSpacing={30}
                style={{ backgroundColor: "hsl(230, 30%, 8%)" }}
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ActivityIndicator />
                </View>
            </ScreenStack>
        );
    }

    return (
        <ScreenStack
            horizontalSpacing={30}
            style={{ backgroundColor: "hsl(230, 30%, 8%)" }}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                alwaysBounceVertical={false}
                overScrollMode="never"
            >
                <SafeAreaView
                    style={{
                        marginTop: 8,
                    }}
                >
                    <Pressable
                        style={{
                            flexDirection: "row",
                            gap: 16,
                            alignItems: "center",
                        }}
                        onPress={() => navigation.goBack()}
                    >
                        <Cross size={ICON_SIZE} />
                        <Text preset="h4">Paramètres</Text>
                    </Pressable>
                </SafeAreaView>
                <View
                    style={{
                        backgroundColor: "hsl(231, 21%, 28%)",
                        padding: 14,
                        borderRadius: 26,
                        marginBottom: 6,
                        gap: 14,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View
                            style={{
                                borderRadius: 25,
                                marginRight: 18,
                                width: 50,
                                height: 50,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "hsla(0, 0%, 100%, 0.3)",
                                overflow: "hidden",
                            }}
                        >
                            {!profile?.localPhotoUri ? (
                                <Text preset="h4">{profile?.name?.[0] ?? ""}</Text>
                            ) : (
                                <Image
                                    source={getProfileImageSource()}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        transform: [{ scale: 1.2 }],
                                    }}
                                />
                            )}
                        </View>
                        <View>
                            <Text preset="label1" weight="bold">
                                {profile?.name} {profile?.surname}
                            </Text>
                            <Text preset="label2">{profile?.schoolName}</Text>
                        </View>
                    </View>

                    <View
                        style={{
                            backgroundColor: "hsla(0, 0%, 100%, .22)",
                            paddingHorizontal: 16,
                            borderRadius: 16,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                overflow: "hidden",
                                borderBottomColor: "hsla(0, 0%, 100%, .25)",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                    // maxWidth: "100%",
                                }}
                            >
                                <At opacity={0.75} size={20} />
                                <Text style={{ opacity: 0.75 }}>E-mail</Text>
                            </View>
                            <Text weight="medium" oneLine align="right">
                                {profile?.email ?? "Pas d'e-mail connu..."}
                            </Text>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: "hsla(0, 0%, 100%, .25)",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <Phone opacity={0.75} size={20} />
                                <Text style={{ opacity: 0.75 }}>Téléphone</Text>
                            </View>
                            <Text weight="medium">
                                {formatPhoneNumber(profile?.phone || "") ||
                                    "Pas de téléphone connu..."}
                            </Text>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 10,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <GraduationCap opacity={0.75} size={22} />
                                <Text style={{ opacity: 0.75 }}>Classe</Text>
                            </View>
                            <Text weight="medium">
                                {profile?.class?.libelle ??
                                    "Pas de classe connue..."}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text
                        preset="label2"
                        style={{ marginTop: 26 }}
                        color="hsla(0, 0%, 100%, .6)"
                    >
                        Paramètres de compte
                    </Text>
                    <SettingsSection options={accountOptions} />
                    <Text
                        preset="label2"
                        style={{ marginTop: 26 }}
                        color="hsla(0, 0%, 100%, .6)"
                    >
                        Paramètres de l'app
                    </Text>
                    <SettingsSection options={appOptions} />
                    <Text
                        preset="label2"
                        style={{ marginTop: 26 }}
                        color="hsla(0, 0%, 100%, .6)"
                    >
                        À propos
                    </Text>
                    <SettingsSection options={aboutOptions} />
                    <View style={{ marginTop: 28, marginBottom: 18 }}>
                        <Section
                            label={"Se déconnecter"}
                            icon={<Power size={18} opacity={0.6} />}
                            onPress={signOut}
                            index={0}
                            totalLength={1}
                            backgroundColor="hsla(0, 47%, 55%, .8)"
                        />
                    </View>
                </View>
                <SafeAreaView edges={["bottom"]} style={{ marginBottom: 20 }}>
                    <View
                        style={{
                            backgroundColor: "hsla(0, 0%, 35%, .3)",
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 20,
                        }}
                    >
                        <Text preset="label3" color="hsla(0, 0%, 100%, .6)">
                            Le meilleur reste à venir...
                        </Text>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </ScreenStack>
    );
}

