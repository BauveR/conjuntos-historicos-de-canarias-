import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

export function useInscripciones() {
  const { user } = useAuth()
  const [ids, setIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIds([])
      setLoading(false)
      return
    }
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'inscripciones'),
      snap => {
        setIds(snap.docs.map(d => Number(d.id)))
        setLoading(false)
      },
      () => {
        setIds([])
        setLoading(false)
      },
    )
    return unsub
  }, [user])

  const remove = (id: number) => setIds(prev => prev.filter(i => i !== id))

  return { ids, loading, remove }
}
