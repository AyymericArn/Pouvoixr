import { AudioAnalyser } from "three"

export default class AudioPlayer {

    $audio: HTMLAudioElement
    audioContext: AudioContext
    $playerControls: {
        backward: Element,
        play: Element,
        forward: Element,
    }
    analyzer: AnalyserNode
    waveform: Float32Array
    emitter: EventTarget

    constructor() {
        this.$audio = document.querySelector('audio')
        this.$playerControls = {
            backward: document.querySelector('.audio-controls .backward'),
            play: document.querySelector('.audio-controls .play'),
            forward: document.querySelector('.audio-controls .forward')
        }
        this.bindAudioControls()
        this.createAudioAnalyzer()
        this.emitter = new EventTarget()
    }

    bindAudioControls = () => {
        this.$playerControls.backward.addEventListener('click', () => {
            this.$audio.currentTime -= 10
        })
        this.$playerControls.play.addEventListener('click', () => {
            if ( this.$audio.paused ) {
                this.audioContext.state === 'suspended' ? this.audioContext.resume() : null;
                this.$audio.play()
                this.$playerControls.play.textContent = '||'
            } else {
                this.$audio.pause()
                this.$playerControls.play.textContent = '|>'
                this.emitter.dispatchEvent(new Event('pause'))
            }
        })
        this.$playerControls.forward.addEventListener('click', () => {
            this.$audio.currentTime += 10
        })
    }

    createAudioAnalyzer = () => {
        this.audioContext = new AudioContext
        const track = this.audioContext.createMediaElementSource(this.$audio)
        this.analyzer = this.audioContext.createAnalyser()
        track.connect(this.analyzer).connect(this.audioContext.destination)

        this.analyzer.fftSize = 2048
        const BufferSize = this.analyzer.frequencyBinCount
        this.waveform = new Float32Array(BufferSize)

        // setInterval(() => {
        //     console.log(this.waveform)
        // }, 1000)
    }
}