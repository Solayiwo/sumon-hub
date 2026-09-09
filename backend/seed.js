const db = require("./db/db"); // Using your db.js configuration

const seedMaster = async () => {
  let connection;
  try {
    // 1. Get a connection from the pool
    const rawConnection = await db.getConnection();
    connection = rawConnection.promise ? rawConnection.promise() : rawConnection;

    console.log("⏳ Starting Master Database Seeding...");

    /* 
      2. Temporarily disable foreign key checks so we can safely 
         truncate tables without dependency lock errors.
    */
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE Order_Items");
    await connection.execute("TRUNCATE TABLE Orders");
    await connection.execute("TRUNCATE TABLE Products");
    await connection.execute("TRUNCATE TABLE Categories");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🧹 Database cleared and ID counters reset.");

    // 3. Seed Categories and capture their generated insert IDs
    const categories = ['smartphones', 'laptops', 'gadgets', 'accessories'];
    const categoryIdMap = {};

    for (const catName of categories) {
      const [result] = await connection.execute(
        "INSERT INTO Categories (category_name) VALUES (?)",
        [catName]
      );
      // Map the text name to its auto-incremented ID (e.g., 'smartphones' -> 1)
      categoryIdMap[catName] = result.insertId;
    }
    console.log("✅ Categories seeded successfully.");

    const products = [
      // 1. Smartphones & Tablets
      [
        categoryIdMap['smartphones'], 
        "iPhone 15 Pro", 
        "Apple", 
        999.99, 
        "Latest Apple flagship with an aerospace-grade titanium frame, high-performance A17 Pro chip, and a pro-level camera array.", 
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", 
        15
      ],
      [
        categoryIdMap['smartphones'], 
        "Samsung Galaxy S24 Ultra", 
        "Samsung", 
        1299.99, 
        "AI-powered flagship smartphone featuring a built-in S Pen, a stunning 200MP camera, and a durable titanium casing.", 
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80", 
        20
      ],
      [
        categoryIdMap['smartphones'], 
        "Google Pixel 8 Pro", 
        "Google", 
        999.00, 
        "The all-pro phone engineered by Google. It has a polished aluminum frame, the advanced Google Tensor G3 chip, and elite low-light photography features.", 
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80", 
        12
      ],
      [
        categoryIdMap['smartphones'], 
        "iPad Pro 12.9 M2", 
        "Apple", 
        1099.99, 
        "Stunning Liquid Retina XDR display, extreme wireless speeds, and breakthroughs in mobile productivity driven by the Apple M2 chip.", 
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", 
        18
      ],

      // 2. Laptops & Computers
      [
        categoryIdMap['laptops'], 
        "MacBook Pro 16", 
        "Apple", 
        2499.99, 
        "M3 Max powered premium laptop for professional creators, developers, and engineers needing max performance on the move.", 
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", 
        10
      ],
      [
        categoryIdMap['laptops'], 
        "Dell XPS 15", 
        "Dell", 
        1899.99, 
        "InfinityEdge touch display with an elegant, lightweight aluminum chassis and a high-performance Intel Core i9 processor setup.", 
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80", 
        8
      ],
      [
        categoryIdMap['laptops'], 
        "ASUS ROG Zephyrus G14", 
        "ASUS", 
        1599.99, 
        "Compact, ultra-portable gaming laptop matching an AMD Ryzen 9 workstation engine with high-framerate NVIDIA RTX graphics capabilities.", 
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80", 
        14
      ],
      [
        categoryIdMap['laptops'], 
        "HP Spectre x360", 
        "HP", 
        1399.00, 
        "Premium 2-in-1 convertible laptop providing premium battery endurance layouts, multi-mode hinges, and vivid OLED workspace visuals.", 
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80", 
        7
      ],

      // 3. Gadgets
      [
        categoryIdMap['gadgets'], 
        "Sony WH-1000XM5", 
        "Sony", 
        399.99, 
        "Industry-leading hybrid active noise cancellation bluetooth headphones with superior 30-hour battery life patterns and beamforming mic arrays.", 
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", 
        25
      ],
      [
        categoryIdMap['gadgets'], 
        "Apple Watch Series 9", 
        "Apple", 
        429.00, 
        "Advanced health monitoring, fitness tracking indexes, bright always-on Retina workspace panels, and magical gesture tracking interactions.", 
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80", 
        30
      ],
      [
        categoryIdMap['gadgets'], 
        "PlayStation 5 Slim", 
        "Sony", 
        499.99, 
        "Next-generation gaming console featuring lightning-fast SSD access times, immersive haptic feedback modules, and stunning 4K HDR fidelity rendering.", 
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80", 
        15
      ],
      [
        categoryIdMap['gadgets'], 
        "Meta Quest 3 VR", 
        "Meta", 
        499.00, 
        "Breakthrough mixed-reality standalone headset blending virtual elements cleanly into your physical environment space seamlessly.", 
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
        10
      ],

      // 4. Accessories
      [
        categoryIdMap['accessories'], 
        "Anker Prime 65W Charger", 
        "Anker", 
        59.99, 
        "Ultra-compact 65W GaN dual-port travel wall adapter supporting simultaneous multi-device rapid charging safety operations.", 
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", 
        100
      ],
      [
        categoryIdMap['accessories'], 
        "Logitech MX Master 3S", 
        "Logitech", 
        99.99, 
        "Ergonomic high-precision performance wireless productivity mouse featuring a near-silent click switch array and MagSpeed scrolling wheels.", 
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80", 
        45
      ],
      [
        categoryIdMap['accessories'], 
        "Keychron K2 Mechanical Keyboard", 
        "Keychron", 
        89.99, 
        "Wireless mechanical compact keyboard offering tactile Gateron mechanical switches and versatile cross-platform OS mappings.", 
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", 
        40
      ],
      [
        categoryIdMap['accessories'], 
        "Samsung T7 Shield 1TB", 
        "Samsung", 
        119.99, 
        "Superfast external portable solid-state storage device featuring a ruggedized IP65 dust and water-resistant armor envelope shell.", 
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80", 
        60
      ]
    ];

    for (const prod of products) {
      await connection.execute(
        "INSERT INTO Products (category_id, name, brand, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
        prod
      );
    }
    console.log("✅ Products seeded successfully.");
    console.log("🎉 Master database seed complete!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Master seeding failed:", err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
};

seedMaster();
