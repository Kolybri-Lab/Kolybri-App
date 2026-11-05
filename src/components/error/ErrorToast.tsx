import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    DevSettings,
} from "react-native";
import Animated, {
    LinearTransition,
    FadeIn,
    FadeOut,
    Easing,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { TriangleAlert, X, RefreshCw, ServerOff } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useErrorStore } from "@/hooks/useErrorStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { AppError, EnrichedAppError } from "@/types/errors";
import { getApiMessage } from "@/constants/api/codes";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SMOOTH_LAYOUT = LinearTransition.duration(350).easing(Easing.out(Easing.quad));

export interface ErrorToastProps {
    onPressDismiss?: (id: string) => void;
}

export function ErrorToast({ onPressDismiss }: ErrorToastProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isBooting = useAuthStore((state) => state.isBooting);
    const errors = useErrorStore((state) => state.errors);
    const dismissError = useErrorStore((state) => state.dismissError);

    const [expandedToastId, setExpandedToastId] = useState<string | null>(null);

    const toastErrors = useMemo(() => {
        return errors.filter(
            (e) => e.error.type === "api-business" || e.error.type === "unknown"
        );
    }, [errors]);

    const isVisible = isAuthenticated && !isBooting && toastErrors.length > 0;

    const handleDismissItem = useCallback(
        (id: string) => {
            if (expandedToastId === id) {
                setExpandedToastId(null);
            }
            dismissError(id);
            if (onPressDismiss) {
                onPressDismiss(id);
            }
        },
        [expandedToastId, dismissError, onPressDismiss]
    );

    const handleToggleExpand = useCallback((id: string) => {
        setExpandedToastId((prev) => (prev === id ? null : id));
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {expandedToastId && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setExpandedToastId(null)}
                    style={{
                        position: "absolute",
                        top: -1000,
                        left: -1000,
                        right: -1000,
                        bottom: -1000,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 997,
                    }}
                />
            )}

            <Animated.View
                layout={SMOOTH_LAYOUT}
                style={{
                    position: "absolute",
                    bottom: 100,
                    left: 20,
                    right: 20,
                    zIndex: 999,
                    gap: 8,
                    justifyContent: "flex-end",
                }}
            >
                {toastErrors.map((enrichedError) => {
                    const isExpanded = expandedToastId === enrichedError.id;
                    const isOtherExpanded = expandedToastId !== null && !isExpanded;

                    return (
                        <ToastItem
                            key={enrichedError.id}
                            enrichedError={enrichedError}
                            isOpen={isExpanded}
                            isOtherExpanded={isOtherExpanded}
                            onToggleExpand={() =>
                                handleToggleExpand(enrichedError.id)
                            }
                            onDismiss={handleDismissItem}
                        />
                    );
                })}
            </Animated.View>
        </View>
    );
}

export const ToastItem = React.memo(function ToastItem({
    enrichedError,
    isOpen,
    isOtherExpanded,
    onToggleExpand,
    onDismiss,
}: {
    enrichedError: EnrichedAppError;
    isOpen: boolean;
    isOtherExpanded: boolean;
    onToggleExpand: () => void;
    onDismiss: (id: string) => void;
}) {
    const { id, durationMs, error } = enrichedError;
    const translateY = useSharedValue(0);
    const [hasBeenOpened, setHasBeenOpened] = useState(false);
    const [toastHeight, setToastHeight] = useState(61);

    useEffect(() => {
        if (isOpen) setHasBeenOpened(true);
        const centerOffset = -(SCREEN_HEIGHT / 2 - 100 - toastHeight / 2);
        translateY.value = withTiming(isOpen ? centerOffset : 0, {
            duration: 400,
            easing: Easing.out(Easing.quad),
        });
    }, [isOpen, toastHeight]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    useEffect(() => {
        if (isOpen || isOtherExpanded) return;
        const timeout = durationMs ?? 4000;
        if (timeout <= 0) return;

        const timer = setTimeout(() => onDismiss(id), timeout);
        return () => clearTimeout(timer);
    }, [id, durationMs, onDismiss, isOpen, isOtherExpanded]);

    if (isOtherExpanded) {
        return null;
    }

    const title =
        error.type === "api-business"
            ? "Erreur API Ecole Directe"
            : "Erreur dans l'application";
    const indication =
        error.type === "api-business"
            ? "Toucher pour en savoir plus"
            : "Un dysfonctionnement pourrait survenir";

    return (
        <Animated.View
            onLayout={(e) => setToastHeight(e.nativeEvent.layout.height)}
            layout={SMOOTH_LAYOUT}
            style={[
                {
                    borderRadius: 14,
                    backgroundColor: "#0C0C20",
                    marginBottom: 8,
                    zIndex: isOpen ? 1000 : 999,
                    overflow: "hidden",
                    borderColor: "red",
                    borderWidth: 1.5,
                },
                containerStyle,
            ]}
        >
            <TouchableOpacity
                onPress={onToggleExpand}
                activeOpacity={0.9}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 61,
                    padding: 14,
                }}
            >
                <ErrorIcon type={error.type} />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <AnimatedTitle
                        title={title}
                        isOpen={isOpen}
                        startFontSize={14}
                        endFontSize={20}
                    />
                    <AnimatedIndication
                        indication={indication}
                        isOpen={isOpen}
                        hasBeenOpened={hasBeenOpened}
                    />
                </View>
                <AnimatedButtons
                    isOpen={isOpen}
                    hasBeenOpened={hasBeenOpened}
                    id={id}
                    onDismiss={onDismiss}
                />
            </TouchableOpacity>

            <ToastExpandedContent
                isOpen={isOpen}
                error={error}
                id={id}
                onDismiss={onDismiss}
            />
        </Animated.View>
    );
});

export function ToastExpandedContent({
    isOpen,
    error,
    id,
    onDismiss,
}: {
    isOpen: boolean;
    error: AppError;
    id: string;
    onDismiss: (id: string) => void;
}) {
    if (!isOpen) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(280)}
            exiting={FadeOut.duration(180)}
            style={{
                paddingHorizontal: "7%",
                paddingBottom: 24,
                paddingTop: 10,
                borderTopWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
                gap: 6,
            }}
        >
            <ErrorDescription type={error.type} />
            <ErrorDetails error={error} />
            <ActionButton type={error.type} id={id} onDismiss={onDismiss} />
        </Animated.View>
    );
}

// =========================================================================
// SOUS-COMPOSANTS D'ANIMATION ET DE RENDER EN BAS DE FICHIER
// =========================================================================

export function AnimatedTitle({
    title,
    isOpen,
    startFontSize = 14,
    endFontSize = 18,
}: {
    title: string;
    isOpen: boolean;
    startFontSize?: number;
    endFontSize?: number;
}) {
    const fontSizeValue = useSharedValue(startFontSize);

    useEffect(() => {
        fontSizeValue.value = withTiming(isOpen ? endFontSize : startFontSize, {
            duration: 400,
            easing: Easing.out(Easing.quad),
        });
    }, [isOpen, startFontSize, endFontSize]);

    const titleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fontSizeValue.value / startFontSize }],
        transformOrigin: "left center",
    }));

    return (
        <Animated.Text
            numberOfLines={1}
            style={[
                {
                    fontSize: startFontSize,
                    color: "red",
                    marginTop: -1,
                    fontWeight: isOpen ? "bold" : "normal",
                },
                titleStyle,
            ]}
        >
            {title}
        </Animated.Text>
    );
}

export function AnimatedIndication({
    indication,
    isOpen,
    hasBeenOpened,
}: {
    indication: string;
    isOpen: boolean;
    hasBeenOpened: boolean;
}) {
    if (isOpen) return null;

    return (
        <Animated.View
            entering={hasBeenOpened ? FadeIn.delay(200).duration(200) : undefined}
            exiting={FadeOut.duration(150)}
        >
            <Text
                numberOfLines={1}
                style={{
                    fontSize: 11,
                    color: "rgba(255,255,255, .8)",
                }}
            >
                {indication}
            </Text>
        </Animated.View>
    );
}

export function AnimatedButtons({
    isOpen,
    hasBeenOpened,
    id,
    onRefresh,
    onDismiss,
}: {
    isOpen: boolean;
    hasBeenOpened: boolean;
    id: string;
    onRefresh?: () => void;
    onDismiss?: (id: string) => void;
}) {
    if (isOpen) return null;

    return (
        <Animated.View
            entering={hasBeenOpened ? FadeIn.delay(180).duration(200) : undefined}
            exiting={FadeOut.duration(140)}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
            }}
        >
            <TouchableOpacity
                onPress={onRefresh ?? (() => console.log("Refresh"))}
                hitSlop={10}
            >
                <RefreshCw color="#6382FF" strokeWidth={3} />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => onDismiss && onDismiss(id)}
                hitSlop={10}
            >
                <X color="#7A7A7A" strokeWidth={3} />
            </TouchableOpacity>
        </Animated.View>
    );
}

export function ErrorIcon({ type }: { type?: string }) {
    if (type === "api-business") {
        return <ServerOff size={32} color="red" strokeWidth={2.5} />;
    }
    return <TriangleAlert color="red" strokeWidth={2.5} size={32} />;
}

export function ActionButton({
    type,
    id,
    onDismiss,
}: {
    type?: string;
    id: string;
    onDismiss: (id: string) => void;
}) {
    const queryClient = useQueryClient();

    const handleLightweightRefresh = async () => {
        onDismiss(id);
        DevSettings.reload();
    };

    const handleUniversalRefresh = () => {
        onDismiss(id);
        queryClient.invalidateQueries();
    };

    const handleRetry = () => {
        if (type === "api-business") {
            handleUniversalRefresh();
        } else if (type === "unknown") {
            handleLightweightRefresh();
        } else {
            onDismiss(id);
        }
    };

    return (
        <View
            style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
                paddingHorizontal: "4%",
            }}
        >
            <TouchableOpacity
                onPress={() => onDismiss(id)}
                style={{
                    width: "45%",
                    height: 27,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#6382FF",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ color: "#FFFFFF", fontSize: 14 }}>Ignorer</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleRetry}
                style={{
                    width: "45%",
                    height: 27,
                    borderRadius: 6,
                    backgroundColor: "#6382FF",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ color: "#FFFFFF", fontSize: 14 }}>Réessayer</Text>
            </TouchableOpacity>
        </View>
    );
}

export function ErrorDescription({ type }: { type: string }) {
    let description =
        type === "api-business"
            ? "Le serveur d’école directe n’a pas répondu correctement. Les données affichées sont donc les anciennes et pourraient être légèrement obsolètes."
            : "Il est conseillé de juste redémarrer l'application en cas d'anomalie.";

    return (
        <>
            <Text
                style={{
                    color: "white",
                    fontSize: 16,
                    marginBottom: 10,
                    marginTop: 5,
                }}
            >
                Ce n'est pas une erreur bloquante
            </Text>
            <Text style={{ color: "white", fontSize: 12 }}>
                Mais de multiples erreurs comme celle ci constituent un problème mais
                c'est inoffensif.
            </Text>
            {description && (
                <Text style={{ color: "white", fontSize: 12 }}>{description}</Text>
            )}
        </>
    );
}

export function ErrorDetails({ error }: { error: AppError }) {
    const code = "code" in error ? error.code : undefined;
    const signification = code != undefined ? getApiMessage(code) : undefined;

    return (
        <View
            style={{
                marginVertical: 5,
                marginHorizontal: 6,
                padding: 6,
                borderTopWidth: 0.5,
                borderBottomWidth: 0.5,
                borderColor: "rgba(255,255,255, .6)",
            }}
        >
            {code != undefined && (
                <Text style={{ color: "white", fontSize: 14 }}>Code : {code}</Text>
            )}
            {signification != undefined && (
                <Text style={{ color: "white", fontSize: 14 }}>
                    Signification : {signification}
                </Text>
            )}
            <Text
                style={{
                    color: "white",
                    fontSize: 14,
                    marginTop: code != undefined ? 10 : 0,
                }}
            >
                Message : {error.message}
            </Text>
        </View>
    );
}

export default ErrorToast;

