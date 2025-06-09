import sqlite3 as sql
from flask import Flask, request, jsonify, send_from_directory, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from flask_cors import CORS
from flask_session import Session 
from contextlib import contextmanager
import re
import sys, os
import bcrypt
import json
sys.path.append('API')
import API 


tempuser = 0
# to make flask print in the terminal in vsc
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
os.environ["PYTHONUNBUFFERED"] = "1"

# this is to stop all the CORS errors ive been getting
app = Flask(__name__, static_folder="planora/dist")
app.secret_key = "planora"
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

app.config["SESSION_TYPE"] = "filesystem"  # Ensures Flask-Session works
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config['FLASK_ENV'] = 'development'
#starting a session which is where the user_id is held which we use to get everything
Session(app) 

login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

    @staticmethod
    def get(user_id):
        with get_db() as conn:
            c = conn.cursor()
            c.execute("SELECT id FROM Users WHERE id = ?", (user_id,))
            user = c.fetchone()
            return User(user_id) if user else None

@login_manager.user_loader
def load_user(user_id):
    user = User.get(user_id)
    return user if user else None

# Context manager for database connections
@contextmanager
def get_db():
    conn = sql.connect("Planora.db")
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        conn.commit()
        conn.close()

# Initialize database tables
def init_db():
    with get_db() as conn:
        c = conn.cursor()
        
        c.execute("""
        CREATE TABLE IF NOT EXISTS Users (
            id integer PRIMARY KEY AUTOINCREMENT,
            email text,
            password text,
            profile_pic text,
            name text
        )""")

        c.execute("""
        CREATE TABLE IF NOT EXISTS Tasks (
            id integer PRIMARY KEY AUTOINCREMENT,
            user_id integer,
            task_name text,
            priority integer, 
            status integer,
            time_slot text,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )""")

        c.execute("""
        CREATE TABLE IF NOT EXISTS Settings (
            id integer PRIMARY KEY AUTOINCREMENT,
            user_id integer,
            calendar_url text, 
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE 
        )""")

def auth_creds(email):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM Users WHERE email = ?", (email,))  # Note the comma after email
        return c.fetchone() is not None

def table_insert(email, password, name):
    if not auth_creds(email):
        with get_db() as conn:
            c = conn.cursor()
            c.execute("""
            INSERT INTO Users (email, password, name) 
            VALUES (?, ?, ?)
            """, (email, password, name))
            return jsonify({"message": "User added successfully"}), 201
    return jsonify({"message": "User already exists"}), 400

def change_name(user_id, new_name):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
        UPDATE Users SET name = ?
        WHERE id = ?
        """, (new_name, user_id))

def email_validation(email):
    email_add = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_add, email) is not None

def password_validation(password):
    if len(password) < 8 or len(password) > 64:
        return False, jsonify({"message": "Password must be at least 8 characters long."})
    
    if not re.search(r"[A-Z]", password):
        return False, jsonify({"message":"Password must contain at least one uppercase letter."})

    if not re.search(r"[a-z]", password):
        return False, jsonify({"message":"Password must contain at least one lowercase letter."})

    if not re.search(r"\d", password):
        return False, jsonify({"message":"Password must contain at least one number."})

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, jsonify({"message":"Password must contain at least one special character."})

    return True, jsonify({"message": "Password is valid."})

def encrypt_pass(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode(), salt)
    return hashed_password

#return true or false depending on if the passwords match when logging in
def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode(), hashed_password)

def password_check(email, password):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT password FROM Users WHERE email = ?", (email,))
        outstring = c.fetchone()
        if outstring is None:
            return jsonify({"message": "The email address you entered isn't connected to an account."})
        
        outstring = outstring[0]
        if check_password(password, outstring):
            return jsonify({"message":"Login Successful"})
        else:
            return jsonify({"message":"Incorrect password. Please try again."})

def table_return():
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id, * FROM Users")
        return c.fetchall()
    

@app.route("/")
def serve_todo():
    return send_from_directory("todo2/dist", "index.html")

# Serve static files for todo2
@app.route("/assets/<path:path>")
def serve_todo_static(path):
    return send_from_directory("todo2/dist/assets", path)

# Serve the planora (login) app at /login
@app.route("/login")
def serve_login():
    return send_from_directory("planora/dist", "index.html")

# Serve static files for planora (login)
@app.route("/login/assets/<path:path>")
def serve_login_static(path):
    return send_from_directory("planora/dist/assets", path)


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401

@app.route('/call_api', methods=['GET'])
def call_api():
    with app.app_context(): 
        print("calling API and creating schedule")
        jsonfile = API.generate_schedule(1)  
        return jsonify({"message": "Schedule generated", "file": jsonfile})

@app.route('/schedule.json')
def serve_schedule():
    schedule_path = os.path.join(os.getcwd(), "schedule.json")
    
    if os.path.exists(schedule_path):
        return send_from_directory(os.getcwd(), "schedule.json")
    else:
        return "File not found", 404

@app.route('/insert_user', methods=['POST'])
def register_user():
    data = request.json

    email = data.get("email")
    if not email or not email_validation(email):
        return jsonify({'error': 'Invalid email address'}), 400
    
    password = data.get("password")
    valid, message = password_validation(password)
    if not valid:
        return jsonify({'error': message}), 400
    fpassword = encrypt_pass(password)
    
    name = data.get("name")
    
    return table_insert(email, fpassword, name)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id, password FROM Users WHERE email = ?", (email,))
        user = c.fetchone()

        if user is None:
            return jsonify({"message": "Email not registered"}), 400  

        user_id, hashed_password = user 

        if not bcrypt.checkpw(password.encode(), hashed_password): 
            return jsonify({"message": "Invalid credentials"}), 401
        
        user_obj = User(user_id)
        login_user(user_obj)

        session["user_id"] = user_id  # Ensure session stores user_id
        session.modified = True  # Forces session to be saved
        
        return jsonify({"message": "Login successful", "user_id": user_id})
    
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    user_id = session.get("user_id")

    # print(f"Request to delete task {task_id} for user {user_id}")  # Debugging

    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM Tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        c.execute("DELETE FROM Tasks WHERE id = ?", (task_id,))
        # print(f"Task {task_id} deleted successfully")
    
    return jsonify({"message": "Task deleted successfully"}), 200


@app.route('/check_session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        return jsonify({"user_id": session['user_id']}), 200  # Session is valid
    return jsonify({"message": "Not authenticated"}), 401  # Session is not valid

@app.route('/tasks', methods=['POST'])
@login_required
def add_tasks():
    user_id = session.get("user_id")
    data = request.json
    task_name = data.get("task_name")
    priority = data.get("priority", 0)
    status = data.get("status", 0)
    time_slot = data.get("time_slot", "temp")
    
    if not task_name: 
        return jsonify({"message": "Task name cannot be empty"}), 400
    
    with get_db() as conn:
        c = conn.cursor()
        c.execute("INSERT INTO Tasks (user_id, task_name, priority, status, time_slot) VALUES (?, ?, ?, ?, ?)",
                  (user_id, task_name, priority, status, time_slot))

    return jsonify({"message": "Tasks added successfully"}), 201

@app.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    global tempuser
    user_id = session.get('user_id')
    with open("userid.txt", "w") as f:
        f.write(str(user_id)) 
    
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    # print(f"Fetching tasks for user {user_id}", flush=True)  # Debugging line

    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id, task_name, priority, status, time_slot FROM Tasks WHERE user_id = ?", (user_id,))
        tasks = [{"id": row[0], "task_name": row[1], "priority": row[2],
                  "status": row[3], "time_slot": row[4]} for row in c.fetchall()]
    # print("Tasks retrieved from database:", tasks, flush=True)  # Debugging line
    return jsonify(tasks), 200

@app.route('/tasks/all', methods=['DELETE'])
@login_required
def clear_all_tasks():
    user_id = session.get("user_id")
    
    with get_db() as conn:
        c = conn.cursor()
        c.execute("DELETE FROM Tasks WHERE user_id = ?", (user_id,))
    
    return jsonify({"message": "All tasks deleted successfully"}), 200

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

@app.route('/save_url', methods=['GET'])
@login_required
def save_url():
    url = request.json
    user_id = session.get('user_id')
    with get_db() as conn:
        c = conn.cursor()
        c.execute("INSERT INTO Settings (user_id, calendar_url) VALUES (?, ?)", (user_id, url))

    return jsonify({"message": "URL added successfully"}), 201




if __name__ == '__main__':
    init_db()  # Initialize database tables when starting the app
    app.run(debug=True)

