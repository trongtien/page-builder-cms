import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, LoginForm, type LoginCredentials } from "../features/auth";

export const Route = createFileRoute("/login")({
    component: LoginPage
});

function LoginPage() {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (credentials: LoginCredentials) => {
        await login(credentials);
        navigate({ to: "/dashboard" });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 antialiased transition-colors duration-200">
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
    );
}
