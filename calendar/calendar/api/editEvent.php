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
        $title = $_POST['title'];
        $description = $_POST['description'];
        $date = $_POST['date'];
        $tag = $_POST['tag'];
        $grp_id = $_POST['grp_id'];
        $event_id = $_POST['event_id'];
        $token = $_SESSION['token'];

        $em = new eventManage();
        $res = $em->editEvent($user_id, $title, $description, $date, $tag, $grp_id, $event_id);
        echo json_encode($res);
    }
    else {
        echo json_encode("Please login first! ");
    }
?>
