import { Color3, Vector3 } from "@babylonjs/core"

export const MESH_DEFAULT_ALPHA = 1.0
export const MESH_TOGGLED_ALPHA = 0.3

// FPS Counter
export const RED_FPS = 15
export const YELLOW_FPS = 30

// Add Mesh constants
export const DEFAULT_SIZE_STEP = 0.1

// Constants used in UI and simulation
export const MIN_BOUNDING_BOX_HEIGHT = 1
export const MIN_BOUNDING_BOX_WIDTH = 1
export const MIN_BOUNDING_BOX_DEPTH = 1

export const DEFAULT_FLUID_COLOR = new Color3(1 - 0.5, 1 - 0.2, 1 - 0.05)
export const MAX_FLUID_COLOR_DENSITY = 2
export const DEFAULT_FLUID_COLOR_DENSITY = 1.8

export const MIN_PARTICLES_COUNT = 1000
export const MAX_PARTICLES_COUNT = 25000
export const PARTICLES_COUNT_STEP = 1
export const DEFAULT_PARTICLES_COUNT = 6000

export const MIN_PARTICLE_SIZE = 0.02
export const MAX_PARTICLE_SIZE = 0.5
export const PARTICLE_SIZE_STEP = 0.01
export const DEFAULT_PARTICLE_SIZE = 0.08

export const MIN_SMOOTHING_RADIUS = 0.01
export const MAX_SMOOTHING_RADIUS = 0.08
export const SMOOTHING_RADIUS_STEP = 0.001
export const DEFAULT_SMOOTHING_RADIUS = 0.04

export const MIN_DENSITY_REFERENCE = 0
export const MAX_DENSITY_REFERENCE = 50000
export const DENSITY_REFERENCE_STEP = 100
export const DEFAULT_DENSITY_REFERENCE = 20000

export const MIN_PRESSURE_CONSTANT = 1
export const MAX_PRESSURE_CONSTANT = 10
export const PRESSURE_CONSTANT_STEP = 1
export const DEFAULT_PRESSURE_CONSTANT = 4

export const MIN_FLUID_VELOCITY = 0
export const MAX_FLUID_VELOCITY = 20
export const FLUID_VELOCITY_STEP = 1
export const DEFAULT_FLUID_VELOCITY = 3

export const MIN_BOX_OPACITY = 0
export const MAX_BOX_OPACITY = 1
export const BOX_OPACITY_STEP = 0.01
export const DEFAULT_BOX_OPACITY = 0.2

// Constants used only in simulation
export const PARTICLE_RADIUS = 0.02
export const VISCOSITY = 0.005
export const GRAVITY = new Vector3(0, -9.8, 0)
export const MIN_TIME_STEP = 1 / 100
export const MAX_VELOCITY = 75
export const MAX_ACCELERATION = 2000 
export const SHAPE_COLLISION_RESTITUTION = 0.999

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

// WEBGL & WEBGPU ENGINE NAMES
export const WEBGL = 'webGL'
export const WEBGPU = 'webGPU'
export const ENGINE_VERSION = 'engineVersion'