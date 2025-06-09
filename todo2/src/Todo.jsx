import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Schedule from "./Schedule"; // EXTERNAL SCHEDULE FILE
import styles from "./Todo.module.css"; // Import CSS module
import Navlogin from "../../welcomepage/src/components/navlogin.jsx";

function Todo() {
  const [currentPage, setCurrentPage] = useState("todo");
  const [inputs, setInputs] = useState([]);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Define fetchTasks outside useEffect so it can be used elsewhere
  // not sure if this is working .. maybe im not calling it ?
  // need to have a default todo inserted a start if []
  // need to delete from the schedule when checked -- some function on my part ?
  // 
  async function fetchTasks() {
    try {
      console.log("Attempting to fetch tasks...");

      // Check if session is valid
      const sessionResponse = await fetch(
        "http://127.0.0.1:5000/check_session",
        {
          credentials: "include",
        }
      );

      if (!sessionResponse.ok) {
        console.error("User session is not valid, redirecting to login");
        navigate("/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/tasks", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Fetch response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks, status: ${response.status}`);
      }

      const tasks = await response.json();
      console.log("Tasks received from backend:", tasks);

      setInputs(
        tasks.map((task) => ({
          id: task.id,
          value: task.task_name,
          checked: task.status === 1,
        })));
        setIsSaveDisabled(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  useEffect(() => {
    // Apply background gradient to the body element
    document.body.style.background = 'rgba(196, 152, 226, 1)'; // NEED TO MATCH TO TEXT BOX PURPLE THO... 
      
    // Clean up when the component unmounts (optional)
    return () => {
      document.body.style.background = ''; // Reset the background on cleanup
    };
  }, []);


  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    console.log("Todo page loaded, userId:", userId);
    if (!userId) {
      console.log("No userId found, should redirect to login");
      navigate("/login");
      return;
    }
    fetchTasks();
  }, [navigate]); // Run only once on component mount

  useEffect(() => {
    if (currentPage === "schedule") {
      navigate("/schedule");
    } else if (currentPage === "todo") {
      navigate("/todo");
    }
  }, [currentPage, navigate]);

  function addInput() {
    if (inputs.length > 0 && inputs[inputs.length - 1].value.trim() === "") {
      return; // Prevent adding if last input is empty
    }
    setInputs([...inputs, { id: Date.now(), value: "", checked: false }]);
    setIsSaveDisabled(false);
  }

  function handleChange(id, event) {
    setInputs(
      inputs.map((input) =>
        input.id === id ? { ...input, value: event.target.value } : input
      )
    );
    setIsSaveDisabled(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaveDisabled) return;

    setIsSaveDisabled(true); // Disable save button immediately

    try {
        // Clear existing tasks before saving new ones
        await fetch("http://127.0.0.1:5000/tasks/all", {
            method: "DELETE",
            credentials: "include",
        });

        for (const input of inputs) {
            if (input.value.trim() !== "") {
                await fetch("http://127.0.0.1:5000/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        task_name: input.value,
                        status: input.checked ? 1 : 0,
                        priority: 1, // Temporary placeholder
                        time_slot: "temp", // Temporary placeholder
                    }),
                });
            }
        }
    } catch (error) {
        console.error("Error saving tasks:", error);
    }

    await fetchTasks(); // Refresh the task list after saving
}

  function handleCheckbox(id, event) {
    setInputs(
      inputs.map((input) =>
        input.id === id ? { ...input, checked: event.target.checked } : input
      )
    );
    setIsSaveDisabled(false);
  }

  async function removeInput(id) {
    console.log(`Deleting task with ID: ${id}`); // Debugging line

    try {
      const response = await fetch(`http://127.0.0.1:5000/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task, status: ${response.status}`);
      }

      setInputs(inputs.filter((input) => input.id !== id));
      setIsSaveDisabled(false);
      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  async function clearAllTasks() {
    try {
      const response = await fetch("http://127.0.0.1:5000/tasks/all", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to clear tasks, status: ${response.status}`);
      }

      setInputs([]); // Clear the UI immediately
      setIsSaveDisabled(false);
      console.log("All tasks cleared successfully");
    } catch (error) {
      console.error("Error clearing tasks:", error);
    }
  }

  const fetchAndNavigateToSchedule = async () => {
    try {
      setIsLoading(true); // Show loading to user

      await handleSubmit(new Event("submit"));
      const response = await fetch("http://127.0.0.1:5000/call_api", {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Schedule data received:", data);
      
      const scheduleResponse = await fetch(`http://127.0.0.1:5000/${data.file}`);
      const scheduleJson = await scheduleResponse.json();
  
      localStorage.setItem("scheduleData", JSON.stringify(scheduleJson)); 
  
      setCurrentPage("schedule");
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setIsLoading(false); // Hide loading 
    }
  };
  
  // SWITCHES TO SCHEDULE PAGE
  if (currentPage === "schedule") {
    return <Schedule setCurrentPage={setCurrentPage} />;
  }
  return (
    <>
      <Navlogin />
      
    
    <div className={styles.todoContainer}>   {/* THE BACKGROUND WHITE BOX  */}
      <span
        className={styles.todoTitle} // Applying the same styles as the button
        onClick={() => setCurrentPage("todo")}
      >
        To-Do
      </span>

        {/* triggers save */}
        <form onSubmit={handleSubmit} className={styles.todoForm}> {/* FORM IS FOR THE WHOLE INSIDE TODO BOXES INCL BIN BUTTON, EXCL THE SAVE ECT. */}
          {inputs.map((input) => (
            <div key={input.id} className={styles.inputContainer}> {/* THE INPUT FOR TODO BOX */}
              <input
                type="checkbox"
                checked={input.checked}
                onChange={(e) => handleCheckbox(input.id, e)}
                className={styles.checkbox} //CHECKBOXES
              />

              <textarea
                value={input.value}
                onChange={(e) => handleChange(input.id, e)}
                placeholder="Today I need to do..."
                rows="1"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault(); // Prevents default tab behavior (moving focus)
                    addInput(); // Calls the function to add a new input
                  }
                }}
                className={`${styles.todoInput} ${input.checked ? styles.checked : styles.unchecked}`} //HANDLES THE CONDITONAL FORMATTING FOR CHECKED
              />

            {/* DELETE */}
            <button
              type="button"
              onClick={() => removeInput(input.id)}
              className={styles.deleteBtn}
            >
              🗑️
            </button>
          </div>
        ))}

        {/* SAVE */}
        <div className={styles.btnContainer}> {/* ALL OF THE BUTTONS FOR SAVE, CLEAR ETC. */}
          {/* <button type="submit" className={styles.button}>
            Save
          </button> */}

          {/* ADD NEW INPUT */}
          <button
            type="button"
            className={styles.button}
            onClick={addInput}
          >
            +
          </button>


          {/* DELETE ALL*/}
          <button
            type="button"
            onClick={clearAllTasks}
            className={styles.button}
          >
            Clear
          </button>

        
        </div>

         {/* CHANGE TO SCHEDULE */}
         <button
            type="button"
            className={`${styles.button} ${isLoading ? styles.loadingButton : ""}`} 
            onClick={fetchAndNavigateToSchedule}
            disabled={isLoading}
          >
            {isLoading ? "Loading" : "Schedule"}
          </button>
      </form>
      </div>

    </>

  );
}

export default Todo;
