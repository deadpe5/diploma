import RenderScene from '@/visualisation/RenderScene';
import { defineStore } from 'pinia';

export const useVisualisationStore = defineStore('visulisationStore', {
    state: () => {
        return {
            renderScene: null as RenderScene | null,
        }
    },
    
    actions: {
        init(canvas: HTMLCanvasElement) {
            this.renderScene = new RenderScene(canvas)
        }
    }
})