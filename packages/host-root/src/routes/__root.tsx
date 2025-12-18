import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthProvider, useAuth } from "../features/auth";

function RootComponent() {
    return (
        <AuthProvider>
            <RootLayout />
        </AuthProvider>
    );
}

function RootLayout() {
    const { isAuthenticated, isLoading, user, logout } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="text-xl font-bold text-indigo-600">
                                Page Builder CMS
                            </Link>
                            {isAuthenticated && (
                                <div className="flex space-x-4">
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                                        activeProps={{ className: "text-indigo-600 bg-indigo-50" }}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/about"
                                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                                        activeProps={{ className: "text-indigo-600 bg-indigo-50" }}
                                    >
                                        About
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center space-x-3">
                                        {user.avatar && (
                                            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                                        )}
                                        <span className="text-sm text-gray-700">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            <TanStackRouterDevtools />
        </div>
    );
}

export const Route = createRootRoute({
    component: RootComponent
});
