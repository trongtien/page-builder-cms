import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthState } from "../features/auth";

export const Route = createFileRoute("/")({
    component: HomePage
});

function HomePage() {
    const { isAuthenticated } = useAuthState();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Welcome to Page Builder CMS
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                    A modern, scalable React application with clean architecture
                </p>
                <div className="mt-8">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Get Started
                        </Link>
                    )}
                </div>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">⚡ Fast Development</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Built with Vite for lightning-fast HMR and build times
                        </p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">🎯 Type Safe</h3>
                        <p className="mt-2 text-sm text-gray-500">Full TypeScript support for robust code</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">🚦 Smart Routing</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Powered by TanStack Router for type-safe navigation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
