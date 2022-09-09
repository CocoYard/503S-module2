
// register.js
function registerAjax(event) {
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password };

    fetch("register_ajax.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => alert(data.success ? "You've been signed up!" : `${data.message}`))
        .catch(err => console.error(err));
}



document.getElementById("register").addEventListener("click", registerAjax, false); // Bind the AJAX call to button click


function logoutAjax(event) {

    fetch("logout_ajax.php", {
        method: 'POST'
    })
        .then(response => response.json())
        .then((data) => {
            if (data.success) {
                $(".login").show("slow");
                alert("You've been logged out!");
                document.getElementById("welcome").innerHTML = ' <div class="login">    \
                <input placeholder="Username" id="username" /><input placeholder="Password" \
                id="password" type="password"/> <div id="login_register">              \
                <button id="login">login</button><button id="register">register</button></div></div>';

document.getElementById("login").addEventListener("click", loginAjax, false); // Bind the AJAX call to button click

document.getElementById("register").addEventListener("click", registerAjax, false); // Bind the AJAX call to button click

                display_tags();
                display_grps();
            }
            else {
                alert(`You were not logged out! `)
            }
        }
        )
        .catch(err => console.error(err));
}

function loginAjax(event) {
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password };

    fetch("login_ajax.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
        .then(response => response.json())
        .then((data) => {
            if (data.success) {


                $(".login").hide("slow");
                alert("You've been logged in!");
                document.getElementById("welcome").innerHTML = "<h1>Hello! " + data.username + "</h1>" + "<button id = 'logout'>logout</button>"+ "<input id='token' hidden='true' value = '" + data.token + "'> </input>";
                console.log(data.token);
                document.getElementById("logout").addEventListener("click", logoutAjax, false); // Bind the AJAX call to button click
                display_tags();
                display_grps();

            }
            else {
                alert(`You were not logged in! ${data.message}`)
            }
        }
        )
        .catch(err => console.error(err));
}

document.getElementById("login").addEventListener("click", loginAjax, false); // Bind the AJAX call to button click


(function () {
    // console.log("act_grp", act_grp);
    act_grp = -1;
    fetch("check_ajax.php")
        .then(response => response.json())
        .then((data) => {
            if (data.success) {
                $(".login").hide("slow");
                // console.log(data);
                document.getElementById("welcome").innerHTML = "<h1>Hello! " + data.username + "</h1>" + "<button id = 'logout'>logout</button>" + "<input id='token' hidden='true' value = '" + data.token + "'> </input>";;
                document.getElementById("logout").addEventListener("click", logoutAjax, false); // Bind the AJAX call to button click
                console.log(data.token);

                display_tags();
                display_grps();

            }
        })
        .catch(err => console.error(err));
})()