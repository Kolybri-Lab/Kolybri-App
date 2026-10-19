import { FlatDay } from "@/features/timetable";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { DayViewBreak, DayViewCourse } from "./DayViewCards";

const HORIZONTAL_PADDING = 22;
const PAGE_GAP = 16;

const DayPage = memo(function DayPage({
    day,
    width,
}: {
    day: FlatDay;
    width: number;
}) {
    const renderItem = useCallback(({ item }) => {
        return item.kind === "course" ? (
            <DayViewCourse course={item.data} />
        ) : (
            <DayViewBreak breakItem={item.data} />
        );
    }, []);

    const keyExtractor = useCallback(
        (item) =>
            item.kind === "course"
                ? Array.isArray(item.data)
                    ? `c-${item.data.map((c) => c.id).join("-")}`
                    : `c-${item.data.id}`
                : `b-${item.data.type}-${item.data.schedules.start.time}`,
        []
    );

    return (
        <View style={{ width, paddingHorizontal: HORIZONTAL_PADDING }}>
            <FlatList
                data={day.items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={DaySeparator}
                contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                windowSize={5}
            />
        </View>
    );
});

const DaySeparator = () => <View style={{ height: 12 }} />;

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
        if (pageWidth === 0 || index === currentIndex.current) return;

        currentIndex.current = index;
        listRef.current?.scrollToOffset({
            offset: index * snapInterval,
            animated: true,
        });
        checkThresholds(index);
    }, [index, pageWidth, snapInterval, checkThresholds]);

    const handleEnd = useCallback(
        (e: any) => {
            if (snapInterval === 0) return;

            const nextIndex = Math.round(
                e.nativeEvent.contentOffset.x / snapInterval
            );

            if (nextIndex === currentIndex.current) return;

            currentIndex.current = nextIndex;
            onIndexChange(nextIndex);
            checkThresholds(nextIndex);
        },
        [snapInterval, onIndexChange, checkThresholds]
    );

    const renderItem = useCallback(
        ({ item, index: itemIndex }) => (
            <View
                style={{
                    width: pageWidth,
                    marginRight: itemIndex < days.length - 1 ? PAGE_GAP : 0,
                }}
            >
                <DayPage day={item} width={pageWidth} />
            </View>
        ),
        [pageWidth, days.length]
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
                    keyExtractor={(day) => day.date}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={index >= 0 ? index : 0}
                    horizontal
                    disableIntervalMomentum
                    snapToInterval={snapInterval}
                    snapToAlignment="start"
                    decelerationRate={0.92}
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={2}
                    maxToRenderPerBatch={2}
                    windowSize={3}
                    onMomentumScrollEnd={handleEnd}
                />
            )}
        </View>
    );
}

export default memo(DayPager);

