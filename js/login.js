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
                "mindspace_remembered_email"
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

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            let valid = true;

            authAlert.classList.add("hidden");

            emailError.classList.add("hidden");

            passwordError.classList.add("hidden");


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            /* EMAIL */

            if (
                !email ||
                !validateEmail(email)
            ) {

                emailError.classList.remove(
                    "hidden"
                );

                valid = false;

            }


            /* PASSWORD */

            if (
                !password ||
                password.length < 6
            ) {

                passwordError.classList.remove(
                    "hidden"
                );

                valid = false;

            }


            /* STOP IF INVALID */

            if (!valid) {

                authAlertText.textContent =
                    "Please correct the highlighted fields.";

                authAlert.classList.remove(
                    "hidden"
                );

                return;

            }


            /* LOADING */

            btnSpinner.classList.remove(
                "hidden"
            );

            btnLabel.textContent =
                "Signing In...";

            submitBtn.disabled = true;


            /* MOCK AUTHENTICATION */

            setTimeout(function () {

                try {

                    if (rememberMe.checked) {

                        localStorage.setItem(
                            "mindspace_remembered_email",
                            email
                        );

                    } else {

                        localStorage.removeItem(
                            "mindspace_remembered_email"
                        );

                    }


                    localStorage.setItem(
                        "mindspace_authenticated",
                        "true"
                    );

                    localStorage.setItem(
                        "mindspace_auth_type",
                        "credentials"
                    );

                    localStorage.setItem(
                        "mindspace_user",
                        email
                    );

                } catch (error) {

                    console.warn(
                        "Storage unavailable:",
                        error
                    );

                }


                btnSpinner.classList.add(
                    "hidden"
                );

                btnLabel.textContent =
                    "Sign In to MindSpace";

                submitBtn.disabled = false;


                showToast(
                    "Welcome Back",
                    "Opening your MindSpace workspace..."
                );


                setTimeout(function () {

                    window.location.href =
                        "index.html";

                }, 1000);

            }, 900);

        }
    );

})();