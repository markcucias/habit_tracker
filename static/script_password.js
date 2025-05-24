document.addEventListener("DOMContentLoaded", function () {
    const back = document.getElementById("back-button");
    const password = document.getElementById("passwordInput");
    const button = document.getElementById("button");
    const message = document.getElementById("message");
    const username = localStorage.getItem("user");

    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
    const welcomeUsername = capitalize(localStorage.getItem("user"));
    const welcome = document.getElementById("welcomeText");
    welcome.textContent = welcomeUsername + ", enter your password";

    back.addEventListener("click", function () {
        localStorage.removeItem("user");
        location.href = "/";
    });

    button.addEventListener("click", function (event) {
        event.preventDefault();
        fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "user": username, "password": password.value })
        })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200) {
                    window.location.href = "/home";
                } else {
                    message.textContent = body.error;
                    message.style.color = "red";
                }
            })
            .catch(err => {
                message.textContent = "Something went wrong.";
                message.style.color = "red";
            });
    });
});
