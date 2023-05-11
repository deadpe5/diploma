import { Vector3 } from "@babylonjs/core"

export const MESH_DEFAULT_ALPHA = 1.0
export const MESH_TOGGLED_ALPHA = 0.3

export enum fileTypes {
    STL = '.stl',
    OBJ = '.obj',
    glTF = '.gltf'
}

// FPS Counter
export const RED_FPS = 15
export const YELLOW_FPS = 30
export const MIN_PARTICLES_COUNT = 1000
export const MAX_PARTICLES_COUNT = 10000
export const PARTICLES_COUNT_STEP = 1

export const MIN_PARTICLE_SIZE = 0.01
export const MAX_PARTICLE_SIZE = 0.5
export const PARTICLE_SIZE_STEP = 0.01

export const MIN_SMOOTHING_RADIUS = 0.01
export const MAX_SMOOTHING_RADIUS = 0.08
export const SMOOTHING_RADIUS_STEP = 0.001

export const MIN_FLUID_DENSITY = 0
export const MAX_FLUID_DENSITY = 50000
export const FLUID_DENSITY_STEP = 100

export const MIN_PREASURE_CONSTANT = 1
export const MAX_PREASURE_CONSTANT = 10
export const PREASURE_CONSTANT_STEP = 1

export const MIN_FLUID_VELOCITY = 0
export const MAX_FLUID_VELOCITY = 20
export const FLUID_VELOCITY_STEP = 1

export const MIN_BOX_OPACITY = 0
export const MAX_BOX_OPACITY = 1
export const BOX_OPACITY_STEP = 0.01
export const DEFAULT_BOX_OPACITY = 0.2

export const ENVIRONMENT_NAMES = [
    "Country",
    "Night",
    "Canyon",
]

export const ENVIRONMENT_FILENAMES = [
    "country.env",
    "night.env",
    "Runyon_Canyon_A_2k_cube_specular.env",
]

export const eps = 0.0001;
export const eps1 = new Vector3(eps, -eps, -eps);
export const eps2 = new Vector3(-eps, -eps, eps);
export const eps3 = new Vector3(-eps, eps, -eps);
export const eps4 = new Vector3(eps, eps, eps);
export const dir1 = new Vector3(1, -1, -1);
export const dir2 = new Vector3(-1, -1, 1);
export const dir3 = new Vector3(-1, 1, -1);
export const dir4 = new Vector3(1, 1, 1);