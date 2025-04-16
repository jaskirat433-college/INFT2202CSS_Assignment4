<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST["name"]);
    $email = htmlspecialchars($_POST["email"]);
    $subject = htmlspecialchars($_POST["subject"]);
    $message = htmlspecialchars($_POST["message"]);

    // Here you can add code to save the feedback to a database or send an email

    echo "Feedback submitted successfully.";
} else {
    echo "Invalid request.";
}
?>
