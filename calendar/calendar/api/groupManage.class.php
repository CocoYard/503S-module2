<?php
require '../database.php';

class groupManage{
        public function addGrp($user_id, $grp_id, $grp_name){
            global $mysqli;
            $stmt = $mysqli->prepare("select count(*) from grp where grp_id = ? ");
            if(!$stmt){
                printf("Query Prep Failed: %s\n", $mysqli->error);
                exit;
            }
            $stmt->bind_param('d', $grp_id);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            $stmt->close();

            if ($count == 0) {
                // insert into table grp
                $stmt = $mysqli->prepare("insert into grp (grp_id, grp_name) values (?, ?)");
                if(!$stmt){
                    printf("Query Prep Failed: %s\n", $mysqli->error);
                    exit;
                }
                $stmt->bind_param('ds', $grp_id, $grp_name);
                $stmt->execute();
                $stmt->close();

                // insert into table grp_member
                $stmt = $mysqli->prepare("insert into grp_member (grp_id, user_id) values (?, ?)");
                if(!$stmt){
                    printf("Query Prep Failed: %s\n", $mysqli->error);
                    exit;
                }
                $stmt->bind_param('dd', $grp_id, $user_id);
                $stmt->execute();
                $stmt->close();
                return false;
            }else{
                return true;
            }


        }

        public function delGrp($usr_id, $grp_id){
            global $mysqli;
            $stmt = $mysqli->prepare("delete from grp_member where grp_id = ?  and user_id = ?");
            if(!$stmt){
                return array('success' => true, 'msg' => "Query Prep Failed: ".$mysqli->error);
                exit;
            }
            $stmt->bind_param('dd', $grp_id, $usr_id);
            $stmt->execute();
            $stmt->close();
            return array('success' => true, 'msg' => "Please login first! ");
        }

        public function getGroups($usr_id){
            global $mysqli;
            $stmt = $mysqli->prepare("select grp.grp_id, grp.grp_name from grp_member join grp on (grp.grp_id = grp_member.grp_id) where grp_member.user_id = $usr_id");
            $stmt->execute();
            $stmt->bind_result($grp_id, $grp_name);
            $arr = array();
            while ($stmt->fetch()) {
                array_push($arr, array("grp_id" => $grp_id, "grp_name" => htmlentities($grp_name)));
            }
            return $arr;
        }

        public function joinGrp($user_id, $grp_id){
            global $mysqli;

            // check no such group
            $stmt = $mysqli->prepare("select count(*) from grp where grp_id = ?");
            if(!$stmt){
                printf("Query Prep Failed: %s\n", $mysqli->error);
                exit;
            }
            $stmt->bind_param("d", $grp_id);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            if($count == 0) {
                $stmt->close();
                return array('success' => false, 'msg' => "No such group! Check your group ID.");
            }
            $stmt->close();

            // check already in this group
            $stmt = $mysqli->prepare("select count(*) from grp_member where grp_id = ? and user_id = ?");
            $stmt->bind_param("dd", $grp_id, $user_id);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            if($count == 1) {
                $stmt->close();
                return array('success' => false, 'msg' => "You are already in this group.");
            }
            $stmt->close();

            // good to join, add this user to grp_member
            $stmt = $mysqli->prepare("insert into grp_member(grp_id, user_id) values ( ?, ?)");
            $stmt->bind_param("dd", $grp_id, $user_id);
            $stmt->execute();
            $stmt->close();
            return array('success' => true, 'msg' => "Joined successfully! ");
        }

}

