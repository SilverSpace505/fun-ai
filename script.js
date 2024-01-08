
utils.setup()
utils.setStyles()
utils.setGlobals()

var delta = 0
var lastTime = 0
var su = 0

var amt = 100
var ais = []

var playing = false

for (let i = 0; i < amt; i++) {
    ais.push(new AI())
}

var started = false
var ticks = 0
var time = 0
var tickRate = 20
var best = 0
var bestNet
var gens = 0
var genTime = 0
var tps = tickRate
var tts = 0
var tpsi = tickRate

var mutationRate = 5000
var roundTime = 20 * 60 * 5

var last = []
var lastTotal = 0
var longestTime = 0

var onlyBest = false
var showRaycast = false
var timeWarp = false
var fasterRaycasts = true

var playButton = new ui.Button("rect", "Play")
var willLoadBest = ""

function srand(seed) {
    let x = Math.sin(seed*3902+7459)*Math.cos(seed*4092+4829)*10000
	return x - Math.floor(x)
}

function loadBest(net) {
    willLoadBest = net
}

function tick() {
    genTime++

    for (let i = 0; i < ais.length; i++) {

        if (onlyBest) {
            if (i == 0) {
                ais[i].shown = lerp(ais[i].shown, 1, 0.1)
            } else {
                ais[i].shown = lerp(ais[i].shown, 0, 0.25)
            }
        } else {
            ais[i].shown = lerp(ais[i].shown, 1, 0.1)
        }

        ais[i].tick()
        if (ais[i].death || willLoadBest.length > 0) {
            if (genTime > longestTime) {
                longestTime = genTime
            }
            last.push([ais[i].net.save(), ais[i].score])
            lastTotal += ais[i].score
            if (ais[i].score > best) {
                best = ais[i].score
                bestNet = ais[i].net.save()
            }
            ais.splice(i, 1)
            i--
        }
    }

    if (ais.length <= 0) {
        gens++
        genTime = 0
        playing = false
        if (willLoadBest.length > 0) {
            bestNet = willLoadBest
            willLoadBest = ""
            console.log("loaded")
        }
        sf(tickRate)
        console.log("Generation", gens)
        last.sort((a, b) => (b[1] - a[1]))
        for (let i = 0; i < amt; i++) {
            ais.push(new AI())
            if (i > amt/4) {
                let percent = Math.random()
                let percentTotal = 0
                for (let ai of last) {
                    if (percent < ai[1]/lastTotal + percentTotal) {
                        ais[i].net.load(ai[0])
                        ais[i].net.mutate(mutationRate, 0.75, mutationRate/4, 0.1, mutationRate/4, 0.1, mutationRate*0.75, 0.5, mutationRate*0.75, 0.5)
                        break
                    }
                    percentTotal += ai[1]/lastTotal
                }
            } else if (i == 0 && bestNet) {
                ais[i].net.load(bestNet)
            }
        }
        last = []
        lastTotal = 0
        started = false
    }

    if (!started) {
        for (let ai of ais) {
            ai.spawn()
        }
        started = true
    }
} 

function play() {
    genTime = 0
    sf(tickRate)
    playing = true
    ais = []
    ais.push(new AI())
    ais[0].net.load(bestNet)
    ais[0].spawn()
}

function ticksToTime(ticks) {
    let seconds = Math.floor(ticks/20)
    let minutes = Math.floor(seconds/60)
    let seconds2 = seconds - minutes*60
    seconds2 = seconds2.toString()
    while (seconds2.length < 2) seconds2 = "0"+seconds2
    return minutes+":"+seconds2
}

function update(timestamp) {
    requestAnimationFrame(update)

    input.setGlobals()
    utils.getDelta(timestamp)
    ui.resizeCanvas()
    ui.getSu()

    if (keys["ShiftLeft"]) {
        if (tickRate != Math.round(mouse.x/canvas.width * 1000)) {
            sf(Math.round(mouse.x/canvas.width * 1000))
        }
    }

    if (jKeys["KeyE"]) {
        showRaycast = !showRaycast
    }
    if (jKeys["Space"]) {
        onlyBest = !onlyBest
    }
    if (playing) onlyBest = false

    if (jKeys["KeyT"]) {
        timeWarp = !timeWarp
    }
    if (jKeys["KeyR"]) {
        sf(20)
    } 
    if (jKeys["KeyF"]) {
        fasterRaycasts = !fasterRaycasts
    }

    ui.rect(canvas.width/2, canvas.height/2, canvas.width, canvas.height, [0, 0, 0, 1])

    let i = 0
    for (let ai of ais) {
        ai.vsx = lerp(ai.vsx, ai.x, delta*tickRate)
        ai.vsy = lerp(ai.vsy, ai.y, delta*tickRate)
        if (playing) {
            ai.player.vsx = lerp(ai.player.vsx, ai.player.x, delta*tickRate)
            ai.player.vsy = lerp(ai.player.vsy, ai.player.y, delta*tickRate)
        }
        for (let bullet of ai.bullets) {
            bullet.vsx = lerp(bullet.vsx, bullet.x, delta*tickRate)
            bullet.vsy = lerp(bullet.vsy, bullet.y, delta*tickRate)
        }
        ai.draw()
        i++
    }
    ctx.globalAlpha = 1

    ais.sort((a, b) => (b.score - a.score))

    tpsi = lerp(tpsi, tps, delta)

    ui.text(10*su, 20*su, 40*su, "Generation: " + gens)
    ui.text(canvas.width-10*su, 20*su, 40*su, "Alive: " + ais.length, {align: "right"})
    ui.text(canvas.width-10*su, 60*su, 40*su, "TPS: " + Math.round(tpsi), {align: "right"})
    ui.text(canvas.width/2, 20*su, 40*su, "Time: " + ticksToTime(genTime), {align: "center"})
    ui.text(canvas.width/2, 60*su, 40*su, "Best Score: " + ais[0].score, {align: "center"})
    ui.text(10*su, 60*su, 40*su, "All Time Best: " + best)

    ui.text(10*su, 100*su, 40*su, "Longest Run: " + ticksToTime(longestTime))

    ui.text(10*su, canvas.height-20*su, 25*su, "(Space) Only best   (E) Show raycasts   (T) Time warp   (Shift+Mouse-left-right) Change speed")

    playButton.set(canvas.width/2, 110*su, 200*su, 50*su)
    playButton.bgColour = [100, 100, 100, 0.5]
    playButton.textSize = 40*su
    playButton.basic()
    playButton.draw()

    if (playButton.hovered() && mouse.lclick) {
        playButton.click()
        play()
    }

    let startTime = new Date().getTime()
    time += delta
    while ((ticks < time*tickRate || timeWarp) && new Date().getTime() - startTime < 1000/120) {
        tick()
        ticks++
        tts++
    }

    if (timeWarp) {
        ticks = time*tickRate
    }

    input.updateInput()
}

setInterval(() => {
    tps = tts
    tts = 0
}, 1000)

function sf(amt) {
    tickRate = amt
    time = 0
    ticks = 0
    tts = 0
}

requestAnimationFrame(update)