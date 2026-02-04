import React, { useEffect, useState } from 'react'
import styles from './RegionPrompt.module.scss'
import { CustomSelect } from './CustomSelect'

export const RegionPrompt = ({ tollRegionsEndpoint, onRegionSelect }) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const value = e.target.value
    setSelectedValue(value)
  }

  const handleSubmit = () => {
    if (selectedValue) {
      const region = regions.find((r) => r.metroId == selectedValue)
      onRegionSelect(region)
    }
  }

  useEffect(() => {
    const STORAGE_KEY = 'chatbot_regions'

    const getRegions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const cached = sessionStorage.getItem(STORAGE_KEY)
        if (cached) {
          setRegions(JSON.parse(cached))
          setIsLoading(false)
          return
        }

        const response = await fetch(tollRegionsEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch regions')
        }

        const data = await response.json()

        const seen = new Set()
        const allRegions = data
          .flatMap((state) => state.value?.regions || [])
          .filter((r) => r.region?.acquireId)
          .map((r) => ({
            chatRegion: r.region.acquireId,
            fullName: r.region.fullName,
            metroId: r.region.metroId
          }))
          .filter((r) => {
            if (seen.has(r.fullName)) return false
            seen.add(r.fullName)
            return true
          })
          .sort((a, b) => a.fullName.localeCompare(b.fullName))

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allRegions))
        setRegions(allRegions)
      } catch (err) {
        setError('Unable to load regions. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    getRegions()
  }, [tollRegionsEndpoint])

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  return (
    <div className={styles.regionPrompt}>
      <CustomSelect
        value={selectedValue}
        onChange={handleChange}
        options={regions}
        placeholder={isLoading ? 'Loading regions...' : 'Select a region'}
        disabled={isLoading}
        ariaLabel='Select your region'
        valueKey='metroId'
        labelKey='fullName'
      />
      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!selectedValue || isLoading}
        type='button'
      >
        Continue
      </button>
    </div>
  )
}
