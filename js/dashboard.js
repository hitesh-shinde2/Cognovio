/* ============================================
   COGNOVIO AUTHENTICATION GUARD
   Verify the JWT with the backend before showing
   the dashboard.
============================================ */

const cognovioToken = sessionStorage.getItem("cognovio_access_token");

if (!cognovioToken) {
    window.location.replace("login.html");
    throw new Error("Authentication required. Redirecting to login.");
}

// Hide dashboard content until the backend verifies the token.
document.documentElement.style.visibility = "hidden";

/* ============================================
   MINDSPACE DASHBOARD JAVASCRIPT
============================================ */


/* ============================================
   DOM ELEMENTS
============================================ */

const navItems = document.querySelectorAll(".nav-item");

const sections = document.querySelectorAll(".page-section");

const pageTitle = document.getElementById("pageTitle");

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const logoutBtn =
    document.getElementById("logoutBtn");

const settingsLogout =
    document.getElementById("settingsLogout");

const welcomeName =
    document.getElementById("welcomeName");

const sidebarUserName =
    document.getElementById("sidebarUserName");

const sidebarUserEmail =
    document.getElementById("sidebarUserEmail");

const userAvatar =
    document.getElementById("userAvatar");

const currentDate =
    document.getElementById("currentDate");

const wellbeingScore =
    document.getElementById("wellbeingScore");

const streakCount =
    document.getElementById("streakCount");

const sessionCount =
    document.getElementById("sessionCount");

const activityList =
    document.getElementById("activityList");

const fullActivityList =
    document.getElementById("fullActivityList");

const moodHistory =
    document.getElementById("moodHistory");

const moodMessage =
    document.getElementById("moodMessage");

const moodPageMessage =
    document.getElementById("moodPageMessage");

const openChatBtn =
    document.getElementById("openChatBtn");

const chatWindow =
    document.getElementById("chatWindow");

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");


/* ============================================
   USER DATA
============================================ */

function getUser() {
    try {
        const storedUser = sessionStorage.getItem("cognovio_user");
        if (storedUser) {
            return JSON.parse(storedUser);
        }
    } catch (error) {
        console.error("Unable to read Cognovio user data:", error);
    }

    return {
        name: "Student",
        email: "",
        student_id: null
    };
}

const user = getUser();

/*
 * Validate the JWT with FastAPI and refresh the profile from MySQL.
 */
async function verifyCognovioSession() {
    try {
        const response = await fetch("https://cognovio-api.onrender.com/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${cognovioToken}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("cognovio_access_token");
            sessionStorage.removeItem("cognovio_user");
            window.location.replace("login.html");
            return;
        }

        if (!response.ok) {
            throw new Error(`Authentication check failed (HTTP ${response.status}).`);
        }

        const verifiedUser = await response.json();
        Object.assign(user, verifiedUser);
        sessionStorage.setItem("cognovio_user", JSON.stringify(verifiedUser));

        displayUser();
        await loadMoodHistory();
        document.documentElement.style.visibility = "visible";
    } catch (error) {
        console.error("Unable to verify Cognovio session:", error);
        alert("Cognovio could not verify your session. Make sure the FastAPI backend is running, then log in again.");
        sessionStorage.removeItem("cognovio_access_token");
        sessionStorage.removeItem("cognovio_user");
        window.location.replace("login.html");
    }
}


/* ============================================
   DISPLAY USER
============================================ */

function displayUser() {

    const name =
        user.name || "Student";

    const email =
        user.email || "student@university.edu";


    welcomeName.textContent =
        name.split(" ")[0];

    sidebarUserName.textContent =
        name;

    sidebarUserEmail.textContent =
        email;


    userAvatar.textContent =
        name.charAt(0).toUpperCase();

}


displayUser();


/* ============================================
   DATE
============================================ */

function displayDate() {

    const today = new Date();

    const options = {

        weekday: "long",

        day: "numeric",

        month: "long",

        year: "numeric"

    };


    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );

}


displayDate();


/* ============================================
   NAVIGATION
============================================ */

const pageNames = {

    dashboard: "Your Dashboard",

    chat: "MindSpace AI",

    mood: "Mood Check-in",

    resources: "Wellbeing Resources",

    activity: "My Activity",

    settings: "Settings"

};


function showSection(sectionName) {

    sections.forEach(section => {

        section.classList.remove("active");

    });


    const targetSection =
        document.getElementById(
            `${sectionName}Section`
        );


    if (targetSection) {

        targetSection.classList.add("active");

    }


    navItems.forEach(item => {

        item.classList.remove("active");

        if (
            item.dataset.section === sectionName
        ) {

            item.classList.add("active");

        }

    });


    pageTitle.textContent =
        pageNames[sectionName] ||
        "MindSpace";


    closeMobileSidebar();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    if (sectionName === "activity") {

        renderActivity();

    }


    if (sectionName === "mood") {

        renderMoodHistory();

    }

}


/* Navigation clicks */

navItems.forEach(item => {

    item.addEventListener("click", event => {

        event.preventDefault();

        showSection(
            item.dataset.section
        );

    });

});


/* Internal section links */

document
    .querySelectorAll("[data-section-link]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showSection(
                    button.dataset.sectionLink
                );

            }
        );

    });


/* ============================================
   MOBILE SIDEBAR
============================================ */

function openMobileSidebar() {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("show");

}


function closeMobileSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

}


mobileMenuBtn?.addEventListener(
    "click",
    openMobileSidebar
);


sidebarOverlay?.addEventListener(
    "click",
    closeMobileSidebar
);


/* ============================================
   MOOD SYSTEM
============================================ */

const moodValues = {

    Great: 100,

    Good: 80,

    Okay: 60,

    Low: 40,

    Struggling: 20

};


let moodHistoryCache = [];

function getMoodHistory() {
    return moodHistoryCache;
}

function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeMoodRecord(record) {
    const createdAt = record.created_at ? new Date(record.created_at) : null;
    return {
        id: record.id,
        mood: record.mood,
        score: Number(record.score),
        date: record.check_in_date,
        time: createdAt && !Number.isNaN(createdAt.getTime())
            ? createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            : ""
    };
}

async function loadMoodHistory() {
    try {
        const response = await fetch("https://cognovio-api.onrender.com/moods/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${cognovioToken}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        if (!response.ok) {
            throw new Error(`Unable to load mood history (HTTP ${response.status}).`);
        }

        const records = await response.json();
        moodHistoryCache = records.map(normalizeMoodRecord);
        const today = localDateString();
        const todayEntry = moodHistoryCache.find(item => item.date === today);
        document.querySelectorAll(".mood-option").forEach(button => {
            button.classList.toggle("selected", Boolean(todayEntry) && button.dataset.mood === todayEntry.mood);
        });
        calculateWellbeing();
        calculateStreak();
        renderMoodHistory();
    } catch (error) {
        console.error("Unable to load mood history:", error);
        showMoodMessage(moodMessage, "Couldn't load your mood history. Please try again.");
        showMoodMessage(moodPageMessage, "Couldn't load your mood history. Please try again.");
    }
}

async function saveMood(mood) {
    try {
        const response = await fetch("https://cognovio-api.onrender.com/moods/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${cognovioToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ mood })
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return false;
        }
        if (!response.ok) {
            let detail = "Unable to save your mood. Please try again.";
            try {
                const errorBody = await response.json();
                if (errorBody.detail) detail = errorBody.detail;
            } catch (_) {}
            throw new Error(detail);
        }

        const savedRecord = await response.json();
        const normalized = normalizeMoodRecord(savedRecord);
        const existingIndex = moodHistoryCache.findIndex(item => item.date === normalized.date);
        if (existingIndex >= 0) {
            moodHistoryCache[existingIndex] = normalized;
        } else {
            moodHistoryCache.unshift(normalized);
        }
        moodHistoryCache.sort((a, b) => b.date.localeCompare(a.date));

        calculateWellbeing();
        calculateStreak();
        renderActivity();
        renderMoodHistory();
        return true;
    } catch (error) {
        console.error("Unable to save mood:", error);
        showMoodMessage(moodMessage, error.message || "Unable to save your mood. Please try again.");
        showMoodMessage(moodPageMessage, error.message || "Unable to save your mood. Please try again.");
        return false;
    }
}


/* Mood button events */

document
    .querySelectorAll(".mood-option")
    .forEach(button => {
        button.addEventListener("click", async () => {
            const mood = button.dataset.mood;
            if (!Object.prototype.hasOwnProperty.call(moodValues, mood)) return;

            const saved = await saveMood(mood);
            if (!saved) return;

            document.querySelectorAll(".mood-option").forEach(matchingButton => {
                matchingButton.classList.toggle("selected", matchingButton.dataset.mood === mood);
            });

            const message = `Check-in saved: You're feeling ${mood.toLowerCase()} today.`;
            showMoodMessage(moodMessage, message);
            showMoodMessage(moodPageMessage, message);

            saveActivity("mood", "Mood check-in", `Recorded mood: ${mood}`);
        });
    });


function showMoodMessage(
    element,
    message
) {

    if (!element) return;


    element.textContent =
        message;

    element.classList.add("show");


    setTimeout(() => {

        element.classList.remove(
            "show"
        );

    }, 3500);

}


/* ============================================
   WELLBEING SCORE
============================================ */

function calculateWellbeing() {

    const history =
        getMoodHistory();


    if (!history.length) {

        wellbeingScore.textContent =
            "--";

        return;

    }


    const recent =
        history.slice(0, 7);


    const total =
        recent.reduce(
            (sum, item) =>
                sum + item.score,
            0
        );


    const average =
        Math.round(
            total / recent.length
        );


    wellbeingScore.textContent =
        average;

}


calculateWellbeing();


/* ============================================
   CHECK-IN STREAK
============================================ */

function calculateStreak() {

    const history =
        getMoodHistory();


    if (!history.length) {

        streakCount.textContent =
            "0";

        return;

    }


    const dates =
        history
            .map(item => item.date)
            .sort()
            .reverse();


    let streak = 0;

    let currentDate =
        new Date();


    for (const dateString of dates) {

        const expected =
            localDateString(currentDate);


        if (dateString === expected) {

            streak++;

            currentDate.setDate(
                currentDate.getDate() - 1
            );

        } else {

            break;

        }

    }


    streakCount.textContent =
        streak;

}


calculateStreak();


/* ============================================
   MOOD HISTORY
============================================ */

function renderMoodHistory() {

    const history =
        getMoodHistory();


    if (!history.length) {

        moodHistory.innerHTML = `

            <div class="empty-activity">

                <span class="material-symbols-outlined">
                    mood
                </span>

                <p>
                    Your mood history will appear here.
                </p>

            </div>

        `;

        return;

    }


    moodHistory.innerHTML =
        history
            .slice(0, 10)
            .map(item => {

                return `

                    <div class="activity-item">

                        <div class="activity-item-icon">

                            <span>
                                ${getMoodEmoji(item.mood)}
                            </span>

                        </div>

                        <div class="activity-item-info">

                            <strong>
                                Feeling ${item.mood}
                            </strong>

                            <span>
                                ${formatDate(item.date)}
                                · ${item.time}
                            </span>

                        </div>

                    </div>

                `;

            })
            .join("");

}


function getMoodEmoji(mood) {

    const emojis = {

        Great: "😄",

        Good: "🙂",

        Okay: "😐",

        Low: "😔",

        Struggling: "😣"

    };


    return emojis[mood] || "🙂";

}


function formatDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* ============================================
   ACTIVITY
============================================ */

function getActivity() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "mindspace_activity"
            )
        ) || [];

    } catch {

        return [];

    }

}


function saveActivity(
    type,
    title,
    description
) {

    const activities =
        getActivity();


    activities.unshift({

        type,

        title,

        description,

        date:
            new Date().toISOString()

    });


    /*
     * Keep only latest 20 activities.
     */

    const trimmed =
        activities.slice(0, 20);


    localStorage.setItem(
        "mindspace_activity",
        JSON.stringify(trimmed)
    );


    renderActivity();

}


function renderActivity() {

    const activities =
        getActivity();


    if (!activities.length) {

        const emptyHTML = `

            <div class="empty-activity">

                <span class="material-symbols-outlined">
                    history
                </span>

                <p>
                    Your activity will appear here.
                </p>

            </div>

        `;


        activityList.innerHTML =
            emptyHTML;

        fullActivityList.innerHTML =
            emptyHTML;

        return;

    }


    const html =
        activities
            .slice(0, 6)
            .map(activity => {

                return `

                    <div class="activity-item">

                        <div class="activity-item-icon">

                            <span class="material-symbols-outlined">
                                ${getActivityIcon(activity.type)}
                            </span>

                        </div>

                        <div class="activity-item-info">

                            <strong>
                                ${escapeHTML(activity.title)}
                            </strong>

                            <span>
                                ${escapeHTML(activity.description)}
                                · ${formatActivityDate(activity.date)}
                            </span>

                        </div>

                    </div>

                `;

            })
            .join("");


    activityList.innerHTML =
        html;


    fullActivityList.innerHTML =
        activities
            .map(activity => {

                return `

                    <div class="activity-item">

                        <div class="activity-item-icon">

                            <span class="material-symbols-outlined">
                                ${getActivityIcon(activity.type)}
                            </span>

                        </div>

                        <div class="activity-item-info">

                            <strong>
                                ${escapeHTML(activity.title)}
                            </strong>

                            <span>
                                ${escapeHTML(activity.description)}
                                · ${formatActivityDate(activity.date)}
                            </span>

                        </div>

                    </div>

                `;

            })
            .join("");

}


function getActivityIcon(type) {

    const icons = {

        mood: "mood",

        chat: "chat_bubble",

        resource: "auto_stories",

        login: "login"

    };


    return icons[type] ||
        "history";

}


function formatActivityDate(
    timestamp
) {

    const date =
        new Date(timestamp);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


renderActivity();


/* ============================================
   AI CHAT
============================================ */

let chatSessions =
    Number(
        localStorage.getItem(
            "mindspace_chat_sessions"
        )
    ) || 0;


sessionCount.textContent =
    chatSessions;




function generateAIResponse(
    message
) {

    const text =
        message.toLowerCase();


    if (
        text.includes("stress") ||
        text.includes("overwhelmed")
    ) {

        return `
            It sounds like you've got a lot happening
            right now. You don't have to solve everything
            at once. Try identifying the one thing that
            feels most urgent, and let's start there.
        `;

    }


    if (
        text.includes("focus") ||
        text.includes("concentrat")
    ) {

        return `
            Difficulty focusing can happen when your mind
            is carrying too much. Try taking a short break,
            getting some water, and choosing one small task
            to work on for the next 15 minutes.
        `;

    }


    if (
        text.includes("lonely") ||
        text.includes("alone")
    ) {

        return `
            Feeling lonely can be really difficult,
            especially during university. You don't need
            to force yourself to feel better immediately.
            If you'd like, we can talk about what's been
            making you feel disconnected.
        `;

    }


    if (
        text.includes("sad") ||
        text.includes("bad") ||
        text.includes("low")
    ) {

        return `
            I'm sorry you're having a difficult moment.
            You can take your time here. What has been
            weighing on you the most lately?
        `;

    }


    return `
        Thanks for sharing that with me. I'm listening.
        Tell me a little more about what's been going
        through your mind.
    `;

}


/* ============================================
   ADD CHAT MESSAGE
============================================ */

function addChatMessage(
    message,
    sender
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        `chat-message ${sender}`;


    const avatar =
        document.createElement("div");


    avatar.className =
        "chat-avatar";


    avatar.textContent =
        sender === "ai"
            ? "✦"
            : user.name
                ?.charAt(0)
                .toUpperCase() || "A";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const author =
        document.createElement("span");


    author.className =
        "message-author";


    author.textContent =
        sender === "ai"
            ? "MindSpace AI"
            : "You";


    const text =
        document.createElement("p");


    text.textContent =
        message;


    content.appendChild(author);

    content.appendChild(text);

    wrapper.appendChild(avatar);

    wrapper.appendChild(content);


    chatWindow.appendChild(wrapper);


    chatWindow.scrollTop =
        chatWindow.scrollHeight;

}


/* ============================================
   CHAT SUBMISSION
============================================ */

chatForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const message =
            chatInput.value.trim();


        if (!message) return;


        addChatMessage(
            message,
            "user"
        );


        chatInput.value = "";


        saveActivity(
            "chat",
            "AI conversation",
            "Started a conversation with MindSpace AI"
        );


        /*
         * Update session count.
         */

        chatSessions++;

        localStorage.setItem(
            "mindspace_chat_sessions",
            chatSessions
        );


        sessionCount.textContent =
            chatSessions;


        /*
         * Temporary simulated response.
         */

        setTimeout(() => {

            const response =
                generateAIResponse(
                    message
                );


            addChatMessage(
                response,
                "ai"
            );

        }, 700);

    }
);


/* ============================================
   QUICK PROMPTS
============================================ */

document
    .querySelectorAll(
        "[data-prompt]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.dataset.prompt;


                showSection("chat");


                setTimeout(() => {

                    chatInput.value =
                        prompt;

                    chatInput.focus();

                }, 100);

            }
        );

    });


/* ============================================
   OPEN CHAT
============================================ */

openChatBtn?.addEventListener(
    "click",
    () => {

        showSection("chat");

        setTimeout(() => {

            chatInput.focus();

        }, 100);

    }
);


/* ============================================
   LOGOUT
============================================ */

function logout() {
    sessionStorage.removeItem("cognovio_access_token");
    sessionStorage.removeItem("cognovio_user");
    localStorage.removeItem("mindspace_active_user");
    window.location.replace("login.html");
}


logoutBtn?.addEventListener(
    "click",
    logout
);


settingsLogout?.addEventListener(
    "click",
    logout
);


/* ============================================
   INITIALIZATION
============================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        calculateWellbeing();

        calculateStreak();

        renderActivity();

        renderMoodHistory();

    }
);

/* Verify authentication and populate the real user profile. */
verifyCognovioSession();
