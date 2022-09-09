<?php
// Anyone has rights to join a group, to quit a group. But no one has the right to delete our shared group.
    require_once './groupManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $grp_id = $_POST['grp_id'];

        $gm = new groupManage();
        $res = $gm->delGrp($user_id, $grp_id);
        echo json_encode($res);
    }
    else {
        echo json_encode(array('success' => false, 'msg' => "Please login first! "));
    }
?>
