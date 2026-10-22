/* =========================================
   MINDSPACE LOGIN
   Vanilla JavaScript
   ========================================= */

(function () {

    const loginForm = document.getElementById("login-form");

    const emailInput = document.getElementById("student-email");
    const passwordInput = document.getElementById("student-password");

    const rememberMe = document.getElementById("remember-me");

    const togglePasswordBtn =
        document.getElementById("toggle-password-btn");

    const togglePasswordIcon =
        document.getElementById("toggle-password-icon");

    const emailError =
        document.getElementById("email-error");

    const passwordError =
        document.getElementById("password-error");

    const authAlert =
        document.getElementById("auth-alert");

    const authAlertText =
        document.getElementById("auth-alert-text");

    const submitBtn =
        document.getElementById("submit-btn");

    const btnSpinner =
        document.getElementById("btn-spinner");

    const btnLabel =
        document.getElementById("btn-label");

    const ssoBtn =
        document.getElementById("sso-btn");

    const forgotPasswordLink =
        document.getElementById("forgot-password-link");

    const toast =
        document.getElementById("toast-notification");

    const toastTitle =
        document.getElementById("toast-title");

    const toastMessage =
        document.getElementById("toast-message");

    const toastIcon =
        document.getElementById("toast-icon");


    /* =========================================
       LOAD REMEMBERED EMAIL
       ========================================= */

    try {

        const savedEmail =
            localStorage.getItem(
                "cognovio_remembered_email"
            );

        if (savedEmail) {

            emailInput.value = savedEmail;

            rememberMe.checked = true;

        }

    } catch (error) {

        console.warn(
            "Local storage unavailable:",
            error
        );

    }


    /* =========================================
       PASSWORD VISIBILITY
       ========================================= */

    togglePasswordBtn.addEventListener(
        "click",
        function () {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword ? "text" : "password";

            togglePasswordIcon.textContent =
                isPassword
                    ? "visibility_off"
                    : "visibility";

        }
    );


    /* =========================================
       TOAST
       ========================================= */

    function showToast(
        title,
        message,
        isError = false
    ) {

        toastTitle.textContent = title;

        toastMessage.textContent = message;

        toastIcon.textContent =
            isError
                ? "warning"
                : "check_circle";

        toastIcon.style.color =
            isError
                ? "#e63b2e"
                : "#ffcc00";

        toast.classList.add("show");

        setTimeout(function () {

            toast.classList.remove("show");

        }, 4000);

    }


    /* =========================================
       EMAIL VALIDATION
       ========================================= */

    function validateEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =========================================
       SSO SIMULATION
       ========================================= */

    ssoBtn.addEventListener(
        "click",
        function () {

            ssoBtn.disabled = true;

            showToast(
                "University Login",
                "Connecting to campus authentication..."
            );

            setTimeout(function () {

                try {

                    localStorage.setItem(
                        "mindspace_authenticated",
                        "true"
                    );

                    localStorage.setItem(
                        "mindspace_auth_type",
                        "university"
                    );

                    localStorage.setItem(
                        "mindspace_user",
                        "student@university.edu"
                    );

                } catch (error) {

                    console.warn(error);

                }

                showToast(
                    "Welcome",
                    "Opening your MindSpace workspace..."
                );

                setTimeout(function () {

                    window.location.href =
                        "index.html";

                }, 1200);

            }, 1000);

        }
    );


    /* =========================================
       FORGOT PASSWORD
       ========================================= */

    forgotPasswordLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            if (!email) {

                showToast(
                    "Password Reset",
                    "Enter your university email first.",
                    true
                );

                emailInput.focus();

                return;

            }

            if (!validateEmail(email)) {

                showToast(
                    "Invalid Email",
                    "Please enter a valid university email.",
                    true
                );

                emailInput.focus();

                return;

            }

            showToast(
                "Reset Request",
                "Password recovery will be connected to the backend later."
            );

        }
    );


    /* =========================================
       LOGIN FORM
       ========================================= */


    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        let valid = true;

        authAlert.classList.add("hidden");
        emailError.classList.add("hidden");
        passwordError.classList.add("hidden");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate email
        if (!email || !validateEmail(email)) {
            emailError.classList.remove("hidden");
            valid = false;
        }

        // Validate password
        if (!password || password.length < 8 || password.length > 72) {
            passwordError.classList.remove("hidden");
            valid = false;
        }

        if (!valid) {
            authAlertText.textContent =
                "Please correct the highlighted fields.";
            authAlert.classList.remove("hidden");
            return;
        }

        // Show loading state
        btnSpinner.classList.remove("hidden");
        btnLabel.textContent = "Signing In...";
        submitBtn.disabled = true;

        try {
            const response = await fetch(
                "https://cognovio-api.onrender.com/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to sign in."
                );
            }

            // Store the token for authenticated API requests.
            // Never store the password.
            sessionStorage.setItem(
                "cognovio_access_token",
                result.access_token
            );

            sessionStorage.setItem(
                "cognovio_user",
                JSON.stringify(result.user)
            );

            // Remember only the email if requested.
            if (rememberMe.checked) {
                localStorage.setItem(
                    "cognovio_remembered_email",
                    email
                );
            } else {
                localStorage.removeItem(
                    "cognovio_remembered_email"
                );
            }

            showToast(
                "Welcome Back",
                "Login successful! Opening Cognovio..."
            );

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {
            console.error("Login error:", error);

            showToast(
                "Login Failed",
                error.message === "Failed to fetch"
                    ? "Cannot connect to the server. Check that FastAPI is running."
                    : error.message,
                true
            );

        } finally {
            btnSpinner.classList.add("hidden");
            btnLabel.textContent = "Sign In to COGNOVIO";
            submitBtn.disabled = false;
        }
    });


})();