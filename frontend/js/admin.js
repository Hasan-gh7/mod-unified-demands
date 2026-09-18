const API_BASE_URL = "/api";

const totalCountElement = document.getElementById("totalCount");
const ownersCountElement = document.getElementById("ownersCount");
const supportersCountElement = document.getElementById("supportersCount");

const membersMessageElement = document.getElementById("membersMessage");
const membersListElement = document.getElementById("membersList");
const logoutButton = document.getElementById("logoutButton");


// الحصول على رمز المدير
function getAdminToken() {
    return localStorage.getItem("adminToken");
}


// التحقق من وجود رمز الدخول
function requireLogin() {
    const token = getAdminToken();

    if (!token) {
        window.location.href = "admin-login.html";
        return false;
    }

    return true;
}


// إعداد Authorization
function getAuthHeaders() {
    return {
        "Authorization": `Bearer ${getAdminToken()}`
    };
}


// تحميل الإحصائيات
async function loadStats() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/members/stats`,
            {
                headers: getAuthHeaders()
            }
        );

        if (response.status === 401) {
            localStorage.removeItem("adminToken");
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("فشل تحميل الإحصائيات");
        }

        const data = await response.json();

        totalCountElement.textContent = data.total;
        ownersCountElement.textContent = data.owners;
        supportersCountElement.textContent = data.supporters;

    } catch (error) {
        console.error(error);

        totalCountElement.textContent = "—";
        ownersCountElement.textContent = "—";
        supportersCountElement.textContent = "—";
    }
}


// تحميل قائمة المشاركين
async function loadMembers() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/members`,
            {
                headers: getAuthHeaders()
            }
        );

        if (response.status === 401) {
            localStorage.removeItem("adminToken");
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("فشل تحميل قائمة المشاركين");
        }

        const data = await response.json();

        if (data.members.length === 0) {
            membersMessageElement.textContent =
                "لا يوجد مشاركون مسجلون حاليًا.";

            membersListElement.innerHTML = "";

            return;
        }

        membersMessageElement.textContent = "";

        membersListElement.innerHTML = data.members
    .map((member, index) => {

        const memberType =
            member.member_type === "owner"
                ? "صاحب حق"
                : "متضامن";

        const createdAt =
            new Date(member.created_at)
                .toLocaleDateString("ar-SY");

        return `
            <tr>

                <td>${index + 1}</td>

                <td>${member.full_name}</td>

                <td>${member.area || "غير محدد"}</td>

                <td>${memberType}</td>

                <td>${createdAt}</td>

            </tr>
        `;
    })
    .join("");

    } catch (error) {
        console.error(error);

        membersMessageElement.textContent =
            "حدث خطأ أثناء تحميل قائمة المشاركين.";
    }
}


// بدء لوحة الإدارة
if (requireLogin()) {
    loadStats();
    loadMembers();
}

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("adminToken");

    window.location.href = "admin-login.html";
});