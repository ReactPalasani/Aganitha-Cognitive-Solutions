CREATE TABLE links (
  code VARCHAR(8) PRIMARY KEY,
  target TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  total_clicks BIGINT DEFAULT 0,
  last_clicked TIMESTAMPTZ
);
