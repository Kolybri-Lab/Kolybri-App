import { GUEST_CREDENTIALS } from "@/constants/config";
import { payloadHelper } from "@/helpers/cryptoHelper";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useUserStore } from "@/hooks/useUserStore";
import { queryClient } from "@/provider/QueryProvider";
import dayjs from "dayjs";
import authService from "../authService";
import storeDatas from "./storeLoginDatas";

/**
 * Get token and user data from storage
 * @param {Object} credentialsCipherText
 * @returns {Promise<boolean>}
 */

export async function tryLoginWithStoredCreds({ cipherText }) {
    try {
        const payload = await payloadHelper.decrypt({ cipherHex: cipherText });
        const now = dayjs();
        const expiration = dayjs(payload.expirationDate, "YYYY-MM-DD_HH:mm");

        let getDataFromStorage = useUserStore.getState().profile;

        if (!getDataFromStorage && payload.superSecretUserToken === "guest_token") {
            const { mockLogin } = require("@/mock/guest/json");
            getDataFromStorage = mockLogin?.data?.accounts?.[0];
        }

        if (now.isBefore(expiration)) {
            if (payload.superSecretUserToken === "guest_token") {
                console.log("Restauration du compte développeur");
            }

            storeDatas({
                data: getDataFromStorage,
                token: payload.superSecretUserToken,
            });

            useAuthStore.getState().setAuthenticated(true);
            useAuthStore.getState().setBooting(false);
            return true;
        }

        if (getDataFromStorage) {
            storeDatas({
                data: getDataFromStorage,
                token: payload.superSecretUserToken,
            });
        }
        return false;
    } catch (error) {
        console.log("Error in tryLoginWithStoredCreds:", error);
        return false;
    }
}

export async function tryRestoreToken({ credentialsPassword }) {
    try {
        const authData = JSON.parse(credentialsPassword);
        const guestUser = GUEST_CREDENTIALS.username;
        const guestPass = GUEST_CREDENTIALS.password;

        if (
            authData?.identifiant === guestUser &&
            authData?.motdepasse === guestPass
        ) {
            console.log("Restauration du compte développeur");
            try {
                const { loginAsGuest } = require("@/mock/guest/guestData");
                await loginAsGuest(true);
                return true;
            } catch (err) {
                return false;
            }
        }

        const gtkCookie = await authService.generateGTK();

        const loginResponse = await authService.login({
            authConnectionDatas: authData,
            headers: {
                Cookie: gtkCookie,
                "X-GTK": gtkCookie.split("=")[1],
            },
        });

        if (loginResponse?.code === 505 || loginResponse?.code === 522) {
            console.warn(
                "Stored credentials are no longer valid (505/522). Clearing credentials."
            );
            await authService.deleteCredentials();
            useAuthStore
                .getState()
                .setError("Votre session a expiré. Veuillez vous reconnecter.");
            useAuthStore.getState().setAuthenticated(false);
            return false;
        }

        const { data, token } = loginResponse;

        const accountData = data?.accounts?.[0];
        if (!accountData) {
            console.error("No account found during token restoration");
            return false;
        }

        storeDatas({
            data: accountData,
            token,
        });

        await authService.saveCredentials(token, accountData.id, authData);
        useAuthStore.getState().setAuthenticated(true);
        useAuthStore.getState().setBooting(false);

        queryClient.invalidateQueries();

        return true;
    } catch (error) {
        console.warn(
            "Erreur lors du rafraîchissement du token en arrière-plan (session hors-ligne conservée) :",
            error
        );
        return false;
    }
}

