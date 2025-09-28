import { useState, useEffect } from 'react'
import { FashionLook } from '@/types'

export function useLooks() {
  const [looks, setLooks] = useState<FashionLook[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLooks = async () => {
    try {
      const response = await fetch('/api/looks')
      if (response.ok) {
        const data = await response.json()
        setLooks(data)
      }
    } catch (error) {
      console.error('Error fetching looks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLook = async (look: FashionLook) => {
    try {
      const response = await fetch('/api/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(look)
      })

      if (response.ok) {
        const savedLook = await response.json()
        setLooks(prev => [savedLook, ...prev])
        return savedLook
      }
    } catch (error) {
      console.error('Error adding look:', error)
      throw error
    }
  }

  const updateLook = async (id: string, updatedLook: FashionLook) => {
    try {
      const response = await fetch(`/api/looks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLook)
      })

      if (response.ok) {
        const savedLook = await response.json()
        setLooks(prev => prev.map(look => look.id === id ? savedLook : look))
        return savedLook
      }
    } catch (error) {
      console.error('Error updating look:', error)
      throw error
    }
  }

  const deleteLook = async (id: string) => {
    try {
      const response = await fetch(`/api/looks/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLooks(prev => prev.filter(look => look.id !== id))
      }
    } catch (error) {
      console.error('Error deleting look:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchLooks()
  }, [])

  return {
    looks,
    loading,
    addLook,
    updateLook,
    deleteLook,
    refetch: fetchLooks
  }
}