const readline = require("readline");
const bcrypt = require("bcryptjs");
const pool = require("../src/db");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function createAdmin() {
    try {
        const username = (await ask("اسم المستخدم: ")).trim();
        const password = await ask("كلمة المرور: ");

        if (!username || !password) {
            console.log("اسم المستخدم وكلمة المرور مطلوبان.");
            return;
        }

        if (password.length < 8) {
            console.log("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.query(
            `
            INSERT INTO admin_users
                (username, password_hash)
            VALUES
                ($1, $2)
            `,
            [username, passwordHash]
        );

        console.log("تم إنشاء حساب المدير بنجاح.");

    } catch (error) {
        console.error("حدث خطأ:", error.message);

    } finally {
        rl.close();
    }
}

createAdmin();