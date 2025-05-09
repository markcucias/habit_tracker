document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("habitForm");
  const input = document.getElementById("habitInput");
  const listContainer = document.getElementById("habitList");
  const message = document.getElementById("message");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // prevents page reload

    const habit = input.value.trim().toLowerCase();
    console.log("Submitted habit:", habit);
    const response = fetch("http://127.0.0.1:5000/habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"name": habit})
    })
    .then( response => {
        if (response.ok) {
        message.textContent = "Habit added!";
        message.style.color = "green";
        setTimeout(() => {
            message.textContent = "";
        }, 2500)
        load_habits();
        } else {
            return response.json().then( data => {
                message.textContent = data.error || "Something went wrong";
                message.style.color = "red";
                setTimeout(() => {
                message.textContent = "";
            }, 2500)
            });
        }

    });
    input.value = "";

    function load_habits() {
        fetch("http://127.0.0.1:5000/habit", {method: "GET"})
        .then(response => response.json())
        .then (data => {
            const habits = data.habits;
            listContainer.innerHTML = "";
            habits.forEach(habit => {
                // Create the list item (one row in the habit list)
                const element = document.createElement("li");
                element.className = "list-group-item"; // base style

                // Create the inner row: habit text + button in one line
                const row = document.createElement("div");
                row.className = "d-flex justify-content-between align-items-center";

                // Create the habit text span
                const habitText = document.createElement("span");
                habitText.textContent = habit;
                habitText.className = "text-capitalize"; // optional, capitalizes habit

                // Create the Done button
                const btn = document.createElement("button");
                btn.textContent = "Done!";
                btn.className = "btn btn-outline-success btn-sm";

                // Add habit text and button to row
                row.appendChild(habitText);
                row.appendChild(btn);

                // Add row to list item
                element.appendChild(row);

                // Create the feedback span (goes below the row)
                const feedback = document.createElement("div");
                feedback.style.height = "20px";
                feedback.style.marginTop = "4px";
                feedback.style.fontSize = "0.9rem";
                feedback.style.textAlign = "right";

                // Add feedback span to list item
                element.appendChild(feedback);

                // Add full list item to the container
                listContainer.appendChild(element);

                btn.addEventListener("click", function () {
                   fetch("http://127.0.0.1:5000/checkin", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({"name": habit})
                   })
                   .then( response => {
                        if (response.ok) {
                        feedback.textContent = "Great job!";
                        feedback.style.color = "green";
                        setTimeout(() => {
                            feedback.textContent = "";
                        }, 2500);
                        } else {
                            return response.json().then( data => {
                                feedback.textContent = data.error || "Already done";
                                feedback.style.color = "red";
                                setTimeout(() => {
                                    feedback.textContent = "";
                                }, 2500);
                            });
                        }

                    });
                });

                  listContainer.appendChild(element);
            });
        })
    }

  });
});
