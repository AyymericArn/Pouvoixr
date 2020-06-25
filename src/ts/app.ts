import * as THREE from "three"
import TWEEN from "@tweenjs/tween.js"
import Shapes from "./Shapes"
import AudioPlayer from "./AudioPlayer"
import MagneticButtons from "./MagneticButtons"
import Loader from "./Loader"
import withSpeechCommands from "./withSpeechCommands"
import particlesData from "./particles.json"
require("particles.js")

const cameraStates = [
    {x: -4, y: -3, z: 5},
    {x: 11, y: 6, z: -5},
    {x: 19, y: 12, z: -15},
    
    // initial state
    {x: -11, y: -6, z: 15},
]

export default class Engine {

    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.WebGLRenderer
    shapes: Shapes
    audioPlayer: AudioPlayer
    lights: { ambient: THREE.AmbientLight, frontal: THREE.DirectionalLight }
    state: {
        intro: boolean
        step: number
        frameCounter: number
    }
    raycaster: THREE.Raycaster
    mouse: THREE.Vector2
    $el: {
        pannel: Element
    }
    particles: unknown
    buttonsMagnetism: MagneticButtons[]

    constructor(shapes, audioPlayer) {
        this.scene = new THREE.Scene()
        this.scene.fog = new THREE.Fog(0xdddddd, 9, 20)
        for (const m of shapes.meshes) {
            
            this.scene.add(m)
        }
        
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
        // this.camera.position.x = -4
        // this.camera.position.y = -3
        // this.camera.position.z = 5
        this.camera.position.x = cameraStates[cameraStates.length - 1].x
        this.camera.position.y = cameraStates[cameraStates.length - 1].y
        this.camera.position.z = cameraStates[cameraStates.length - 1].z
        
        this.renderer = new THREE.WebGLRenderer({alpha: true})
        this.renderer.setClearAlpha(0.0)
        this.renderer.setClearColor(0x000000, 0)
        this.renderer.setPixelRatio( window.devicePixelRatio )

        this.lights = {
            ambient: new THREE.AmbientLight(0xffffff, 1.4),
            frontal: new THREE.DirectionalLight(0xffcccc, 0.3)
        }
        this.lights.frontal.position.x = 1
        this.lights.frontal.position.y = 1
        this.lights.frontal.position.z = 1
        this.lights.frontal.castShadow = true
        this.lights.frontal.shadow.camera.top = 0.6
        this.lights.frontal.shadow.camera.right = 0.6
        this.lights.frontal.shadow.camera.bottom = - 0.6
        this.lights.frontal.shadow.camera.left = - 0.6
        for (const l of Object.values(this.lights)) {
            this.scene.add(l)
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild( this.renderer.domElement )
        
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        })

        this.mouse = new THREE.Vector2

        this.state = {
            intro: true,
            step: 0,
            frameCounter: 0
        }

        this.shapes = shapes
        this.audioPlayer = audioPlayer
        this.buttonsMagnetism = []

        // this.setupParticles()

        this.listenPause()

        this.bindControls()

        this.bindShapeActions()

        this.setupIntro()

        // this.animate()
    }
    
    animate = () => {
        requestAnimationFrame( this.animate )
        TWEEN.update()
        this.shapeHover()
        this.shapes.rotate()

        // keep track of frame number to give custom rythm to animations
        this.state.frameCounter === 60 ? this.state.frameCounter = 0 : this.state.frameCounter++
        if (!this.audioPlayer.$audios[this.state.step].paused && this.state.frameCounter % 2 === 0) {
            this.shapes.warpVertices( this.audioPlayer.waveform, this.state.step )
        }

        // this needs to be done at each frame for animation smoothness
        if (!this.audioPlayer.$audios[this.state.step].paused) {
            this.shapes.updateShapeVertices( this.state.step )
        }
        this.audioPlayer.analyzer.getFloatTimeDomainData(this.audioPlayer.waveform)
        for (const b of this.buttonsMagnetism) {
            b.run()
        }
        
        this.renderer.render( this.scene, this.camera )
    }

    prevStep = () => {
        if (this.state.step > 0) {
            this.state.step--
            const tween = new TWEEN.Tween(this.camera.position).to(cameraStates[this.state.step], 2000)
            tween.easing(TWEEN.Easing.Cubic.InOut)
            tween.start()

            this.audioPlayer.currentTrack--

            this.$el.pannel.classList.add('changing-step')
            setTimeout(() => {
                this.$el.pannel.classList.remove('changing-step')
            }, 2000);
        }
    }

    nextStep = () => {
        if (this.state.step < 2) {
            this.state.step++
            const tween = new TWEEN.Tween(this.camera.position).to(cameraStates[this.state.step], 2000)
            tween.easing(TWEEN.Easing.Cubic.InOut)
            tween.start()

            this.audioPlayer.currentTrack++

            this.$el.pannel.classList.add('changing-step')
            setTimeout(() => {
                this.$el.pannel.classList.remove('changing-step')
            }, 2000);
        }
    }

    bindControls = () => {
        const buttons = {
            prev: document.querySelector('.previous') as HTMLButtonElement,
            next: document.querySelector('.next') as HTMLButtonElement,
        }
        this.$el = {
            pannel: document.querySelector('.pannel')
        }

        buttons.prev.addEventListener('click', this.prevStep)
        buttons.next.addEventListener('click', this.nextStep)

        this.setButtonsMagnetism(buttons.prev, buttons.next)
    }

    listenPause = () => {
        this.audioPlayer.emitter.addEventListener('pause', () => {
            setTimeout(() => {
                this.shapes.updateShapeVertices( this.state.step )
            }, 32)
            // this.shapes.resetVertices(this.state.step)
        })
    }

    bindShapeActions = () => {
        // const v = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5)
        this.raycaster = new THREE.Raycaster()
        

        window.addEventListener('mousemove', ( e ) => {
            this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1
            this.mouse.y = ( e.clientY / window.innerHeight ) * 2 + 1
        })
    }

    setButtonsMagnetism = (...buttons: HTMLButtonElement[]) => {
        for (const b of buttons) {
            this.buttonsMagnetism.push(new MagneticButtons(b, 20))
        }
    }

    setupIntro = () => {
        const $scene = document.querySelector('canvas')
        $scene.classList.add('invisible')
        const $start = document.querySelector('.intro button')
        $start.addEventListener('click', () => {
            this.displayScene()
        })
    }

    displayScene = () => {
        const $intro = document.querySelector('.intro')
        $intro.classList.add('invisible')
        setTimeout(() => {
            $intro.classList.add('vanished')
        }, 1500);
        const $app = document.querySelector('.app')
        const $scene = document.querySelector('canvas')
        $app.classList.remove('invisible')
        $scene.classList.remove('invisible')
        const tween = new TWEEN.Tween(this.camera.position).to(cameraStates[0], 1500)
        tween.easing(TWEEN.Easing.Cubic.InOut)
        tween.start()
    }

    shapeHover = () => {
        
        // const meshes = this.shapes.meshes.map(m => {
        //     m.updateMatrix()
        //     m.updateMatrixWorld()
        //     return m.children[0]
        // })

        // this.raycaster.setFromCamera( this.mouse, this.camera )
        // const intersects = this.raycaster.intersectObjects( meshes, true )
        // for ( let i = 0; i < intersects.length; i++ ) {
        //     console.log('hey')
        //     // @ts-ignore
        //     intersects[ i ].object.material.color.set( 0xff0000 );
        // }
    }

    setupParticles = () => {
        // @ts-ignore
        // particlesJS.load('container', 'particles.json', () => {

        // })
        particlesJS('particles-js', particlesData)
    }
}

new Loader(
    withSpeechCommands(new Engine(new Shapes(), new AudioPlayer))
)