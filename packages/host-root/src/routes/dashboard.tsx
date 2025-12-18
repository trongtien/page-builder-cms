import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
    ManagerLayout,
    useManagerLayout,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button
} from "@page-builder/core-ui";
import { Home, Users, Settings, FileText, BarChart } from "lucide-react";
import type { MenuItem, User } from "@page-builder/core-ui";

export const Route = createFileRoute("/dashboard")({
    beforeLoad: () => {
        // Check authentication from localStorage
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            // TanStack Router uses throw redirect() pattern
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({
                to: "/"
            });
        }
    },
    component: DashboardPage
});

const menuItems: MenuItem[] = [
    {
        id: "home",
        label: "Dashboard",
        icon: <Home className="h-5 w-5" />,
        path: "/dashboard"
    },
    {
        id: "users",
        label: "Users",
        icon: <Users className="h-5 w-5" />,
        path: "/users"
    },
    {
        id: "reports",
        label: "Reports",
        icon: <BarChart className="h-5 w-5" />,
        children: [
            {
                id: "sales",
                label: "Sales Reports",
                path: "/reports/sales"
            },
            {
                id: "analytics",
                label: "Analytics",
                path: "/reports/analytics"
            }
        ]
    },
    {
        id: "pages",
        label: "Pages",
        icon: <FileText className="h-5 w-5" />,
        path: "/pages"
    },
    {
        id: "settings",
        label: "Settings",
        icon: <Settings className="h-5 w-5" />,
        path: "/settings"
    }
];

const user: User = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin"
};

function DashboardPage() {
    const [count, setCount] = useState(0);

    const layout = useManagerLayout({
        config: {
            title: "Admin Panel",
            menuItems,
            user,
            showSearch: false,
            onLogout: () => {
                console.info("Logout clicked");
            }
        },
        defaultActiveItem: "home"
    });

    if (!layout) {
        return <div>Loading...</div>;
    }

    return (
        <ManagerLayout.Root layout={layout}>
            <ManagerLayout.Sidebar />
            <ManagerLayout.Header />
            <ManagerLayout.Content>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">2,543</p>
                                <p className="text-sm text-muted-foreground">+12% from last month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">$45,231</p>
                                <p className="text-sm text-muted-foreground">+8% from last month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">573</p>
                                <p className="text-sm text-muted-foreground">Current active users</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Counter Example</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-2xl font-semibold">Count: {count}</p>
                                <div className="flex gap-2">
                                    <Button onClick={() => setCount(count + 1)}>Increment</Button>
                                    <Button onClick={() => setCount(count - 1)} variant="secondary">
                                        Decrement
                                    </Button>
                                    <Button onClick={() => setCount(0)} variant="outline">
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ManagerLayout.Content>
        </ManagerLayout.Root>
    );
}
