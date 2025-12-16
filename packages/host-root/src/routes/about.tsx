import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="page-container">
      <h1>About</h1>
      <p>This is a clean, scalable React TypeScript application.</p>
      <div className="content-section">
        <h2>Project Structure</h2>
        <ul>
          <li><strong>/components</strong> - Reusable UI components</li>
          <li><strong>/features</strong> - Feature-specific modules</li>
          <li><strong>/hooks</strong> - Custom React hooks</li>
          <li><strong>/services</strong> - API and external services</li>
          <li><strong>/types</strong> - TypeScript type definitions</li>
          <li><strong>/utils</strong> - Helper functions and utilities</li>
          <li><strong>/routes</strong> - TanStack Router route components</li>
        </ul>
      </div>
    </div>
  );
}
