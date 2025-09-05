let startTime = Date.now() // Used for chrono
let interval // Used for chrono
const durationActive = {}

function play_video(obj) {
  console.log('Playing video : ', obj)
  let video_id = '#video'
  if ('id' in obj) {
    video_id = '#' + obj['id']
  }
  const v = $(video_id).first()

  const doPlay = function () {
    v.attr('src', obj.src)
    v.attr('currentTime', 0)
    $.each(v, function (_, i) {
      i.load()
    })

    if (obj.volume > 0) {
      v.attr('volume', obj.volume)
    }
    $.each(v, function (_, i) {
      i.play()
    })
  }

  const doStop = function () {
    $.each(v, function (_, i) {
      i.pause()
    })
    v.attr('currentTime', 0)
  }

  if (obj.loop) {
    v.attr('loop', true)
  } else {
    v.removeAttr('loop')
  }

  let fadeIn = 200
  if ('fade-in' in obj) fadeIn = obj['fade-in'] * 1000
  let prevFadeOut = 200
  if ('prev-fade-out' in obj) prevFadeOut = obj['prev-fade-out'] * 1000
  let fadeOut = 0
  if ('fade-out' in obj) fadeOut = obj['fade-out'] * 1000
  let duration = 0
  if ('duration' in obj) duration = obj.duration * 1000

  if (durationActive[video_id] !== undefined) {
    clearTimeout(durationActive[video_id])
    durationActive[video_id] = undefined
  }
  v.stop(true, true)
  v.clearQueue()

  if (fadeOut > 0 && duration > fadeIn + fadeOut) {
    v.fadeOut(prevFadeOut, doPlay).fadeIn(fadeIn)
    durationActive[video_id] = setTimeout(() => {
      v.fadeOut(fadeOut, function () {
        doStop()
        durationActive[video_id] = undefined
      })
    }, duration - fadeIn - fadeOut)
  } else if (fadeOut > 0) {
    v.fadeOut(prevFadeOut, doPlay).fadeIn(fadeIn).fadeOut(fadeOut, doStop)
  } else {
    v.fadeOut(prevFadeOut, doPlay).fadeIn(fadeIn)
  }
}

function stop_video(obj) {
  console.log('Stopping video')
  let video_id = '#video'
  if ('id' in obj) {
    video_id = '#' + obj['id']
  }
  const v = $(video_id).first()

  const doStop = function () {
    $.each(v, function (_, i) {
      i.pause()
    })
    v.attr('currentTime', 0)
  }

  let fadeOut = 200
  if ('fade-out' in obj) fadeOut = obj['fade-out'] * 1000

  if (durationActive[video_id] !== undefined) {
    clearTimeout(durationActive[video_id])
    durationActive[video_id] = undefined
  }

  v.fadeOut(fadeOut, doStop)
}

function start_game(obj) {
  console.log('Starting game')
}

// ----- Teams -----

function set_teams(teama, teamb) {
  $('#team-left').html(teama)
  $('#team-right').html(teamb)
}

// ----- Gauges -----

function set_gauge(value) {
  $('#gauge').height(value + '%')
  $('#level').html(value + '%')
}

// ----- Chrono -----

function start_chrono() {
  startTime = Date.now()
  if (interval !== undefined) {
    clearInterval(interval)
  }
  interval = setInterval(function () {
    const elapsedTime = Date.now() - startTime
    $('#timer-value').html(
      luxon.DateTime.fromMillis(elapsedTime).toFormat('mm:ss.uu')
    )
    $('#score-value').html(
      luxon.DateTime.fromMillis(elapsedTime).toFormat('mm:ss.uu')
    )
  })
}

function stop_chrono() {
  if (interval !== undefined) {
    clearInterval(interval)
  }
}

function reset_chrono() {
  stop_chrono()
  $('#timer-value').html(luxon.DateTime.fromMillis(0).toFormat('mm:ss.uu'))
  $('#score-value').html(luxon.DateTime.fromMillis(0).toFormat('mm:ss.uu'))
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
  })

  const v = $('#video')
  v[0].addEventListener('ended', (event) => {
    client.publish(base_topic + '/video/ended', 'true')
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

    // console.log("Parsed message:", obj);
    switch (topic) {
      case base_topic + 'reload':
        location.reload(true)
        break
      case base_topic + 'gauge':
        set_gauge(obj.value)
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
      case base_topic + 'video/play':
        play_video(obj)
        break
      case base_topic + 'video/stop':
        stop_video(obj)
        break
      case base_topic + 'score/show':
        $('#score').fadeIn('fast')
        break
      case base_topic + 'score/hide':
        $('#score').fadeOut('fast')
        break
      default:
        console.log('Unknown topic:', topic)
        console.log(`base topic: '${base_topic}'`)
    }
  })
}
