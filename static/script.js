document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("habitForm");
  const input = document.getElementById("habitInput");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // prevents page reload

    const habit = input.value.trim().toLowerCase();
    console.log("Submitted habit:", habit);
    fetch("http://127.0.0.1:5000/habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"name": habit})
    });
  });
});
