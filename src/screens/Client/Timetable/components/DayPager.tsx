import { FlatDay } from "@/features/timetable";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { DayViewBreak, DayViewCourse } from "./DayViewCards";

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
                ? `c-${item.data.id}`
                : `b-${item.data.type}-${item.data.schedules.start.time}`,
        []
    );

    return (
        <View style={{ width }}>
            <FlatList
                data={day.items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={DaySeparator}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                windowSize={5}
            />
        </View>
    );
});

const DaySeparator = () => <View style={{ height: 12 }} />;

function DayPager({ days, index, onIndexChange }) {
    const [width, setWidth] = useState(0);
    const listRef = useRef(null);
    const currentIndex = useRef(index);

    useEffect(() => {
        if (width === 0 || index === currentIndex.current) return;

        currentIndex.current = index;
        listRef.current?.scrollToIndex({
            index,
            animated: true,
        });
    }, [index, width]);

    const handleEnd = useCallback(
        (e) => {
            if (width === 0) return;

            const nextIndex = Math.round(e.nativeEvent.contentOffset.x / width);

            if (nextIndex === currentIndex.current) return;

            currentIndex.current = nextIndex;
            onIndexChange(nextIndex);
        },
        [width, onIndexChange]
    );

    const renderItem = useCallback(
        ({ item }) => <DayPage day={item} width={width} />,
        [width]
    );

    const getItemLayout = useCallback(
        (_, i) => ({
            length: width,
            offset: width * i,
            index: i,
        }),
        [width]
    );

    return (
        <View
            style={{ flex: 1, width: "100%" }}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
            {width > 0 && days.length > 0 && (
                <FlatList
                    ref={listRef}
                    data={days}
                    keyExtractor={(day) => day.date}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={index >= 0 ? index : 0}
                    horizontal
                    pagingEnabled
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={1}
                    maxToRenderPerBatch={1}
                    windowSize={3}
                    onMomentumScrollEnd={handleEnd}
                />
            )}
        </View>
    );
}

export default memo(DayPager);
