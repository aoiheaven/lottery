import dist from "@testing-library/user-event"

export default class Turntable {
    constructor(options) {
        this.canvas = options.canvas
        this.context = options.context
        this.startRadian = 0
        this.canBeClick = true
        this.awards = [
            {level: '1st', name: '下次一定', color: '#370958'},
            {level: '2nd', name: '徽章', color: '#f066a1'},
            {level: '3rd', name: '立牌', color: '#ed44eb'},
            {level: '4th', name: '明信片', color: '#bd79f2'},
            {level: '5th', name: '抱枕', color: '#eeb04f'},
            {level: '6th', name: '钥匙扣', color: '#14c771'}
        ]
    }
    
    drawPanel() {
        const context = this.context
        const startRadian = this.startRadian
        context.save()
        context.beginPath()
        context.fillStyle = '#e8185f'  // pink? #f272b9
        context.arc(150, 75, 75, this.startRadian, 2*Math.PI, false)
        context.fill()
        context.restore()
    }

    getLineTextList(context, text, maxLineWidth) {
        let wordList = text.split('')
        let tempLine = ''
        let lineList = []
        for (let i=0; i<wordList.length; i++) {
            if (context.measureText(tempLine).width >= maxLineWidth) {
                lineList.push(tempLine)
                maxLineWidth -= context.measureText(text[0]).width
                tempLine = ''
            }
            tempLine += wordList[i]
        }
        // console.log(tempLine);
        lineList.push(tempLine)
        return lineList
    }

    drawPrizeBlock() {
        const context = this.context
        const awards = this.awards
        let startRadian = this.startRadian, RadianGap = Math.PI*2/awards.length, endRadian = startRadian + RadianGap
        for (let i=0; i<awards.length; i++) {
            context.save()
            context.beginPath()
            // context.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16)
            context.fillStyle = awards[i].color
            context.moveTo(150, 75)
            context.arc(150, 75, 70, startRadian, endRadian, false)
            context.fill()
            context.restore()
            context.save()

            context.fillStyle = '#FFFFFF'
            context.font = '14px Arial'
            context.translate(
                150 + 70*Math.cos(startRadian + RadianGap/2),
                75 + 70*Math.sin(startRadian + RadianGap/2)
            )
            context.rotate(startRadian + RadianGap/2 + Math.PI/2);
            this.getLineTextList(context, awards[i].name, 70).forEach(
                (line, index) => {
                    context.fillText(line, -context.measureText(line).width/2, ++index*25);
                }
            )
            // context.fillText(line, -context.measureText(line).width/2, ++index*25);
            context.restore()
            startRadian += RadianGap
            endRadian += RadianGap
        }
    }
    
    drawButton() {
        const context = this.context
        context.save()
        context.beginPath()
        context.fillStyle = '#FFFFFF'
        context.arc(150, 75, 18, 0, 2*Math.PI, false)
        context.fill()
        context.restore()

        context.save()
        context.beginPath()
        context.fillStyle = '#FF0000'
        context.font = '14px Arial'
        context.translate(150, 75)
        context.fillText('抽爆', -context.measureText('抽爆').width/2, 5)
        context.restore()
    }

    drawArrow() {
        const context= this.context
        context.save()
        context.beginPath()
        context.moveTo(140, 65)
        context.lineTo(150, 35)
        context.lineTo(160, 65)
        context.fillStyle = '#FFFFFF'
        context.closePath()
        context.fill()
        context.restore()
    }

    windowToCanvas(canvas, e) {
        const canvasPosition = canvas.getBoundingClientRect()
        const x = e.clientX
        const y = e.clientY
        return {
            x: x - canvasPosition.left,
            y: y - canvasPosition.top
        }
    }

    startRotate() {
        const canvas = this.canvas
        const context = this.context
        const canvasStyle = canvas.getAttribute('style')
        this.render()
        canvas.addEventListener(
            'mousedown', e => {
                if (!this.canBeClick) return
                this.canBeClick = false
                let position = this.windowToCanvas(canvas, e)
                context.beginPath()
                context.arc(350, 175, 35, 0, 2*Math.PI, false)  // click judge region
                // console.log('\nposx = '+position.x + '\n' + 'posy = ' + position.y)
                if (context.isPointInPath(position.x, position.y)) {
                    // console.log('start rotate!')
                    this.startRadian = 0
                    const distance = this.distanceToStop()
                    this.rotatePanel(distance)
                }
            }
        )
        // TODO: modify mouse style
        canvas.addEventListener(
            'mousedown', e => {
                let position = this.windowToCanvas(canvas, e)
                context.beginPath()
                context.arc(350, 175, 35, 0, 2*Math.PI, false)  // click judge region
                if (context.isPointInPath(position.x, position.y)) {
                    canvas.setAttribute('style', `cursor: pointer;${canvasStyle}`)
                } else {
                    canvas.setAttribute('style', canvasStyle)
                }
            }
        )
    }

    distanceToStop() {
        let middleAngle = 0, distance = 0
        const awardsToAngleList = this.awards.map(
            (data, index) => {
                let awardRadian = (Math.PI * 2) / this.awards.length
                return awardRadian * index + (awardRadian) / 2  // ... + (awardRadian*(index+1)-awardRadian)/2
            }
        )
        const currentPrizeIndex = Math.floor(Math.random()*this.awards.length)  // TODO: fetch data from BE
        console.log('中了啥? : ' + this.awards[currentPrizeIndex].name)
        middleAngle = awardsToAngleList[currentPrizeIndex]
        distance = Math.PI *3/2 - middleAngle
        distance = distance > 0 ? distance: Math.PI * 2 + distance
        console.log('distance = ' + distance)
        return distance + Math.PI * 10
    }

    rotatePanel(distance) {
        let changeRadian = (distance - this.startRadian) / 10
        this.startRadian += changeRadian
        if (distance-this.startRadian <= 0.05) {
            this.canBeClick = true
            return
        }
        // this.startRadian += Math.PI * (2/180)  // add 2° each call
        this.render()  // re-render
        window.requestAnimationFrame(this.rotatePanel.bind(this, distance))
    }

    render() {
        this.drawPanel()
        this.drawPrizeBlock()
        this.drawArrow()
        this.drawButton()
    }
}