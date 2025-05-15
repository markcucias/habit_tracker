document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("habitForm");
    const input = document.getElementById("habitInput");
    const listContainer = document.getElementById("habitList");
    const message = document.getElementById("message");



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

                // Create a group for buttons
                const buttonGroup = document.createElement("div");
                buttonGroup.className = "d-flex gap-2";

                // Create the Done button
                const btn = document.createElement("button");
                btn.textContent = "Done!";
                btn.className = "btn btn-outline-success btn-sm";

                // Create the Delete button
                const dlt = document.createElement("button");
                dlt.innerHTML = '<i class="bi bi-trash"></i>';
                dlt.className = "btn btn-outline-success btn-sm";

                // Add habit text and button to row
                row.appendChild(habitText);

                buttonGroup.appendChild(btn);
                buttonGroup.appendChild(dlt);

                row.appendChild(buttonGroup);

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

                dlt.addEventListener("click", function () {
                  fetch("http://127.0.0.1:5000/habit", {
                       method: "DELETE",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({"name": habit})
                  })
                  .then( response => {
                       if (response.ok) {
                        load_habits();
                        load_all_checkin();
                       } else {
                           return response.json().then( data => {
                               feedback.textContent = data.error;
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


    document.getElementById("reload").addEventListener("click", function (event) {
        event.preventDefault();
        load_habits();
        load_all_checkin();
      });

    function load_checkin_for_date(date) {
        fetch("http://127.0.0.1:5000/checkin", { method: "GET" })
          .then(response => response.json())
          .then(data => {
            const history = document.getElementById("checkinHistory");
            history.innerHTML = "";
      
            if (!data[date]) {
              history.textContent = "No check-ins for this date.";
              return;
            }
      
            const habits = data[date];
      
            // Create table
            const table = document.createElement("table");
            table.className = "table table-bordered";
      
            // Table header
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
      
            const dateHeader = document.createElement("th");
            dateHeader.textContent = "Date";
      
            const habitsHeader = document.createElement("th");
            habitsHeader.textContent = "Habits Completed";
      
            headerRow.appendChild(dateHeader);
            headerRow.appendChild(habitsHeader);
            thead.appendChild(headerRow);
            table.appendChild(thead);
      
            // Table body
            const tbody = document.createElement("tbody");
            const row = document.createElement("tr");
      
            const dateCell = document.createElement("td");
            dateCell.textContent = date;
      
            const habitsCell = document.createElement("td");
            habitsCell.textContent = habits.join(", ");
      
            row.appendChild(dateCell);
            row.appendChild(habitsCell);
            tbody.appendChild(row);
      
            table.appendChild(tbody);
            history.appendChild(table);
          });
      }
      


    function load_all_checkin() {
        fetch("http://127.0.0.1:5000/checkin", { method: "GET" })
          .then(response => response.json())
          .then(data => {
            const history = document.getElementById("checkinHistory");
            history.innerHTML = "";
      
            // Create table
            const table = document.createElement("table");
            table.className = "table table-bordered";
      
            // Table header
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
      
            const dateHeader = document.createElement("th");
            dateHeader.textContent = "Date";
      
            const habitsHeader = document.createElement("th");
            habitsHeader.textContent = "Habits Completed";
      
            headerRow.appendChild(dateHeader);
            headerRow.appendChild(habitsHeader);
            thead.appendChild(headerRow);
            table.appendChild(thead);
      
            // Table body
            const tbody = document.createElement("tbody");
      
            Object.keys(data).sort().reverse().forEach(date => {
              const row = document.createElement("tr");
      
              const dateCell = document.createElement("td");
              dateCell.textContent = date;
      
              const habitsCell = document.createElement("td");
              const habits = data[date];
              habitsCell.textContent = habits.join(", ");
      
              row.appendChild(dateCell);
              row.appendChild(habitsCell);
              tbody.appendChild(row);
            });
      
            table.appendChild(tbody);
            history.appendChild(table);
          });
      }
      

    document.getElementById("dateForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const btn = event.submitter.id;
        if (btn == "custom") {
            const date = document.getElementById("datePicker").value;
            if (!date) {
              alert("Please select a date");
              return;
            } 
            load_checkin_for_date(date);
        } else if (btn == "all") {
            load_all_checkin();
        }
      });


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
        load_all_checkin();
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

  });


});
