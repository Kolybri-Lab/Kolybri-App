import { create } from "zustand";

interface TimetablePagerState {
    animatingIndex: number;
    isOriginLeave: boolean;
    setAnimatingIndex: (index: number) => void;
    setBoth: (index: number, isLeave: boolean) => void;
}

export const useTimetablePagerStore = create<TimetablePagerState>()((set) => ({
    animatingIndex: 0,
    isOriginLeave: false,
    setAnimatingIndex: (index: number) =>
        set((state) =>
            state.animatingIndex === index ? state : { animatingIndex: index }
        ),
    setBoth: (index: number, isLeave: boolean) =>
        set((state) =>
            state.animatingIndex === index && state.isOriginLeave === isLeave
                ? state
                : { animatingIndex: index, isOriginLeave: isLeave }
        ),
}));

