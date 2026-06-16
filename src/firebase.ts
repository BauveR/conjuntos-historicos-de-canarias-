import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyA9D_v-wH4tNanjvl3NMBjBwAUeOxh3kMw',
  authDomain: 'conjuntos-historicos-canarias.firebaseapp.com',
  projectId: 'conjuntos-historicos-canarias',
  storageBucket: 'conjuntos-historicos-canarias.firebasestorage.app',
  messagingSenderId: '318375586770',
  appId: '1:318375586770:web:68d19f7b2e1474ff5d360b',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})
