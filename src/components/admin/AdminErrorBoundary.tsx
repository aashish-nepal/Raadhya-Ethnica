"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary for Admin Panel
 * Catches and handles React errors gracefully to prevent entire admin panel from crashing
 */
export class AdminErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === "development") {
            console.error("Admin Error Boundary caught an error:", error, errorInfo);
        }

        // Update state with error details
        this.setState({
            error,
            errorInfo,
        });

        // TODO: Log to error reporting service (e.g., Sentry) in production
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900">
                                    Something went wrong
                                </h1>
                                <p className="text-neutral-600 mt-1">
                                    An error occurred in the admin panel
                                </p>
                            </div>
                        </div>

                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <div className="mb-6">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-red-900 mb-2">
                                        Error Details (Development Only)
                                    </h3>
                                    <p className="text-sm text-red-800 font-mono mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-red-700">
                                            <summary className="cursor-pointer font-medium mb-1">
                                                Component Stack
                                            </summary>
                                            <pre className="whitespace-pre-wrap overflow-auto max-h-48 bg-red-100 p-2 rounded">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button onClick={this.handleReset} className="flex items-center gap-2">
                                <RefreshCw size={18} />
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => (window.location.href = "/admin")}
                            >
                                Go to Dashboard
                            </Button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>What you can do:</strong>
                            </p>
                            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                                <li>Click "Try Again" to reload this component</li>
                                <li>Go back to the dashboard and try a different action</li>
                                <li>Refresh the entire page</li>
                                <li>Contact support if the problem persists</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
