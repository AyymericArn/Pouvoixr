import { gsap } from "gsap"
import Engine from "./app";

export default class Parallax {

    $pannel: HTMLElement;
    $pannelElements: HTMLElement[];
    $introTexts: HTMLElement[];
    windowWidth: number
    windowHeight: number
    state: number
    engine: Engine

    constructor(engine: Engine) {
        this.$pannel = document.querySelector('.pannel')
        this.$pannelElements = [...document.querySelectorAll('.pannel div')] as HTMLElement[]
        this.$introTexts = [...document.querySelectorAll('.intro h1, .intro em, .intro ul, .intro p')] as HTMLElement[]

        this.windowWidth = window.innerWidth
        this.windowHeight = window.innerHeight
        
        window.addEventListener('resize', () => {
            this.windowWidth = window.innerWidth
            this.windowHeight = window.innerHeight
        })

        this.engine = engine

        this.handleMove()
    }

    handleMove = () => {
        window.addEventListener('mousemove', (e) => {
            const ratioX = e.clientX / this.windowWidth - 0.5
            const ratioY = e.clientY / this.windowHeight - 0.5

            for (const _el of this[!this.engine.state.intro ? '$pannelElements' : '$introTexts']) {
                const leftValue = parseFloat(_el.dataset.depth ?? '1') *  ratioX * 15
                const topValue = parseFloat(_el.dataset.depth ?? '1') *  ratioY * 15
                const blur = _el.dataset.noblur ? 0 : 1

                gsap.to(_el, {
                    x: -leftValue,
                    y: -topValue,
                    rotateY: `${1 + (ratioX - 0.2 + ratioY)}deg`,
                    scale: 1 + (ratioX - 0.2 + ratioY) / 100,
                    filter: `blur(${Math.abs(ratioX - 0.2 + ratioY) * 2 * parseFloat(_el.dataset.depth) * blur}px)`,
                    duration: 2,
                    ease: "power4.out",
                });
                // _el.style.transform = `translate(${-leftValue}%, ${-topValue}%)`
            }
        })

    }
}