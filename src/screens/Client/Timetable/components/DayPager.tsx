import { Text } from "@/components";
import { FlatDay } from "@/features/timetable";
import { useNetworkStore } from "@/hooks/useNetworkStore";
import { useTheme } from "@/hooks/useThemeStore";
import { WifiOff } from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { DayViewBreak, DayViewCourse } from "./DayViewCards";
import { DayViewLeave } from "./DayViewLeave";
import { useTimetablePagerStore } from "./timetablePagerStore";

const HORIZONTAL_PADDING = 22;
const PAGE_GAP = 16;

const PageSeparator = memo(function PageSeparator() {
    return <View style={{ width: PAGE_GAP }} />;
});

export const isLeaveDay = (day: FlatDay): boolean => {
    const hasCourses = day.items.some((item) => item.kind === "course");
    return (
        !hasCourses &&
        day.items.some((item) => item.kind === "break" && item.data.type === "LEAVE")
    );
};

const DayPage = memo(function DayPage({
    day,
    width,
    pageIndex,
}: {
    day: FlatDay;
    width: number;
    pageIndex: number;
}) {
    const leaveDay = useMemo(() => isLeaveDay(day), [day]);

    const keyExtractor = useCallback(
        (item: FlatDay["items"][number]) =>
            item.kind === "course"
                ? Array.isArray(item.data)
                    ? `c-${item.data.map((c) => c.id).join("-")}`
                    : `c-${item.data.id}`
                : `b-${item.data.type}-${item.data.schedules.start.time}`,
        []
    );

    if (leaveDay) {
        return (
            <View style={{ width, flex: 1, paddingHorizontal: HORIZONTAL_PADDING }}>
                <DayViewLeave pageIndex={pageIndex} />
            </View>
        );
    }

    return (
        <View style={{ width, flex: 1, paddingHorizontal: HORIZONTAL_PADDING }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingTop: 14,
                    paddingBottom: 24,
                    gap: 12,
                }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
            >
                {day.items.map((item) =>
                    item.kind === "course" ? (
                        <DayViewCourse key={keyExtractor(item)} course={item.data} />
                    ) : (
                        <DayViewBreak
                            key={keyExtractor(item)}
                            breakItem={item.data}
                        />
                    )
                )}
            </ScrollView>
        </View>
    );
});

interface DayPagerProps {
    days: FlatDay[];
    index: number;
    onIndexChange: (index: number) => void;
    onExtendForward?: () => void;
    onExtendBackward?: () => void;
}

function DayPager({
    days,
    index,
    onIndexChange,
    onExtendForward,
    onExtendBackward,
}: DayPagerProps) {
    const [containerWidth, setContainerWidth] = useState(0);
    const { colors } = useTheme();
    const isConnected = useNetworkStore(
        (state) => state.activeNetworkStatus.isConnected
    );
    const isOffline = isConnected === false;
    const listRef = useRef<FlatList>(null);
    const currentIndex = useRef(index);

    const pageWidth = containerWidth;
    const snapInterval = pageWidth + PAGE_GAP;
    const prevFirstDateRef = useRef<string | null>(null);

    const isProgrammaticScrollRef = useRef(false);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 60,
    }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (isProgrammaticScrollRef.current) return;
        const dominant = viewableItems?.[0];
        if (dominant && typeof dominant.index === "number") {
            useTimetablePagerStore.getState().setAnimatingIndex(dominant.index);
        }
    }).current;

    const checkThresholds = useCallback(
        (targetIndex: number) => {
            if (isOffline) return;
            // Antérieur à J-3 (3 jours ou moins depuis le début)
            if (targetIndex <= 3) {
                onExtendBackward?.();
            }
            // Ultérieur à J-5 (5 jours ou moins avant la fin)
            if (targetIndex >= days.length - 5) {
                onExtendForward?.();
            }
        },
        [isOffline, days.length, onExtendBackward, onExtendForward]
    );

    useEffect(() => {
        if (days.length === 0) return;
        const currentFirstDate = days[0].date;

        if (
            prevFirstDateRef.current &&
            prevFirstDateRef.current !== currentFirstDate
        ) {
            const addedCount = days.findIndex(
                (d) => d.date === prevFirstDateRef.current
            );
            if (addedCount > 0) {
                currentIndex.current += addedCount;
            }
        }
        prevFirstDateRef.current = currentFirstDate;
    }, [days]);

    useEffect(() => {
        const originDay = days[index];
        const isLeave = originDay ? isLeaveDay(originDay) : false;
        useTimetablePagerStore.getState().setBoth(index, isLeave);

        if (pageWidth === 0 || index === currentIndex.current) return;

        isProgrammaticScrollRef.current = true;
        currentIndex.current = index;
        listRef.current?.scrollToOffset({
            offset: index * snapInterval,
            animated: true,
        });
        checkThresholds(index);
    }, [index, pageWidth, snapInterval, checkThresholds, days]);

    const handleEnd = useCallback(
        (e: any) => {
            isProgrammaticScrollRef.current = false;
            if (snapInterval === 0) return;

            const nextIndex = Math.round(
                e.nativeEvent.contentOffset.x / snapInterval
            );

            if (nextIndex >= days.length) {
                const lastIndex = Math.max(0, days.length - 1);
                isProgrammaticScrollRef.current = true;
                currentIndex.current = lastIndex;
                listRef.current?.scrollToOffset({
                    offset: lastIndex * snapInterval,
                    animated: true,
                });
                const lastDay = days[lastIndex];
                useTimetablePagerStore
                    .getState()
                    .setBoth(lastIndex, lastDay ? isLeaveDay(lastDay) : false);
                return;
            }

            const nextDay = days[nextIndex];
            const isLeave = nextDay ? isLeaveDay(nextDay) : false;
            useTimetablePagerStore.getState().setBoth(nextIndex, isLeave);

            if (nextIndex === currentIndex.current) return;

            currentIndex.current = nextIndex;
            onIndexChange(nextIndex);
            checkThresholds(nextIndex);
        },
        [snapInterval, onIndexChange, checkThresholds, days]
    );

    const keyExtractor = useCallback((day: FlatDay) => day.date, []);

    const renderItem = useCallback(
        ({ item, index: itemIndex }: { item: FlatDay; index: number }) => {
            return (
                <DayPage
                    day={item}
                    width={pageWidth}
                    pageIndex={itemIndex}
                />
            );
        },
        [pageWidth]
    );

    const getItemLayout = useCallback(
        (_: any, i: number) => ({
            length: snapInterval,
            offset: snapInterval * i,
            index: i,
        }),
        [snapInterval]
    );

    const offlineFooter = useMemo(() => {
        if (!isOffline || pageWidth === 0) return null;
        return (
            <View
                style={{
                    width: Math.round(pageWidth * 0.6),
                    marginLeft: PAGE_GAP,
                    flex: 1,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingLeft: 12,
                    paddingRight: 20,
                    gap: 8,
                }}
            >
                <WifiOff size={26} color={colors.text.secondary} />
                <Text
                    preset="body.lg"
                    weight="medium"
                    align="left"
                    color={colors.text.primary}
                >
                    Hors connexion
                </Text>
                <Text
                    preset="body.sm"
                    align="left"
                    color={colors.text.secondary}
                >
                    Reconnectez-vous pour voir la suite.
                </Text>
            </View>
        );
    }, [isOffline, pageWidth, colors.text.primary, colors.text.secondary]);

    return (
        <View
            style={{ flex: 1, width: "100%" }}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {pageWidth > 0 && days.length > 0 && (
                <FlatList
                    ref={listRef}
                    data={days}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    ItemSeparatorComponent={PageSeparator}
                    ListFooterComponent={offlineFooter}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={index >= 0 ? index : 0}
                    horizontal
                    disableIntervalMomentum
                    snapToInterval={snapInterval}
                    snapToAlignment="start"
                    decelerationRate="normal"
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={2}
                    maxToRenderPerBatch={2}
                    windowSize={3}
                    maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    onMomentumScrollEnd={handleEnd}
                />
            )}
        </View>
    );
}

export default memo(DayPager);

