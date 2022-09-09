<?php
    // For now this doesn't consider groups. Instead, just show all events with same user_id

    require_once './groupManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    // if ($_SESSION['token'] != $_POST['token']){
    //     exit();
    // }
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $gm = new groupManage();
        $res = $gm->getGroups($user_id);

        echo json_encode($res);
    }
    else {
        echo json_encode(
            array(["grp_id" => 0, "grp_name" => "No Group"])
        );
    }
