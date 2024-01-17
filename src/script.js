import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import{ GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject ={}

// Canvas
const canvas = document.querySelector('canvas.webgl')

//loader
const gltfLoader = new GLTFLoader()
// Scene
const scene = new THREE.Scene()


/**
 * Test sphere
 */
const testSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0,0,0),
    new THREE.MeshStandardMaterial()
)
scene.add(testSphere)


/***
 * lights
 */
//light
const directionalLights = new THREE.DirectionalLight('#ffffff',8)
directionalLights.position.set(0.25,3,-2.25)
directionalLights.castShadow=true
directionalLights.shadow.mapSize.set(1024,1024)
directionalLights.shadow.normalBias=0.05
scene.add(directionalLights)




/*
*tweaks
*/
//gui
gui.add(directionalLights,'intensity') .min(0).max(10) .step(0.001) .name('lighIntensity')
gui.add(directionalLights.position, 'x') .min(-5).max(5).step(0.001).name('lightX')
gui.add(directionalLights.position, 'y') .min(-5).max(5).step(0.001).name('lightY')
gui.add(directionalLights.position, 'z') .min(-5).max(5).step(0.001).name('lightZ')
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)


/**
 * loader
 */
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(10,10,10)
        
        gltf.scene.position.set(0,-4,0)
        gltf.scene.rotation.y= Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
        gui
        .add(gltf.scene.rotation, 'y')
        .min(-Math.PI * 5)
        .max(Math.PI* 5)
        .step(0.001)
        .name('rotation')
    }
)



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * update materials
 */
const updateAllMaterials= () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMap= enviromentMap
            child.material.envMapIntensity=5
            child.material.envMapIntensity =debugObject.envMapIntensity
            child.castShadow=true
            child.receiveShadow=true
        }
    })
}



/**
 * tecture
 */
//texture
const cubeTextureLoader = new THREE.CubeTextureLoader()
const enviromentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/1/px.jpg',
    '/textures/environmentMaps/1/nx.jpg',
    '/textures/environmentMaps/1/py.jpg',
    '/textures/environmentMaps/1/ny.jpg',
    '/textures/environmentMaps/1/pz.jpg',
    '/textures/environmentMaps/1/nz.jpg'
])
scene.background=enviromentMap
debugObject.envMapIntensity = 5
gui.add(debugObject , 'envMapIntensity')
.min(0)
.max(10)
.step(0.001)
.onChange(updateAllMaterials)
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias : true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights= true
renderer.outputEncoding= THREE.sRGBEncoding
renderer.toneMapping=THREE.ACESFilmicToneMapping
renderer.shadowMap.enabled=true
renderer.shadowMap.type= THREE.PCFSoftShadowMap
// renderer.toneMappingExposure =3
gui
   .add(renderer,'toneMapping',{
   No:THREE.NoToneMapping,
   Linear: THREE.LinearToneMapping,
   Reinhard: THREE.ReinhardToneMapping,
   Cineon: THREE.CineonToneMapping,
   ACEFilmic: THREE.ACESFilmicToneMapping

   })
   .onFinishChange(() =>
   {
    renderer.toneMapping =Number(renderer.toneMapping)
    updateAllMaterials()
   })

gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)


/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()