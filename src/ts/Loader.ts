import Engine from "./app"
// import { createjs } from "preloadjs/lib/preloadjs"
// require("preloadjs")
// import createjs from "preload-js"

export default class Loader {

    $images: HTMLImageElement[]
    state: number
    maxState: number
    engine: Engine

    constructor(engine) {
        this.$images = [
            ...document.querySelectorAll('img'),
        ]

        this.engine = engine

        this.onLoad()

        this.engine.audioPlayer.addSource()
        this.engine.audioPlayer.bindAudioControls()
        this.engine.audioPlayer.createAudioAnalyzer()

        this.engine.animate()

        this.state = 0
        this.maxState = (this.engine.audioPlayer.$audios.length * 5)+1
    }

    onLoad = () => {
        
        const cb = (e) => {
            this.state++
            this.updateLoadState()
            if (this.state === this.maxState) {
                document.querySelector('.loader span').classList.add('invisible')
                setTimeout(() => {
                    this.loadScene()
                }, 2000)
            }
        }

        window.addEventListener('load', cb) 
        
        this.engine.audioPlayer.$audios.forEach(_el => {
            _el.addEventListener('loadstart', cb)
            _el.addEventListener('loadedmetadata', cb)
            _el.addEventListener('loadeddata', cb)
            _el.addEventListener('canplay', cb)
            _el.addEventListener('canplaythrough', cb)
        })
    }

    // onLoad2 = () => {
    //     const queue = new createjs.LoadQueue(false)
    //     queue.on('fileload', () => {
    //         console.log('youpii')
    //     })
    //     queue.loadFile('./media/episode_1.mp3')
    // }

    updateLoadState = () => {
        (document.querySelector('.loader .progress-bar') as HTMLElement).style.transform = `scaleX(${this.state / this.maxState})`
    }

    loadScene = () => {
        document.querySelector('.loader').classList.add('invisible')
        setTimeout(() => {
            ;(document.querySelector('.loader') as HTMLElement).style.zIndex = '-25'
        }, 2000)
    }
}