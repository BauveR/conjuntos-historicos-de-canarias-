import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

export type UserRole = 'user' | 'admin'

type AuthContextValue = {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<UserRole>
  signUp: (name: string, email: string, password: string) => Promise<UserRole>
  signInWithGoogle: () => Promise<UserRole>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const googleProvider = new GoogleAuthProvider()

async function fetchRole(uid: string): Promise<UserRole> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? (snap.data().role as UserRole) : 'user'
  } catch {
    return 'user'
  }
}

async function ensureUserDoc(user: User, name?: string): Promise<UserRole> {
  try {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        role: 'user',
        email: user.email,
        displayName: name ?? user.displayName ?? '',
        createdAt: serverTimestamp(),
      })
    }
    return snap.exists() ? (snap.data().role as UserRole) : 'user'
  } catch {
    return 'user'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const role = await fetchRole(firebaseUser.uid)
        setUserRole(role)
      } else {
        setUserRole(null)
      }
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string): Promise<UserRole> => {
    const { user: u } = await signInWithEmailAndPassword(auth, email, password)
    const role = await fetchRole(u.uid)
    setUserRole(role)
    return role
  }

  const signUp = async (name: string, email: string, password: string): Promise<UserRole> => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(newUser, { displayName: name })
    const role = await ensureUserDoc(newUser, name)
    setUserRole(role)
    return role
  }

  const signInWithGoogle = async (): Promise<UserRole> => {
    const { user: googleUser } = await signInWithPopup(auth, googleProvider)
    const role = await ensureUserDoc(googleUser)
    setUserRole(role)
    return role
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
