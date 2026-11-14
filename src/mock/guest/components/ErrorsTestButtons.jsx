import { Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { useErrorStore } from "@/hooks/useErrorStore";
import { useSignIn } from "@/hooks/useSignIn";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function ErrorsTestButtons() {
    const { colors } = useTheme();
    const { signOut } = useSignIn();
    const [shouldCrashRender, setShouldCrashRender] = useState(false);

    if (shouldCrashRender) {
        throw new Error(
            "TypeError: Cannot read property 'courses' of undefined\n" +
                "    at ErrorsTestButtons (ErrorsTestButtons.jsx:11:24)\n" +
                "    at renderWithHooks (react-dom.development.js:16305)\n" +
                "    at mountIndeterminateComponent (react-dom.development.js:20074)\n" +
                "    at beginWork (react-dom.development.js:21587)\n" +
                "    at performUnitOfWork (react-dom.development.js:26560)\n" +
                "    at workLoopSync (react-dom.development.js:26473)\n" +
                "    at renderRootSync (react-dom.development.js:26446)\n" +
                "    at performConcurrentWorkOnRoot (react-dom.development.js:25738)\n" +
                "    at workLoop (scheduler.development.js:266)\n" +
                "    at flushWork (scheduler.development.js:239)\n" +
                "    at performWorkUntilDeadline (scheduler.development.js:533)\n" +
                "    at dispatchAction (react-dom.development.js:16139)\n" +
                "    at handlePress (TouchableOpacity.js:112)\n" +
                "    at invokeGuardedCallback (react-dom.development.js:4158)\n" +
                "    at executeDispatch (react-dom.development.js:8243)"
        );
    }

    return (
        <View style={{ gap: 8, width: "100%" }}>
            <Text size={13} color={colors.text.secondary}>
                ⚠️ ERREURS, TOASTS & CRASHS
            </Text>

            {/* BANDEAUX */}
            <TouchableOpacity
                onPress={() =>
                    useErrorStore.getState().pushError({
                        type: "network",
                        message: "Connexion Internet interrompue",
                        isRetryable: true,
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    🔴 Bandeau : Panne Réseau
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    useErrorStore.getState().setHasStaleData(true)
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    🟡 Bandeau : Données Obsolètes
                </Text>
            </TouchableOpacity>

            {/* TOASTS API ED & UNKNOWN */}
            <TouchableOpacity
                onPress={() =>
                    useErrorStore.getState().pushError({
                        type: "api-business",
                        code: 403,
                        message: "ED 403 : Adresse IP enregistrée / WAF",
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    🟠 Toast : ED Code 403 (WAF Rate-limit)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    useErrorStore.getState().pushError({
                        type: "api-business",
                        code: 535,
                        message: "ED 535 : Établissement indisponible",
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    🏢 Toast : ED Code 535 (Établissement fermé)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    useErrorStore.getState().pushError({
                        type: "api-business",
                        code: 517,
                        message: "ED 517 : Version d'API obsolète",
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    ⚠️ Toast : ED Code 517 (API périmée)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    useErrorStore.getState().pushError({
                        type: "unknown",
                        message: "Erreur inattendue au traitement des données",
                        endpoint: "/v3/eleves/notes.awp",
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    ❓ Toast : Erreur Inconnue / Mapping
                </Text>
            </TouchableOpacity>

            {/* CRASHS BLOQUANTS & ERROR BOUNDARY */}
            <TouchableOpacity
                onPress={() => setShouldCrashRender(true)}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.2),
                    borderWidth: 1,
                    borderColor: colors.state.warning,
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    💥 Crash : Rendu Component React (ErrorBoundary)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    const invalidObject = null;
                    invalidObject.triggerNullPointerMethod();
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.2),
                    borderWidth: 1,
                    borderColor: colors.state.warning,
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    💣 Crash : Exception JS Null Pointer / TypeError
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    useErrorStore.getState().pushError({
                        type: "auth",
                        reason: "session_expired",
                        message: "Session expirée, veuillez vous reconnecter",
                    });
                    signOut();
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.2),
                    borderWidth: 1,
                    borderColor: colors.state.warning,
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    🔑 Crash : Session Expirée ED (Auto-Logout)
                </Text>
            </TouchableOpacity>

            {/* RÉSOLUTION & EFFACEMENT DES ERREURS UNIQUEMENT */}
            <TouchableOpacity
                onPress={() => {
                    useErrorStore.getState().clearAll();
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.success, 0.15),
                }}
            >
                <Text size={13} color={colors.state.success}>
                    🔄 Reset Tests Erreurs
                </Text>
            </TouchableOpacity>
        </View>
    );
}
