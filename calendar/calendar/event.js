// group color
// --tag-color-text-one: #58c2a9;
// --tag-color-two: #ece7fe;
// --tag-color-text-two: #8972f3;
// --tag-color-three: #fde7ea;
// --tag-color-text-three: #e77f89;
// --tag-color-four: #f7f8fc;
// --tag-color-text-four: #a0a6b5;


/********************************  display  ********************************/
/*
 * tags
 * groups
 * events
 * 
 */
{
    let token = $("#token").val();
    // console.log(token);
    function display_tags() {
        $.post("./api/getTag.php", {}, function (data) {
            console.log("display_tags");
            tags = JSON.parse(data);
            let tags_info = "";
            // console.log(tags);
            tags_info += '<div class = "tag_item" act="1" style="float: left; position: relative; "><button class="tag_button" >' + "None" + '</button ></div >';
            for (let i in tags) {
                cur_tag = tags[i];
                tags_info += '<div class = "tag_item" act="1" style="float: left; position: relative; "><button class="tag_button" >' + cur_tag + '</button ><button class="tag_delete">×</button></div >';
            }

            tags_info += '<input id="input-tag" type="text" placeholder="write your new tag"/> </label><button class="tag_button" id="added">√</button><button class="tag_button" id="add_tag_button">+</button>';

            document.getElementsByClassName("category")[0].innerHTML = tags_info;
            onclick_add_tag_button();
            onclick_tag_item();
            set_color();
            display_events();

        });
        return;
    }
    function display_grps() {
        $.post("./api/getGrp.php", {}, function (data) {
            grps = JSON.parse(data);
            let grps_info = "";
            // console.log(tags);
            grps_info += '<div class = "grp_item" id="-1" style="float: left; position: relative; "><button class="grp_button" style=" background: #30afe2;" >' + "All" + '</button ></div >';

            for (let i in grps) {
                cur_grp = grps[i];
                if (cur_grp.grp_id != 0) {
                    grps_info += '<div class = "grp_item" id="' + cur_grp.grp_id + ' "style="float: left; position: relative; "><button class="grp_button" >' + cur_grp.grp_name + '</button ><button class="grp_delete">×</button></div >';
                }
                else
                    grps_info += '<div class = "grp_item" id="' + cur_grp.grp_id + ' "style="float: left; position: relative; "><button class="grp_button" >' + cur_grp.grp_name + '</button ></div >';
            }

            grps_info += '<input id="input-grp" type="text" placeholder="join a group"/> </label><button class="grp_button" id="added_grp">√</button><button class="grp_button" id="add_grp_button">+</button>';

            document.getElementsByClassName("group")[0].innerHTML = grps_info;
            onclick_add_grp_button();
            onclick_grp_item();
            display_events();

        });
        return;
    }

    function display_events() {
        let tags = document.getElementsByClassName("tag_item");
        console.log("tag length: ", tags.length);
        // console.log();

        // get all activited tags
        let act_tag_names = [];

        for (let i = 0; i < tags.length; i++) {
            cur_tag = tags[i];
            if (cur_tag.getAttribute("act") == 1) {
                act_tag_names.push(cur_tag.children[0].textContent);
            }

        }

        if (act_tag_names.length == 0) {
            let events_info = "";
            events_info += '<li>total events: 0</li>';
            document.getElementsByClassName("list")[0].innerHTML = events_info;
            onclick_event_item();
        }
        else {
            // console.log("act_grp",act_grp);
            $.post("./api/getEventsByTag.php", { tags: act_tag_names, grp_id: act_grp }, function (data) {
                events = JSON.parse(data);

                let events_info = "";
                for (let i in events) {
                    cur_event = events[i];
                    count = parseInt(i)+1;
                    if (cur_event.grp_id == 0) {
                        events_info += '<li class="event-item" value=' + cur_event.event_id + '><span class="xh">' + count + '</span><span>' + cur_event.title + '&nbsp</span><span class="groupTag"> </span><span class="share-event"></span><span class="qc"></span></li>';
                    }
                    else {
                        events_info += '<li class="event-item" value=' + cur_event.event_id + '><span class="xh">' + count + '</span><span>' + cur_event.title + '&nbsp</span><span class="groupTag">' + cur_event.grp_name + '</span><span class="share-event"></span><span class="qc"></span></li>';
                    }
                }

                events_info += '<li>total events: ' + events.length + '</li>';
                // console.log("events", events_info);

                document.getElementsByClassName("list")[0].innerHTML = events_info;
                onclick_event_item();
            });
        }

    }

}
/********************************  on click funtion on tag/group element  ********************************/
{
    function onclick_add_tag_button() {
        tag_button = document.getElementById("add_tag_button")
        tag_button.onclick = function () {
            document.getElementById("input-tag").style.display = "inline-block";
            document.getElementById("added").style.display = "inline-block";
            document.getElementById("add_tag_button").style.display = "none";
        }

        document.getElementById("added").onclick = function () {
            document.getElementById("input-tag").style.display = "none";
            document.getElementById("added").style.display = "none";
            document.getElementById("add_tag_button").style.display = "inline-block";
            add_tag();
        }
    }


    function onclick_tag_item() {
        $(".tag_item").each(
            function (index) {

                // add select_tag listener on tag
                this.children[0].onclick = function (index1) {
                    console.log(this.parentNode)

                    this.parentNode.setAttribute("act", this.parentNode.getAttribute("act") * (-1));
                    // console.log(this.parentNode.getAttribute("act"))
                    set_color();
                    display_events();

                };

                // add delete listener on tag without the 'None' tag
                if (index != 0) {
                    this.children[1].onclick = function () {
                        let cur_tag = this.parentNode.children[0].innerHTML
                        delete_tag(cur_tag);
                    }
                }
            }
        )
    }

    function onclick_add_grp_button() {
        grp_button = document.getElementById("add_grp_button")
        grp_button.onclick = function () {
            document.getElementById("input-grp").style.display = "inline-block";
            console.log(document.getElementById("added_grp"));
            document.getElementById("added_grp").style.display = "inline-block";
            document.getElementById("add_grp_button").style.display = "none";
        }
        document.getElementById("added_grp").onclick = function () {
            document.getElementById("input-grp").style.display = "none";
            document.getElementById("added_grp").style.display = "none";
            document.getElementById("add_grp_button").style.display = "inline-block";
            add_grp();
        }
    }

    function onclick_grp_item() {

        $(".grp_item").each(

            function (index) {
                let cur_grp = this.id;
                // add select_grp listener on grp
                this.children[0].onclick = function (index1) {
                    act_grp = cur_grp;
                    console.log(act_grp);
                    // highlight current grp;
                    $(".grp_item").each(function () {
                        // console.log(this.children[0].id, cur_tag)
                        if (this.id == cur_grp) {
                            this.children[0].style.background = '#30afe2';
                            console.log('validate ', cur_grp);
                        } else {
                            this.children[0].style.background = '#888888';
                        }
                    })
                    display_events();
                };

                // add delete listener on grp without the 'No Group' grp and "All"
                if (index != 0 && index != 1) {
                    this.children[1].onclick = function () {
                        delete_grp(cur_grp);
                    }
                }
            }
        )


    }
}

/********************************  funtions on tag operations  ********************************/
{

    function add_tag() {
        let new_tag = $("#input-tag").val();
        // filter in
        let regex = /^.+$/;
        if (!regex.test(new_tag)) {
            alert("Invalid Input! Input some words please. ");
        }
        else {
            $.post("./api/addTag.php", { tag_name: new_tag }, function (data) {
                res = JSON.parse(data);
                if (!res.isLogin) {
                    alert("Please login first! ");
                }
                else {
                    let isExistTag = res.isExistTag;
                    if (!isExistTag) {
                        display_tags();
                    } else {
                        alert("Warnning: cannot add an existed tag")
                    }

                }

            });
        }
    }

    function delete_tag(tag_name) {
        $.post("./api/delTag.php", { tag_name: tag_name }, function (data) {
            res = JSON.parse(data);
            console.log(res);
            if (res.success) {
                display_tags();
                display_grps();
            }
            else
                alert(res.msg);
        });//token:token
    }


    function set_color() {
        // highlight act == 1 tag;
        $(".tag_item").each(function (key, value) {
            if (value.getAttribute("act") == 1) {
                value.children[0].style.background = '#30afe2';
                // console.log('test');
            } else {
                value.children[0].style.background = '#888888';
            }
        })
    }
}

/********************************  funtions on group operations  ********************************/
{

    function delete_grp(grp_id) {
        $.post("./api/delGrp.php", { grp_id: grp_id },
            function (data) {
                res = JSON.parse(data);
                if (res.success) {
                    act_grp = -1;
                    display_tags();
                    display_grps();
                }
                else {
                    alert(res.msg);
                }
            });
    }

    function add_grp() {
        let new_grp = $("#input-grp").val();
        // filter in
        let regex = /^[\d]+$/;
        if (!regex.test(new_grp)) {
            alert("Invalid Input! Only digits please. ");
        }
        else {
            $.post("./api/joinGrp.php", { grp_id: new_grp }, function (data) {
                res = JSON.parse(data);
                if (res.success) {
                    act_grp = -1;
                    display_tags();
                    display_grps();
                }
                else {
                    alert(res.msg);
                }

            });

        }
    }
}


/********************************  funtions on event operations  ********************************/
{

    function edit_event(event_id) {
        cur_editing = event_id;
        document.getElementById("editEvent").style.display = "block";
        // prepare tags for event to be added
        $.post("./api/getTag.php", {}, function (data) {
            tags = JSON.parse(data);
            let tags_info = "";
            // default tag: "None" tag
            tags_info += '<option>None</option>'
            for (let i in tags) {
                cur_tag = tags[i];
                tags_info += '<option> ' + cur_tag + ' </option>'
            }
            // prepare tags
            $("#new_tag").html(tags_info);

            // prepare groups
            $.post("./api/getGrp.php", {}, function (data) {
                groups = JSON.parse(data);
                let grps_info = "";

                for (let i in groups) {
                    cur_grp = groups[i];
                    grps_info += '<option value="' + cur_grp.grp_id + '"> ' + cur_grp.grp_name + ' </option>'
                }
                // prepare groups
                $("#new_group").html(grps_info);
                // console.log('edit test', event_id);

                // display current event information
                $.post("./api/getEventDetail.php", { event_id: event_id }, function (data) {
                    event_detail = JSON.parse(data);
                    // update event content in your input area
                    document.getElementById("new_title").value = event_detail.title;
                    document.getElementById("new_description").value = event_detail.description;
                    document.getElementById("new_date").value = event_detail.date;
                    document.getElementById("new_tag").value = event_detail.tag_name;
                    document.getElementById("new_group").value = event_detail.grp_id;

                })
            });

        });

    }


    function delete_event(event_id) {
        console.log('del_test', event_id);
        let token = $("#token").val();
        $.post("./api/delEvent.php", { event_id: event_id, token:token}, function (data) { 
            display_events(); 
            alert(JSON.parse(data));
        });//token:token
    }

    function share_event(event_id) {
        console.log('share_test', event_id);
        let hash_id = md5(event_id);
        // float window for showing event_share_code
        document.getElementById("event-share-code-box").style.display = "block";
        console.log()
        document.getElementById("event-share-body").innerHTML = '<p id="event-share-code">' + hash_id + '</p>';


        // update share code to database
        $.post("./api/updateEshareCode.php", { event_id: event_id, event_id: event_id }, function (data) { });//token:token
    }



    // onclick event item
    function onclick_event_item() {
        $(".event-item").each(
            function () {
                // add edit_event listener on event item
                this.children[1].onclick = function () {
                    edit_event(this.parentNode.value);
                }

                // add delete_event listerner on event item
                this.children[3].onclick = function () {
                    delete_event(this.parentNode.value);
                }

                // add share_event listerner on event item
                this.children[4].onclick = function () {
                    share_event(this.parentNode.value);
                }

            }
        )
    }
}

let act_grp = -1;
// $.post("./check_ajax.php", {}, function (data) {
//     res = JSON.parse(data);
//     if (res.success) {

/*********************************************************************
 * 
 * category/tag function  
 * 
 ********************************************************************/

// display_tags();

// add tag_name into database

/*********************************************************************
 * 
 *   group function  
 * 
 ********************************************************************/




// display_grps();

/*********************************************************************
 * 
 * on click funtion on grp element; 
 * 
 ********************************************************************/


// get the event element
let myGroup = document.getElementById('myGroup');

// onclick add event button
document.getElementById("addGroup").onclick = function () {
    myGroup.style.display = "block";

}

// add group into database

$("#save_grp").click(function () {
    let grp_name = $("#grp_name").val();
    let grp_id = $("#grp_share_code").val();
    $.post("./api/addGrp.php", { grp_name: grp_name, grp_id: grp_id },
        function (data) {
            res = JSON.parse(data);
            if (!res.isLogin) {
                alert("Please login first! ");
            }
            else {
                let isExistGrpid = res.isExistGrpid;
                if (!isExistGrpid) {
                    myGroup.style.display = "none";
                    display_grps();
                } else {
                    alert("Duplicated group ID! Please try another group code")
                }

            }
        })
})


/*********************************************************************
 * 
 *   event function  
 * 
 ********************************************************************/




// store current being edited event
let cur_editing = -1


$("#update").click(function () {
    // check empty
    // filter in
    let title = $("#new_title").val();
    let description = $("#new_description").val();
    let date = $("#new_date").val();

    let regex = /.+/;
    if (!regex.test(title) || !regex.test(description) || !regex.test(date)) {
        console.log(regex.test(title));
        console.log(regex.test(description));
        console.log(regex.test(date))
        console.log(description);
        alert("Invalid Input! Input some words please. ");
    }
    else {
        let tag = $("#new_tag").val();
        let grp_id = $("#new_group").val();
        token = $("#token").val();
        $.post("./api/editEvent.php", {
            title: title, description: description, token:token,
            date: date, tag: tag, grp_id: grp_id, event_id: cur_editing
        }, function (data) {
            alert(JSON.parse(data));
            console.log(JSON.parse(data));
            display_events();
            document.getElementById('editEvent').style.display = "none";
        })
    }
})

// onlick share event button
document.getElementById("shareEvent").onclick = function () {

    document.getElementById("addShareEvent").style.display = "block";
}

// onlick save share event button
document.getElementById("save_shared_event").onclick = function () {
    const input_share_code = $("#input-eShareCode").val();
    console.log(input_share_code);
    token = $("#token").val();
    $.post("./api/addEventbyShareCode.php", { share_code: input_share_code, token: token }, function (data) { 
        if(data=='null'){
            alert("added shared event successfully! ");
            display_tags();
        }
        else
            alert(JSON.parse(data));
    });//token:token
    document.getElementById("addShareEvent").style.display = "none";

}





// get the event element
let myEvent = document.getElementById('myEvent');

// onclick add event button
document.getElementById("addEvent").onclick = function () {
    myEvent.style.display = "block";
    // prepare tags for event to be added
    $.post("./api/getTag.php", {}, function (data) {
        tags = JSON.parse(data);
        let tags_info = "";
        // default tag: "None" tag
        tags_info += '<option>None</option>'
        for (let i in tags) {
            cur_tag = tags[i];
            tags_info += '<option> ' + cur_tag + ' </option>'
        }
        $("#tag").html(tags_info);
    });
    // prepare groups for event to be added
    $.post("./api/getGrp.php", {}, function (data) {
        grps = JSON.parse(data);
        let grps_info = "";
        for (let i in grps) {
            cur_grp = grps[i];
            grps_info += '<option value = "' + cur_grp.grp_id + '"> ' + cur_grp.grp_name + ' </option>'
        }
        $("#group").html(grps_info);
        
    });
}


// click on <span> (x), close float window
$(".close").each(function () {
    this.onclick = function () {
        myEvent.style.display = "none";
        document.getElementById("editEvent").style.display = "none";
        document.getElementById("myGroup").style.display = "none";
        document.getElementById("addShareEvent").style.display = "none";
        document.getElementById("event-share-code-box").style.display = "none";


    }
})

// close the float window, when click other place. 
window.onclick = function (event) {

    if (event.target == myEvent) {
        myEvent.style.display = "none";
    }
    if (event.target == document.getElementById("editEvent")) {
        document.getElementById("editEvent").style.display = "none";
    }
    if (event.target == document.getElementById("myGroup")) {
        document.getElementById("myGroup").style.display = "none";
    }
    if (event.target == document.getElementById("addShareEvent")) {
        document.getElementById("addShareEvent").style.display = "none";
    }
    if (event.target == document.getElementById("event-share-code-box")) {
        document.getElementById("event-share-code-box").style.display = "none";
    }
}

// add event into database

$("#save").click(function () {
    // check empty
    // filter in
    let title = $("#event_title").val();
    let description = $("#event_description").val();
    let date = $("#event_date").val();

    let regex = /.+/;
    if (!regex.test(title) || !regex.test(description) || !regex.test(date)) {
        alert("Invalid Input! Input some words please. ");
    }
    else {
        let tag = $("#tag").val();
        let grp_id = $("#group").val();
        // CSRF
        token = $("#token").val();
        $.post("./api/addEvent.php", {
            title: title, description: description,
            date: date, tag: tag, grp_id: grp_id,
            token: token
        }, function (data) {
            alert(JSON.parse(data));
            // alert(JSON.parse(data));
            display_events();
            document.getElementById('myEvent').style.display = "none";
        })
    }
})
