export default class MagneticButtons {

    button: HTMLButtonElement
    threshold: number
    state: any

    constructor(button: HTMLButtonElement, threshold: number) {
        this.button = button

        console.log(button)

        this.state = {
            bounds: this.button.getBoundingClientRect(),
            threshold: threshold,
            ratio: 3.5,
            isMagnetic: false,
            mouse: {
                x: 0,
                y: 0
            },
            ease: {
                x: 0,
                y: 0,
                scale: 1,
                value: 0.225
            },
            transform: {
                x: 0,
                y: 0,
                scale: 1,
                max: 100
            },
            width: window.innerWidth,
            height: window.innerHeight,
            history: false,
            scale: 1.2
        }

        document.addEventListener('mousemove', this.mouseMove, false)
        window.addEventListener('resize', this.resize)
    }

    mouseMove = ({ pageX, pageY }) => {
        Object.assign(this.state, {
            mouse: {
                x: pageX,
                y: pageY
            },
            isMagnetic: this.isMagnetic(pageX, pageY)
        })
    }
    
    resize = () => {
        if (window.innerWidth < 1920) {
            document.removeEventListener('mousemove', this.mouseMove, false)
        }
        Object.assign(this.state, {
            bounds: this.button.getBoundingClientRect(),
            width: window.innerWidth,
            height: window.innerHeight
        })
    }

    run = () => {
        
        const { isMagnetic, transform, mouse, width, height, ease, max, scale } = this.state
    
        transform.x = isMagnetic ? (mouse.x - width / 2) / width * transform.max * 5 : 0
        transform.y = isMagnetic ? (mouse.y - height / 2) / height * transform.max * 3 - 120 : 0
        transform.scale = isMagnetic ? scale : 1
        
        // basic linear interpolation
        ease.x += (transform.x - ease.x) * ease.value
        ease.y += (transform.y - ease.y) * ease.value
        ease.scale += (transform.scale - ease.scale) * ease.value
    
        Object.assign(this.button.style, {
            transform: `
                translate(
                    ${ease.x.toFixed(2)}px,
                    ${ease.y.toFixed(2)}px
                )
                translateZ(0)
                scale(
                    ${(ease.scale).toFixed(2)}
                )`
        })
        
        // @ts-ignore
        // Object.assign(this.button.children[0].style, {
        //     transform: `
        //         translate(
        //             ${(-ease.x  / this.state.ratio).toFixed(2)}px,
        //             ${(-ease.y  / this.state.ratio).toFixed(2)}px
        //         )
        //         translateZ(0)
        //         scale(
        //             ${(1 / ease.scale).toFixed(2)}
        //         )`
        // })
    }

    isMagnetic = (x, y) => {
        const { bounds } = this.state
        
        const centerX = bounds.left + (bounds.width / 2)
        const centerY = bounds.top + (bounds.height / 2)
        
        // use pythagorean theorem to calculate
        // cursor distance from center of btn
        // a^2 + b^2 = c^2
        const a = Math.abs(centerX - x)
        const b = Math.abs(centerY - y)
        const c = Math.sqrt(a * a + b * b)
        
        // true if cursor distance from center of btn is
        // equal to btn radius + threshold
        const isHover = c < (bounds.width / 2) + this.state.threshold
    
        if (!this.state.history && isHover) {
            this.button.classList.add('is-hover')
            Object.assign(this.state, {
                threshold: this.state.threshold * this.state.ratio,
                history: true
            })
        } else if (this.state.history && !isHover) {
            this.button.classList.remove('is-hover')
            Object.assign(this.state, {
                threshold: this.state.threshold / this.state.ratio,
                history: false
            })
        }
    
        return isHover
    }
}