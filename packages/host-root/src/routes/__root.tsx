import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1>Page Builder CMS</h1>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/about">About</a>
              <a href="/dashboard">Dashboard</a>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
