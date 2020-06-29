import * as THREE from "three"
import TWEEN from "@tweenjs/tween.js"


// type CustomMesh = THREE.Object3D & { bounce?: number }

export default class Shapes {
    materials: THREE.Material[]
    meshes: THREE.Object3D[]

    background: THREE.Mesh

    initialVerticesPosition: THREE.Vector3[][]

    constructor () {

        const geometries = [
            new THREE.OctahedronGeometry(0.8, 1),
            new THREE.OctahedronGeometry(0.8, 1),
            new THREE.OctahedronGeometry(0.8, 1),
        ]

        const edges = geometries.map(g => new THREE.EdgesGeometry( g ))

        this.materials = [
            // new THREE.ShaderMaterial( { uniforms: { uWaveForm: { value: 0 } }, vertexShader: document.getElementById('vertexShader').textContent} ),
            // new THREE.ShaderMaterial( { uniforms: { uWaveForm: { value: 0 } }, vertexShader: document.getElementById('vertexShader').textContent} ),
            // new THREE.ShaderMaterial( { uniforms: { uWaveForm: { value: 0 } }, vertexShader: document.getElementById('vertexShader').textContent} ),
            new THREE.MeshPhongMaterial( { color: 0xff7900, flatShading: true } ),
            new THREE.MeshPhongMaterial( { color: 0xff7900, flatShading: true } ),
            new THREE.MeshPhongMaterial( { color: 0xff7900, flatShading: true } ),
            // new THREE.MeshStandardMaterial( { color: 0xffaa00, roughness: 0.6, metalness: 0.2 } ),
            // new THREE.MeshStandardMaterial( { color: 0xffaa00, roughness: 0.6, metalness: 0.2 } ),
            // new THREE.MeshStandardMaterial( { color: 0xffaa00, roughness: 0.6, metalness: 0.2 } ),
        ]

        // var material = new THREE.MeshPhongMaterial( {
        //     specular: 0xffffff,
        //     envMap: textureCube,
        //     shininess: 50,
        //     reflectivity: 1.0,
        //     flatShading: true
        // } );

        this.meshes = geometries.map((_, i) => {
            const shape = new THREE.Object3D()
            shape.add(new THREE.Mesh( geometries[i], this.materials[i] ))
            shape.add(new THREE.LineSegments( edges[i], new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2, opacity: 0.0, transparent: true } ) ))
            
            const outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide, transparent: true } );
            const outlineMesh = new THREE.Mesh( geometries[i], outlineMaterial );
            outlineMesh.scale.multiplyScalar(1.05);
            shape.add(outlineMesh)
            
            return shape
        })
        
        this.meshes[2].position.x = 16
        this.meshes[2].position.y = 12
        this.meshes[2].position.z = -20
        
        this.meshes[1].position.x = 8
        this.meshes[1].position.y = 6
        this.meshes[1].position.z = -10
        
        this.meshes[0].position.x = -7
        this.meshes[0].position.y = -3
        this.meshes[0].position.z = 0

        this.initialVerticesPosition = []

        // save the initial state of the vertices of each geometry
        // TODO: optimize for performance

        ;(async() => {
            for (const m of this.meshes) {
                this.initialVerticesPosition.push(
                    JSON.parse (
                        JSON.stringify(
                            ((m.children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices
                        )
                    )
                )
            }
        })()

        this.bounce()

        this.setupBackground()

        console.table(this.meshes)
    }

    bounce = () => {

        // const AnimationClipCreator = {
        //     times: [0, 2],
        //     values: [-1, 1],
        //     axis: 'y',
        // }
        // const track = new THREE.NumberKeyframeTrack('bounce', AnimationClipCreator.times, AnimationClipCreator.values)


        
        for (const i in this.meshes) {

            setTimeout(() => {
                const tween = new TWEEN.Tween( this.meshes[i].position ).to(new THREE.Vector3( this.meshes[i].position.x, this.meshes[i].position.y + 0.3, this.meshes[i].position.z ), 500)
                const tween2 = new TWEEN.Tween( this.meshes[i].position ).to(new THREE.Vector3( this.meshes[i].position.x, this.meshes[i].position.y - 0.3, this.meshes[i].position.z ), 1000)
                const tween3 = new TWEEN.Tween( this.meshes[i].position ).to(new THREE.Vector3( this.meshes[i].position.x, this.meshes[i].position.y, this.meshes[i].position.z ), 500)
                
                tween.easing(TWEEN.Easing.Quadratic.Out)
                tween2.easing(TWEEN.Easing.Quadratic.InOut)
                tween3.easing(TWEEN.Easing.Quadratic.In)
                    
                tween.chain(tween2)
                tween2.chain(tween3)
                tween3.chain(tween)
                tween.start()
            }, 600 * Number(i));
        }
    }
    
    rotate = () => {
        for (const m of this.meshes) {
            m.rotation.x += 0.01
            m.rotation.y -= 0.005
            m.rotation.z += 0.015
        }
    }

    warpVertices = (waveForm: Float32Array, stepIndex: number) => {

        let values: number[] = []
        for (let i = 0; i < waveForm.length; i+=56) {
            const value = waveForm
                .slice(i, i+55)
                .reduce((prev, cur) => prev + cur) / 56;

            values.push(Math.sin(value * 100) / 10)
        }

        for (const index in ((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices) {
            const vertices = ((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices[index];
            
            const tween = new TWEEN.Tween( vertices ).to(
                new THREE.Vector3(
                    this.initialVerticesPosition[stepIndex][index].x + values[index],
                    this.initialVerticesPosition[stepIndex][index].y + values[index],
                    this.initialVerticesPosition[stepIndex][index].z + values[index]
                ),
                32
            )
            tween.easing(TWEEN.Easing.Quadratic.InOut)
            tween.start()

            // ;((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices[index].y = this.initialVerticesPosition[stepIndex][index].y + values[index]
            // ;((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices[index].z = this.initialVerticesPosition[stepIndex][index].z + values[index]            
        }
    }

    updateShapeVertices = (stepIndex: number) => {
        ;((this.meshes[stepIndex].children[1] as THREE.LineSegments).geometry as THREE.EdgesGeometry).fromGeometry(((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry))
        // @ts-ignore
        ;((this.meshes[stepIndex].children[1] as THREE.LineSegments).geometry as THREE.EdgesGeometry).attributes.position.needsUpdate = true
        ;((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).verticesNeedUpdate = true

    }
    
    resetVertices = (stepIndex: number) => {
        console.log('reset shape')
        console.table(this.initialVerticesPosition[0])
        console.table(this.initialVerticesPosition[1])
        console.table(this.initialVerticesPosition[2])
        for (const index in ((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices) {
            ;((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices[index].x = this.initialVerticesPosition[stepIndex][index].x
            ;((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices[index].y = this.initialVerticesPosition[stepIndex][index].y
            ;((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).vertices[index].z = this.initialVerticesPosition[stepIndex][index].z
        }
        ;((this.meshes[stepIndex].children[1] as THREE.LineSegments).geometry as THREE.EdgesGeometry).fromGeometry(((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry))
        // @ts-ignore
        ;((this.meshes[stepIndex].children[1] as THREE.LineSegments).geometry as THREE.EdgesGeometry).attributes.position.needsUpdate = true
        ;((this.meshes[stepIndex].children[0] as THREE.Mesh).geometry as THREE.Geometry).verticesNeedUpdate = true
    }

    setupBackground = () => {
        const background = new THREE.PlaneGeometry(50, 50, 25, 25)
        const material = new THREE.MeshPhongMaterial({ color: 0x999999, flatShading: true })
        material.onBeforeCompile = (shader) => {
            shader.uniforms.time = { value: 0 }
            shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    'vec3 vNormal = vec3(0);',
                    `float theta = sin( time + position.y + position.x ) / ${ Number(40).toFixed( 1 ) };`,
                    'float c = cos( theta );',
                    'float s = sin( theta );',
                    // 'mat3 m = mat3( c, 0, s, c, 1, s, -s, 0, -s );',
                    'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
                    'vec3 transformed = vec3( position ) * m;',
                    'vNormal = vNormal * m;'
                    
                    // `
                    // float vWaveEffect = 0.0;
                    // vec3 vNormal = vec3(0);
                    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            
                    // float waveEffect = sin(modelPosition.y * 10.0 + time * 0.03) + sin(modelPosition.x * 10.0 + time * 0.3);
                    // modelPosition.xyz += normal * vec3(waveEffect) * 0.2;
            
                    // vNormal = normal;
                    // vWaveEffect = waveEffect;
            
                    // gl_Position = projectionMatrix * viewMatrix * modelPosition;`
                ].join('\n')
            )

            material.userData.shader = shader;
        };

        // const shader = new THREE.ShaderMaterial({
        //     uniforms: { uTime: { value: 0 } },
        //     vertexShader:     `
        //     uniform float uTime;
            
        //     varying vec3 vNormal;
        //     varying float vWaveEffect;
            
        //     void main()
        //     {
        //         vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            
        //         float waveEffect = sin(modelPosition.y * 10.0 + uTime * 0.03) + sin(modelPosition.x * 10.0 + uTime * 0.3);
        //         modelPosition.xyz += normal * vec3(waveEffect) * 0.2;
            
        //         vNormal = normal;
        //         vWaveEffect = waveEffect;
            
        //         gl_Position = projectionMatrix * viewMatrix * modelPosition;
        //     }
        //         `,
        //     fragmentShader:     `
        //     varying vec3 vNormal;
        //     varying float vWaveEffect;
            
        //     void main()
        //     {
        //         // vec3 color = vec3(0.5, 0.5, 0.5) + vec3(vWaveEffect - 0.2);
        //         gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
        //     }
        //         `,
        //         flatShading: true,
        // })

        this.background = new THREE.Mesh(background, material)
        this.background.position.x = -7
        this.background.position.y = -8
        this.background.position.z = -3
        this.background.rotation.z = -3.65
        this.animateBackground()

        // bounce
        // const tween = new TWEEN.Tween( this.background.position ).to(new THREE.Vector3( this.background.position.x, this.background.position.y + 0.3, this.background.position.z ), 1000)
        // const rtween = new TWEEN.Tween( this.background.rotation ).to(new THREE.Vector3( this.background.rotation.x, this.background.rotation.y + 3, this.background.rotation.z ), 1000)
        // const tween2 = new TWEEN.Tween( this.background.position ).to(new THREE.Vector3( this.background.position.x, this.background.position.y - 0.3, this.background.position.z ), 2000)
        // const rtween2 = new TWEEN.Tween( this.background.rotation ).to(new THREE.Vector3( this.background.rotation.x, this.background.rotation.y - 3, this.background.rotation.z ), 2000)
        // const tween3 = new TWEEN.Tween( this.background.position ).to(new THREE.Vector3( this.background.position.x, this.background.position.y, this.background.position.z ), 1000)
        // const rtween3 = new TWEEN.Tween( this.background.rotation ).to(new THREE.Vector3( this.background.rotation.x, this.background.rotation.y, this.background.rotation.z ), 1000)
        
        // tween.easing(TWEEN.Easing.Quadratic.Out)
        // tween2.easing(TWEEN.Easing.Quadratic.InOut)
        // tween3.easing(TWEEN.Easing.Quadratic.In)
            
        // tween.chain(tween2)
        // tween2.chain(tween3)
        // tween3.chain(tween)
        // tween.start()
    }

    animateBackground = () => {
        // @ts-ignore
        const shader = this.background.material.userData.shader
        if (shader) {
            shader.uniforms.time.value = performance.now() / 1000
        }

        // (this.background.material as THREE.ShaderMaterial).uniforms.uTime.value += 0.2
        // const time = new Date().getSeconds()
        // for (const v of (this.background.geometry as THREE.Geometry).vertices) {
        //     // v.z = (Math.random() - 0.5)
        //     const tween = new TWEEN.Tween( v ).to( new THREE.Vector3(v.x, v.y, Math.sin(time + v.x + v.y)), 1000)
        //     tween.easing(TWEEN.Easing.Quadratic.InOut)
        //     tween.start()
        // }
        // ;(this.background.geometry as THREE.Geometry).verticesNeedUpdate = true
    }
}

// const AnimationClipCreator = () => {}
// AnimationClipCreator.CreateShakeAnimation = function ( duration, shakeScale ) {

// 	var times = [], values = [], tmp = new THREE.Vector3();

// 	for ( var i = 0; i < duration * 10; i ++ ) {

// 		times.push( i / 10 );

// 		tmp.set( Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0 ).
// 			multiply( shakeScale ).
// 			toArray( values, values.length );

// 	}

// 	var trackName = '.position';

// 	var track = new THREE.VectorKeyframeTrack( trackName, times, values );

// 	return new THREE.AnimationClip( null, duration, [ track ] );

// };