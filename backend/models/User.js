const db = require("../db/db");

class User {
    static async findByEmail(email) {
        const [rows] = await db.execute(
            "SELECT * FROM Users WHERE LOWER(email_address) = LOWER(?)",
            [email]
        );
        return rows[0];
    }


    static async create({ first_name, last_name, email_address, password_hash }) {
        const [result] = await db.execute(
            "INSERT INTO Users (first_name, last_name, email_address, password_hash) VALUES (?, ?, ?, ?)",
            [first_name, last_name, email_address, password_hash]
        );
        
        return {
            user_id: result.insertId,
            first_name,
            last_name,
            email_address
        };
    }

}

module.exports = User;