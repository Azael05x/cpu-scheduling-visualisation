window.onload = function () {
  new CPUCanvas();
};

class CPUCanvas {
  constructor() {
    // Constants
    this.CANVAS_PADDING = 10;
    this.CANVAS_TIMEFRAME_LENGTH = 50;
    this.ROUND_ROBIN_TQ = 3;
    this.DURATION_MIN = 1;
    this.DURATION_MAX = 6;
    this.NEXT_ARRIVAL_MIN = 1;
    this.NEXT_ARRIVAL_MAX = 4;
    this.PROCESS_TRANSPARENCY = 0.5;

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
        name: `Process #${i + 1}`,
        order: i + 1,
        index: i,
        duration: this.randomNumber(this.DURATION_MIN, this.DURATION_MAX),
        arrivalTime,
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


  calculateRR(rawProcesses) {
    let requestQueue = [0];
    let sequence = [];
    let time = 0;

    const allCompleted = () => processes.reduce((a, b) => a + b.burstTime, 0) === 0;
    const activeProcesses = () => processes.filter(process => process.arrivalTime <= time && process.burstTime > 0);
    const executeProcess = (processIndex) => {
      const executionTime = Math.min(this.ROUND_ROBIN_TQ, processes[processIndex].burstTime);
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


  // Draw table/calculations
  fillTables() {
    this.generateTableFromJSON('processes', this.cpu.processes);
    this.generateTableFromJSON('sequence', this.cpu.sequence);
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

    for (let i = 0; i < timeframesToDraw; i++) {
      this.rough.rectangle(
        this.CANVAS_PADDING + this.CANVAS_TIMEFRAME_LENGTH * i, this.CANVAS_PADDING, this.CANVAS_TIMEFRAME_LENGTH, this.CANVAS_TIMEFRAME_LENGTH,
        { bowing: 0 }
      );
    }
  }


  drawProcesses() {
    this.cpu.sequence.forEach(seq => {
      const process = this.cpu.processes[seq.process];

      this.rough.rectangle(
        this.CANVAS_PADDING + this.CANVAS_TIMEFRAME_LENGTH * seq.from,
        this.CANVAS_PADDING,
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
    });
  }

}
