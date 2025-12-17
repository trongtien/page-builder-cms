import { Button, Card } from "@page-builder/core-ui";

export function Home() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-primary-600 mb-8">Render Root - SSR Application</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="Server-Side Rendering" subtitle="Built with Vinxi + React">
                        <p className="text-secondary-600">
                            This page is server-side rendered for optimal performance and SEO.
                        </p>
                    </Card>

                    <Card title="Shared Components" subtitle="From @page-builder/core-ui">
                        <div className="space-y-4">
                            <Button variant="primary">Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                        </div>
                    </Card>

                    <Card title="Shared Theme" subtitle="Tailwind configuration">
                        <p className="text-secondary-600">
                            Using the same design system as host-root with primary and secondary colors.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
