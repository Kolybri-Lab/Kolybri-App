import { DropDownMenu, ScreenStack, Text } from "@/components";
import { Search } from "@/components/svg";
import { useMessaging } from "@/features/messaging";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { routesNames } from "@/router/config/routesNames";
import dynamicBorderRadius from "@/utils/borderRadius";
import { formatDate } from "@/utils/date";
import { dedupeById } from "@/utils/dedupe";
import { useNavigation } from "@react-navigation/native";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
    interpolate,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";

export default function MessagingContent() {
    const token = useUserStore((state) => state.token);
    const navigation = useNavigation();
    const haptics = useHaptic("light");
    const [displayGroup, setDisplayGroup] = useState({
        id: "received",
        name: "Reçus",
    });
    const {
        data,
        isLoading,
        isError,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
        isRefetching,
    } = useMessaging(token, {
        typeOfRecovery: displayGroup.id,
        itemsPerPage: 20,
    });
    const { colors } = useTheme();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const inputRef = useRef(null);

    const messages = useMemo(() => {
        const flat = data?.pages.flatMap((page) => page[displayGroup.id]) ?? [];
        const deduped = dedupeById(flat);

        const query = searchQuery.trim().toLowerCase();
        if (!query) return deduped;

        return deduped.filter((item) => {
            const senderName = item.sender?.fullName?.toLowerCase() ?? "";
            const subject = item.subject?.toLowerCase() ?? "";
            return senderName.includes(query) || subject.includes(query);
        });
    }, [data, searchQuery]);

    const renderMessageItem = useCallback(
        ({ item, index }) => (
            <MessageItem
                item={item}
                index={index}
                messages={messages}
                navigation={navigation}
                token={token}
            />
        ),
        [messages, navigation, token]
    );

    const transitionProgress = useSharedValue(0); // 0: button ; 1: input
    const pressScale = useSharedValue(1);

    const containerStyle = useAnimatedStyle(() => ({
        flexShrink: 1,
        borderRadius: interpolate(transitionProgress.value, [0, 1], [30, 10]),
        transform: [{ scale: pressScale.value }],
    }));

    const inputStyle = useAnimatedStyle(() => ({
        opacity: interpolate(transitionProgress.value, [0.7, 1], [0, 1]),
    }));
    const buttonTextStyle = useAnimatedStyle(() => ({
        opacity: interpolate(transitionProgress.value, [1, 0.03], [0, 1]),
    }));

    const openSearch = () => {
        haptics();
        setIsSearchOpen(true);
        inputRef.current?.focus();
        transitionProgress.value = withTiming(1, { duration: 250 });
    };
    const closeSearch = () => {
        inputRef.current?.blur();
        setSearchQuery("");
        transitionProgress.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) {
                runOnJS(setIsSearchOpen)(false);
            }
        });
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage && !isLoading) {
            fetchNextPage();
        }
    };

    if (isLoading) return <ActivityIndicator size="large" />;

    if (isError) {
        return (
            <View style={{ padding: 16 }}>
                <Text>Une erreur est survenue lors du chargement des messages.</Text>
            </View>
        );
    }

    return (
        <ScreenStack horizontalSpacing={16}>
            <SafeAreaView>
                <Animated.View
                    layout={LinearTransition.duration(250)}
                    style={[
                        {
                            backgroundColor: colors.surface.raised,
                            alignSelf: "center",
                            paddingVertical: 12,
                            paddingHorizontal: 18,
                            marginVertical: 20,
                        },
                        containerStyle,
                    ]}
                >
                    <Animated.View
                        style={buttonTextStyle}
                        pointerEvents={isSearchOpen ? "none" : "auto"}
                    >
                        <Pressable
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                gap: 8,
                                maxWidth: "100%",
                            }}
                            onPress={openSearch}
                            disabled={isSearchOpen}
                            onPressIn={() => {
                                pressScale.value = withSpring(0.82, {
                                    damping: 10,
                                    stiffness: 140,
                                    mass: 0.7,
                                });
                            }}
                            onPressOut={() => {
                                pressScale.value = withSpring(1, {
                                    damping: 12,
                                    stiffness: 170,
                                    mass: 1.1,
                                });
                            }}
                        >
                            <Search size={18} />
                            <Text
                                preset="label1"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                                style={{ flexShrink: 1 }}
                            >
                                Rechercher dans les messages
                            </Text>
                        </Pressable>
                    </Animated.View>
                    {isSearchOpen && (
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFill,
                                inputStyle,
                                {
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                },
                            ]}
                        >
                            <TextInput
                                autoFocus
                                style={{
                                    height: "100%",
                                    paddingLeft: 16,
                                    flex: 1,
                                    color: "white",
                                }}
                                placeholder="Nom de prof. ou sujet..."
                                onBlur={() => inputRef.current?.blur()}
                                onChangeText={setSearchQuery}
                                value={searchQuery}
                            />
                            <Pressable
                                style={{ paddingRight: 24 }}
                                onPress={closeSearch}
                                hitSlop={10}
                            >
                                <Text>Annuler</Text>
                            </Pressable>
                        </Animated.View>
                    )}
                </Animated.View>
            </SafeAreaView>

            <View
                style={{
                    alignItems: "baseline",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 10,
                }}
            >
                <Text
                    preset="h3"
                    oneLine
                    style={{ marginBottom: 18, flexShrink: 0 }}
                >
                    Boîte de réception
                </Text>
                <View
                    style={{
                        zIndex: 100,
                        minWidth: 0,
                        flexShrink: 1,
                    }}
                >
                    <DropDownMenu
                        options={[
                            { id: "received", name: "Reçus" },
                            { id: "sent", name: "Envoyés" },
                            { id: "draft", name: "Brouillons" },
                            { id: "archived", name: "Archivés" },
                        ]}

                        value={displayGroup}
                        onSelect={(item) => setDisplayGroup(item)}
                        minWidth="180"
                        selectorPosition={"right"}
                        customButtonStyle={{
                            backgroundColor: colors.surface.card,
                        }}
                        customDropDownStyle={{
                            backgroundColor: colors.surface.raised,
                        }}
                    />
                </View>
            </View>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: 4 }}
                renderItem={renderMessageItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={{ padding: 16 }}>
                        <Text>Aucun message pour le moment.</Text>
                    </View>
                }
                ListFooterComponent={
                    <View>
                        {isFetchingNextPage ? (
                            <ActivityIndicator size="small" />
                        ) : null}
                        <View style={{ height: 25 }} />
                    </View>
                }
            />
        </ScreenStack>
    );
}

const MessageItem = memo(({ item, index, navigation, messages, token }) => {
    const BORDER_RADIUS_EXT = 28;
    const BORDER_RADIUS_INT = 6;

    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={() =>
                navigation.navigate(routesNames.client.messaging.details, {
                    token: token,
                    message: item,
                })
            }
            style={{
                backgroundColor: colors.surface.card,
                paddingVertical: 16,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                ...dynamicBorderRadius(
                    index,
                    messages.length,
                    BORDER_RADIUS_INT,
                    BORDER_RADIUS_EXT
                ),
            }}
        >
            <View
                style={{
                    width: 37,
                    height: 37,
                    borderRadius: 18,
                    backgroundColor: "hsla(217, 91%, 60%, 1)",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Text preset="label1" style={{ color: "white" }}>
                    {item.sender.initials ?? "??"}
                </Text>
            </View>

            <View style={{ flex: 1 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Text preset="title2" oneLine style={{ flexShrink: 1 }}>
                        {item.sender.fullName}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Text
                            oneLine
                            preset="label2"
                            style={{ flexShrink: 0, marginLeft: 20 }}
                        >
                            {formatDate(new Date(item.date), "fullDate")}
                        </Text>
                        {!item.read && (
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    backgroundColor: "hsla(0, 0%, 100%, 1)",
                                    borderRadius: 5,
                                }}
                            />
                        )}
                    </View>
                </View>
                <Text preset="body2" oneLine>
                    {item.subject}
                </Text>
            </View>
        </TouchableOpacity>
    );
});

