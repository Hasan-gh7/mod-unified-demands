const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

const pool = {
    query: async (text, params = []) => {
        const rows = await sql.query(text, params);

        return {
            rows,
        };
    },
};

module.exports = pool;