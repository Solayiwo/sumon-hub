const express = require("express");
const Product = require("../models/Product");
const router = express.Router();


// GET all product
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET single product by ID -> matches /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const productRows = await Product.findById(req.params.id);
    
    // Note: If findById returns a full array, extract the first entry
    const product = Array.isArray(productRows) ? productRows[0] : productRows;

    if (!product) {
      return res.status(404).json({ message: "Product not found inside database" });
    }
    
    // Return clean JSON
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
