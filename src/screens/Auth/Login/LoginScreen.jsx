import { useNavigation, useTheme } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    A2fSelectableModal,
    CheckBox,
    LinkButton,
    OverLoader,
} from "@/components/index";
import { Account, Discord, EDP, Github } from "@/components/svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/core";
import { getApiMessage } from "@/constants/api/codes";
import { useSignIn } from "@/hooks/useSignIn";
import { routesNames } from "@/router/config/routesNames";
import { addOpacityToCssRgb } from "@/utils/colorGenerator";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { EyeClosedIcon, EyeIcon } from "lucide-react-native";

export default function LoginScreen() {
    const navigation = useNavigation();
    const theme = useTheme();
    const caseColor = addOpacityToCssRgb(theme.colors.case, 0.3);

    const styles = createStyles(theme, caseColor); //Temporary
    const { signIn, mcqDatas, setChoice, setMcqDatas, apiError, setApiError } =
        useSignIn();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [keepConnected, setKeepConnected] = useState(true);
    const [loginStates, setLoginStates] = useState({
        loading: false,
        decodedChoices: [],
        decodedQuestion: null,
    });
    const [loading, setLoading] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const usernameInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const connect = useCallback(() => {
        setLoading(true);
        signIn({
            username: username.trim(),
            password: password,
            keepConnected: keepConnected,
        });
        setApiError(null);
    }, [username, password, keepConnected]);

    useEffect(() => {
        if (!apiError) return;
        setLoading(false);
    }, [apiError]);

    const toggleModal = useCallback(() => {
        setModalVisible((lastState) => !lastState);
    }, []);

    const handleModalSubmit = async (item) => {
        setLoading(true);
        setChoice(mcqDatas.choices[item]);
        setMcqDatas("");
    };

    useEffect(() => {
        if (!mcqDatas) return;
        if (!("choices" in mcqDatas) || !("question" in mcqDatas)) {
            const message = getApiMessage(1005);
            // provoquer une erreur avec le screen d'error (not implemented yet)
        }

        setLoginStates((prevState) => ({
            ...prevState,
            decodedChoices: [...Object.keys(mcqDatas.choices)],
            decodedQuestion: Object.keys(mcqDatas.question)[0],
        }));
        setLoading(false);
        toggleModal();
    }, [mcqDatas]);

    return (
        <SafeAreaView style={[styles.container]}>
            <SafeAreaView style={styles.logos}>
                <LinkButton url={"https://discord.gg/AKAqXfTgvE"}>
                    <Discord fill={theme.colors.main} size={28} />
                </LinkButton>

                <LinkButton
                    url={"https://github.com/as2pick/EcoleDirectePlus-Mobile"}
                >
                    <Github fill={theme.colors.main} size={28} />
                </LinkButton>
            </SafeAreaView>
            <OverLoader
                bgOpacityValue={0.54}
                loaderStyles={styles.loader}
                annimationStartTiming={800}
                triggerStateArr={[loading, setLoading]}
                triggerViewArr={[showLoader, setShowLoader]}
            />

            <View style={styles.form}>
                <View style={styles.logo.box}>
                    <View style={{ opacity: 0 }}>
                        <EDP size={88} />
                    </View>
                    <MaskedView maskElement={<Text preset="h1">Kolybri</Text>}>
                        <LinearGradient
                            colors={theme.colors.edptext}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                        >
                            <Text preset="h1" style={{ opacity: 0 }}>
                                Kolybri
                            </Text>
                        </LinearGradient>
                    </MaskedView>
                </View>
                <View style={[styles.input.box]}>
                    <View style={styles.input.cases}>
                        <View style={styles.input.logos}>
                            <TextInput
                                ref={usernameInputRef}
                                placeholder="Identifiant"
                                placeholderTextColor={theme.colors.main}
                                onChangeText={(data) => {
                                    setApiError(null);
                                    setUsername(data);
                                }}
                                onSubmitEditing={() =>
                                    passwordInputRef.current?.focus()
                                }
                                returnKeyType="next"
                                value={username}
                                textAlign="center"
                                autoComplete="username"
                                textContentType="username"
                                spellCheck={false}
                                style={[
                                    styles.input.case,
                                    {
                                        borderColor: theme.colors.border,
                                        backgroundColor: theme.colors.background,
                                    },
                                ]}
                            />
                            <View style={styles.input.icon}>
                                <Account />
                            </View>
                        </View>
                        <View style={styles.input.logos}>
                            <TextInput
                                ref={passwordInputRef}
                                placeholder="Mot de passe"
                                placeholderTextColor={theme.colors.main}
                                onChangeText={(data) => {
                                    setApiError(null);
                                    setPassword(data);
                                }}
                                onSubmitEditing={connect}
                                value={password}
                                returnKeyType="done"
                                spellCheck={false}
                                textAlign="center"
                                // keyboardType="visible-password"
                                secureTextEntry={!passwordVisible} // ONLY IN PROD ENV
                                autoComplete="password" // ONLY IN PROD ENV
                                textContentType="password" // ONLY IN PROD ENV
                                style={[
                                    styles.input.case,
                                    {
                                        borderColor: theme.colors.border,
                                        backgroundColor: theme.colors.background,
                                    },
                                ]}
                            />
                            <View style={styles.input.icon}>
                                <Pressable
                                    onPress={() =>
                                        setPasswordVisible(!passwordVisible)
                                    }
                                >
                                    {passwordVisible ? (
                                        <EyeIcon
                                            size={26}

                                            color="hsl(222, 54%, 75%)"
                                        />
                                    ) : (
                                        <EyeClosedIcon
                                            size={26}
                                            color="hsl(222, 54%, 75%)"
                                        />
                                    )}
                                </Pressable>
                                {/* <Key /> */}
                            </View>
                        </View>
                        <View style={styles.checkBox}>
                            <CheckBox
                                initialValue={keepConnected}
                                onValueChange={(v) => setKeepConnected(v)}
                                libelle="Rester connecté"
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={connect}
                    style={{
                        borderWidth: 1.4,
                        borderRadius: 12,
                        paddingVertical: 7,
                        paddingHorizontal: 16,
                        borderColor: theme.colors.border,
                        transform: [{ scale: 1.2 }],
                    }}
                >
                    <Text preset="label2">{"Se connecter      ➜"}</Text>
                </TouchableOpacity>
            </View>
            {apiError && (
                <Text style={styles.error} color={theme.colors.error}>
                    {apiError}
                </Text>
            )}

            <View
                style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    marginBottom: 8,
                }}
            >
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate(routesNames.auth.privacyPolicy);
                    }}
                >
                    <Text
                        style={[styles.privacyPolicy]}
                        align="center"
                        color={theme.colors.main}
                        preset="body2"
                    >
                        Politique de confidentialité et Conditions d'utilisation
                    </Text>
                </TouchableOpacity>
            </View>

            <View>
                <A2fSelectableModal
                    visible={modalVisible}
                    onClose={toggleModal}
                    items={loginStates.decodedChoices}
                    onSelect={handleModalSubmit}
                    question={loginStates.decodedQuestion}
                />
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme, caseColor) =>
    StyleSheet.create({
        //const styles = StyleSheet.create({ - Temporary
        container: {
            flex: 1,
            alignItems: "center",
            backgroundColor: theme.colors.background.login,
        },
        logos: {
            flexDirection: "row",
            position: "absolute",
            top: 12,
            left: 8,
            marginLeft: 12,
            gap: 16,
            color: theme.colors.main,
        },
        checkBox: {
            marginLeft: "5%",
        },
        loader: {
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgb(10, 10, 10)",
        },
        form: {
            marginTop: 26,
            height: "82%",
            width: "100%",
            justifyContent: "space-evenly",
            flexDirection: "column",
            alignItems: "center",
        },
        logo: {
            box: { alignItems: "center", gap: 26 },
            logoOutline: {
                borderWidth: 1,
                padding: 10,
                borderRadius: 10,
            },

            textOutline: {
                paddingHorizontal: 17,
                paddingVertical: 4,
                borderWidth: 1,
                borderRadius: 10,
            },
        },
        input: {
            box: {
                width: "100%",
                paddingHorizontal: 20,
                borderRadius: 23,
            },
            cases: { gap: 20 },
            case: {
                borderRadius: 14,
                borderWidth: 0.8,
                paddingHorizontal: 17,
                paddingRight: 42, // 30(logo size)+12(right 12)
                fontSize: 16,
                overflow: "hidden",
                borderColor: theme.colors.accent,
                color: theme.colors.main,
                backgroundColor: caseColor,
            },
            logos: {
                justifyContent: "center",
            },
            icon: {
                right: 12,
                position: "absolute",
                gap: 6,
            },
        },

        button: {
            //borderWidth: 1,
            //borderColor: theme.colors.accent,
            //transform: [{ scale: 1.2 }],
            borderRadius: 12,
            paddingVertical: 7,
            paddingHorizontal: 16,
            color: theme.colors.theme,
            //backgroundColor: theme.colors.accent,
        },
        buttonWrapper: {
            borderRadius: 12,
            overflow: "hidden",
            transform: [{ scale: 1.2 }],
        },

        privacyPolicy: {
            maxWidth: 210,
        },
        error: {
            padding: 12,
            backgroundColor: theme.colors.bg.bg2,
            borderColor: theme.colors.error,
            borderWidth: 0.9,
            borderRadius: 12,
        },
        gradientStyle: {
            paddingVertical: 0,
            paddingHorizontal: 0,
            justifyContent: "center",
            alignItems: "center",
        },
    });

