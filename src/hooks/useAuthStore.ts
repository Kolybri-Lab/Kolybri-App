import { create } from "zustand";
import { useUserStore } from "./useUserStore";

interface AuthState {
    isAuthenticated: boolean;
    isBooting: boolean;
    error: string | null;

    mcqDatas: { question: Record<string, any>; choices: Record<string, any> } | null;
    selectedChoice: string | null;
    a2fInfos: { identifiant: string | null; motdepasse: string | null; fa: any[] | null } | null;
    a2fToken: string | null;
    gtk: string | null;
    keepConnected: boolean;

    setAuthenticated: (value: boolean) => void;
    setBooting: (value: boolean) => void;
    setError: (error: string | null) => void;
    setMcqDatas: (datas: AuthState['mcqDatas']) => void;
    setSelectedChoice: (choice: string) => void;

    setA2fInfos: (infos: Partial<AuthState['a2fInfos']>) => void;
    setA2fToken: (token: string | null) => void;
    setGtk: (gtk: string | null) => void;
    setKeepConnected: (keep: boolean) => void;

    reset: () => void;
}

const hasExistingAccount = Boolean(useUserStore.getState().profile);

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: hasExistingAccount,
    isBooting: false,
    error: null,
    mcqDatas: null,
    selectedChoice: null,
    a2fInfos: null,
    a2fToken: null,
    gtk: null,
    keepConnected: true,

    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setBooting: (isBooting) => set({ isBooting }),
    setError: (error) => set({ error }),
    setMcqDatas: (mcqDatas) => set({ mcqDatas }),
    setSelectedChoice: (selectedChoice) => set({ selectedChoice }),
    setA2fInfos: (infos) => set((state) => ({
        a2fInfos: state.a2fInfos ? { ...state.a2fInfos, ...infos } : { identifiant: null, motdepasse: null, fa: null, ...infos }
    })),
    setA2fToken: (a2fToken) => set({ a2fToken }),
    setGtk: (gtk) => set({ gtk }),
    setKeepConnected: (keepConnected) => set({ keepConnected }),

    reset: () => set({
        isAuthenticated: false,
        isBooting: false,
        error: null,
        mcqDatas: null,
        selectedChoice: null,
        a2fInfos: null,
        a2fToken: null,
        gtk: null,
    }),
}));
