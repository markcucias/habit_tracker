from collections import defaultdict

import app
from flask import Flask, request, jsonify, render_template
from datetime import datetime
import db

app = Flask(__name__)


# Home function
@app.route("/", methods = ["GET"])
def home():
    return render_template("user.html")


@app.route("/home", methods = ["GET"])
def home1():
    return render_template("index.html")

# Functions for /user

# POST
@app.route("/user", methods=["POST"])
def add_user():
    data = request.get_json()
    new_user = data.get("name")
    if not new_user:
        return jsonify({"error": "The user is invalid (most likely empty)"}), 400
    new_user = new_user.strip().lower()

    user = db.get_user_by_name(new_user)
    if user:
        return jsonify({"error": "The user already exists"}), 400

    db.insert_user(new_user)
    return jsonify({"message": f"The user '{new_user}' was added successfully"}), 201


# GET
@app.route("/user", methods=["GET"])
def retrieve_users():
    users = [row[0] for row in db.get_users()]
    return jsonify({"users": users}), 200




# Functions for /habit

# POST
@app.route("/habit", methods=["POST"])
def add_habit():
    data = request.get_json()
    new_habit = data.get("name")
    name = data.get("user")
    
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400
    
    if not new_habit:
        return jsonify({"error": "The habit is invalid (most likely empty)"}), 400
    
    new_habit = new_habit.strip().lower()


    habit_info = db.get_habit_by_name(new_habit, user_id)
    if habit_info:
        habit_id, deleted = habit_info
        if deleted:  # Reactivate if it was previously marked deleted
            db.activate_habit(new_habit, user_id)
            return jsonify({"message": f"The habit '{new_habit}' was reactivated successfully"}), 201
        else:
            return jsonify({"error": "The habit already exists"}), 400

    db.insert_habit(new_habit, user_id)
    return jsonify({"message": f"The habit '{new_habit}' was added successfully for the user {name}"}), 201


# GET
@app.route("/habit", methods=["GET"])
def retrieve_habits():
    name = request.args.get("user")
    
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400
    
    habits = [row[0] for row in db.get_all_active_habits(user_id)]
    return jsonify({"habits": habits}), 200

# DELETE
@app.route("/habit", methods = ["DELETE"])
def delete_habit_route():
    data = request.get_json()
    name = data.get("user")
    habit = data.get("name")

    if not habit:
        return jsonify({"error": "Invalid input: empty habit"}), 400
    
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400
    
    habit_row = db.get_habit_by_name(habit, user_id)
    if not habit_row:
        return jsonify({"error": "Habit doesn't exist"}), 404
    else:
        habit_id = habit_row[0]
        db.delete_habit(habit, user_id)
    return jsonify({"message": f"Habit '{habit}' was successfuly deleted"}), 200






# Functions for /checkin

# POST
@app.route("/checkin", methods = ["POST"])
def register_habit():
    data = request.get_json()
    habit = data.get("name")
    name = data.get("user")
    
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400

    if not habit:
        return jsonify({"error": "The habit you are trying to check in is invalid (most likely empty)"}), 400
    habit = habit.strip().lower()

    habit_row = db.get_habit_by_name(habit, user_id)
    if not habit_row:
        return jsonify({"error": f"The habit '{habit}' does not exist for {name}. Please add it first using /habit."}), 400

    habit_id = habit_row[0]

    date = datetime.today().strftime('%Y-%m-%d')
    if db.checkin_exists(habit_id, user_id, date):
        return jsonify({"message": "You already checked in this habit today"}), 400

    db.insert_checkin(habit_id, user_id, date)
    return jsonify({
        "message": f"The habit '{habit}' was checked in successfully for {name} on {date}"
    }), 201


# GET
@app.route("/checkin", methods = ["GET"])
def retrieve_checkin():
    name = request.args.get("user")
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400
    
    result = defaultdict(list)
    temp = db.get_all_checkins(user_id)
    checkins = [[checkin[0], checkin[1]] for checkin in temp]
    for date, name in checkins:
        result[date].append(name)
    return jsonify(result), 200


# DELETE
@app.route("/checkin/clear", methods = ["DELETE"])
def clear_checkins():
    data = request.get_json()
    name = data.get("user")
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400
    
    db.delete_checkins(user_id)
    return jsonify({"message": f"The checkin history was successfuly deleted for {name}"}), 200





# Function for the progress bar
@app.route("/progress", methods = ["GET"])
def get_progress():
    name = request.args.get("user")
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400
    
    habits = [row[0] for row in db.get_all_active_habits(user_id)]
    active_amount = len(habits)

    date = datetime.today().strftime('%Y-%m-%d')
    checkins = db.get_all_checkins(user_id)
    checkins_for_today = [[checkin[0], checkin[1]] for checkin in checkins if (checkin[0]==date and checkin[1] in habits)]
    checkin_amount = len(checkins_for_today)
    return jsonify({"total": active_amount, "completed": checkin_amount}), 200


@app.route("/stats", methods=["GET"])
def get_stats():
    name = request.args.get("user")
    user_id = check_get_user_id(name)
    if user_id is None:
        return jsonify({"error": "The user name is invalid"}), 400
    
    checkins = db.get_all_checkins(user_id)
    stats = defaultdict(int)

    for date, _ in checkins:
        stats[date] += 1

    return jsonify(dict(stats)), 200



def check_get_user_id(name):
    if not name:
        return None
    
    user = db.get_user_by_name(name)
    if user:
        return user[0]
    return None



if __name__ == "__main__":
    db.create_tables()
    app.run(debug=True)