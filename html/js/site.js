
// setting gauges
// Variables for saving the Power, Energy & speed

let varPower = 0;
let varEnvergy = 0;
let varSpeed = 0;

const maxValueE = 5000;
const maxValueP = 1000;
const maxValueSP = 60;

const arcE = document.getElementById("energy-arc");
const valueTextE = document.getElementById("energy-value");

const arcP = document.getElementById("power-arc");
const valueTextP = document.getElementById("power-value");

const arcSP = document.getElementById("speed-arc");
const valueTextSP = document.getElementById("speed-value");


// Helper: convert value to angle (0 to 180 degrees)
function valueToAngle(value, maxValue) {
  return (value / maxValue) * Math.PI;
}

// Helper: describe an arc path in SVG
function describeArc(x, y, radius, startAngle, endAngle) {
  let end = distCal(x, y, radius, endAngle);
  let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", 20, 100, //"M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");
}

function distCal(centerX, centerY, radius, angleInRad) {
  return {
    x: centerX - (radius * Math.cos(angleInRad)),
    y: centerY - (radius * Math.sin(angleInRad))
  };
}

// Update functions
function updateEnergy(value, maxValue) {
  if (value < 0) value = 0;
  if (value > maxValue) value = maxValue;

  let endAngle = valueToAngle(value, maxValue);
  arcE.setAttribute("d", describeArc(100, 100, 80, 0, endAngle));

  valueTextE.textContent = value;
}

function updatePower(value, maxValue) {
  if (value < 0) value = 0;
  if (value > maxValue) value = maxValue;

  let endAngle = valueToAngle(value, maxValue);
  arcP.setAttribute("d", describeArc(100, 100, 80, 0, endAngle));

  valueTextP.textContent = value;
}

function updateSpeed(value, maxValue) {
  if (value < 0) value = 0;
  if (value > maxValue) value = maxValue;

  let endAngle = valueToAngle(value, maxValue);
  arcSP.setAttribute("d", describeArc(100, 100, 80, 0, endAngle));

  valueTextSP.textContent = value;
}

function updateAvancee(value) {
  if (value < 0) value = 0;
  if (value > 100) value = 100;

  const box = document.getElementById("avancee-box");
  const fill = document.getElementById("avancee-fill");
  const text = document.getElementById("avancee-value");

  // update fill height
  fill.style.height = value + "%";

  // update number
  text.textContent = value + "%";

  // change colors if 100%
  if (value === 100) {
    fill.style.background = "rgba(46, 204, 113, 0.6)"; // green fill
    box.style.borderColor = "#2ecc71"; // green border
  } else {
    fill.style.background = "rgba(231, 76, 60, 0.3)"; // red fill
    box.style.borderColor = "#e74c3c"; // red border
  }
}

// Countdown
function countdown () {
  let count = 5;
  const countdownEl = document.getElementById('countdown');
  const dashboard = document.querySelector('.dashboardWrapper');
  dashboard.style.display = 'none';
  countdownEl.style.display = 'flex';   
  countdownEl.textContent = 5;

  const countdownInterval = setInterval(() => {count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(countdownInterval);
      countdownEl.style.display = 'none';   // hide countdown
      // Start fade-in for dashboard
      dashboard.style.opacity = 0;
      dashboard.style.display = 'flex';
      const fadeIn = setInterval(() => {
        let op = parseFloat(dashboard.style.opacity);
        if (op < 1) {
          dashboard.style.opacity = op + 0.05;
        } else {
          clearInterval(fadeIn);
        }
      }, 30);
    }
  }, 1000); // every 1 second
}



// Set Up the fireworks
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;  // store the loop ID


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createFirework(x, y) {
  const colors = ['#ff0043', '#14fc56', '#1e90ff', '#ffff00', '#ff9900', '#ff66cc'];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x,
      y,
      angle: Math.random() * 2 * Math.PI,
      speed: random(2, 6),
      radius: random(2, 4),
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;
    p.alpha -= 0.01;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${hexToRgb(p.color)},${p.alpha})`;
    ctx.fill();

    if (p.alpha <= 0) particles.splice(i, 1);
  });

  animationId = requestAnimationFrame(animateFireworks);
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#',''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

// launch fireworks every 1.5s
setInterval(() => {
  createFirework(random(100, canvas.width - 100), random(100, canvas.height - 200));
}, 1500);

// resetting screen 
function stopFirework(){
  cancelAnimationFrame(animationId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = [];
}




// Timing for Chrono
let startTime = Date.now() // Used for chrono
let interval // Used for chrono
const durationActive = {}


// ----- Gauges -----

function set_gauge(value) {
  $('#gauge').height(value + '%')
  $('#level').html(value + '%')
}

// ----- Chrono -----

function start_chrono() {
  startTime = Date.now();
  if (interval !== undefined) {
    clearInterval(interval);
  }
  interval = setInterval(function () {
    const elapsedTime = Date.now() - startTime;
    const formatted = luxon.DateTime.fromMillis(elapsedTime).toFormat('mm:ss.uu');

    // update the timer bar
    $('#timer-bar').html(formatted);

    // keep your other updates if needed
    $('#timer-value').html(formatted);
    $('#score-value').html(formatted);
  }, 10); // update every 10 ms for smoothness
}

function stop_chrono() {
  if (interval !== undefined) {
    clearInterval(interval)
  }
}

function reset_chrono() {
  stop_chrono();
  const formatted = luxon.DateTime.fromMillis(0).toFormat('mm:ss.uu');
  $('#timer-bar').html(formatted);
  $('#timer-value').html(formatted);
  $('#score-value').html(formatted);
}



// MQTT client

function init_client() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  const broker_url = params.B
  const base_topic = params.T

  console.log('Connecting to broker:', broker_url)
  const client = mqtt.connect(broker_url)

  client.on('connect', function (connack) {
    console.log('Connected to broker')
    console.log('Subscribing to topic:', base_topic + '#')
    client.subscribe(base_topic + '#', { qos: 1 })
    console.log("base_topic ", base_topic)
  })


  client.on('message', function (topic, message) {
    console.log(
      'Received message:',
      topic.toString(),
      ' : ',
      message.toString()
    )

    let obj
    try {
      obj = JSON.parse(message)
    } catch (error) {
      console.log('Error parsing message')
      obj = {}
    }

    console.log("Parsed message:", obj);
    switch (topic) {
      case base_topic + 'reload':
        location.reload(true)
        break
      case base_topic + 'gauge':
        //set_gauge(obj.value)
        updateAvancee(obj.value)
        break
      case base_topic + 'power':
        varPower = obj;
        console.log("Power: ", varPower)
        updatePower(varPower, maxValueP);
        break
      case base_topic + 'energy':
        varEnvergy = obj;
        updateEnergy(varEnvergy, maxValueE);
        break
      case base_topic + 'speed':
        varSpeed = obj;
        updateSpeed(varSpeed, maxValueSP);
        break
      case base_topic + 'chrono/start':
        start_chrono()
        break
      case base_topic + 'chrono/stop':
        stop_chrono()
        break
      case base_topic + 'chrono/reset':
        reset_chrono()
        break
      case base_topic + 'firework':
        if (obj == 1){
          animateFireworks();
        }
        if (obj == 0){
          stopFirework();
        }
        break
      case base_topic + 'video/play':
        //play_video(obj)
        countdown();
        break
      default:
        console.log('Unknown topic:', topic)
        console.log(`base topic: '${base_topic}'`)
    }
  })
}




