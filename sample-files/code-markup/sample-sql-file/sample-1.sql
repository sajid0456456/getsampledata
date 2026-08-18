CREATE TABLE widgets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL,
  in_stock BOOLEAN
);

INSERT INTO widgets (id, name, price, in_stock) VALUES
  (1, 'Widget 1', 5.33, FALSE),
  (2, 'Widget 2', 7.67, TRUE),
  (3, 'Widget 3', 10.0, FALSE),
  (4, 'Widget 4', 12.33, TRUE),
  (5, 'Widget 5', 14.67, FALSE);
