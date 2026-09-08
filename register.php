<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Student Portfolio Website | Register</title>

    <link rel="stylesheet" href="login.css">

</head>

<body>

    <!-- BACKGROUND SHAPES -->

    <div class="shape shape-one"></div>
    <div class="shape shape-two"></div>
    <div class="shape shape-three"></div>


    <!-- REGISTER PAGE -->

    <main class="auth-page">

        <section class="auth-card">

            <div class="auth-top">

                <span>
                    PORTFOLIO
                </span>

                <span>
                    02 / REGISTER
                </span>

            </div>


            <div class="auth-logo">
                M
            </div>


            <div class="auth-heading">

                <p class="small-title">
                    CREATE ACCOUNT
                </p>

                <h1>
                    REGISTER<span>.</span>
                </h1>

                <p class="description">
                    Create your student portfolio account. Your portfolio starts blank and belongs only to you.
                </p>

            </div>


            <form id="registerForm">

                <!-- USERNAME -->

                <div class="input-group">

                    <label for="registerName">
                        FULL NAME
                    </label>

                    <input
                        type="text"
                        id="registerName"
                        placeholder="Your name"
                        autocomplete="name"
                        maxlength="80"
                        required
                    >

                </div>

                <!-- USERNAME -->

                <div class="input-group">

                    <label for="registerUsername">
                        USERNAME
                    </label>

                    <input
                        type="text"
                        id="registerUsername"
                        placeholder="Choose username"
                        autocomplete="username"
                        required
                    >

                </div>


                <!-- PASSWORD -->

                <div class="input-group">

                    <label for="registerPassword">
                        PASSWORD
                    </label>

                    <div class="password-wrapper">

                        <input
                            type="password"
                            id="registerPassword"
                            placeholder="Choose password"
                            autocomplete="new-password"
                            required
                        >

                        <button
                            type="button"
                            class="show-password"
                            onclick="togglePassword('registerPassword', this)"
                        >
                            SHOW
                        </button>

                    </div>

                </div>


                <!-- CONFIRM PASSWORD -->

                <div class="input-group">

                    <label for="confirmPassword">
                        CONFIRM PASSWORD
                    </label>

                    <div class="password-wrapper">

                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Repeat password"
                            autocomplete="new-password"
                            required
                        >

                        <button
                            type="button"
                            class="show-password"
                            onclick="togglePassword('confirmPassword', this)"
                        >
                            SHOW
                        </button>

                    </div>

                </div>


                <!-- MESSAGE -->

                <p
                    id="registerMessage"
                    class="message"
                ></p>


                <!-- CREATE ACCOUNT -->

                <button
                    type="submit"
                    class="auth-button"
                >
                    CREATE ACCOUNT
                    <span>→</span>
                </button>

            </form>


            <!-- LOGIN -->

            <div class="auth-footer">

                <span>
                    ALREADY HAVE AN ACCOUNT?
                </span>

                <a href="login.php">
                    LOGIN
                </a>

            </div>


            <!-- BACK -->

            <a
                href="login.php"
                class="back-link"
            >
                ← BACK
            </a>


        </section>

    </main>


    <script src="auth.js"></script>

</body>

</html>
