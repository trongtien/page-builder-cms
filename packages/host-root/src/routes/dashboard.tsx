import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
    component: DashboardPage
});

function DashboardPage() {
    const [count, setCount] = useState(0);

    return (
        <div className="page-container">
            <h1>Dashboard</h1>
            <p>This is your dashboard with interactive elements.</p>

            <div className="dashboard-section">
                <div className="card">
                    <h2>Counter Example</h2>
                    <p>Count: {count}</p>
                    <div className="button-group">
                        <button onClick={() => setCount(count + 1)}>Increment</button>
                        <button onClick={() => setCount(count - 1)}>Decrement</button>
                        <button onClick={() => setCount(0)}>Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
