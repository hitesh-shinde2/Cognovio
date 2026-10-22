/* =========================================
   MINDSPACE SIGNUP
   Vanilla JavaScript
   ========================================= */

(function () {

    /* =========================================
       ELEMENTS
       ========================================= */

    const form =
        document.getElementById("signupForm");

    const fullName =
        document.getElementById("fullName");

    const studentEmail =
        document.getElementById("studentEmail");

    const academicMajor =
        document.getElementById("academicMajor");

    const academicYear =
        document.getElementById("academicYear");

    const passField =
        document.getElementById("passField");

    const confirmPass =
        document.getElementById("confirmPassField");

    const termsConsent =
        document.getElementById("termsConsent");

    const togglePassBtn =
        document.getElementById("togglePassBtn");

    const togglePassIcon =
        document.getElementById("togglePassIcon");

    const dot1 =
        document.getElementById("dot1");

    const dot2 =
        document.getElementById("dot2");

    const dot3 =
        document.getElementById("dot3");

    const strengthLabel =
        document.getElementById("strengthLabel");

    const strengthDots =
        document.querySelector(".strength-dots");

    const strengthRow =
        document.querySelector(".strength-row");

    const matchFeedback =
        document.getElementById("matchFeedback");

    const matchIcon =
        document.getElementById("matchIcon");

    const statusToast =
        document.getElementById("statusToast");

    const ssoBtn =
        document.getElementById("ssoBtn");

    const submitBtn =
        document.getElementById("submitBtn");


    /* =========================================
       PASSWORD VISIBILITY
       ========================================= */

    togglePassBtn.addEventListener(
        "click",
        function () {

            const isPassword =
                passField.type === "password";

            passField.type =
                isPassword
                    ? "text"
                    : "password";

            togglePassIcon.textContent =
                isPassword
                    ? "visibility_off"
                    : "visibility";

        }
    );


    /* =========================================
       CAMPUS EMAIL VALIDATION
       ========================================= */

    function isValidCampusEmail(value) {

        const email =
            value.toLowerCase().trim();

        /*
         * Prototype validation.
         *
         * In the real backend, this should be
         * replaced with your university's
         * approved email domain.
         */

        const basicEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email);

        return basicEmail;

    }


    /* =========================================
       PASSWORD STRENGTH
       ========================================= */

    passField.addEventListener(
        "input",
        function () {

            const value =
                passField.value;

            let score = 0;


            if (value.length >= 6) {

                score++;

            }


            if (
                value.length >= 8 &&
                /[A-Z]/.test(value) &&
                /[0-9]/.test(value)
            ) {

                score++;

            }


            if (
                value.length >= 10 &&
                /[^A-Za-z0-9]/.test(value)
            ) {

                score++;

            }


            /* Reset */

            strengthDots.className =
                "strength-dots";

            strengthRow.className =
                "strength-row";


            dot1.style.background =
                "";

            dot2.style.background =
                "";

            dot3.style.background =
                "";


            /* Empty */

            if (score === 0) {

                strengthLabel.textContent =
                    "Empty";

                return;

            }


            /* Weak */

            if (score === 1) {

                strengthDots.classList.add(
                    "weak"
                );

                strengthRow.classList.add(
                    "weak"
                );

                strengthLabel.textContent =
                    "Weak";

                return;

            }


            /* Good */

            if (score === 2) {

                strengthDots.classList.add(
                    "good"
                );

                strengthRow.classList.add(
                    "good"
                );

                strengthLabel.textContent =
                    "Good";

                return;

            }


            /* Strong */

            if (score >= 3) {

                strengthDots.classList.add(
                    "strong"
                );

                strengthRow.classList.add(
                    "strong"
                );

                strengthLabel.textContent =
                    "Strong";

            }

        }
    );


    /* =========================================
       PASSWORD MATCH
       ========================================= */

    function checkPasswordMatch() {

        const password =
            passField.value;

        const confirmation =
            confirmPass.value;


        if (!confirmation) {

            matchFeedback.classList.add(
                "hidden"
            );

            matchIcon.textContent =
                "password";

            return;

        }


        matchFeedback.classList.remove(
            "hidden"
        );


        if (password === confirmation) {

            matchFeedback.textContent =
                "Match OK";

            matchFeedback.className =
                "match-feedback success";

            matchIcon.textContent =
                "check_circle";

            matchIcon.style.color =
                "var(--blue)";

        } else {

            matchFeedback.textContent =
                "Does Not Match";

            matchFeedback.className =
                "match-feedback error";

            matchIcon.textContent =
                "error";

            matchIcon.style.color =
                "var(--error)";

        }

    }


    confirmPass.addEventListener(
        "input",
        checkPasswordMatch
    );


    /* =========================================
       STATUS MESSAGE
       ========================================= */

    function showStatus(
        message,
        type
    ) {

        statusToast.textContent =
            message;

        statusToast.className =
            "status-toast " + type;

    }


    /* =========================================
       SSO MOCK
       ========================================= */

    ssoBtn.addEventListener(
        "click",
        function () {

            /*
             * This is only a frontend prototype.
             *
             * Real university SSO will eventually
             * be handled by FastAPI/backend.
             */


            fullName.value =
                "Alex Sharma";

            studentEmail.value =
                "alex.sharma@university.edu";

            academicMajor.value =
                "Computer Science";

            academicYear.value =
                "year_3";

            passField.value =
                "UniversityPass2026!";

            confirmPass.value =
                "UniversityPass2026!";

            termsConsent.checked =
                true;


            passField.dispatchEvent(
                new Event("input")
            );

            confirmPass.dispatchEvent(
                new Event("input")
            );


            showStatus(
                "University login simulated. Student profile pre-filled for this prototype.",
                "success"
            );

        }
    );


    /* =========================================
       FORM VALIDATION
       ========================================= */


    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        let valid = true;

        // Validate name
        const nameError = document.getElementById("nameError");
        if (!fullName.value.trim()) {
            nameError.classList.remove("hidden");
            valid = false;
        } else {
            nameError.classList.add("hidden");
        }

        // Validate email
        const emailError = document.getElementById("emailError");
        if (!isValidCampusEmail(studentEmail.value)) {
            emailError.classList.remove("hidden");
            valid = false;
        } else {
            emailError.classList.add("hidden");
        }

        // Validate major
        const majorError = document.getElementById("majorError");
        if (!academicMajor.value.trim()) {
            majorError.classList.remove("hidden");
            valid = false;
        } else {
            majorError.classList.add("hidden");
        }

        // Validate academic year
        if (!academicYear.value) {
            showStatus("Please select your academic year.", "error");
            valid = false;
        }

        // Validate password
        if (
            passField.value.length < 8 ||
            passField.value.length > 72 ||
            passField.value !== confirmPass.value
        ) {
            matchFeedback.classList.remove("hidden");
            matchFeedback.textContent =
                "Passwords must match and contain 8–72 characters.";
            matchFeedback.className = "match-feedback error";
            valid = false;
        }

        // Validate terms
        if (!termsConsent.checked) {
            showStatus(
                "Please accept the Student Wellbeing Privacy Charter.",
                "error"
            );
            valid = false;
        }

        if (!valid) return;

        // Send registration details to the backend
        submitBtn.disabled = true;
        const originalButtonText = submitBtn.textContent;
        submitBtn.textContent = "Creating account...";

        try {
            const response = await fetch(
                "https://cognovio-api.onrender.com/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: fullName.value.trim(),
                        email: studentEmail.value.trim(),
                        password: passField.value,
                        student_id: null
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = Array.isArray(result.detail)
                    ? result.detail.map(error => error.msg).join(", ")
                    : result.detail;

                throw new Error(errorMessage || "Registration failed.");
            }

            showStatus(
                "Registration successful! Please log in.",
                "success"
            );

            form.reset();
            checkPasswordMatch();

            // Redirect only if login.html exists
            setTimeout(function () {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {
            console.error("Registration error:", error);

            showStatus(
                error.message === "Failed to fetch"
                    ? "Cannot connect to the server. Check that FastAPI is running."
                    : error.message,
                "error"
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalButtonText;
        }
    });



})();