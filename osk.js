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
    this.canvas = document.getElementById('canvas')
    this.context = canvas.getContext('2d');
    this.rough = rough.canvas(this.canvas);

    this.cpu = {
      type: `fcfs`,
      processes: this.generateProcesses(1, `fcfs`),
    }

    this.initFormListeners();
    this.initCanvas();

    this.generateVisualisation();
  }



  // Helpers:
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }



  // Form interception
  initFormListeners() {
    document.getElementById('form').addEventListener('submit', (e) => {
      if (e.preventDefault) e.preventDefault();

      /* do what you want with the form */
      const processCount = +document.getElementById('process_count').value;

      this.cpu.type = document.querySelector('input[name="type"]:checked').value;
      this.cpu.processes = this.generateProcesses(processCount, this.cpu.type);

      this.generateVisualisation();

      // You must return false to prevent the default form behavior
      return false;
    });
  }


  generateVisualisation() {
    this.clearTables();
    this.fillTables();
    this.clearCanvas();
    this.drawCanvas();
  }


  // Process logic
  generateProcesses(processCount, type) {
    let generatedProcesses = [];

    for (let i = 0; i < processCount; i++) {
      generatedProcesses.push({
        processName: `Process #${i + 1}`,
        order: i + 1,
        duration: this.randomNumber(1, 6),
      });
    }

    console.log(type, generatedProcesses);

    return generatedProcesses;
  }


  getProcessExecutionOrder() {

  }



  // Draw table/calculations
  clearTables() {

  }


  fillTables() {
    switch (this.cpu.type) {
      case `fcfs`:
        this.fillFCFS();
        break;
      case `sjf`:
        this.fillSJF();
        break;
      case `rr`:
        this.fillRR();
        break;
      case `p`:
        this.fillP();
        break;
      default:
        break;
    }
  }


  fillFCFS() {
    this.generateTableFromJSON([
      {
        test: 1
      },
    ])
  }


  fillSJF() {

  }


  fillRR() {

  }


  fillP() {

  }


  generateTableFromJSON(data) {
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
    var divContainer = document.getElementById("showData");
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

    switch (this.cpu.type) {
      case `fcfs`:
        this.drawFCFS();
        break;
      case `sjf`:
        this.drawSJF();
        break;
      case `rr`:
        this.drawRR();
        break;
      case `p`:
        this.drawP();
        break;
      default:
        break;
    }
  }


  drawTimeLine() {
    const duration = this.cpu.processes.reduce((a, obj) => a + obj.duration, 0);
    const timeframesToDraw = Math.max(duration, 20);

    for (let i = 0; i < timeframesToDraw; i++) {
      this.rough.rectangle(10 + 50 * i, 10, 50, 50, { bowing: 0 });
    }
  }


  drawFCFS() { }


  drawSJF() { }


  drawRR() { }


  drawP() { }

}
