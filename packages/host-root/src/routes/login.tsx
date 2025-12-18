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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
    );
}
