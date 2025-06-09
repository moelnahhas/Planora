import React, { useEffect, useState } from "react";
import styles from "./Schedule.module.css"; // Import the CSS module
import Navlogin from "../../welcomepage/src/components/navlogin.jsx";

function Schedule({ setCurrentPage }) {
  const [scheduleData, setScheduleData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clearSchedule, setClearSchedule] = useState(false);

  const clearScheduleHandler = () => {
    setClearSchedule(true); // Trigger clearing
  };

  const parseTime = (timeStr) => {
    if (typeof timeStr !== "string") return null;
    const timeParts = timeStr.split("-");
    if (timeParts.length !== 2) return null;

    const [start, end] = timeParts.map(time => {
      if (!/^\d{2}:\d{2}$/.test(time)) return null;
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    });

    if (start === null || end === null) return null;
    return { start, end };
  };

  useEffect(() => {
    try {
      const storedSchedule = localStorage.getItem("scheduleData");
  
      if (storedSchedule) {
        const parsedSchedule = JSON.parse(storedSchedule);
        if (Array.isArray(parsedSchedule)) {
          if (clearSchedule === true) {
            localStorage.removeItem('scheduleData');
            console.log('Schedule cleared!');
            setScheduleData([]); // Reset scheduleData state to an empty array
            setClearSchedule(false); // Reset clearSchedule state

          }else{
            const isValid = parsedSchedule.every(item => 
              item.hasOwnProperty("time") &&
              item.hasOwnProperty("activity") &&
              item.hasOwnProperty("location")

            );

  
            if (isValid) {
              setScheduleData(parsedSchedule);
            } else {
              console.error("Invalid schedule data structure");
            }
          }
      
        } else {
          console.error("Schedule data is not an array");
        }
      }
    } catch (error) {
      console.error("Error loading or parsing schedule data from localStorage:", error);
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [clearSchedule]);
  

  return (
    <>
      <Navlogin />

    <div className={styles.scheduleContainer}>
      <h1 className={styles.scheduleTitle}>Schedule</h1>
      <div className={styles.scheduleGrid}>
        <div className={styles.scheduleHours}>
          {Array.from({ length: 24 }, (_, i) => {

            const hour = i % 12 || 12;
            const period = i < 12 ? "AM" : "PM";
            const hourStart = i * 60;
            
            return (
              <div key={i} className={styles.scheduleHour}>
              <div className={styles.hourLabel}>
                {/* Show empty span for 12 AM (i === 0), otherwise show the hour and period */}
                <span>{i === 0 ? "" : `${hour}:00 ${period}`}</span>
              </div>

                {scheduleData.map(({ time, activity, location }, index) => {
                  const timeRange = parseTime(time);
                  if (!timeRange) return null;

                  const { start, end } = timeRange;
                  if (start < hourStart || start >= hourStart + 60) return null;

                  const startMinutes = start - hourStart;
                  const duration = end - start;

                  return (
                    <div
                      key={index}
                      className={styles.scheduleEntry}
                      style={{
                        top: `${(startMinutes / 60) * 100}%`,
                        height: `${(duration / 60) * 100}%`,
                      }}
                    >
                      <p className={styles.entryActivity}>{activity}</p>
                      <p className={styles.entryLocation}>{location}</p>
                      <p className={styles.entryTime}>{time}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="toggleButtons">

        <button
          type="button"
          className={styles.updateButton}
          onClick={() => clearScheduleHandler()}
        >
          Clear
        </button>

        <button
          type="button"
          className={styles.updateButton}
          onClick={() => setCurrentPage("todo")}
        >
          To-Do
        </button>
      </div>

    </div>
    </>
  );
}

export default Schedule;
