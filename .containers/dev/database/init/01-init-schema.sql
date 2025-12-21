-- Initialize PageBuilder CMS Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);

-- Widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Page widgets junction table
CREATE TABLE IF NOT EXISTS page_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_page_widgets_page_id ON page_widgets(page_id);
CREATE INDEX IF NOT EXISTS idx_page_widgets_widget_id ON page_widgets(widget_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widgets_updated_at BEFORE UPDATE ON widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO pages (title, slug, content, status) VALUES
  ('Home', 'home', '{"blocks": [{"type": "hero", "content": "Welcome to PageBuilder CMS"}]}', 'published'),
  ('About', 'about', '{"blocks": [{"type": "text", "content": "About us page"}]}', 'draft')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO widgets (name, type, config) VALUES
  ('Hero Banner', 'hero', '{"height": "500px", "background": "#000"}'),
  ('Text Block', 'text', '{"fontSize": "16px", "lineHeight": "1.5"}'),
  ('Image Gallery', 'gallery', '{"columns": 3, "gap": "10px"}')
ON CONFLICT DO NOTHING;
