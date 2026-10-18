import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { DayViewBreak, DayViewCourse } from "./DayViewCards";

function DayPage({ day, width }) {
    return (
        <View style={{ width }}>
            <ScrollView
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {day.items.map((item) =>
                    item.kind === "course" ? (
                        <DayViewCourse
                            key={`c-${item.data.id}`}
                            course={item.data}
                        />
                    ) : (
                        <DayViewBreak
                            key={`b-${item.data.type}-${item.data.schedules.start.time}`}
                            breakItem={item.data}
                        />
                    )
                )}
            </ScrollView>
        </View>
    );
}

function DayPager({ days, index, onIndexChange }) {
    const [width, setWidth] = useState(0);
    const listRef = useRef(null);
    const currentIndex = useRef(index);

    useEffect(() => {
        if (width === 0 || index === currentIndex.current) return;
        const animated = Math.abs(index - currentIndex.current) === 1;
        currentIndex.current = index;
        listRef.current?.scrollToIndex({ index, animated });
    }, [index, width]);

    const handleEnd = useCallback(
        (e) => {
            if (width === 0) return;
            const next = Math.round(e.nativeEvent.contentOffset.x / width);
            if (next === currentIndex.current) return;
            currentIndex.current = next;
            onIndexChange(next);
        },
        [width, onIndexChange]
    );

    const renderItem = useCallback(
        ({ item }) => <DayPage day={item} width={width} />,
        [width]
    );

    return (
        <View
            style={{ flex: 1, width: "100%" }}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
            {width > 0 && (
                <FlatList
                    ref={listRef}
                    data={days}
                    keyExtractor={(d) => d.date}
                    horizontal
                    pagingEnabled
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={index}
                    getItemLayout={(_, i) => ({
                        length: width,
                        offset: width * i,
                        index: i,
                    })}
                    windowSize={3}
                    initialNumToRender={5}
                    onMomentumScrollEnd={handleEnd}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
}
export default memo(DayPager);
