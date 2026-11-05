import { CONFIG } from "@/constants/config";
import AES from "crypto-js/aes";
import encHex from "crypto-js/enc-hex";
import encUtf8 from "crypto-js/enc-utf8";
import WordArray from "crypto-js/lib-typedarrays";
import Pkcs7 from "crypto-js/pad-pkcs7";
import dayjs from "dayjs";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const { localSecretKeyStoreName, totalTokenExpirationTime } = CONFIG;

/**
 * Generate or get a secure key
 */
export async function getEncryptionKey() {
    try {
        let key = await SecureStore.getItemAsync(localSecretKeyStoreName);

        if (!key) {
            const randomBytes = await Crypto.getRandomBytesAsync(32); // 256 bits = 32 bytes
            const wordArray = WordArray.create(randomBytes);
            key = wordArray.toString(); // hex string
            await SecureStore.setItemAsync(localSecretKeyStoreName, key);
            console.log("New encryption key generated and stored.");
        }

        return key;
    } catch (error) {
        console.error("Error in getEncryptionKey:", error);
        return null;
    }
}

export const payloadHelper = {
    /**
     * Crypt payload with AES-256 + random IV (CBC — default mode)
     * @param {Object} payload
     * @returns {Promise<string>} IV + encrypted text (hex)
     */
    encrypt: async ({ connectionToken, userId }) => {
        try {
            const keyHex = await getEncryptionKey();
            if (!keyHex) throw new Error("Missing encryption key");

            const key = encHex.parse(keyHex);

            const now = dayjs();
            const payload = JSON.stringify({
                userId: userId,
                superSecretUserToken: connectionToken,
                creationDate: now.format("YYYY-MM-DD_HH:mm"),
                expirationDate:
                    connectionToken === "guest_token"
                        ? now.add(99, "years").format("YYYY-MM-DD_HH:mm")
                        : now
                              .add(totalTokenExpirationTime / 60, "minutes")
                              .format("YYYY-MM-DD_HH:mm"),
            });

            // IV generated with expo-crypto for compatibility
            const randomIvBytes = await Crypto.getRandomBytesAsync(16);
            const iv = WordArray.create(randomIvBytes);

            const encrypted = AES.encrypt(payload, key, {
                iv,
                padding: Pkcs7,
                // mode: CBC by default
            });

            const cipherHex =
                iv.toString(encHex) + encrypted.ciphertext.toString(encHex);

            return cipherHex;
        } catch (error) {
            console.error("Error in payloadHelper.encrypt:", error);
            return null;
        }
    },

    /**
     * Decrypt crypted chain with AES-CBC with IV integrated
     * @param {string} cipherHex
     * @returns {Promise<string|null>}
     */
    decrypt: async ({ cipherHex }) => {
        try {
            if (!cipherHex || cipherHex.length < 32) {
                throw new Error("Invalid cipherHex input");
            }

            const keyHex = await getEncryptionKey();
            if (!keyHex) throw new Error("Missing encryption key");

            const key = encHex.parse(keyHex);

            const ivHex = cipherHex.slice(0, 32); // 16 bytes IV = 32 hex chars
            const ciphertextHex = cipherHex.slice(32);

            const iv = encHex.parse(ivHex);
            const ciphertext = encHex.parse(ciphertextHex);

            const decrypted = AES.decrypt({ ciphertext }, key, {
                iv,
                padding: Pkcs7,
                // mode: CBC by default
            });

            const stringPayload = decrypted.toString(encUtf8);
            try {
                const parsedPayload = JSON.parse(stringPayload);
                return parsedPayload;
            } catch (error) {
                throw new Error("Invalid JSON format after decryption");
            }
        } catch (error) {
            console.error("Error in payloadHelper.decrypt:", error);
            return null;
        }
    },
};
