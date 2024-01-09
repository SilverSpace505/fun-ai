
class AI {
    x = 0
    y = 0
    net
    angle = Math.PI
    vx = 0
    vy = 0
    vsx = 0
    vsy = 0
    asteroids = []
    spawnCooldown = 0
    death = false
    score = 0
    rays = []
    bullets = []
    shootCooldown = 0
    trail = []
    shown = 0
    rayAmt = 32
    output = []
    trailCooldown = 0
    player = {}
    playerTrail = []
    pShootCooldown = 0
    constructor() {
        this.net = new Net(this.rayAmt*2+6, 5, [0, 10], [0, this.rayAmt*2+15])
        for (let i = 0; i < 5; i++) this.output.push(0.5)
        if (playing) {
            this.player = {x: 0, y: 0, vx: 0, vy: 0, vsx: 0, vsy: 0, angle: 0}
        }
    }
    tick() {
        this.shootCooldown--
        this.spawnCooldown--
        this.trailCooldown--
        if (this.spawnCooldown <= 0) {
            this.spawnCooldown = 20*5 - genTime/roundTime * 100
            // let x = Math.random()*canvas.width
            // let y = Math.random()*canvas.height
            let x = srand(genTime*2)*canvas.width
            let y = srand(genTime*2+1)*canvas.height
            let off = 1
            while (Math.sqrt((x-this.x)**2 + (y-this.y)**2) < 250*su) {
                x = srand(genTime*2 + off)*canvas.width
                y = srand(genTime*2+1 + off)*canvas.height
                off++
            }
            let dir = {x: this.x-x, y: this.y-y}
            let length = Math.sqrt(dir.x**2+dir.y**2)
            dir.x /= length; dir.y /= length
            this.asteroids.push({x: x, y: y, dir: dir, lifetime: 0})
        }

        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i]
            bullet.x += Math.sin(bullet.angle)*20
            bullet.y += Math.cos(bullet.angle)*20
            bullet.lifetime++
            if (bullet.lifetime > 20*5) {
                this.bullets.splice(i, 1)
                i--
            } else {
                for (let i2 = 0; i2 < this.asteroids.length; i2++) {
                    if (Math.sqrt((bullet.x-this.asteroids[i2].x)**2 + (bullet.y-this.asteroids[i2].y)**2) < 25*su) {
                        this.asteroids.splice(i2, 1)
                        this.score++
                        i2--
                        this.bullets.splice(i, 1)
                        i--
                        break
                    }
                }
            }
        }

        for (let i = 0; i < this.asteroids.length; i++) {
            let asteroid = this.asteroids[i]
            asteroid.x += asteroid.dir.x*3
            asteroid.y += asteroid.dir.y*3
            asteroid.lifetime++
            if (asteroid.lifetime > 20*50) {
                this.asteroids.splice(i, 1)
                i--
            } else {
                let d = Math.sqrt((this.x-asteroid.x)**2 + (this.y-asteroid.y)**2)
                if (d < 30*su) {
                    this.death = true
                }
            }
        }

        let output = this.output

        if (output[4] > 0.5 && this.shootCooldown <= 0) {
            this.bullets.push({x: this.x, y: this.y, vsx: this.x, vsy: this.y, angle: this.angle, lifetime: 0})
            this.shootCooldown = 20/2
        }

        // this.vx += Math.sin(this.angle) * (output[0]*1.5-0.5) * 5
        // this.vy += Math.cos(this.angle) * (output[0]*1.5-0.5) * 5
        if (output[0] > 0.5) {
            this.vx += Math.sin(this.angle) * 15
            this.vy += Math.cos(this.angle) * 15
        }
        if (output[1] > 0.5) {
            this.vx -= Math.sin(this.angle)*0.5 * 15
            this.vy -= Math.cos(this.angle)*0.5 * 15
        }

        if (output[2] > 0.5) {
            this.angle += 0.3
        }
        if (output[3] > 0.5) {
            this.angle -= 0.3
        }

        if (playing) {
            this.pShootCooldown--
            if (keys["Space"] && this.pShootCooldown <= 0) {
                this.bullets.push({x: this.player.x, y: this.player.y, vsx: this.player.x, vsy: this.player.y, angle: this.player.angle, lifetime: 0})
                this.pShootCooldown = 20/2
            }
            if (keys["KeyW"] > 0.5) {
                this.player.vx += Math.sin(this.player.angle) * 15
                this.player.vy += Math.cos(this.player.angle) * 15
            }
            if (keys["KeyS"] > 0.5) {
                this.player.vx -= Math.sin(this.player.angle)*0.5 * 15
                this.player.vy -= Math.cos(this.player.angle)*0.5 * 15
            }
    
            if (keys["KeyA"] > 0.5) {
                this.player.angle += 0.3
            }
            if (keys["KeyD"] > 0.5) {
                this.player.angle -= 0.3
            }

            this.player.vx = lerp(this.player.vx, 0, 0.5)
            this.player.vy = lerp(this.player.vy, 0, 0.5)

            this.player.x += this.player.vx
            this.player.y += this.player.vy
        }

        // this.angle += (output[1]*2-1) * 0.1

        if (this.score < -50) {
            this.death = true
        }

        // if (genTime > 20*60) {
        //     this.death = true
        // }

        if (!this.death) {
            // let d = Math.sqrt((canvas.width/2-this.x)**2 + (canvas.height/2-this.y)**2)
            // this.score += 1
        }

        this.vx = lerp(this.vx, 0, 0.5)
        this.vy = lerp(this.vy, 0, 0.5)

        this.x += this.vx
        this.y += this.vy

        this.score = Math.round(this.score*10)/10
        // if (output[1] > 0.5) {
        //     this.x -= 10
        // }

        // if (this.x > canvas.width-10*su) this.x = canvas.width-10*su
        // if (this.x < 10*su) this.x = 10*su

        // if (this.y > canvas.height-10*su) this.y = canvas.height-10*su
        // if (this.y < 10*su) this.y = 10*su

        if (this.x > canvas.width-10*su) this.death = true
        if (this.x < 10*su) this.death = true

        if (this.y > canvas.height-10*su) this.death = true
        if (this.y < 10*su) this.death = true

        if (this.trailCooldown <= 0) {
            this.trail.push([this.x-this.vx, this.y-this.vy])

            while (this.trail.length > 15) {
                this.trail.splice(0, 1) 
            }
            this.trailCooldown = 0
        }

        this.playerTrail.push([this.player.x-this.player.vx, this.player.y-this.player.vy])
        while (this.playerTrail.length > 15) {
            this.playerTrail.splice(0, 1) 
        }

        this.rays = []
        let rays = []
        for (let i = 0; i < this.rayAmt; i++) {
            let r = this.raycast(this.angle+i*(Math.PI*2 / this.rayAmt))
            this.rays.push(r)
            rays.push(r[0]/(500*su), r[1])
        }

        this.net.setInput([1, genTime/roundTime, this.x, this.y, this.vx, this.vy, ...rays])
        // this.net.mutate(10, 0.75, 3, 0.1, 3, 0.1, 10, 0.5, 10, 0.5)
        this.net.tick()
        this.output = this.net.output()
    }
    raycast(angle) {
        let dir = {x: Math.sin(angle), y: Math.cos(angle)}
        let r = {x: this.x, y: this.y}
        let d = 0
        let stop = false
        let collided = 0.5
        let move = 10*su
        while (d < 500*su && !stop) {
            r.x += dir.x*move
            r.y += dir.y*move
            let move2 = Math.min(r.x, r.y, canvas.width-r.x, canvas.height-r.y)
            if (r.x > 10*su && r.x < canvas.width-10*su && r.y > 10*su && r.y < canvas.height-10*su) {
                for (let asteroid of this.asteroids) {
                    let d = Math.sqrt((r.x-asteroid.x)**2 + (r.y-asteroid.y)**2)
                    if (d < move2 || move2 == -1) {
                        move2 = d
                    }
                    if (d < 50*su) {
                        stop = true
                        collided = 1
                        break
                    }
                }
            } else {
                break
            }
            d += move
            if (fasterRaycasts) move = move2/2
        }
        return [d, collided]
    }
    spawn() {
        this.x = canvas.width/2
        this.y = canvas.height/2
        this.angle = Math.PI
        this.vx = 0
        this.vy = 0
        this.vsx = canvas.width/2
        this.vsy = canvas.height/2
        
        if (playing) {
            this.player.x = canvas.width/2
            this.player.y = canvas.height/2
            this.player.angle = Math.PI
            this.player.vx = 0
            this.player.vy = 0
            this.player.vsx = canvas.width/2
            this.player.vsy = canvas.height/2
        }
    }
    draw() {
        if (this.shown < 0.1) return
        ctx.globalAlpha = this.shown
        if (showRaycast) {
            for (let i = 0; i < this.rayAmt; i++) {
                if (this.rays[i][0] >= 500*su && fasterRaycasts) continue
                if (this.rays[i][1] == 0.5) {
                    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"
                } else {
                    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
                }
                ctx.lineWidth = 5*su
                ctx.beginPath()
                ctx.moveTo(this.vsx, this.vsy)
                ctx.lineTo(this.vsx + Math.sin(this.angle+i*(Math.PI*2 / this.rayAmt)) * this.rays[i][0], this.vsy + Math.cos(this.angle+i*(Math.PI*2 / this.rayAmt)) * this.rays[i][0])
                ctx.stroke()
                if (this.rays[i][0] < 500*su) {
                    ui.circle(this.vsx + Math.sin(this.angle+i*(Math.PI*2 / this.rayAmt)) * this.rays[i][0], this.vsy + Math.cos(this.angle+i*(Math.PI*2 / this.rayAmt)) * this.rays[i][0], 5*su, [255, 255, 255, 1])
                }
            }
        }

        for (let asteroid of this.asteroids) {
            ui.circle(asteroid.x, asteroid.y, 20*su, [127, 127, 127, 1])
        }

        for (let bullet of this.bullets) {
            ui.circle(bullet.vsx, bullet.vsy, 5*su, [255, 255, 0, 1])
        }

        if (this.trail.length > 0) {
            ctx.lineJoin = "round"
            ctx.lineWidth = 5*su
            ctx.beginPath()
            ctx.moveTo(this.trail[0][0], this.trail[0][1])
            let i = 0
            for (let point of this.trail) {
                ctx.strokeStyle = `rgba(255, 127, 0, ${i/this.trail.length})`
                ctx.lineTo(point[0], point[1])
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(point[0], point[1])
                i++
            }
        }

        if (playing && this.playerTrail.length > 0) {
            ctx.lineJoin = "round"
            ctx.lineWidth = 5*su
            ctx.beginPath()
            ctx.moveTo(this.playerTrail[0][0], this.playerTrail[0][1])
            let i = 0
            for (let point of this.playerTrail) {
                ctx.strokeStyle = `rgba(255, 127, 0, ${i/this.playerTrail.length})`
                ctx.lineTo(point[0], point[1])
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(point[0], point[1])
                i++
            }
        }

        ctx.beginPath()
        this.angle -= Math.PI/2
        let s = 1
        ctx.moveTo(this.vsx+rotv2({x: -7.5*su*s, y: -10*su*s}, this.angle).x, this.vsy+rotv2({x: -7.5*su*s, y: -10*su*s}, this.angle).y)
        ctx.lineTo(this.vsx+rotv2({x: 0*su, y: -7.5*su*s}, this.angle).x, this.vsy+rotv2({x: 0*su, y: -7.5*su*s}, this.angle).y)
        ctx.lineTo(this.vsx+rotv2({x: 7.5*su*s, y: -10*su*s}, this.angle).x, this.vsy+rotv2({x: 7.5*su*s, y: -10*su*s}, this.angle).y)
        ctx.lineTo(this.vsx+rotv2({x: 0*su, y: 10*su*s}, this.angle).x, this.vsy+rotv2({x: 0*su, y: 10*su*s}, this.angle).y)
        ctx.lineTo(this.vsx+rotv2({x: -7.5*su*s, y: -10*su*s}, this.angle).x, this.vsy+rotv2({x: -7.5*su*s, y: -10*su*s}, this.angle).y)
        this.angle += Math.PI/2
        ctx.fillStyle = "rgb(0, 127, 255)"
        ctx.fill()

        if (playing) {
            ctx.beginPath()
            this.player.angle -= Math.PI/2
            ctx.moveTo(this.player.vsx+rotv2({x: -7.5*su*s, y: -10*su*s}, this.player.angle).x, this.player.vsy+rotv2({x: -7.5*su*s, y: -10*su*s}, this.player.angle).y)
            ctx.lineTo(this.player.vsx+rotv2({x: 0*su, y: -7.5*su*s}, this.player.angle).x, this.player.vsy+rotv2({x: 0*su, y: -7.5*su*s}, this.player.angle).y)
            ctx.lineTo(this.player.vsx+rotv2({x: 7.5*su*s, y: -10*su*s}, this.player.angle).x, this.player.vsy+rotv2({x: 7.5*su*s, y: -10*su*s}, this.player.angle).y)
            ctx.lineTo(this.player.vsx+rotv2({x: 0*su, y: 10*su*s}, this.player.angle).x, this.player.vsy+rotv2({x: 0*su, y: 10*su*s}, this.player.angle).y)
            ctx.lineTo(this.player.vsx+rotv2({x: -7.5*su*s, y: -10*su*s}, this.player.angle).x, this.player.vsy+rotv2({x: -7.5*su*s, y: -10*su*s}, this.player.angle).y)
            this.player.angle += Math.PI/2
            ctx.fillStyle = "rgb(255, 255, 0)"
            ctx.fill()
        }
    }
}