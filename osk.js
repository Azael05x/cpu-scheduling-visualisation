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
    this.processCount = 1;
    this.schedulingType = `fcfs`;

    this.processes = this.generateProcesses(this.processCount, this.schedulingType);

    this.canvas = document.getElementById('canvas')
    this.context = canvas.getContext('2d');
    this.rough = rough.canvas(this.canvas);

    this.initFormListeners();
    this.initCanvas();
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
      this.processCount = +document.getElementById('process_count').value;
      this.schedulingType = document.querySelector('input[name="type"]:checked').value;

      this.processes = this.generateProcesses(this.processCount, this.schedulingType);

      this.clearCanvas();
      this.drawLogic();

      // You must return false to prevent the default form behavior
      return false;
    });
  }



  // Process logic
  generateProcesses(processCount, type) {
    let generatedProcesses = [];

    for (let i = 0; i < processCount; i++) {
      generatedProcesses.push({
        processName: `Process #${i + 1}`,
        order: i + 1,
        duration: this.randomNumber(1, 40),
      });
    }

    console.log(type, generatedProcesses);

    return generatedProcesses;
  }


  getProcessExecutionOrder() {

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
      this.drawLogic();
    }

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
  }



  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
  }


  drawLogic() {
    switch (this.schedulingType) {
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


  drawFCFS() { }


  drawSJF() { }


  drawRR() { }


  drawP() { }

}

// this.rough.rectangle(10, 10, 50, 50, {
//   fill: 'red',
//   stroke: 'blue',
//   hachureAngle: 60,
//   hachureGap: 10,
//   fillWeight: 2,
//   strokeWidth: 1
// });
