import { CONFIG } from "@/constants/config";
import { payloadHelper } from "@/helpers/cryptoHelper";
import { useColorStore } from "@/hooks/useColorStore";
import { useUserStore } from "@/hooks/useUserStore";
import * as SecureStore from "expo-secure-store";
import { createMMKV } from "react-native-mmkv";

import fetchApi from "../fetchApi";
import { getCookieFromResponse } from "../responseUtils";
import { getResponseChoices, sendResponseChoice } from "./doubleAuth";

const storage = createMMKV();
const { localSecretKeyStoreName } = CONFIG;

const authService = {
    generateGTK: async () => {
        const rawGtkResponse = await fetchApi(
            "https://api.ecoledirecte.com/v3/login.awp?gtk=1&{API_VERSION}",
            { method: "GET" }
        );
        return getCookieFromResponse(rawGtkResponse);
    },
    login: async ({
        username = "",
        password = "",
        authConnectionDatas = null,
        headers,
    }) => {
        return await fetchApi(
            "https://api.ecoledirecte.com/v3/login.awp?{API_VERSION}",
            {
                body:
                    authConnectionDatas != null
                        ? {
                              ...authConnectionDatas,
                          }
                        : {
                              identifiant: username,
                              motdepasse: password,
                              isReLogin: false,
                              uuid: "",
                          },
                method: "POST",
                headers: headers,
            }
        );
    },

    startA2fProcess: async (token) => {
        return await getResponseChoices(token);
    },

    submitFormA2f: async (token, choice) => {
        return await sendResponseChoice(token, choice);
    },

    saveCredentials: async (token, userId, loginDatas) => {
        const credentialsCipher = await payloadHelper.encrypt({
            connectionToken: JSON.stringify(loginDatas),
            userId: userId,
        });
        await SecureStore.setItemAsync(
            `${localSecretKeyStoreName}Credentials`,
            credentialsCipher
        );

        const cipherText = await payloadHelper.encrypt({
            connectionToken: token,
            userId: userId,
        });

        await SecureStore.setItemAsync(
            `${localSecretKeyStoreName}Payload`,
            cipherText
        );
    },
    restoreCredentials: async () => {
        const credentialsCipher = await SecureStore.getItemAsync(
            `${localSecretKeyStoreName}Credentials`
        );
        const cipherText = await SecureStore.getItemAsync(
            `${localSecretKeyStoreName}Payload`
        );

        const decryptedCredentials = credentialsCipher
            ? await payloadHelper.decrypt({ cipherHex: credentialsCipher })
            : null;

        return {
            password: decryptedCredentials?.superSecretUserToken ?? null,
            cipherText,
        };
    },
    deleteCredentials: async () => {
        const keyNames = [
            localSecretKeyStoreName,
            `${localSecretKeyStoreName}Payload`,
            `${localSecretKeyStoreName}Credentials`,
            "password",
        ];
        await Promise.all(keyNames.map((key) => SecureStore.deleteItemAsync(key)));
        useUserStore.getState().reset();
        useColorStore.getState().reset();
        storage.clearAll();
    },
};

export default authService;
