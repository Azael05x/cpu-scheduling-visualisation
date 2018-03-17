window.onload = function () {
  new CPUCanvas();
};

// Process types:
// `fcfs`
// `sjf`
// `rr`
// `p`

class CPUCanvas {
  constructor() {
    this.CANVAS_PADDING = 10;
    this.CANVAS_TIMEFRAME_LENGTH = 50;

    this.canvas = document.getElementById('canvas')
    this.context = canvas.getContext('2d');
    this.rough = rough.canvas(this.canvas);


    // Data about visualisation
    this.cpu = this.generateNewCpu('fcfs', 4);

    this.initFormListeners();
    this.initCanvas();

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
      generatedProcesses.push({
        name: `Process #${i + 1}`,
        order: i + 1,
        duration: this.randomNumber(1, 6),
        arrivalTime,
        color: this.randomRgba(0.5),
        stroke: this.randomRgba(0.5),
      });

      arrivalTime += this.randomNumber(1, 4);
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
      sequence.push({
        from: time,
        to: time + process.duration,
        process: i,
      });

      time += process.duration;
    });

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
    console.log('Clear Canvas');
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
  }


  drawCanvas() {
    this.drawTimeLine();
    this.drawProcesses();
  }


  drawTimeLine() {
    const duration = this.cpu.processes.reduce((a, obj) => a + obj.duration, 0);
    const timeframesToDraw = Math.max(duration, 20);

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
