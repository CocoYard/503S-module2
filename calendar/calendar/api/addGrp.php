<?php
    require_once './groupManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $grp_id = $_POST['grp_id'];
        $grp_name = $_POST['grp_name'];

        $gm = new groupManage();
        $isExistGrpid = $gm->addGrp($user_id, $grp_id, $grp_name);
        $res = array('isExistGrpid' => $isExistGrpid, 'isLogin' => true);
        echo json_encode($res);
    }
    else {
        echo json_encode(array('isLogin' => false));
    }
?>
