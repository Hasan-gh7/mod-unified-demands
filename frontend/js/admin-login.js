const API_BASE_URL = "/api";

const form = document.getElementById("loginForm");
const messageElement = document.getElementById("loginMessage");


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!username || !password) {
        messageElement.textContent =
            "يرجى إدخال اسم المستخدم وكلمة المرور.";

        return;
    }

    try {

        messageElement.textContent =
            "جارٍ تسجيل الدخول...";


        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message || "فشل تسجيل الدخول"
            );
        }


        localStorage.setItem(
            "adminToken",
            data.token
        );


        messageElement.textContent =
            "تم تسجيل الدخول بنجاح.";


    } catch (error) {

        console.error(error);

        messageElement.textContent =
            error.message ||
            "حدث خطأ أثناء تسجيل الدخول.";
    }
});