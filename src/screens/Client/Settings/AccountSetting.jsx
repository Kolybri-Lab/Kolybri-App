import { Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { withAlpha } from "@/themes/color";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import SettingSectionLayout from "./components/SettingSectionLayout";

export default function AccountScreen({ route }) {
    const { label } = route.params;
    const profile = useUserStore((state) => state.profile);
    const setProfile = useUserStore((state) => state.setProfile);
    const nameInputRef = useRef(null);
    const surnameInputRef = useRef(null);
    const { colors } = useTheme();

    const [profileDatas, setProfileDatas] = useState({
        name: profile?.name ?? "",
        surname: profile?.surname ?? "",
    });
    const [ableToValidate, setAbleToValidate] = useState(false);

    useEffect(() => {
        const hasChanged =
            profileDatas.name !== (profile?.name ?? "") ||
            profileDatas.surname !== (profile?.surname ?? "");

        const isValid =
            profileDatas.name.trim() !== "" && profileDatas.surname.trim() !== "";

        setAbleToValidate(hasChanged && isValid);
    }, [profileDatas, profile?.name, profile?.surname]);

    return (
        <SettingSectionLayout label={label}>
            <View style={{ gap: 4 }}>
                <Pressable
                    style={{
                        backgroundColor: withAlpha(
                            colors.surface.simpleOpacity,
                            0.1
                        ),
                        padding: 5,
                        borderRadius: 99,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 20,
                        flexShrink: 1,
                    }}
                    onPress={() => nameInputRef.current?.focus()}
                >
                    <Text preset="title1">Prénom</Text>
                    <TextInput
                        ref={nameInputRef}
                        value={profileDatas.name}
                        placeholder={profileDatas.name}
                        placeholderTextColor={withAlpha(colors.text.primary, 0.7)}
                        style={{ color: colors.text.primary, fontSize: 18 }}
                        onChangeText={(text) =>
                            setProfileDatas((prev) => ({
                                ...prev,
                                name: text,
                            }))
                        }
                    />
                </Pressable>
                <Pressable
                    style={{
                        backgroundColor: withAlpha(
                            colors.surface.simpleOpacity,
                            0.1
                        ),
                        padding: 5,
                        borderRadius: 99,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 20,
                        flexShrink: 1,
                    }}
                    onPress={() => surnameInputRef.current?.focus()}
                >
                    <Text preset="title1">Nom</Text>
                    <TextInput
                        ref={surnameInputRef}
                        value={profileDatas.surname}
                        placeholder={profileDatas.surname}
                        placeholderTextColor={withAlpha(colors.text.primary, 0.7)}
                        style={{ color: colors.text.primary, fontSize: 18 }}
                        onChangeText={(text) =>
                            setProfileDatas((prev) => ({
                                ...prev,
                                surname: text,
                            }))
                        }
                    />
                </Pressable>
                <Text preset="label3" style={{ opacity: 0.4 }}>
                    Note: la modification du nom et prénom n'impacte pas votre compte
                    Ecole Directe. Tout reste local.
                </Text>
                {ableToValidate && (
                    <Pressable
                        style={{
                            backgroundColor: "green",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingVertical: 12,
                            borderRadius: 14,
                        }}
                        onPress={() => {
                            setProfile({
                                ...profile,
                                name: profileDatas.name.trim(),
                                surname: profileDatas.surname.trim(),
                            });
                            setProfileDatas({
                                name: profileDatas.name.trim(),
                                surname: profileDatas.surname.trim(),
                            });
                            setAbleToValidate(false);
                        }}
                    >
                        <Text preset="label1">Valider les modifications</Text>
                    </Pressable>
                )}
            </View>
        </SettingSectionLayout>
    );
}

