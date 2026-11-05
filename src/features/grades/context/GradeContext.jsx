import { createContext, useContext, useMemo, useReducer } from "react";

const GradeContext = createContext();

const defaultState = {
    gradeData: null,
    simulation: { modalOpen: false, disciplineCode: null },
    gradeToRemove: null,
    simulatedGrade: null,
};

const gradeReducer = (state, action) => {
    switch (action.type) {
        case "SEE_GRADE_DETAILS":
            return { ...state, gradeData: action.payload };
        case "RESET_GRADE_DETAILS":
            return { ...state, gradeData: null };
        case "OPEN_SIMULATION_MODAL":
            return {
                ...state,
                simulation: { modalOpen: true, disciplineCode: action.payload }, // not passed in SimulateGradeModal
            };
        case "CLOSE_SIMULATION_MODAL":
            return {
                ...state,
                simulation: { modalOpen: false, disciplineCode: null },
            };
        case "REMOVE_SIMULATED_GRADE":
            return {
                ...state,
                gradeToRemove: action.payload,
            };
        case "CLEAR_SIMULATED_GRADE":
            return {
                ...state,
                gradeToRemove: null,
                simulatedGrade: null,
            };
        case "CREATE_SIMULATED_GRADE":
            return {
                ...state,
                simulatedGrade: action.payload,
            };
        default:
            return state;
    }
};

export const GradeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gradeReducer, defaultState);

    const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return (
        <GradeContext.Provider value={contextValue}>
            {children}
        </GradeContext.Provider>
    );
};

export const useGrade = () => useContext(GradeContext);

