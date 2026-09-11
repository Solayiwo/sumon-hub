const db = require("../db/db");

class Order {
  static async create({ user_id, items }) {
    let connection;
    try {
      // 1. Fetch connection from the pool
      const rawConnection = await db.getConnection();
      
      // Safely extract the promise-wrapped connection
      connection = rawConnection.promise ? rawConnection.promise() : rawConnection;

      // Start MySQL Transaction
      await connection.beginTransaction();

      // 2. Resolve prices and validate inventory before making any modifications
      const resolvedItems = [];
      let totalCents = 0;

      for (const item of items) {
        const [products] = await connection.execute(
          "SELECT name, price, stock FROM Products WHERE product_id = ? FOR UPDATE",
          [item.product_id]
        );

        if (products.length === 0) {
          throw new Error(`Product ID ${item.product_id} no longer exists.`);
        }

        const product = products[0];
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} left.`);
        }

        const unitPriceCents = Math.round(Number(product.price) * 100);
        totalCents += unitPriceCents * item.quantity;
        resolvedItems.push({
          ...item,
          unit_price: product.price,
        });
      }

      // 3. Insert the Parent Order
      const [orderResult] = await connection.execute(
        "INSERT INTO Orders (user_id, total_price, status) VALUES (?, ?, 'Completed')",
        [user_id, (totalCents / 100).toFixed(2)]
      );
      const orderId = orderResult.insertId;

      // 4. Insert Child Order Items and safely decrement verified stock
      for (const item of resolvedItems) {
        await connection.execute(
          "INSERT INTO Order_Items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [orderId, item.product_id, item.quantity, item.unit_price]
        );

        await connection.execute(
          "UPDATE Products SET stock = stock - ? WHERE product_id = ?",
          [item.quantity, item.product_id]
        );
      }

      // Commit changes if everything went through cleanly
      await connection.commit();
      return orderId;
    } catch (error) {
      // Rollback changes cleanly to preserve data integrity
      if (connection) await connection.rollback();
      throw error;
    } finally {
      // Always return connection back to the main resource pool
      if (connection) connection.release();
    }
  }
}

module.exports = Order;
