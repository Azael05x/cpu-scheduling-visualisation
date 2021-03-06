window.onload = function () {
  new CPUCanvas();
};

class CPUCanvas {
  constructor() {
    // Constants
    this.CANVAS_PADDING_TOP = 30;
    this.CANVAS_PADDING = 10;
    this.CANVAS_TIMEFRAME_LENGTH = 50;
    this.DURATION_MIN = 1;
    this.DURATION_MAX = 6;
    this.PRIORITY_MIN = 1;
    this.PRIORITY_MAX = 7;
    this.NEXT_ARRIVAL_MIN = 1;
    this.NEXT_ARRIVAL_MAX = 2;
    this.PROCESS_TRANSPARENCY = 0.7;
    this.TIMEFRAME_SECONDS_PADDING_TOP = 10;
    this.TIMEFRAME_SECONDS_FONT_SIZE = 15;
    this.TIMEFRAME_SECONDS_FONT_FAMILY = 'Arial';
    this.PROCESS_NAME_FONT_SIZE = 15;
    this.PROCESS_NAME_FONT_FAMILY = 'Arial';


    this.roundRobinTQ = +document.getElementById('rr_tq').value;

    // Canvas
    this.canvas = document.getElementById('canvas')
    this.context = canvas.getContext('2d');
    this.rough = rough.canvas(this.canvas);

    // Generate new CPU
    const processCount = +document.getElementById('process_count').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    this.cpu = this.generateNewCpu(type, processCount);

    // Initialize visualisation page
    this.initFormListeners();
    this.initCanvas();

    // Generate new visualisation
    this.generateVisualisation();
  }



  // Helpers:
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  randomRgba(alpha) {
    const o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + alpha + ')';
  }



  // Form interception
  initFormListeners() {
    document.getElementById('form').addEventListener('submit', (e) => {
      if (e.preventDefault) e.preventDefault();

      /* do what you want with the form */
      const processCount = +document.getElementById('process_count').value;
      const type = document.querySelector('input[name="type"]:checked').value;
      this.roundRobinTQ = +document.getElementById('rr_tq').value;

      this.cpu = this.generateNewCpu(type, processCount);

      this.generateVisualisation();

      // You must return false to prevent the default form behavior
      return false;
    });
  }


  generateVisualisation() {
    this.fillTables();
    this.clearCanvas();
    this.drawCanvas();
  }


  // Process logic
  generateNewCpu(type, count) {
    const processes = this.generateProcesses(count, type);
    const sequence = this.calculate(type, processes);
    const cpu = { type, processes, sequence };
    console.log('CPU:', cpu);

    return cpu;
  }

  generateProcesses(processCount, type) {
    let generatedProcesses = [];
    let arrivalTime = 0;
	
    for (let i = 0; i < processCount; i++) {
      const randomProcess = {
        name: `P${i + 1}`,
        order: i + 1,
        index: i,
        duration: this.randomNumber(this.DURATION_MIN, this.DURATION_MAX),
        arrivalTime,
		priority: this.randomNumber(this.PRIORITY_MIN, this.PRIORITY_MAX),
        color: this.randomRgba(this.PROCESS_TRANSPARENCY),
        stroke: this.randomRgba(this.PROCESS_TRANSPARENCY),
      };

      generatedProcesses.push(randomProcess);

      // Update arrival time of next process;
      arrivalTime += this.randomNumber(this.NEXT_ARRIVAL_MIN, this.NEXT_ARRIVAL_MAX);
    }

    return generatedProcesses;
  }


  calculate(type, processes) {
    switch (type) {
      case `fcfs`:
        return this.calculateFCFS(processes);
      case `sjf`:
        return this.calculateSJF(processes);
      case `rr`:
        return this.calculateRR(processes);
      case `p`:
        return this.calculateP(processes);
      default:
        return [];
    }
  }


  calculateFCFS(processes) {
    let sequence = [];
    let time = 0;

    processes.forEach((process, i) => {
      if (process.arrivalTime > time) {
        time = process.arrivalTime;
      }

      sequence.push({
        from: time,
        to: time + process.duration,
        process: i,
      });

      time += process.duration;
    });

    return sequence;
  }


  calculateSJF(orig_processes) {
    let processes = [...orig_processes]; // Copy processes so original processes would not get touched
    let sequence = [];
    let time = 0;

    const activeProcesses = () => processes.filter(process => process.arrivalTime <= time && !process.done);
    const shortestActiveProcess = () => {
      if (activeProcesses().length > 0) {
        const minDuration = activeProcesses().sort((x, z) => x.duration - z.duration)[0].duration;
        const smallestProcesses = activeProcesses().filter(process => process.duration === minDuration);
        return smallestProcesses.sort((x, z) => x.order - z.order)[0];
      } else {
        return undefined;
      }
    };
    const allDone = () => processes.filter(process => !process.done).length === 0;

    while (!allDone()) {
      const activeProcess = shortestActiveProcess();

      if (!!activeProcess) {
        sequence.push({
          from: time,
          to: time + activeProcess.duration,
          process: activeProcess.index,
        });
        time += activeProcess.duration;
        processes[activeProcess.index].done = true;
      } else {
        ++time;
      }
    }

    return sequence;
  }


  calculateRR(rawProcesses) {
    let requestQueue = [0];
    let sequence = [];
    let time = 0;

    const allCompleted = () => processes.reduce((a, b) => a + b.burstTime, 0) === 0;
    const activeProcesses = () => processes.filter(process => process.arrivalTime <= time && process.burstTime > 0);
    const executeProcess = (processIndex) => {
      const executionTime = Math.min(this.roundRobinTQ, processes[processIndex].burstTime);
      processes[processIndex].burstTime -= executionTime;

      sequence.push({
        from: time,
        to: time + executionTime,
        process: processIndex,
      });

      time += executionTime;
    };
    const enqueueProcesses = (nextProcesses) => {
      nextProcesses.forEach(process => {
        if (requestQueue.indexOf(process.index) === -1) {
          requestQueue.push(process.index);
        }
      });
    };

    const processes = rawProcesses.map(process => {
      return {
        index: process.index,
        arrivalTime: process.arrivalTime,
        burstTime: process.duration
      }
    });

    while (!allCompleted()) {
      // Get next process we should execute from processes
      const processIndex = requestQueue.shift();

      // If queue has process enqueued, execute it
      if (Number.isInteger(processIndex)) {
        executeProcess(processIndex);
      } else {
        time += 1;
      }

      // Find active processes without current executed process
      let nextProcesses = activeProcesses().filter(process => process.index !== processIndex);
      let currentProcess = activeProcesses().filter(process => process.index === processIndex)[0];

      // If current process is still active add it to the next processes end
      if (currentProcess) {
        nextProcesses.push(currentProcess);
      }


      // Add those processes to request queue, if they are already not added
      enqueueProcesses(nextProcesses);
    }

    return sequence;
  }
  
  calculateP(orig_processes) {
	let processes = [...orig_processes]; // Copy processes so original processes would not get touched
	
	let arrivedProcesses = []; // Processes which have already arrived at specific time moment
	let sequence = [];
	let time = 0;	// Current time
	
	let currentProcessId = -1;
	let currentProcessStarts = -1;
	let currentProcessEnds = -1;
	
	const allDone = () => processes.filter(process => !process.done).length === 0;
	const highestPriorityProcess = (processesArray) => processesArray.reduce((a, b) => a.priority <= b.priority ? a : b);
	
	// Find processes which arrive at specific time point
	const arrivesNow = (time) => processes.filter(process => process.arrivalTime === time);
	
	while(!allDone()){
		if(time === currentProcessEnds){ // If current process finishes
			sequence.push({
				from: currentProcessStarts,
				to: currentProcessEnds,
				process: currentProcessId,
			});
			processes[currentProcessId].done = true;
			
			// find finished process
			const finishedProcess = arrivedProcesses.find(process => process.index === currentProcessId);
			// and remove it
			arrivedProcesses.splice(arrivedProcesses.indexOf(finishedProcess),1);
		}
		
		// Add processes which arrive at this time moment to arrived processes array
		arrivedProcesses.push(...arrivesNow(time));
		
		// If there are any arrived processes
		if(arrivedProcesses.length > 0)
		{		
			// Select highest priority process
			const currentProcess = highestPriorityProcess(arrivedProcesses);
			
			// If highest priority process is not the same as current running process
			if(currentProcessId !== currentProcess.index){
				currentProcessId = currentProcess.index;
				currentProcessStarts = time;
				currentProcessEnds = time + currentProcess.duration;
			}	
		}
		time++;
	}
	return sequence;
  }


  // Draw table/calculations
  fillTables() {
    const processTableData = this.cpu.processes.map(process => {
      return {
        name: process.name,
        arrival: process.arrivalTime,
        duration: process.duration,
		priority: process.priority		
      };
    });


    const sequenceTable = this.cpu.sequence.map(seq => {
      return {
        process: this.cpu.processes[seq.process].name,
        from: seq.from,
        to: seq.to,
      };
    });

    this.generateTableFromJSON('processes', processTableData);
    this.generateTableFromJSON('sequence', sequenceTable);
  }


  generateTableFromJSON(id, data) {
    // EXTRACT VALUE FOR HTML HEADER.
    // ('Book ID', 'Book Name', 'Category' and 'Price')
    var col = [];
    for (var i = 0; i < data.length; i++) {
        for (var key in data[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1);                   // TABLE ROW.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      // TABLE HEADER.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < data.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = data[i][col[j]];
        }
    }

    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    var divContainer = document.getElementById(id);
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
  }


  // Canvas
  initCanvas() {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = 200;
      /**
       * Your drawings need to be inside this function otherwise they will be reset when
       * you resize the browser window and the canvas goes will be cleared.
       */
      this.drawCanvas();
    }

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
  }



  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
  }


  drawCanvas() {
    this.drawTimeLine();
    this.drawProcesses();
  }


  drawTimeLine() {
    const timeframesToDraw = Math.floor((this.canvas.width - this.CANVAS_PADDING) / this.CANVAS_TIMEFRAME_LENGTH);

    this.context.font = `${this.TIMEFRAME_SECONDS_FONT_SIZE}px ${this.TIMEFRAME_SECONDS_FONT_FAMILY}`;

    for (let i = 0; i < timeframesToDraw; i++) {
      this.rough.rectangle(
        this.CANVAS_PADDING + this.CANVAS_TIMEFRAME_LENGTH * i, this.CANVAS_PADDING_TOP, this.CANVAS_TIMEFRAME_LENGTH, this.CANVAS_TIMEFRAME_LENGTH,
        { bowing: 0 }
      );

      this.context.strokeText(
        i,
        this.CANVAS_PADDING + this.CANVAS_TIMEFRAME_LENGTH * i,
        this.CANVAS_PADDING_TOP + this.TIMEFRAME_SECONDS_PADDING_TOP + this.CANVAS_TIMEFRAME_LENGTH + this.TIMEFRAME_SECONDS_FONT_SIZE,
      );
    }
  }


  drawProcesses() {
    this.context.font = `${this.PROCESS_NAME_FONT_SIZE}px ${this.PROCESS_NAME_FONT_FAMILY}`;

    this.cpu.sequence.forEach(seq => {
      const process = this.cpu.processes[seq.process];

      this.rough.rectangle(
        this.CANVAS_PADDING + this.CANVAS_TIMEFRAME_LENGTH * seq.from,
        this.CANVAS_PADDING_TOP,
        this.CANVAS_TIMEFRAME_LENGTH * (seq.to - seq.from),
        this.CANVAS_TIMEFRAME_LENGTH,
        {
          fill: process.color,
          stroke: process.stroke,
          fillWeight: 1,
          strokeWidth: 3,
          fillStyle: 'solid',
          bowing: 1,
        }
      );

      this.context.strokeText(
        process.name,
        (this.CANVAS_TIMEFRAME_LENGTH * (seq.to - seq.from)) / 2 + (this.CANVAS_PADDING + this.CANVAS_TIMEFRAME_LENGTH * seq.from) - 5,
        this.CANVAS_PADDING_TOP - this.PROCESS_NAME_FONT_SIZE,
      );
    });
  }

}
