<?php
    require_once './eventManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    if (isset($_SESSION['token']) && isset($_POST['token']) && $_SESSION['token'] != $_POST['token']){
        echo json_encode("CSRF attack detected! ");
        exit();
    }
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $share_code = $_POST['share_code'];


        $em = new eventManage();
        $res = $em->addEventbyShareCode($user_id, $share_code);
        echo json_encode($res);
        exit();

    }
    else {
        echo json_encode("Please login first! ");
        exit();

    }
