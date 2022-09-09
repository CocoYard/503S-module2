<?php
    require_once './eventManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $tag_names = $_POST['tags'];
        $grp_id = $_POST['grp_id'];
        $em = new eventManage();
        $res = $em->getEventsByTagGrp($user_id, $tag_names, $grp_id);

        echo json_encode($res);
    }
    else {
        echo json_encode([]);
    }
?>
