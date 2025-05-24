document.addEventListener("DOMContentLoaded", function () {
    const userList = document.getElementById("userList");
    const userInput = document.getElementById("newUserInput");
    const userPassword = document.getElementById("newUserPassword");
    const form = document.getElementById("newUserForm");
    const message = document.getElementById("message");



    function load_users() {
        fetch("http://127.0.0.1:5000/user", { method: "GET" })
            .then(response => response.json())
            .then(data => {
                const users = data.users;
                userList.innerHTML = "";
                users.forEach(user => {
                    // Create the list item (one row in the habit list)
                    const element = document.createElement("li");
                    element.className = "list-group-item"; // base style

                    // Create the inner row: habit text + button in one line
                    const row = document.createElement("div");
                    row.className = "d-flex justify-content-between align-items-center";

                    // Create the habit text span
                    const userText = document.createElement("span");
                    userText.textContent = user;
                    userText.className = "text-capitalize"; // optional, capitalizes habit

                    // Create a group for buttons
                    const buttonGroup = document.createElement("div");
                    buttonGroup.className = "d-flex gap-2";

                    // Create the Choose button
                    const btn = document.createElement("button");
                    btn.textContent = "Choose";
                    btn.className = "btn btn-outline-success btn-sm";

                    // Create the Delete button
                    const dlt = document.createElement("button");
                    dlt.innerHTML = '<i class="bi bi-trash"></i>';
                    dlt.className = "btn btn-outline-success btn-sm";

                    // Add habit text and button to row
                    row.appendChild(userText);

                    buttonGroup.appendChild(btn);
                    buttonGroup.appendChild(dlt);

                    row.appendChild(buttonGroup);

                    // Add row to list item
                    element.appendChild(row);

                    // Add full list item to the container
                    userList.appendChild(element);

                    btn.addEventListener("click", function () {
                        localStorage.setItem("user", user);
                        location.href = "http://127.0.0.1:5000/password";
                    });

                    dlt.addEventListener("click", function () {
                        fetch("http://127.0.0.1:5000/user", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ "user": user })
                        })
                            .then(response => {
                                if (response.ok) {
                                    load_users();
                                } else {
                                    alert("Something went wrong, please try clearing the history again");
                                }

                            });
                    });

                });
            })
            .catch(error => console.error("Error loading users:", error));
    }


    form.addEventListener("submit", function (event) {
        event.preventDefault(); // prevents page reload

        const user = userInput.value.trim().toLowerCase();
        const password = userPassword.value;
        console.log("Submitted user:", user);
        const response = fetch("http://127.0.0.1:5000/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "name": user, "password": password })
        })
            .then(response => {
                return response.json().then(data => {
                    if (response.ok) {
                        message.textContent = data.message || "User added";
                        message.style.color = "green";
                        setTimeout(() => {
                            message.textContent = "";
                        }, 2500)
                        load_users();
                    } else {
                        return response.json().then(data => {
                            message.textContent = data.error || "Something went wrong";
                            message.style.color = "red";
                            setTimeout(() => {
                                message.textContent = "";
                            }, 2500)
                        });
                    }
                });

            });
        userInput.value = "";
        userPassword.value = "";

    });



    load_users();
});