const API_BASE_URL = "/api";

const counterElement = document.getElementById("supporterCount");
const form = document.getElementById("joinForm");
const messageElement = document.getElementById("formMessage");

// قراءة عدد المشاركين
async function loadSupporterCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/members/count`);

        if (!response.ok) {
            throw new Error("Failed to load supporter count");
        }

        const data = await response.json();

        counterElement.textContent = data.count;
    } catch (error) {
        console.error("Error loading supporter count:", error);

        counterElement.textContent = "—";
    }
}


// إرسال نموذج الانضمام
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const area = document.getElementById("area").value.trim();
    const memberType = document.getElementById("memberType").value;
    const agreed = document.getElementById("consent").checked;

    if (!fullName || !phone || !memberType || !agreed) {
        messageElement.textContent =
            "يرجى إدخال الاسم ورقم الهاتف والموافقة على الميثاق.";

        return;
    }

    try {
        messageElement.textContent = "جارٍ تسجيل الانضمام...";

        const response = await fetch(`${API_BASE_URL}/members`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
            fullName,
            phone,
            area,
            memberType,
            agreed
        })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "حدث خطأ أثناء التسجيل"
            );
        }

        messageElement.textContent =
            "تم تسجيل انضمامك بنجاح. شكرًا لمشاركتك.";

        form.reset();

        // تحديث العداد بعد التسجيل
        await loadSupporterCount();

    } catch (error) {
        console.error("Error submitting form:", error);

        messageElement.textContent =
            error.message || "حدث خطأ أثناء إرسال البيانات.";
    }
});


// تشغيل العداد عند فتح الصفحة
loadSupporterCount();