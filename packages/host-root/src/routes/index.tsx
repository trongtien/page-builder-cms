import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: HomePage
});

function HomePage() {
    return (
        <div className="page-container">
            <div className="hero">
                <h1>Welcome to Page Builder CMS</h1>
                <p>A modern, scalable React application with clean architecture</p>
                <div className="feature-list">
                    <div className="feature-card">
                        <h3>⚡ Fast Development</h3>
                        <p>Built with Vite for lightning-fast HMR and build times</p>
                    </div>
                    <div className="feature-card">
                        <h3>🎯 Type Safe</h3>
                        <p>Full TypeScript support for robust code</p>
                    </div>
                    <div className="feature-card">
                        <h3>🚦 Smart Routing</h3>
                        <p>Powered by TanStack Router for type-safe navigation</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
