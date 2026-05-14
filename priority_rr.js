// priority_rr.js - Priority scheduling with Round Robin (preemptive)

function priorityRR() {
    let processes = getProcessInputs();
    let quantum = getTimeQuantum();
    let time = 0;
    let queue = [];
    let schedule = [];
    let wt = [];
    let tat = [];
    let rt = [];
    let completed = 0;
    let index = 0;
    let current = null;
    let timeSlice = 0;

    processes.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));

    while (completed < processes.length) {
        // Add newly arrived processes to the queue
        while (index < processes.length && processes[index].at <= time) {
            queue.push(processes[index]);
            index++;
        }

        // Check if we need to switch the current process
        let needSwitch = false;
        if (!current || timeSlice === 0) {
            needSwitch = true;
        } else if (queue.length > 0) {
            // Check if there's a higher priority process in the queue
            let minPrInQueue = Math.min(...queue.map(p => p.pr));
            if (minPrInQueue < current.pr) {
                needSwitch = true;
            }
        }

        if (needSwitch) {
            // Put current back to queue if it has remaining time
            if (current && current.remaining > 0) {
                queue.push(current);
            }
            // Select the highest priority process
            if (queue.length > 0) {
                queue.sort((a, b) => a.pr - b.pr || 0);
                current = queue.shift();
                timeSlice = quantum;
            } else {
                current = null;
                timeSlice = 0;
            }
        }

        if (!current) {
            // Idle time
            let nextArrival = Math.min(...processes.filter(p => !p.done).map(p => p.at));
            createScheduleSegment(schedule, 'Idle', time, nextArrival);
            time = nextArrival;
            continue;
        }

        // Execute the current process for 1 time unit
        if (current.responseTime === -1) {
            current.responseTime = time - current.at;
        }
        createScheduleSegment(schedule, current.pn, time, time + 1);
        time += 1;
        current.remaining -= 1;
        timeSlice -= 1;

        // Check if process is completed
        if (current.remaining === 0) {
            current.completionTime = time;
            current.done = true;
            completed++;
            let idx = processes.findIndex(p => p.id === current.id);
            wt[idx] = current.completionTime - current.at - current.bt;
            tat[idx] = current.completionTime - current.at;
            rt[idx] = current.responseTime;
            current = null;
            timeSlice = 0;
        }
    }

    displayResults(processes, wt, tat, rt, schedule);
}
