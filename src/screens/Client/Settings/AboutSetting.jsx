import { Section, Text } from "@/components";
import { Chevron, Info, Link, Person } from "@/components/svg";
import DiscordLogo from "@/components/svg/logos/Discord";
import GithubLogo from "@/components/svg/logos/Github";
import KolybriLogo from "@/components/svg/logos/Kolybri";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { openUrl } from "@/utils/url";
import { useNavigation } from "@react-navigation/native";
import { Heart } from "lucide-react-native";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedFrenchFlag from "./components/AnimatedFrenchFlag";
import SettingSectionLayout from "./components/SettingSectionLayout";
export default function AboutScreen({ route }) {
    const { label } = route.params;
    const navigation = useNavigation();
    const { colors } = useTheme();
    return (
        <SettingSectionLayout label={label}>
            <View style={{ gap: 28 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-around",
                    }}
                >
                    <AnimatedFrenchFlag baseRotation={350} />
                    <View
                        style={{
                            backgroundColor: colors.surface.default,
                            padding: 18,
                            borderRadius: 18,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <KolybriLogo size={100} />
                    </View>
                    <AnimatedFrenchFlag baseRotation={10} />
                </View>

                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: withAlpha(colors.surface.raised, 0.7),
                        marginHorizontal: 10,
                        padding: 16,
                        borderRadius: 28,
                        gap: 20,
                        marginBottom: 20,
                    }}
                >
                    <Text preset="body1" align="center">
                        Kolybri simplifie l'accès à vos données École Directe grâce à
                        une interface moderne, rapide et respectueuse de votre vie
                        privée. Aucune donnée n'est collectée ni revendue : votre
                        confidentialité est notre priorité.
                    </Text>
                </View>
            </View>

            <View style={{ gap: 9, flex: 1, justifyContent: "center" }}>
                <Text
                    preset="label2"
                    style={{ marginTop: 26 }}
                    color={colors.text.primary}
                >
                    Développeurs principaux
                </Text>
                <Section
                    index={0}
                    totalLength={2}
                    label={"As de Pique"}
                    icon={
                        <Image
                            source={{
                                uri: "https://avatars.githubusercontent.com/u/187793762?v=4",
                            }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        />
                    }
                    height={48}
                    onPress={() => openUrl("https://github.com/as2pick")}
                >
                    <Link size={24} fill={withAlpha(colors.text.primary, 0.3)} />
                </Section>
                <Section
                    index={1}
                    totalLength={2}
                    label={"Lucilus"}
                    icon={
                        <Image
                            source={{
                                uri: "https://avatars.githubusercontent.com/u/208399537?v=4",
                            }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        />
                    }
                    height={48}
                    onPress={() => openUrl("https://github.com/Lucilus78")}
                >
                    <Link size={24} fill={withAlpha(colors.text.primary, 0.3)} />
                </Section>
                <Text
                    preset="label2"
                    style={{ marginTop: 26 }}
                    color={colors.text.primary}
                >
                    Le projet et les contributeurs
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 9,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Section
                            index={0}
                            totalLength={1}
                            label={"Github"}
                            icon={
                                <GithubLogo size={24} fill={colors.text.primary} />
                            }
                            height={48}
                            onPress={() =>
                                openUrl(
                                    "https://github.com/Kolybri-Lab/EcoleDirectePlus-Mobile"
                                )
                            }
                        >
                            <Link
                                size={24}
                                fill={withAlpha(colors.text.primary, 0.3)}
                            />
                        </Section>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Section
                            index={0}
                            totalLength={1}
                            label={"Contributeurs"}
                            icon={<Person size={22} fill={colors.text.primary} />}
                            height={48}
                            onPress={() =>
                                navigation.navigate(
                                    routesNames.settings.about_settings.contributors,
                                    { label: "Contributeurs" }
                                )
                            }
                        >
                            <Chevron
                                size={16}
                                fill={withAlpha(colors.text.primary, 0.3)}
                            />
                        </Section>
                    </View>
                </View>
                <View style={{ gap: 9 }}>
                    <Section
                        index={0}
                        totalLength={2}
                        label={"Discord"}
                        icon={<DiscordLogo size={24} fill={colors.text.primary} />}
                        height={48}
                        onPress={() => openUrl("https://discord.gg/AKAqXfTgvE")}
                    >
                        <Link size={24} fill={withAlpha(colors.text.primary, 0.3)} />
                    </Section>
                    <Section
                        index={1}
                        totalLength={2}
                        label={"Plus..."}
                        icon={<Info size={24} fill={colors.text.primary} />}
                        height={48}
                        onPress={() =>
                            navigation.navigate(
                                routesNames.settings.about_settings.plus,
                                { label: "Plus" }
                            )
                        }
                    >
                        <Chevron
                            size={16}
                            fill={withAlpha(colors.text.primary, 0.3)}
                        />
                    </Section>
                    {/* <View style={{pheight: 20 }} /> */}
                </View>
            </View>

            <SafeAreaView
                edges={["bottom"]}
                style={{
                    alignItems: "center",

                    marginVertical: 20,
                }}
            >
                <Text preset="label1" align="center">
                    Cette application à été designé, concue et développée par des
                    étudiant français avec
                </Text>
                <Heart fill={"hsl(0, 70%, 60%)"} color={"transparent"} size={30} />
                <Text
                    weight="light"
                    size={7}
                    color={withAlpha(colors.text.primary, 0.14)}
                >
                    mais genre vrm ;-)
                </Text>
            </SafeAreaView>
        </SettingSectionLayout>
    );
}
