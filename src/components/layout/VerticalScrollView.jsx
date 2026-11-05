import React, { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    cancelAnimation,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { GLOBALS_DATAS } from "@/constants/device/globals";

const {
    screen: { height },
} = GLOBALS_DATAS;

const SPRING_CONFIG = {
    stiffness: 180,
    damping: 22,
    mass: 0.8,
};

const VerticalScrollView = forwardRef(({ children, arrayLength, getIndex }, ref) => {
    const translateY = useSharedValue(0);
    const pageIndex = useSharedValue(0);
    const startY = useSharedValue(0);
    const [activePageIndex, setActivePageIndex] = useState(0);

    useDerivedValue(() => {
        scheduleOnRN(getIndex, pageIndex.value);
    });

    const scrollToIndex = (index, withAnimation = true) => {
        if (index < 0 || index >= arrayLength) return;

        pageIndex.value = index;
        if (withAnimation) {
            translateY.value = withSpring(-index * height, SPRING_CONFIG);
        } else {
            translateY.value = -index * height;
        }

        setActivePageIndex(index);
    };

    const adjustForPrepend = (addedCount) => {
        if (addedCount <= 0) return;
        pageIndex.value = pageIndex.value + addedCount;
        translateY.value = translateY.value - addedCount * height;
        setActivePageIndex((prev) => prev + addedCount);
    };

    useImperativeHandle(ref, () => ({
        scrollToIndex,
        adjustForPrepend,
    }));

    const gesture = Gesture.Pan()
        .onStart(() => {
            cancelAnimation(translateY);
            startY.value = translateY.value;
        })
        .onUpdate((event) => {
            const minTranslate = -(arrayLength - 1) * height;
            const maxTranslate = 0;
            const rawTranslate = startY.value + event.translationY;

            if (rawTranslate > maxTranslate) {
                translateY.value = maxTranslate + (rawTranslate - maxTranslate) * 0.2;
            } else if (rawTranslate < minTranslate) {
                translateY.value = minTranslate + (rawTranslate - minTranslate) * 0.2;
            } else {
                translateY.value = rawTranslate;
            }
        })
        .onEnd((event) => {
            const currentTranslate = translateY.value;
            let targetIndex = pageIndex.value;

            if (event.velocityY < -500 || event.translationY < -height * 0.25) {
                targetIndex = Math.min(arrayLength - 1, Math.floor(-currentTranslate / height) + 1);
            } else if (event.velocityY > 500 || event.translationY > height * 0.25) {
                targetIndex = Math.max(0, Math.ceil(-currentTranslate / height) - 1);
            } else {
                targetIndex = Math.max(0, Math.min(arrayLength - 1, Math.round(-currentTranslate / height)));
            }

            scheduleOnRN(scrollToIndex, targetIndex);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.container, animatedStyle]}>
                {React.Children.map(children, (child, index) => (
                    <View key={index} style={styles.page}>
                        {child}
                    </View>
                ))}
            </Animated.View>
        </GestureDetector>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    page: { width: "100%", height },
});

export default VerticalScrollView;
