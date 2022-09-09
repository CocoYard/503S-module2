<?php
    require_once './tagManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    // if ($_SESSION['token'] != $_POST['token']){
    //     exit();
    // }
    if (isset($_SESSION['user_id'])){
    $usr_id = $_SESSION['user_id'];
    $tagmanage = new TagManage();
    $res = $tagmanage->getTag($usr_id);

    echo json_encode($res);
    }
    else {
        echo json_encode(["login to add tags"]);
    }
