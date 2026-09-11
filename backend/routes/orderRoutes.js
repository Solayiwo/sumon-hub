const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order"); 
const db = require("../db/db"); 
const router = express.Router();


// 1. FETCH DETAILED ORDER HISTORY WITH ITEMS (GET /api/orders)
router.get("/", async (req, res) => {
  try {
    // 1. Extract and verify token headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access Denied. No token authorization header detected." });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired session security token." });
    }

    const userId = decoded.user_id;

    // 2. Query MySQL using a JOIN to fetch Orders along with their corresponding Item lines
    const [rows] = await db.execute(
      `SELECT 
        o.order_id, o.total_price, o.order_date, o.status,
        oi.order_item_id, oi.quantity, oi.unit_price,
        p.product_id, p.name AS product_name, p.image_url
       FROM Orders o
       LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
       LEFT JOIN Products p ON oi.product_id = p.product_id
       WHERE o.user_id = ? 
       ORDER BY o.order_date DESC`,
      [userId]
    );

    /* 
      3. Transform flat SQL rows into a clean, nested JSON tree object structure:
         From: [{ order_id: 1, product_name: 'iPhone' }, { order_id: 1, product_name: 'Charger' }]
         To:   [{ order_id: 1, items: [{ name: 'iPhone' }, { name: 'Charger' }] }]
    */
    const ordersMap = {};

    rows.forEach((row) => {
      // If we haven't seen this order yet, initialize its parent structure
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          total_price: row.total_price,
          order_date: row.order_date,
          status: row.status,
          items: [] // Array to collect nested item rows safely
        };
      }

      // If an item line exists for this order row, attach it into the nested array
      if (row.order_item_id) {
        ordersMap[row.order_id].items.push({
          order_item_id: row.order_item_id,
          product_id: row.product_id,
          name: row.product_name,
          image_url: row.image_url,
          quantity: row.quantity,
          unit_price: row.unit_price
        });
      }
    });

    // Convert the map hash back into a standard array to stream back to the UI layout page
    const structuredOrders = Object.values(ordersMap);
    res.json(structuredOrders);

  } catch (error) {
    console.error("[Backend Detailed Order History Fetch Error]:", error);
    res.status(500).json({ error: error.message });
  }
});


// 2. CREATE NEW ORDER (POST /api/orders)
router.post("/", async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "Missing order metadata or cart items list is completely empty." 
      });
    }

    const orderId = await Order.create({ user_id, items });
    
    res.status(201).json({
      message: "Order placed successfully!",
      order_id: orderId,
    });
  } catch (error) {
    if (error.message && (error.message.includes("stock") || error.message.includes("exists"))) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
