import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from "react-native-reanimated";
import Stack from "../core/Stack";

export default function ScrollableStack({
    children,
    horizontal = false,
    showsScrollIndicator = false,
    paging = false,
    contentContainerStyle,
    ...props
}) {
    const scrollX = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = horizontal
                ? event.contentOffset.x
                : event.contentOffset.y;
        },
    });

    return (
        <Animated.ScrollView
            horizontal={horizontal}
            contentContainerStyle={[
                !horizontal && { paddingBottom: 24 },
                contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={showsScrollIndicator}
            showsHorizontalScrollIndicator={showsScrollIndicator}
            pagingEnabled={paging}
            onScroll={onScroll}
            // scrollEnabled={false}
            scrollEventThrottle={16}
        >
            <Stack direction={horizontal ? "horizontal" : "vertical"} {...props}>
                {children}
            </Stack>
        </Animated.ScrollView>
    );
}
