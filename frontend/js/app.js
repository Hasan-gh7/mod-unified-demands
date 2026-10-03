const API_BASE_URL = "/api";

const counterElement = document.getElementById("supporterCount");
const form = document.getElementById("joinForm");
const messageElement = document.getElementById("formMessage");

const fields = {
    fullName: document.getElementById("fullName"),
    phone: document.getElementById("phone"),
    area: document.getElementById("area"),
    memberType: document.getElementById("memberType"),
    consent: document.getElementById("consent"),
};

function normalizePhone(phone) {
    let value = phone.trim();
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

    value = value.replace(/[٠-٩]/g, (digit) => arabicDigits.indexOf(digit));
    value = value.replace(/[\s\-().]/g, "");

    if (value.startsWith("00")) {
        value = "+" + value.slice(2);
    }

    if (value.startsWith("+963")) {
        value = "0" + value.slice(4);
    } else if (value.startsWith("963")) {
        value = "0" + value.slice(3);
    }

    return value;
}

function setFieldError(fieldId, message) {
    const group = document.querySelector(`[data-field="${fieldId}"]`);
    const errorEl = document.getElementById(`${fieldId}Error`);

    if (group) {
        group.classList.toggle("has-error", Boolean(message));
    }

    if (errorEl) {
        errorEl.textContent = message || "";
    }
}

function clearAllErrors() {
    Object.keys(fields).forEach((key) => setFieldError(key, ""));
    messageElement.textContent = "";
    messageElement.className = "form-message";
}

function validateForm() {
    clearAllErrors();

    const fullName = fields.fullName.value.trim();
    const phoneRaw = fields.phone.value.trim();
    const area = fields.area.value.trim();
    const memberType = fields.memberType.value;
    const agreed = fields.consent.checked;
    const normalizedPhone = normalizePhone(phoneRaw);

    let valid = true;

    if (!fullName) {
        setFieldError("fullName", "الاسم الكامل مطلوب");
        valid = false;
    } else if (fullName.length < 2) {
        setFieldError("fullName", "الاسم قصير جدًا");
        valid = false;
    }

    if (!phoneRaw) {
        setFieldError("phone", "رقم الهاتف مطلوب");
        valid = false;
    } else if (!/^\d{10}$/.test(normalizedPhone)) {
        setFieldError(
            "phone",
            "يجب أن يكون الرقم 10 أرقام (مثال: 09XXXXXXXX)"
        );
        valid = false;
    }

    if (!area) {
        setFieldError("area", "المنطقة / الحي مطلوب");
        valid = false;
    } else if (area.length < 2) {
        setFieldError("area", "أدخل اسم المنطقة بشكل أوضح");
        valid = false;
    }

    if (!memberType) {
        setFieldError("memberType", "اختر نوع الانضمام");
        valid = false;
    }

    if (!agreed) {
        setFieldError("consent", "يجب الموافقة على الميثاق للانضمام");
        valid = false;
    }

    if (!valid) {
        messageElement.textContent = "يرجى تصحيح الحقول المشار إليها أدناه.";
        messageElement.className = "form-message form-message--error";
    }

    return {
        valid,
        fullName,
        phone: phoneRaw,
        area,
        memberType,
        agreed,
    };
}

fields.phone.addEventListener("input", () => {
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    let value = fields.phone.value.replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d));
    value = value.replace(/\D/g, "").slice(0, 14);
    if (fields.phone.value !== value) {
        fields.phone.value = value;
    }
});

fields.phone.addEventListener("blur", () => {
    const normalized = normalizePhone(fields.phone.value);
    if (/^\d{10}$/.test(normalized)) {
        fields.phone.value = normalized;
    }
});

Object.keys(fields).forEach((key) => {
    const el = fields[key];
    const eventName = el.type === "checkbox" ? "change" : "input";

    el.addEventListener(eventName, () => {
        setFieldError(key, "");
        if (messageElement.classList.contains("form-message--error")) {
            messageElement.textContent = "";
            messageElement.className = "form-message";
        }
    });
});

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

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const validated = validateForm();

    if (!validated.valid) {
        return;
    }

    const { fullName, phone, area, memberType, agreed } = validated;

    try {
        messageElement.textContent = "جارٍ تسجيل الانضمام...";
        messageElement.className = "form-message form-message--pending";

        const response = await fetch(`${API_BASE_URL}/members`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullName,
                phone,
                area,
                memberType,
                agreed,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "حدث خطأ أثناء التسجيل");
        }

        messageElement.textContent =
            "تم تسجيل انضمامك بنجاح. شكرًا لمشاركتك.";
        messageElement.className = "form-message form-message--success";

        form.reset();
        clearAllErrors();

        await loadSupporterCount();
    } catch (error) {
        console.error("Error submitting form:", error);

        messageElement.textContent =
            error.message || "حدث خطأ أثناء إرسال البيانات.";
        messageElement.className = "form-message form-message--error";
    }
});

loadSupporterCount();
