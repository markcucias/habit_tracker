from collections import defaultdict

import app
from flask import Flask, request, jsonify, render_template
from datetime import datetime
from db import create_tables, insert_habit, get_all_active_habits, get_habit_by_name, checkin_exists, insert_checkin, get_all_checkins, delete_habit, delete_checkins, check_if_deleted, activate_habit, get_the_db

app = Flask(__name__)



@app.route("/", methods = ["GET"])
def home():
    return render_template("index.html")

@app.route("/habit", methods=["POST"])
def add_habit():
    data = request.get_json()
    new_habit = data.get("name")
    if not new_habit:
        return jsonify({"error": "The habit is invalid (most likely empty)"}), 400
    new_habit = new_habit.strip().lower()

    habit_info = get_habit_by_name(new_habit)
    if habit_info:
        habit_id, deleted = habit_info
        if deleted:  # Reactivate if it was previously marked deleted
            activate_habit(new_habit)
            return jsonify({"message": f"The habit '{new_habit}' was reactivated successfully"}), 201
        else:
            return jsonify({"error": "The habit already exists"}), 400

    insert_habit(new_habit)
    return jsonify({"message": f"The habit '{new_habit}' was added successfully"}), 201




@app.route("/habit", methods=["GET"])
def retrieve_habits():
    habits = [row[0] for row in get_all_active_habits()]
    return jsonify({"habits": habits}), 200



@app.route("/habit", methods = ["DELETE"])
def delete_habit_route():
    data = request.get_json()
    habit = data.get("name")

    if not habit:
        return jsonify({"error": "Invalid input: empty habit"}), 400
    
    habit_row = get_habit_by_name(habit)
    if not habit_row:
        return jsonify({"error": "Habit doesn't exist"}), 404
    else:
        habit_id = habit_row[0]
        delete_habit(habit)
    return jsonify({"message": f"Habit '{habit}' was successfuly deleted"}), 200





@app.route("/checkin", methods = ["POST"])
def register_habit():
    data = request.get_json()
    habit = data.get("name")

    if not habit:
        return jsonify({"error": "The habit you are trying to check in is invalid (most likely empty)"}), 400
    habit = habit.strip().lower()

    habit_row = get_habit_by_name(habit)
    if not habit_row:
        return jsonify({"error": f"The habit '{habit}' does not exist. Please add it first using /habit."}), 400

    habit_id = habit_row[0]

    date = datetime.today().strftime('%Y-%m-%d')
    if checkin_exists(habit_id, date):
        return jsonify({"message": "You already checked in this habit today"}), 400

    insert_checkin(habit_id, date)
    return jsonify({
        "message": f"The habit '{habit}' was checked in successfully for {date}"
    }), 201


@app.route("/checkin", methods = ["GET"])
def retrieve_checkin():
    result = defaultdict(list)
    temp = get_all_checkins()
    checkins = [[checkin[0], checkin[1]] for checkin in temp]
    for date, name in checkins:
        result[date].append(name)
    return jsonify(result), 200


@app.route("/checkin/clear", methods = ["DELETE"])
def clear_checkins():
    delete_checkins()
    return jsonify({"message": "The checkin history was successfuly deleted"}), 200




if __name__ == "__main__":
    create_tables()
    print(get_the_db())
    app.run(debug=True)