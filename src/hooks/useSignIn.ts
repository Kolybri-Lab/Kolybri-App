import { getApiMessage } from "@/constants/api/codes";
import { GUEST_CREDENTIALS } from "@/constants/config";
import { queryClient } from "@/provider/QueryProvider";
import authService from "@/services/login/authService";
import { handleA2fSubmit } from "@/services/login/tools/a2fHandler";
import storeDatas from "@/services/login/tools/storeLoginDatas";
import { useCallback, useEffect } from "react";
import { useAuthStore } from "./useAuthStore";
import { useCustomDataStore } from "./useCustomDataStore";
import { useErrorStore } from "./useErrorStore";
import { useUserStore } from "./useUserStore";

export const useSignIn = () => {
    const error = useAuthStore((state) => state.error);
    const mcqDatas = useAuthStore((state) => state.mcqDatas);
    const choice = useAuthStore((state) => state.selectedChoice);
    const a2fInfos = useAuthStore((state) => state.a2fInfos);
    const gtk = useAuthStore((state) => state.gtk);
    const a2fToken = useAuthStore((state) => state.a2fToken);
    const keepConnected = useAuthStore((state) => state.keepConnected);
    const userAccessToken = useUserStore((state) => state.token);

    const setError = useAuthStore((state) => state.setError);
    const setMcqDatas = useAuthStore((state) => state.setMcqDatas);
    const setSelectedChoice = useAuthStore((state) => state.setSelectedChoice);
    const setA2fToken = useAuthStore((state) => state.setA2fToken);
    const setGtk = useAuthStore((state) => state.setGtk);
    const setA2fInfos = useAuthStore((state) => state.setA2fInfos);
    const setKeepConnected = useAuthStore((state) => state.setKeepConnected);
    const resetAuth = useAuthStore((state) => state.reset);

    const signIn = useCallback(
        async ({ username, password, keepConnected }: any) => {
            setKeepConnected(keepConnected);

            if (
                username === GUEST_CREDENTIALS.username &&
                password === GUEST_CREDENTIALS.password
            ) {
                try {
                    const { loginAsGuest } = require("@/mock/guest/guestData");
                    await loginAsGuest(keepConnected);
                    return;
                } catch (err) {
                    setError("Erreur lors de la connexion invité");
                    return;
                }
            }

            try {
                const gtkCookie = await authService.generateGTK();
                const apiLoginData = await authService.login({
                    username,
                    password,
                    headers: {
                        Cookie: gtkCookie,
                        "X-GTK": gtkCookie.split("=")[1],
                    },
                });

                setA2fInfos({
                    identifiant: encodeURIComponent(username),
                    motdepasse: encodeURIComponent(password),
                });

                const { token } = apiLoginData;

                switch (apiLoginData.code) {
                    case 200: {
                        const { data } = apiLoginData;
                        const accountData = data?.accounts?.[0];
                        if (!accountData) {
                            setError("Aucun compte valide trouvé");
                            break;
                        }
                        if (keepConnected) {
                            await authService.saveCredentials(
                                token,
                                accountData.id,
                                {
                                    identifiant: encodeURIComponent(username),
                                    motdepasse: encodeURIComponent(password),
                                }
                            );
                        }
                        storeDatas({ data: accountData, token });
                        useAuthStore.getState().setAuthenticated(true);
                        useAuthStore.getState().setBooting(false);
                        break;
                    }
                    case 250: {
                        const a2fTokenHeader =
                            apiLoginData.responseHeaders["2fa-token"];
                        const { choices, question } =
                            await authService.startA2fProcess(a2fTokenHeader);
                        setMcqDatas({ choices, question });
                        setA2fToken(a2fTokenHeader);
                        break;
                    }
                    default: {
                        const message = getApiMessage(apiLoginData.code);
                        setError(message || "Erreur de connexion");
                        break;
                    }
                }
            } catch (err: any) {
                const code = typeof err?.code === "number" ? err.code : undefined;
                const message = code ? getApiMessage(code) : undefined;

                setError(
                    message || err?.message || "Une erreur inattendue est survenue"
                );
            }
        },
        [setKeepConnected, setA2fInfos, setMcqDatas, setA2fToken, setError]
    );

    const signOut = useCallback(async () => {
        await authService.deleteCredentials();
        resetAuth();
        useUserStore.getState().reset();
        useCustomDataStore.getState().reset();
        useErrorStore.getState().clearAll();
        queryClient.clear();
    }, [resetAuth]);

    useEffect(() => {
        if (!choice) return;
        handleA2fSubmit({
            a2fToken,
            choice,
            setA2fInfos,
            setSelectedChoice,
            setGtk,
            keepConnected,
        });
    }, [choice, a2fToken, setA2fInfos, setSelectedChoice, setGtk, keepConnected]);

    return {
        signIn,
        signOut,
        userAccessToken,
        mcqDatas,
        choice,
        apiError: error,
        setMcqDatas,
        setChoice: setSelectedChoice,
        setApiError: setError,
    };
};

