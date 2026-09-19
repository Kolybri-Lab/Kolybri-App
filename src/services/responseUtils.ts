import { splitCookiesString } from "set-cookie-parser";

export const getCookieFromResponse = (response: ApiResponseWithHeaders): string => {
    const setCookieHeader = getHeaderFromResponse({ response, item: "set-cookie" });
    if (!setCookieHeader) return "";

    return (
        splitCookiesString(setCookieHeader).map(
            (cookie) => cookie.split(";")[0]
        )[0] ?? ""
    );
};

type ApiResponseWithHeaders = {
    responseHeaders?: Record<string, string>;
    [key: string]: any;
};

export const getHeaderFromResponse = ({
    response,
    item,
}: {
    response: ApiResponseWithHeaders;
    item: string;
}): string | null => {
    const headers = response.responseHeaders;

    if (!headers) return null;

    const normalizedItem = item.toLowerCase();
    const match = Object.keys(headers).find(
        (key) => key.toLowerCase() === normalizedItem
    );

    return match ? headers[match] : null;
};

export const convertApiResponse = async (response: Response): Promise<any> => {
    const stringifyResponse = await response.text();

    if (stringifyResponse) {
        try {
            return JSON.parse(stringifyResponse);
        } catch (error) {
            console.warn(
                "Échec du parsing JSON (panne ou maintenance d'EcoleDirecte ?) :",
                error
            );
            throw {
                code: 502,
                message: "Serveur EcoleDirecte indisponible ou en maintenance.",
                data: {},
                originalError: error,
            };
        }
    } else {
        return response;
    }
};
