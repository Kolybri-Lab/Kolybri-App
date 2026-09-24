import { Text } from "@/components/core";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { formatDate } from "@/utils/date";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MD5 } from "crypto-js";
import { useEffect, useState } from "react";
import {
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useHomework } from "../context/HomeworkContext";

export default function NewHomeworkModal({ visible, defaultDate }) {
    const { dispatch } = useHomework();
    const { colors } = useTheme();
    const [isRendered, setIsRendered] = useState(false);
    const [error, setError] = useState(null);
    const translateY = useSharedValue(500);
    const opacity = useSharedValue(0);

    const [date, setDate] = useState(new Date());

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [homeworkDatas, setHomeworkDatas] = useState({
        discipline: "Mathématique",
        date: formatDate(new Date(), "ed"),
        content: null,
        id: 1,
        isEvaluation: false,
    });

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === "ios");
        setDate(currentDate);
        setHomeworkDatas((prev) => ({
            ...prev,
            date: formatDate(currentDate, "ed"),
        }));
    };

    useEffect(() => {
        if (visible) {
            const initialDate = defaultDate
                ? new Date(`${defaultDate}T12:00:00`)
                : new Date();
            setDate(initialDate);
            setHomeworkDatas((prev) => ({
                ...prev,
                date: formatDate(initialDate, "ed"),
            }));

            setIsRendered(true);
            translateY.value = withTiming(0, {
                duration: 450,
            });
            opacity.value = withTiming(1, { duration: 250 });
        } else {
            translateY.value = withTiming(
                500,
                {
                    duration: 350,
                },
                () => {
                    scheduleOnRN(setIsRendered, false);
                }
            );
            opacity.value = withTiming(0, { duration: 250 });
        }
    }, [visible, defaultDate]);

    const modalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const handleClose = () => {
        dispatch({ type: "CLOSE_NEW_HOMEWORK_MODAL" });
    };
    const handleCreate = () => {
        if (
            !homeworkDatas.content ||
            !homeworkDatas.date ||
            !homeworkDatas.discipline ||
            !homeworkDatas.id
        )
            return setError("Veuillez remplir tout les champs !");

        const updatedHomework = {
            ...homeworkDatas,
            discipline: { name: homeworkDatas.discipline },
        };
        updatedHomework["md5Key"] = MD5(JSON.stringify(updatedHomework)).toString();
        dispatch({ type: "CREATE_NEW_HOMEWORK", payload: updatedHomework });
    };

    useEffect(() => {
        if (!error) return;
        setTimeout(() => {
            setError("");
        }, 3000);
    }, [error]);

    if (!isRendered) return null;

    return (
        <View
            style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 1000,
            }}
        >
            <Animated.View
                style={[
                    {
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.7)",
                    },
                    backdropStyle,
                ]}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleClose}
                    style={{ flex: 1 }}
                />
            </Animated.View>
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        backgroundColor: colors.surface.raised,
                        borderTopLeftRadius: 42,
                        borderTopRightRadius: 42,
                        paddingHorizontal: 24,
                        paddingTop: 16,
                        minHeight: 400,
                        maxHeight: "85%",
                    },
                    modalStyle,
                ]}
            >
                <View
                    style={{
                        width: 50,
                        height: 5,
                        backgroundColor: colors.surface.default,
                        borderRadius: 3,
                        alignSelf: "center",
                        marginBottom: 24,
                    }}
                />
                {error && (
                    <View
                        style={{
                            backgroundColor: "hsla(0, 70%, 50%, 0.2)",
                            marginHorizontal: 60,
                            paddingVertical: 12,
                            borderRadius: 10,
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "hsla(0, 70%, 50%, 0.5)",
                            marginBottom: 10,
                        }}
                    >
                        <Text align="center">⚠️ {error}</Text>
                    </View>
                )}
                <View style={{ marginBottom: 12 }}>
                    <Text preset="h2">Ajouter un devoir</Text>
                    <Text
                        style={{
                            marginTop: 4,
                        }}
                        preset="body2"
                    >
                        Ajouter un devoir pour s'épargner l'agenda !
                    </Text>
                </View>
                <View
                    style={{
                        marginBottom: 20,
                        alignItems: "center",
                    }}
                >
                    <View style={{ flexDirection: "row", gap: 20 }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.surface.default,
                                borderRadius: 13,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderWidth: 1,
                                borderColor: colors.border.subtle,
                                width: "40%",
                                justifyContent: "center",
                            }}
                            onPress={() => setShowDatePicker((prev) => !prev)}
                        >
                            <Text align="center">{formatDate(date)}</Text>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="calendar"
                                    onChange={onChange}
                                    minimumDate={
                                        date < new Date()
                                            ? date
                                            : new Date(
                                                  new Date().setHours(0, 0, 0, 0)
                                              )
                                    }
                                    maximumDate={
                                        new Date(
                                            new Date().setFullYear(
                                                new Date().getFullYear() + 2
                                            )
                                        )
                                    }
                                />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: homeworkDatas.isEvaluation
                                    ? "hsl(0, 54%, 57%)"
                                    : colors.surface.default,
                                alignSelf: "center",
                                paddingHorizontal: 14,
                                paddingVertical: 9,
                                borderRadius: 13,
                            }}
                            onPress={() =>
                                setHomeworkDatas((prev) => ({
                                    ...prev,
                                    isEvaluation: !prev.isEvaluation,
                                }))
                            }
                        >
                            <Text preset="label1">Contrôle</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ marginBottom: 8 }} preset="label1">
                            Matière
                        </Text>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.surface.default,
                                borderRadius: 13,
                                paddingHorizontal: 16,
                                borderWidth: 1,
                                borderColor: colors.border.subtle,
                                minHeight: 50,
                                justifyContent: "center",
                            }}
                        >
                            <TextInput
                                placeholder="Mathématiques"
                                placeholderTextColor={withAlpha(
                                    colors.text.primary,
                                    0.4
                                )}
                                keyboardType="default"
                                style={{ fontSize: 16, color: colors.text.primary }}
                                onChangeText={(text) =>
                                    setHomeworkDatas((prev) => ({
                                        ...prev,
                                        discipline: text,
                                    }))
                                }
                            />
                        </View>
                    </View>

                    <View style={{}}>
                        <Text style={{ marginBottom: 8 }} preset="label1">
                            Tâche à faire
                        </Text>
                        <View
                            style={{
                                backgroundColor: colors.surface.default,
                                borderRadius: 13,
                                paddingHorizontal: 16,
                                paddingVertical: 7,
                                borderWidth: 1,
                                borderColor: colors.border.subtle,
                                minHeight: 250,
                            }}
                        >
                            <TextInput
                                placeholder="Décris la tâche à faire..."
                                placeholderTextColor={withAlpha(
                                    colors.text.primary,
                                    0.4
                                )}
                                keyboardType="default"
                                style={{ fontSize: 16, color: colors.text.primary }}
                                multiline={true}
                                onChangeText={(text) =>
                                    setHomeworkDatas((prev) => ({
                                        ...prev,
                                        content: text,
                                    }))
                                }
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                        onPress={handleClose}
                        style={{
                            flex: 1,
                            backgroundColor: colors.surface.default,
                            paddingVertical: 16,
                            borderRadius: 13,
                            alignItems: "center",
                        }}
                    >
                        <Text preset="label1">Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: colors.brand.primary,
                            paddingVertical: 16,
                            borderRadius: 13,
                            alignItems: "center",
                        }}
                        onPress={handleCreate}
                    >
                        <Text preset="label1" color={colors.text.onBrand}>
                            Ajouter
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

