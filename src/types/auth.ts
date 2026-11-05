export interface SecureCredentials {
    identifiant: string;
    motdepasse: string;
}

export interface SecurePayload {
    connectionToken: string;
    userId: string | number;
}

export interface A2FState {
    identifiant: string | null;
    motdepasse: string | null;
    fa: any[] | null; 
}

export interface ApiAccount {
    // À affiner plus tard si besoin
    id: number;
    typeCompte: string;
    [key: string]: any;
}

export interface ApiLoginResponse {
    code: number;
    token: string;
    message: string;
    data: {
        accounts: ApiAccount[];
    };
    responseHeaders?: any;
}

export interface FetchApiResponse<T> {
    code: number;
    token: string;
    message: string;
    data: T;
    isDataEmpty: boolean;
}
