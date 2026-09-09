const db = require("../db/db");

class Product {
  // Added safe defaults (= "") so it never crashes if parameters are missing
  static async findAll({ category = "", q = "" } = {}) {
    // Included p.brand explicitly in the query footprint
    let query = `
      SELECT p.*, p.brand, c.category_name 
      FROM Products p 
      JOIN Categories c ON p.category_id = c.category_id
    `;
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push("LOWER(c.category_name) = ?");
      params.push(category.toLowerCase());
    }

    if (q) {
      // OPTIMIZATION: Expanded search queries to look inside p.brand text records as well
      conditions.push("(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [products] = await db.execute(query, params);
    return products;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      // Included p.brand explicitly in the unique identifier pull execution
      `SELECT p.*, p.brand, c.category_name 
       FROM Products p 
       JOIN Categories c ON p.category_id = c.category_id 
       WHERE p.product_id = ?`,
      [id]
    );
    return rows[0];
  }
}

module.exports = Product;
