const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

const pool = {
    query: async (text, params = []) => {
        let lastError;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const rows = await sql.query(text, params);

                return {
                    rows,
                };
            } catch (error) {
                lastError = error;

                console.error(
                    `Database query attempt ${attempt} failed:`,
                    error.message
                );

                if (attempt < 3) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, attempt * 1000)
                    );
                }
            }
        }

        throw lastError;
    },
};

module.exports = pool;