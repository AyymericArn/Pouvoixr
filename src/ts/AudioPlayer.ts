import { AudioAnalyser } from "three"
import Wavesurfer from "wavesurfer.js"
import playSrc from "../media/img/play.svg"
import pauseSrc from "../media/img/pause.svg"
// const introsrc = require("../media/introduction.mp3")
const audio1src = require("../media/1.mp3")
const audio2src = require("../media/2.mp3")
const audio3src = require("../media/3.mp3")
// const conclu = require("../media/conclusion.mp3")

export default class AudioPlayer {

    $audio: HTMLAudioElement
    $audios: HTMLAudioElement[]
    currentTrack: number
    currentTimes: number[]
    audioContext: AudioContext
    track: MediaElementAudioSourceNode
    $playerControls: {
        backward: Element,
        play: Element,
        forward: Element,
    }
    analyzer: AnalyserNode[]
    waveform: Float32Array
    emitter: EventTarget

    constructor() {
        this.currentTrack = 0
        this.currentTimes = [0, 0, 0]
        this.$audios = [
            new Audio(),
            new Audio(),
            new Audio(),
        ]
        this.restoreProgression()
        this.$playerControls = {
            backward: document.querySelector('.audio-controls .backward'),
            play: document.querySelector('.audio-controls .play'),
            forward: document.querySelector('.audio-controls .forward')
        }
        // this.bindAudioControls()
        // this.createAudioAnalyzer()
        this.emitter = new EventTarget()
    }

    addSource = () => {

        // this.$audios.forEach(a =>{ a.preload = 'metadata' })

        const sources = [
            // introsrc,
            audio1src,
            audio2src,
            audio3src,
            // conclu,
        ]

        sources.forEach((s, i) => {
            this.$audios[i].src = s
            this.$audios[i].load()
        })
    }

    bindAudioControls = () => {
        this.$playerControls.backward.addEventListener('click', () => {
            this.$audios[this.currentTrack].currentTime -= 10
            
            this.$playerControls.backward.children[0].classList.add('research')
            setTimeout(() => {
                this.$playerControls.backward.children[0].classList.remove('research')
            }, 200);
        })

        this.$playerControls.play.addEventListener('click', () => {
            if ( this.$audios[this.currentTrack].paused ) {
                this.audioContext.state === 'suspended' ? this.audioContext.resume() : null;
                this.$audios[this.currentTrack].play()
                this.$playerControls.play.children[0].classList.add('switch-play-state')
                setTimeout(() => {
                    (this.$playerControls.play.children[0] as HTMLImageElement).src = pauseSrc
                }, 100);
                setTimeout(() => {
                    this.$playerControls.play.children[0].classList.remove('switch-play-state')
                }, 200);
            } else {
                this.$audios[this.currentTrack].pause()
                this.$playerControls.play.children[0].classList.add('switch-play-state')
                setTimeout(() => {
                    (this.$playerControls.play.children[0] as HTMLImageElement).src = playSrc
                }, 100);
                setTimeout(() => {
                    this.$playerControls.play.children[0].classList.remove('switch-play-state')
                }, 200);
                this.emitter.dispatchEvent(new Event('pause'))
            }
        })

        this.$playerControls.forward.addEventListener('click', () => {
            this.$audios[this.currentTrack].currentTime += 10

            this.$playerControls.forward.children[0].classList.add('research')
            setTimeout(() => {
                this.$playerControls.forward.children[0].classList.remove('research')
            }, 200);
        })
    }

    addWaveForm = () => {
        document.querySelector('#waveform').innerHTML = ''
        const wavesurfer = Wavesurfer.create({
            container: '#waveform',
            waveColor: '#444444',
            progressColor: '#ff7a00',
            backend: 'MediaElement',
        })
        // wavesurfer.setMute(true)
        wavesurfer.load(this.$audios[this.currentTrack])
        this.$audios[this.currentTrack].currentTime = this.currentTimes[this.currentTrack]
        // wavesurfer.skip(this.currentTimes[this.currentTrack])
    }

    restoreProgression = () => {
        this.$audios.forEach((a, i) => {
            this.currentTimes[i] = Math.round(parseInt(localStorage.getItem(`track_${i}_currentTime`)))
            // a.currentTime = parseInt(localStorage.getItem(`track_${i}_currentTime`))
        })
    }

    saveProgression = () => {
        this.$audios.forEach((a, i) => {
            this.currentTimes[i] = a.currentTime
            localStorage.setItem(`track_${i}_currentTime`, `${a.currentTime}`)
        })
    }

    createAudioAnalyzer = () => {

        this.audioContext = new AudioContext()
        this.analyzer = []
        this.$audios.forEach((a, i) => {
            this.track = this.audioContext.createMediaElementSource(this.$audios[i])
            this.analyzer.push(this.audioContext.createAnalyser())
            this.track.connect(this.analyzer[i]).connect(this.audioContext.destination)
            this.analyzer[i].fftSize = 2048
            const BufferSize = this.analyzer[i].frequencyBinCount
            this.waveform = new Float32Array(BufferSize)
        })

        // setInterval(() => {
        //     console.log(this.waveform)
        // }, 1000)
    }

    // changeAudioAnalyserTrack = () => {
    //     const track = this.audioContext.createMediaElementSource(this.$audios[this.currentTrack])
    //     this.analyzer = this.audioContext.createAnalyser()
    //     track.connect(this.analyzer).connect(this.audioContext.destination)

    // }
}