import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
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
    getDocs(collection(db, 'users', user.uid, 'inscripciones'))
      .then(snap => setIds(snap.docs.map(d => Number(d.id))))
      .catch(() => setIds([]))
      .finally(() => setLoading(false))
  }, [user])

  const remove = (id: number) => setIds(prev => prev.filter(i => i !== id))

  return { ids, loading, remove }
}
