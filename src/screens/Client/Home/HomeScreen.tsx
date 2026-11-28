import { ScreenStack, Text } from "@/components";
import { useGrades } from "@/features/grades";
import ActiveCourseCard from "@/features/home/components/ActiveCourseCard";
import GeneralAveragePreview from "@/features/home/components/GeneralAveragePreview";
import HomeworksPreview from "@/features/home/components/HomeworksPreview";
import LastGrades from "@/features/home/components/LastGrades";
import getGreetingMessage from "@/features/home/utils/getGreetingMessage";
import { useHomeworks } from "@/features/homeworks";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { GuestTestButtons } from "@/mock/guest/components";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { useNavigation } from "@react-navigation/native";
import { type ComponentType, useCallback, useState } from "react";
import { Image, type ImageSourcePropType, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenStackView = ScreenStack as ComponentType<any>;
const ActiveCourseCardView = ActiveCourseCard as ComponentType<any>;
const GeneralAveragePreviewView = GeneralAveragePreview as ComponentType<any>;
const LastGradesView = LastGrades as ComponentType<any>;
const GuestTestButtonsView = GuestTestButtons as ComponentType<any>;

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const token = useUserStore((state) => state.token);
    const profile = useUserStore((state) => state.profile);

    const [greetingMessage] = useState<string>(getGreetingMessage);

    const name = profile?.name ?? "";
    const { data: gradesData } = useGrades(token);
    const { data: homeworksData } = useHomeworks(token);

    const localPhotoUri = profile?.localPhotoUri;

    const getProfileImageSource = useCallback(
        (): ImageSourcePropType =>
            localPhotoUri
                ? { uri: localPhotoUri }
                : require("../../../../assets/custom/default-user-picture.png"),
        [localPhotoUri]
    );

    return (
        <ScreenStackView>
            <View style={{ paddingHorizontal: 20 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    scrollEventThrottle={16}
                    overScrollMode="never"
                >
                    <SafeAreaView
                        style={{
                            marginTop: 10,
                        }}
                    >
                        <Pressable
                            style={{
                                overflow: "hidden",
                                borderRadius: 16,
                                marginBottom: 18,
                                opacity: 0.85,
                                borderColor: colors.border.subtle,
                                borderWidth: 1.5,
                                width: 46,
                                height: 46,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: colors.surface.default,
                            }}
                            onPress={() =>
                                navigation.navigate(
                                    routesNames.navigators.settings,
                                    {
                                        screen: routesNames.settings.home,
                                    }
                                )
                            }
                        >
                            {localPhotoUri == undefined ? (
                                <Text
                                    preset="heading.section"
                                    size={26}
                                    family="petrona"
                                    weight="semibold"
                                >
                                    {name[0]}
                                </Text>
                            ) : (
                                <Image
                                    source={getProfileImageSource()}
                                    style={{
                                        width: 46,
                                        height: 46,
                                        transform: [{ scale: 1.2 }],
                                    }}
                                />
                            )}
                        </Pressable>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginTop: 10,
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text
                                    preset="heading.hero"
                                    size={26}
                                    weight="medium"
                                    color={withAlpha(colors.text.primary, 0.4)}
                                    style={{ lineHeight: 25 }}
                                >
                                    {greetingMessage}
                                </Text>
                                <Text
                                    preset="heading.hero"
                                    size={38}
                                    family="petrona"
                                    weight="semibold"
                                    style={{ letterSpacing: 0.3 }}
                                >
                                    {name} 👋
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                    <View style={{ gap: 26, marginTop: 10 }}>
                        <ActiveCourseCardView />
                        <View style={{ gap: 3 }}>
                            <GeneralAveragePreviewView
                                gradesData={gradesData}
                            />
                            {(gradesData?.lastGrades?.length ?? 0) >= 1 && (
                                <LastGradesView
                                    lastGradesObject={gradesData?.lastGrades}
                                />
                            )}
                        </View>
                        <HomeworksPreview homeworksDatas={homeworksData} />
                    </View>
                    {token === "guest_token" && <GuestTestButtonsView />}
                    <View style={{ height: 25 }} />
                </ScrollView>
            </View>
        </ScreenStackView>
    );
}
