const express = require("express");
const router = express.Router();
const db = require("../database/db");

// =========================
// GET ALL PRODUCTS (SAFE)
// =========================
router.get("/", (req, res) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const startValue = (page - 1) * limit;

  const query = `
    SELECT 
      p.id,
      p.title,
      p.image,
      p.price,
      p.short_desc,
      p.quantity,
      COALESCE(c.title, 'Uncategorized') as category
    FROM products p
    LEFT JOIN categories c ON c.id = p.cat_id
    LIMIT ?, ?
  `;

  db.query(query, [startValue, limit], (err, results) => {
    if (err) {
      console.error("DB Error (products list):", err);
      return res.status(500).json({
        error: "Database query failed",
        details: err.message
      });
    }

    return res.json(results);
  });
});

// =========================
// GET SINGLE PRODUCT
// =========================
router.get("/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);

  if (isNaN(productId)) {
    return res.status(400).json({
      error: "Invalid product ID"
    });
  }

  const query = `
    SELECT 
      p.id,
      p.title,
      p.image,
      p.images,
      p.description,
      p.price,
      p.quantity,
      COALESCE(c.title, 'Uncategorized') as category
    FROM products p
    LEFT JOIN categories c ON c.id = p.cat_id
    WHERE p.id = ?
  `;

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("DB Error (single product):", err);
      return res.status(500).json({
        error: "Database query failed",
        details: err.message
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    return res.json(results[0]);
  });
});

module.exports = router;
