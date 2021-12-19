export default class Turntable {
    constructor(options) {
        this.canvas = options.canvas
        this.context = options.context
        this.awards = [
            {level: '1st', name: ''}
        ]
    }
    
    drawPanel() {
        const context = this.context
        context.save()
        context.beginPath()
        context.fillStyle = '#f272b9'  // pink? #f272b9
        context.arc(150, 75, 75, 0, 2*Math.PI, false)
        context.fill()
        context.restore()
    }

    drawPrizeBlock() {
        const context = this.context
        let startRadian = 0, RadianGap = Math.PI*2/6, endRadian = startRadian + RadianGap
        for (let i=0; i<6; i++) {
            context.save()
            context.beginPath()
            context.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16)
            context.moveTo(150, 75)
            context.arc(150, 75, 70, startRadian, endRadian, false)
            startRadian += RadianGap
            endRadian += RadianGap
            context.fill()
            context.restore()
        }
    }

    render() {
        this.drawPanel()
        this.drawPrizeBlock()
    }
}