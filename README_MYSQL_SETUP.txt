STUDENT PORTFOLIO WEBSITE — PHP + MYSQL

1. Put this entire folder under C:\xampp\htdocs\
2. Start Apache and MySQL in XAMPP.
3. FIRST-TIME INSTALL:
   http://localhost/Student_Portfolio_Website_MySQL_PHP_READY/Portfolio_Customizable_Website_FIXED/website%20html%20matt/database/install.php
4. IF YOU ALREADY INSTALLED THE PREVIOUS BUILD:
   run this ONCE:
   http://localhost/Student_Portfolio_Website_MySQL_PHP_READY/Portfolio_Customizable_Website_FIXED/website%20html%20matt/database/update.php
5. Open:
   http://localhost/Student_Portfolio_Website_MySQL_PHP_READY/Portfolio_Customizable_Website_FIXED/website%20html%20matt/login.php

OWNER
Username: matthaevs
Password: matthaevs0203
Display name: MANECLANG

NEW ACCOUNTS
- Registration requires a full name, username and password.
- New accounts start completely blank.
- They never inherit MANECLANG content.
- Recent accounts on the same device can be switched to, but password verification is required.

PORTFOLIO FEATURES
- Account-specific profile name and avatar
- Avatar change/delete from Website Customizer
- Home/About/Hero customization
- Dark/Light mode toggle
- Dynamic Projects archive
- Upload complete project folders as ZIP files (index.html required)
- Dynamic Featured Projects
- Achievements
- Gallery with Facebook-style relative timestamps
- Account/profile switching with password verification
- Responsive UI

PROJECT UPLOAD
Users no longer need to hard-code a project folder into HTML/JS.
Use PROJECTS > ADD PROJECT and upload the complete project folder as a ZIP.
The ZIP should contain index.html and all project assets.
Server-side project uploads reject server-side/executable extensions and block path traversal.

SECURITY
- Passwords use PHP password_hash/password_verify.
- Uploaded avatars are validated as real images.
- Uploaded project ZIPs are path-traversal checked and server-side executable extensions are rejected.
- Do not expose database/install.php or database/update.php on a public production server after setup.
