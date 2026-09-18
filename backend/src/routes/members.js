const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

function normalizePhone(phone) {
    let value = phone.trim();

    // تحويل الأرقام العربية إلى أرقام إنجليزية
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

    value = value.replace(/[٠-٩]/g, (digit) => {
        return arabicDigits.indexOf(digit);
    });

    // إزالة المسافات والشرطات والأقواس
    value = value.replace(/[\s\-().]/g, "");

    // تحويل 00 إلى +
    if (value.startsWith("00")) {
        value = "+" + value.slice(2);
    }

    // توحيد الأرقام السورية إلى الصيغة المحلية 09...
    if (value.startsWith("+963")) {
        value = "0" + value.slice(4);
    } else if (value.startsWith("963")) {
        value = "0" + value.slice(3);
    }

    return value;
}


// تسجيل عضو جديد
router.post("/", async (req, res) => {
    try {
        const {
            fullName,
            phone,
            area,
            memberType,
            agreed
        } = req.body;

        const normalizedPhone = normalizePhone(phone);

        // التحقق الأساسي
        if (!fullName || !phone || !memberType || agreed !== true) {
            return res.status(400).json({
                status: "error",
                message: "البيانات المطلوبة غير مكتملة"
            });
        }


        // التحقق من نوع العضوية
        if (!["owner", "supporter"].includes(memberType)) {
            return res.status(400).json({
                status: "error",
                message: "نوع العضوية غير صالح"
            });
        }


        // التحقق من طول الاسم
        if (fullName.trim().length < 2) {
            return res.status(400).json({
                status: "error",
                message: "الاسم غير صالح"
            });
        }


        // التحقق من رقم الهاتف
        if (normalizedPhone.length < 7) {
            return res.status(400).json({
                status: "error",
                message: "رقم الهاتف غير صالح"
            });
        }


        const result = await pool.query(
            `
            INSERT INTO members
            (full_name, phone, phone_normalized, area, member_type, agreed)
        VALUES
            ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                full_name,
                area,
                member_type,
                created_at
            `,
            [
                fullName.trim(),
                phone.trim(),
                normalizedPhone,
                area?.trim() || null,
                memberType,
                agreed

            ]
        );


        res.status(201).json({
            status: "ok",
            member: result.rows[0]
        });

    } catch (error) {

    console.error(error);

    if (
        error.code === "23505" &&
        error.constraint === "members_phone_normalized_unique"
    ) {
        return res.status(409).json({
            status: "error",
            message: "رقم الهاتف مسجل مسبقًا"
        });
    }

    res.status(500).json({
        status: "error",
        message: "حدث خطأ أثناء حفظ البيانات"
    });
}
});


// عدد المشاركين
router.get("/count", async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT COUNT(*)::int AS count FROM members"
        );

        res.json({
            status: "ok",
            count: result.rows[0].count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: "error",
            message: "حدث خطأ أثناء قراءة عدد المشاركين"
        });
    }
});

// إحصائيات المشاركين
router.get("/stats", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE member_type = 'owner')::int AS owners,
                COUNT(*) FILTER (WHERE member_type = 'supporter')::int AS supporters
            FROM members
        `);

        res.json({
            status: "ok",
            total: result.rows[0].total,
            owners: result.rows[0].owners,
            supporters: result.rows[0].supporters
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: "حدث خطأ أثناء قراءة الإحصائيات"
        });
    }
});


// عرض قائمة المشاركين
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                full_name,
                area,
                member_type,
                agreed,
                created_at
            FROM members
            ORDER BY created_at DESC
        `);

        res.json({
            status: "ok",
            members: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: "حدث خطأ أثناء قراءة قائمة المشاركين"
        });
    }
});

module.exports = router;