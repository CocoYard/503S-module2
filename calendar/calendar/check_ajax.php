<?php
// check_ajax.php

ini_set("session.cookie_httponly", 1);

session_start();

if(isset( $_SESSION['user_id'])) {
    echo json_encode(array(
        "success" => true,
        "username" => $_SESSION['username'],
        "user_id" => $_SESSION['user_id'],
        // token 
        "token" => $_SESSION['token']

    ));
    exit;
}
else{
    echo json_encode(array(
        "success" => false
    ));
    exit;
}