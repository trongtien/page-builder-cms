import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@page-builder/core-ui";

export function Home() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-primary-600 mb-8">Render Root - SSR Application</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Server-Side Rendering</CardTitle>
                            <CardDescription>Built with Vinxi + React</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-secondary-600">
                                This page is server-side rendered for optimal performance and SEO.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shared Components</CardTitle>
                            <CardDescription>From @page-builder/core-ui</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button variant="default">Primary Button</Button>
                                <Button variant="secondary">Secondary Button</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shared Theme</CardTitle>
                            <CardDescription>Tailwind configuration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-secondary-600">
                                Using the same design system as host-root with primary and secondary colors.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
