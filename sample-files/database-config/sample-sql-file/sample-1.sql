CREATE TABLE widgets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL
);

INSERT INTO widgets (id, name, price) VALUES
  (1, 'Widget 1', 5.33),
  (2, 'Widget 2', 7.67),
  (3, 'Widget 3', 10.0),
  (4, 'Widget 4', 12.33),
  (5, 'Widget 5', 14.67);
