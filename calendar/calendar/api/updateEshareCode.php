<?php
    require_once './eventManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    // if ($_SESSION['token'] != $_POST['token']){
    //     exit();
    // }
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $event_id = $_POST['event_id'];

        $em = new eventManage();
        $res = $em->updateEventShareCode($user_id, $event_id);
        // echo json_encode($res);
    }
    else {
        // echo json_encode("Please login first! ");
    }
?>
