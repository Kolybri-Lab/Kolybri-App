import React, { Component, ErrorInfo, ReactNode } from "react";
import { DevSettings } from "react-native";
import CrashScreen from "@/screens/Crash/CrashScreen";
import { useErrorStore } from "@/hooks/useErrorStore";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public componentDidMount() {
        if ((global as any).ErrorUtils) {
            (global as any).ErrorUtils.setGlobalHandler((error: Error) => {
                console.error("Global JS Exception capturée par ErrorBoundary :", error);
                this.setState({ hasError: true, error });
            });
        }
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary a capturé une erreur non gérée :", error, errorInfo);
    }

    private handleRestart = () => {
        useErrorStore.getState().clearAll();
        this.setState({ hasError: false, error: null });
        DevSettings.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <CrashScreen
                    error={this.state.error}
                    onRestart={this.handleRestart}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
