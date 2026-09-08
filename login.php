<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Student Portfolio Website | Login</title>

    <link
        rel="stylesheet"
        href="login.css"
    >

    <style>

        /* PASSWORD SHOW / HIDE */

        .password-wrapper {
            position: relative;
            width: 100%;
        }

        .password-wrapper input {
            padding-right: 70px;
        }

        .show-password {
            position: absolute;

            right: 10px;
            top: 50%;

            transform: translateY(-50%);

            width: auto;
            height: auto;

            padding: 5px;

            border: none;

            background: transparent;

            color: #666;

            font-size: 8px;
            font-weight: bold;

            letter-spacing: 1px;

            cursor: pointer;

            box-shadow: none;
        }

        .show-password:hover {
            color: #aaa;

            background: transparent;

            transform: translateY(-50%);
        }

        .show-password:active {
            transform: translateY(-50%);
        }

    </style>

</head>


<body>


    <!-- BACKGROUND SHAPES -->

    <div class="shape shape-one"></div>

    <div class="shape shape-two"></div>

    <div class="shape shape-three"></div>



    <!-- LOGIN PAGE -->

    <main class="auth-page">

        <section class="auth-card">


            <!-- TOP LABEL -->

            <div class="auth-top">

                <span>
                    STUDENT PORTFOLIO WEBSITE
                </span>

                <span>
                    01 / LOGIN
                </span>

            </div>



            <!-- LOGO -->

            <div class="auth-logo">
                M
            </div>



            <!-- HEADING -->

            <div class="auth-heading">

                <p class="small-title">
                    WELCOME
                </p>

                <h1>
                    LOGIN<span>.</span>
                </h1>

                <p class="description">
                    Sign in to continue to the website.
                </p>

            </div>



            <!-- LOGIN FORM -->

            <form id="loginForm">


                <!-- USERNAME -->

                <div class="input-group">

                    <label for="username">
                        USERNAME
                    </label>

                    <input
                        type="text"
                        id="username"
                        placeholder="Enter username"
                        autocomplete="username"
                        required
                    >

                </div>



                <!-- PASSWORD -->

                <div class="input-group">

                    <label for="password">
                        PASSWORD
                    </label>


                    <div class="password-wrapper">

                        <input
                            type="password"
                            id="password"
                            placeholder="Enter password"
                            autocomplete="current-password"
                            required
                        >


                        <button
                            type="button"
                            class="show-password"
                            id="showPassword"
                        >
                            SHOW
                        </button>

                    </div>

                </div>



                <!-- LOGIN MESSAGE -->

                <p
                    id="loginMessage"
                    class="message"
                ></p>



                <!-- LOGIN BUTTON -->

                <button
                    type="submit"
                    class="auth-button"
                >

                    LOGIN

                    <span>
                        →
                    </span>

                </button>


            </form>



            <!-- REGISTER -->

            <div class="auth-footer">

                <span>
                    DON'T HAVE AN ACCOUNT?
                </span>

                <a href="register.php">
                    REGISTER
                </a>

            </div>



        </section>

    </main>



    <!-- AUTH SCRIPT -->

    <script src="auth.js"></script>


    <!-- SHOW / HIDE PASSWORD -->

    <script>

        const passwordInput =
            document.getElementById("password");

        const showPassword =
            document.getElementById("showPassword");


        showPassword.addEventListener(
            "click",
            function () {

                if (
                    passwordInput.type === "password"
                ) {

                    passwordInput.type = "text";

                    showPassword.textContent =
                        "HIDE";

                }

                else {

                    passwordInput.type =
                        "password";

                    showPassword.textContent =
                        "SHOW";

                }

            }
        );

    </script>


</body>

</html>
