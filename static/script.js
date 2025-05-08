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
                const element = document.createElement("li");
                element.textContent = habit;

                const feedback = document.createElement("span");
                feedback.style.marginLeft = "10px";

                const btn = document.createElement("button");
                btn.textContent = "Done!";
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
                                feedback.textContent = data.error || (habit + " is already completed for today");
                                feedback.style.color = "red";
                                setTimeout(() => {
                                    feedback.textContent = "";
                                }, 2500);
                            });
                        }

                    });
                });

                element.appendChild(btn);
                element.appendChild(feedback);
                listContainer.appendChild(element);
            });
        })
    }

  });
});
