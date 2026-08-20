-- Drop old categories
DELETE FROM merch_categories;

-- Seed new categories for book store
INSERT INTO merch_categories (name_en, name_es, slug, sort_order) VALUES
  ('Books', 'Libros', 'books', 1),
  ('Journals', 'Diarios', 'journals', 2),
  ('Apparel', 'Ropa', 'apparel', 3),
  ('Gifts', 'Regalos', 'gifts', 4);
