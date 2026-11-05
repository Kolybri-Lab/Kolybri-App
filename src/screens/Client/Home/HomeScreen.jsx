import { ScreenStack, SharePopup, Text } from "@/components";
import { useGrades } from "@/features/grades";
import ActiveCourseCard from "@/features/home/components/ActiveCourseCard";
import GeneralAveragePreview from "@/features/home/components/GeneralAveragePreview";
import HomeworksPreview from "@/features/home/components/HomeworksPreview";
import LastGrades from "@/features/home/components/LastGrades";
import getGreetingMessage from "@/features/home/utils/getGreetingMessage";
import { useHomeworks } from "@/features/homeworks";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { GuestTestButtons } from "@/mock/guest/components";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const token = useUserStore((state) => state.token);
    const profile = useUserStore((state) => state.profile);

    const [greetingMessage] = useState(getGreetingMessage);

    const hasHydrated = useUserStore((s) => s.hasHydrated);
    const isFirstLaunch = useUserStore((s) => s.isFirstLaunch);
    const markLaunched = useUserStore((s) => s.markLaunched);
    const [showPopup, setShowPopup] = useState(false);

    const name = profile?.name ?? "";
    const { data: gradesData } = useGrades(token);
    const { data: homeworksData } = useHomeworks(token);

    const localPhotoUri = profile?.localPhotoUri;

    const customDataStore = useCustomDataStore();

    useEffect(() => {
        if (hasHydrated && isFirstLaunch) {
            const timer = setTimeout(() => setShowPopup(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [hasHydrated, isFirstLaunch]);

    const handleClosePopup = () => {
        setShowPopup(false);
        markLaunched();
    };

    const getProfileImageSource = useCallback(
        () =>
            localPhotoUri
                ? { uri: localPhotoUri }
                : require("../../../../assets/custom/default-user-picture.png"),
        [localPhotoUri]
    );
    return (
        <ScreenStack>
            <SharePopup visible={showPopup} onClose={handleClosePopup} />
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
                                borderColor: "hsla(0, 0%, 100%, 0.6)",
                                borderWidth: 1.5,
                                width: 46,
                                height: 46,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "hsla(0, 0%, 100%, 0.3)",
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
                                    preset="h4"
                                    size={26}
                                    style={{ fontFamily: "Petrona-SemiBold" }}
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
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text
                                    size={26}
                                    color={withAlpha(colors.text.primary, 0.4)}
                                    style={{ fontFamily: "Medium", lineHeight: 25 }}
                                >
                                    {greetingMessage}
                                </Text>
                                <Text
                                    size={38}
                                    style={{
                                        fontFamily: "Petrona-SemiBold",
                                        letterSpacing: 0.3,
                                    }}
                                >
                                    {name} 👋
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                    <View style={{ gap: 26 }}>
                        <ActiveCourseCard />
                        <View style={{ gap: 3 }}>
                            <GeneralAveragePreview gradesData={gradesData} />
                            {gradesData?.lastGrades?.length >= 1 && (
                                <LastGrades
                                    lastGradesObject={gradesData.lastGrades}
                                />
                            )}
                        </View>
                        <HomeworksPreview
                            customHomeworks={customDataStore?.customHomeworks ?? {}}
                            homeworksDatas={homeworksData}
                        />
                    </View>
                    {token === "guest_token" && <GuestTestButtons />}
                    <View style={{ height: 25 }} />
                </ScrollView>
            </View>
        </ScreenStack>
    );
}

