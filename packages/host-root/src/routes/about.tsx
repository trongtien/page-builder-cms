import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@page-builder/core-ui";
import { useState } from "react";

export const Route = createFileRoute("/about")({
    component: AboutPage
});

function AboutPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showError, setShowError] = useState(false);

    return (
        <div className="page-container">
            <h1>About - Input Component Test</h1>
            <p>Testing Input component WITHOUT FormProvider (standalone mode)</p>

            <div className="content-section max-w-md space-y-6 mt-8">
                <h2>Standalone Input Components</h2>

                {/* Test 1: Basic Input */}
                <Input label="Email Address" type="email" placeholder="you@example.com" helperText="Enter your email" />

                {/* Test 2: Controlled Input */}
                <Input
                    label="Controlled Email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    helperText={`Current value: ${email || "(empty)"}`}
                />

                {/* Test 3: Input with Error */}
                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    error={showError ? "Password must be at least 8 characters" : undefined}
                />

                <button
                    onClick={() => setShowError(!showError)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showError ? "Hide Error" : "Show Error"}
                </button>

                {/* Test 4: Disabled Input */}
                <Input label="Disabled Input" type="text" value="Cannot edit this" disabled />

                {/* Test 5: Input without label */}
                <Input placeholder="Input without label" />

                {/* Test 6: Input with name prop (should still work standalone) */}
                <Input name="test" label="Input with name prop" helperText="This has a name but no form context" />

                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded">
                    <h3 className="font-semibold text-green-800 dark:text-green-200">✅ Test Results</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                        If you can see all inputs above without errors, the Input component works correctly without
                        FormProvider!
                    </p>
                </div>
            </div>

            <div className="content-section mt-8">
                <h2>Project Structure</h2>
                <ul>
                    <li>
                        <strong>/components</strong> - Reusable UI components
                    </li>
                    <li>
                        <strong>/features</strong> - Feature-specific modules
                    </li>
                    <li>
                        <strong>/hooks</strong> - Custom React hooks
                    </li>
                    <li>
                        <strong>/services</strong> - API and external services
                    </li>
                    <li>
                        <strong>/types</strong> - TypeScript type definitions
                    </li>
                    <li>
                        <strong>/utils</strong> - Helper functions and utilities
                    </li>
                    <li>
                        <strong>/routes</strong> - TanStack Router route components
                    </li>
                </ul>
            </div>
        </div>
    );
}
