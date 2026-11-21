import authService from "../authService";
import { useAuthStore } from "@/hooks/useAuthStore";
import storeDatas from "./storeLoginDatas";

export const handleA2fSubmit = async ({
    a2fToken,
    choice,
    setA2fInfos,
    setSelectedChoice,
    setGtk,
    keepConnected,
}) => {
    try {
        const fa = await authService.submitFormA2f(a2fToken, choice);
        const updatedA2fInfos = {
            ...useAuthStore.getState().a2fInfos,
            fa: [{ ...fa.data }],
        };
        setA2fInfos(updatedA2fInfos);
        const gtkCookie = await authService.generateGTK();
        setGtk(gtkCookie);

        await completeA2fLogin({
            a2fInfos: updatedA2fInfos,
            gtk: gtkCookie,
            a2fToken,
            keepConnected,
        });
    } catch (error) {
        useAuthStore
            .getState()
            .setError(
                error?.message ||
                    "Une erreur est survenue lors de la double authentification."
            );
    } finally {
        setSelectedChoice("");
    }
};

export const completeA2fLogin = async ({
    a2fInfos,
    gtk,
    a2fToken,
    keepConnected,
}) => {
    const accountData = await authService.login({
        authConnectionDatas: a2fInfos,
        headers: {
            Cookie: gtk,
            "X-GTK": gtk.split("=")[1],
            "X-Token": a2fToken,
        },
    });

    const account = accountData?.data?.accounts?.[0];
    const token = accountData?.token;

    if (!account || !token) {
        console.error("Aucun compte valide reçu après double authentification");
        useAuthStore.getState().setError("Une erreur est survenue lors de la double authentification.");
        useAuthStore.getState().setBooting(false);
        return;
    }

    if (keepConnected) {
        await authService.saveCredentials(token, account.id, a2fInfos);
    }
    storeDatas({
        data: account,
        token,
    });

    useAuthStore.getState().setAuthenticated(true);
    useAuthStore.getState().setBooting(false);
};
