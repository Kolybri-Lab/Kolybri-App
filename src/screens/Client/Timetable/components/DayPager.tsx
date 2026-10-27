import { FlatDay } from "@/features/timetable";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { DayViewBreak, DayViewCourse } from "./DayViewCards";
import { DayViewLeave } from "./DayViewLeave";

const HORIZONTAL_PADDING = 22;
const PAGE_GAP = 16;

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
    isActive,
    shouldAnimate,
}: {
    day: FlatDay;
    width: number;
    isActive: boolean;
    shouldAnimate: boolean;
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
                <DayViewLeave isActive={isActive} shouldAnimate={shouldAnimate} />
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
    const listRef = useRef<FlatList>(null);
    const currentIndex = useRef(index);

    const pageWidth = containerWidth;
    const snapInterval = pageWidth + PAGE_GAP;
    const prevFirstDateRef = useRef<string | null>(null);
    const [originIndex, setOriginIndex] = useState(index);
    const originDay = days[originIndex];
    const isOriginLeave = originDay ? isLeaveDay(originDay) : false;

    const isProgrammaticScrollRef = useRef(false);
    const [animatingIndex, setAnimatingIndex] = useState(index);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 60,
    }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (isProgrammaticScrollRef.current) return;
        const dominant = viewableItems?.[0];
        if (dominant && typeof dominant.index === "number") {
            setAnimatingIndex(dominant.index);
        }
    }).current;

    const checkThresholds = useCallback(
        (targetIndex: number) => {
            // Antérieur à J-3 (3 jours ou moins depuis le début)
            if (targetIndex <= 3) {
                onExtendBackward?.();
            }
            // Ultérieur à J-5 (5 jours ou moins avant la fin)
            if (targetIndex >= days.length - 5) {
                onExtendForward?.();
            }
        },
        [days.length, onExtendBackward, onExtendForward]
    );

    // Maintien de l'offset sans animation lors de l'insertion de jours passés (backward)
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
            if (addedCount > 0 && snapInterval > 0) {
                currentIndex.current += addedCount;
                listRef.current?.scrollToOffset({
                    offset: currentIndex.current * snapInterval,
                    animated: false,
                });
            }
        }
        prevFirstDateRef.current = currentFirstDate;
    }, [days, snapInterval]);

    useEffect(() => {
        setAnimatingIndex(index);
        setOriginIndex(index);
        if (pageWidth === 0 || index === currentIndex.current) return;

        isProgrammaticScrollRef.current = true;
        currentIndex.current = index;
        listRef.current?.scrollToOffset({
            offset: index * snapInterval,
            animated: true,
        });
        checkThresholds(index);
    }, [index, pageWidth, snapInterval, checkThresholds]);

    const handleEnd = useCallback(
        (e: any) => {
            isProgrammaticScrollRef.current = false;
            if (snapInterval === 0) return;

            const nextIndex = Math.round(
                e.nativeEvent.contentOffset.x / snapInterval
            );

            setAnimatingIndex(nextIndex);
            setOriginIndex(nextIndex);
            if (nextIndex === currentIndex.current) return;

            currentIndex.current = nextIndex;
            onIndexChange(nextIndex);
            checkThresholds(nextIndex);
        },
        [snapInterval, onIndexChange, checkThresholds]
    );

    const renderItem = useCallback(
        ({ item, index: itemIndex }) => {
            const isItemActive = itemIndex === animatingIndex;
            const shouldAnimate = !isOriginLeave;

            return (
                <View
                    style={{
                        width: pageWidth,
                        marginRight: itemIndex < days.length - 1 ? PAGE_GAP : 0,
                    }}
                >
                    <DayPage
                        day={item}
                        width={pageWidth}
                        isActive={isItemActive}
                        shouldAnimate={shouldAnimate}
                    />
                </View>
            );
        },
        [pageWidth, days.length, animatingIndex, isOriginLeave]
    );

    const getItemLayout = useCallback(
        (_, i) => ({
            length: snapInterval,
            offset: snapInterval * i,
            index: i,
        }),
        [snapInterval]
    );

    return (
        <View
            style={{ flex: 1, width: "100%" }}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {pageWidth > 0 && days.length > 0 && (
                <FlatList
                    ref={listRef}
                    data={days}
                    extraData={`${index}-${animatingIndex}-${isOriginLeave}`}
                    keyExtractor={(day) => day.date}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={index >= 0 ? index : 0}
                    horizontal
                    disableIntervalMomentum
                    snapToInterval={snapInterval}
                    snapToAlignment="start"
                    decelerationRate="normal"
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={4}
                    maxToRenderPerBatch={4}
                    windowSize={5}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    onMomentumScrollEnd={handleEnd}
                />
            )}
        </View>
    );
}

export default memo(DayPager);

