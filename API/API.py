import os, json, re, requests, sqlite3, sys
from datetime import datetime, timedelta, timezone
from ics import Calendar
from dotenv import load_dotenv
from groq import Groq
import sqlite3 as sql



def user_tasks():
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    with open("userid.txt", "r") as f:
        user_id = f.read().strip()
        with sql.connect("Planora.db") as conn:
            c = conn.cursor()
            c.execute("SELECT task_name FROM Tasks WHERE user_id = ?", (user_id,))
            tasks = c.fetchall()
            cleaned_tasks = [task[0] for task in tasks]
    print(cleaned_tasks)
    return cleaned_tasks


def Cal_intake():
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    with open("userid.txt", "r") as f:
        user_id = f.read().strip()
        with sql.connect("Planora.db") as conn:
                c = conn.cursor()
                c.execute("SELECT calendar_url FROM Settings WHERE user_id = ?", (user_id,))
                calendar_url = c.fetchone()

    if calendar_url:
        response = requests.get(calendar_url)
        if response.status_code == 200:
            calendar_data = response.text
        else:
            print("Failed to fetch the calendar.")
            exit()

        # Parse the calendar
        calendar = Calendar(calendar_data)

        # Calculate start and end of the current day
        today = datetime.now(timezone.utc)
        start_of_day = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = today.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Extract lectures for today
        lectures_today = []
        for event in calendar.events:
            event_start = event.begin.datetime  # Event start time
            if start_of_day <= event_start <= end_of_day:
                lecture = {
                    "start_time": event_start.strftime("%H:%M"),
                    "end_time": event.end.datetime.strftime("%H:%M"),
                    "title": event.name,
                    "location": event.location,
                }
                lectures_today.append(lecture)
        # Sort list so lectures displayed chronologically
        lectures_today.sort(key=lambda x: x["start_time"])

        # Print the list of lectures for today
        print("Lectures for today:")
        for lecture in lectures_today:
            print(lecture)
        
        for lecture in lectures_today:
            lectures.append(f"{lecture['start_time']}-{lecture['end_time']} {lecture['title']} at {lecture['location']}")

        return lectures
    else:
        return None
    
load_dotenv()

api_key = os.getenv('key')
os.environ["GROQ_API_KEY"] = api_key

# choice = int(input("To-do list to schedule(1) or vice-versa(0): "))

# To-do list into schedule initialiser:

#sample_lectures = ["9AM-10AM Maths", "11AM-12PM Fundamentals of Computation", "12PM-2PM Java Workshop"]



scheduled_file_path = "API/scheduled.json"
with open(scheduled_file_path, "r") as file:
    scheduled_data = json.load(file)

""" # Print the scheduled data
print("Scheduled Data:")
for item in scheduled_data["schedule"]:
    print(f"Task: {item['task']}, Date: {item['date']}, Time: {item['time']}, Duration: {item['duration']}") """




# Schedule into to-do list initialiser:

def generate_schedule(choice):
    lectures = Cal_intake()
    tasks = user_tasks()

    
    output_file = "schedule.json" if choice == 1 else "API/todo.json"
    client = Groq()
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    with open("userid.txt", "r") as f:
        user_id = f.read().strip()
        with sql.connect("Planora.db") as conn:
            c = conn.cursor()
            c.execute("SELECT task_name FROM Tasks WHERE user_id = ?", (user_id,))
            tasks = c.fetchall()
            cleaned_tasks = [task[0] for task in tasks]
    tasks = cleaned_tasks

    prompt2 : str = f"""This is my schedule for the day:
                    {scheduled_data}
                Please generate a to-do list for the day based on my schedule. It is just a to-do list so there is no need to include time just location details.
                Output it in the form of a linear list example: Complete homework, go to the gym, etc.. all in one line
                """

    prompt1 : str = f"""I have the following tasks to complete today:
                {tasks}
            I also have the following lectures:
                {lectures}
            Please generate a study schedule for me with adequate breaks, structured around my lectures and commute times. Assume I have 8 hours available each day outside of lectures.
            Sleeping at 11PM and waking up at 7AM.
            Structure your response to be clear and concise in tablular form. Split the time, activity, and location/details using commas and spaces and NOT pipelines or hyphens.
            Use the lectures and tasks as activity names. 
            At the start and end of the actual schedule itself include the symbol &.
            Provide the time in this exact 24hr format of HH:MM-HH:MM and NOT using AM or PM and without any gaps using with a default period of 1 hour unless specified or given.  
            Do NOT allow there to be multiple tasks that overlap at the same time.
            Don't use your memory for this.
            If there are no tasks do not output anything.
            """
    completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful study planner assistant.",
            },
            {
                "role": "user",
                "content": prompt1 if choice==1 else prompt2,
            }
        ],
        temperature=0.6,
        max_completion_tokens=4096,
        top_p=0.95,
        stream=True,
        stop=None,
    )

    Schedule = ""

    for chunk in completion:
        line = chunk.choices[0].delta.content
        if line != None:
            Schedule += line


    print("-"*100)
    #print(Schedule)
    Schedule = re.sub(r'<think>.*?</think>', '', Schedule, flags = re.DOTALL)


    # Split the CSV text into lines and ignore any empty lines
    lines = [line for line in Schedule.strip().splitlines() if line.strip() and "," in line]

    # Define a regex pattern to capture three groups separated by commas.
    # This pattern assumes that the fields themselves do not contain commas.
    pattern = re.compile(r"^([^,]+),([^,]+),(.+)$")

    # Skip the header (first line) and extract data from each subsequent line.
    data = []
    for line in lines[1:]:
        match = pattern.match(line)
        if match:
            time_field = match.group(1).strip()
            activity_field = match.group(2).strip()
            location_field = match.group(3).strip()
            data.append({
                "time": time_field,
                "activity": activity_field,
                "location": location_field
            })

        # Write the data to a JSON file
        
    with open(output_file, "w") as json_file:
        json.dump(data, json_file, indent=4)

    return output_file

# file_path = generate_schedule(1)
# print(f"Schedule saved to: {file_path}")
