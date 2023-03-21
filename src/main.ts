// Vue
import { createApp } from 'vue'
import App from './App.vue'

// Pinia
import { createPinia } from 'pinia'

// Vue router
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCube, faExpand } from '@fortawesome/free-solid-svg-icons'
import '@mdi/font/css/materialdesignicons.css'
import './assets/main.css'

library.add(faCube, faExpand,)

const pinia = createPinia()
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(vuetify)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
