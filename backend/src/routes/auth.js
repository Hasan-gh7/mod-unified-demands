const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();


// تسجيل دخول المدير
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: "error",
                message: "اسم المستخدم وكلمة المرور مطلوبان"
            });
        }

        const result = await pool.query(
            `
            SELECT id, username, password_hash
            FROM admin_users
            WHERE username = $1
            `,
            [username.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: "error",
                message: "بيانات الدخول غير صحيحة"
            });
        }

        const admin = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                status: "error",
                message: "بيانات الدخول غير صحيحة"
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            status: "ok",
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: "حدث خطأ أثناء تسجيل الدخول"
        });
    }
});


module.exports = router;