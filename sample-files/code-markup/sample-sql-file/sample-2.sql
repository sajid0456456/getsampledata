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
  (5, 'Widget 5', 14.67, FALSE),
  (6, 'Widget 6', 17.0, TRUE),
  (7, 'Widget 7', 19.33, FALSE),
  (8, 'Widget 8', 21.67, TRUE),
  (9, 'Widget 9', 24.0, FALSE),
  (10, 'Widget 10', 26.33, TRUE),
  (11, 'Widget 11', 28.67, FALSE),
  (12, 'Widget 12', 31.0, TRUE),
  (13, 'Widget 13', 33.33, FALSE),
  (14, 'Widget 14', 35.67, TRUE),
  (15, 'Widget 15', 38.0, FALSE);
