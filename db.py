import sqlite3

def get_connection():
    db = sqlite3.connect("habits.db")
    db.execute("PRAGMA foreign_keys = ON")
    return db

def create_tables():
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS habits(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
            );
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS checkins(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        );
    ''')

    db.commit()
    db.close()


def insert_habit(name):
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO habits(name) values (?);
    ''', (name,))
    db.commit()
    db.close()


def get_all_habits():
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT name FROM habits;
    ''')
    rows = res.fetchall()
    db.close()
    return rows


def get_habit_by_name(name):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT id FROM habits
        WHERE name=?;
    ''', (name,))
    habit = res.fetchone()
    db.close()
    return habit


def insert_checkin(habit_id, date):
    db = get_connection()
    cur = db.cursor()
    cur.execute('''
        INSERT INTO checkins(habit_id, date) VALUES (?, ?)
    ''', (habit_id, date))
    db.commit()
    db.close()


def checkin_exists(habit_id, date):
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT id FROM checkins
        WHERE habit_id=? AND date=?;
    ''', (habit_id, date))
    checkin = res.fetchone()
    db.close()
    return checkin is not None


def get_all_checkins():
    db = get_connection()
    cur = db.cursor()
    res = cur.execute('''
        SELECT checkins.date, habits.name
        FROM checkins
        JOIN habits ON checkins.habit_id=habits.id
    ''')
    checkins = res.fetchall()
    db.close()
    return checkins