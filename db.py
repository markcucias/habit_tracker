import sqlite3


# Functions for setting up the database and tables
def get_connection():
    db = sqlite3.connect("habits.db", timeout=10)
    db.execute("PRAGMA foreign_keys = ON")
    return db

def create_tables():
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS habits(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            deleted BOOLEAN,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE (name, user_id)
            );
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS checkins(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL        
        );
    ''')

    db.commit()
    db.close()




# Functions for working with (inserting and getting) users
def insert_user(name):
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO users(name) VALUES (?);
    ''', (name,))
    db.commit()
    db.close()


def get_users():
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT name FROM users;
    ''')
    rows = res.fetchall()
    db.close()
    return rows






# Functions for working with (inserting and getting) habits
def insert_habit(name, user_id):
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO habits(name, user_id, deleted) VALUES (?, ?, FALSE);
    ''', (name, user_id))
    db.commit()
    db.close()


def activate_habit(name, user_id):
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        UPDATE habits
        SET deleted = FALSE
        WHERE name = ? AND user_id = ?;
    ''', (name, user_id))
    db.commit()
    db.close()




def get_all_active_habits(user_id):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT name FROM habits WHERE deleted = FALSE AND user_id = ?;
    ''', (user_id, ))
    rows = res.fetchall()
    db.close()
    return rows




# Helper functions for checkins, user etc.
def get_habit_by_name(name, user_id):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT id, deleted FROM habits WHERE name = ? AND user_id = ?;
    ''', (name, user_id))
    habit = res.fetchone()
    db.close()
    return habit  # returns (id, deleted) or None


def get_user_by_name(name):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT id FROM users WHERE name = ?;
    ''', (name,))
    user = res.fetchone()
    db.close()
    return user



def check_if_deleted(name):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT deleted FROM habits
        WHERE name=?;
    ''', (name,))
    deleted = res.fetchone()
    db.close()
    return deleted


def insert_checkin(habit_id, user_id, date):
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO checkins(habit_id, user_id, date) VALUES (?, ?, ?)
    ''', (habit_id, user_id, date))
    db.commit()
    db.close()


def checkin_exists(habit_id, user_id, date):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT id FROM checkins
        WHERE habit_id=? AND date=? AND user_id = ?;
    ''', (habit_id, date, user_id))
    checkin = res.fetchone()
    db.close()
    return checkin is not None


def get_all_checkins(user_id):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT checkins.date, habits.name
        FROM checkins
        JOIN habits ON checkins.habit_id=habits.id
        WHERE checkins.user_id = ?
    ''', (user_id, ))
    checkins = res.fetchall()
    db.close()
    return checkins



#Delete functions
def delete_checkins(user_id):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        DELETE FROM checkins
        WHERE user_id = ?
    ''', (user_id, ))
    db.commit()
    db.close()
    return

def delete_habit(name, user_id):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        UPDATE habits
        SET deleted = TRUE
        WHERE name = ? AND user_id = ?;
    ''', (name, user_id))
    db.commit()
    db.close()
    return