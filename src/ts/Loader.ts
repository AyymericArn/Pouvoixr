import Engine from "./app"

export default class Loader {

    $elements: HTMLElement[]
    state: number
    engine: Engine

    constructor(engine) {
        this.$elements = [
            ...document.querySelectorAll('img'),
            ...document.querySelectorAll('audio'),
        ]

        this.engine = engine

        this.onLoad()

        this.engine.audioPlayer.addSource()
        this.engine.audioPlayer.bindAudioControls()
        this.engine.audioPlayer.createAudioAnalyzer()

        this.engine.animate()

        this.state = 0/this.$elements.length
    }

    onLoad = () => {
        
        const cb = () => {
            console.log('loaded !');
            
            this.state++
            this.updateLoadState()
            if (this.state === 1) {
                this.loadScene()
            }
        }

        this.$elements.forEach(_el => {
            _el.addEventListener('loadedmetadata', cb)
        })
    }

    updateLoadState = () => {
        (document.querySelector('.loader .progress-bar') as HTMLElement).style.transform = `scaleX(${this.state})`
    }

    loadScene = () => {

    }
}