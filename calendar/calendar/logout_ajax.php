<?php
// check_ajax.php
ini_set("session.cookie_httponly", 1);

header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

session_start();

session_unset();
session_destroy();
echo json_encode(array(
    "success" => true
));
exit;
