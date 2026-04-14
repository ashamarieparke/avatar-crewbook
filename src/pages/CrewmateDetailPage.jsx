import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function formatCreatedAt(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return date.toLocaleString()
}

function CrewmateDetailPage({
  crewmates,
  isLoadingCrew,
  crewCategories,
  nations,
  bendingStyles,
  onStartEdit,
  onSaveBio,
}) {
  const { id } = useParams()
  const [apiDetails, setApiDetails] = useState({
    loading: false,
    error: '',
    character: null,
  })
  const [customBio, setCustomBio] = useState('')
  const [bioStatus, setBioStatus] = useState('')
  const [isSavingBio, setIsSavingBio] = useState(false)

  const crewmate = crewmates.find((entry) => String(entry.id) === String(id))
  const crewmateId = crewmate?.id
  const crewmateBio = crewmate?.bio ?? ''
  const category = crewCategories.find((entry) => entry.id === crewmate?.category)

  useEffect(() => {
    if (!crewmateId) {
      return
    }

    setCustomBio(crewmateBio)
    setBioStatus('')
  }, [crewmateId, crewmateBio])

  useEffect(() => {
    if (!crewmate?.name) {
      return
    }

    let isCancelled = false

    const fetchApiDetails = async () => {
      setApiDetails({ loading: true, error: '', character: null })

      try {
        const response = await fetch(
          `https://last-airbender-api.fly.dev/api/v1/characters?name=${encodeURIComponent(crewmate.name)}`,
        )

        if (!response.ok) {
          throw new Error('Could not fetch Avatar API details.')
        }

        const data = await response.json()
        const exactMatch = data.find(
          (entry) => entry?.name?.toLowerCase() === crewmate.name.toLowerCase(),
        )
        const picked = exactMatch ?? data[0] ?? null

        if (!isCancelled) {
          setApiDetails({ loading: false, error: '', character: picked })
        }
      } catch {
        if (!isCancelled) {
          setApiDetails({
            loading: false,
            error: 'Avatar API details are unavailable right now.',
            character: null,
          })
        }
      }
    }

    fetchApiDetails()

    return () => {
      isCancelled = true
    }
  }, [crewmate?.name])

  const saveCustomBio = async () => {
    if (!crewmate) {
      return
    }

    setIsSavingBio(true)
    setBioStatus('')

    try {
      await onSaveBio(crewmate.id, customBio)
      setBioStatus('Bio saved.')
    } catch (error) {
      setBioStatus(
        error instanceof Error ? error.message : 'Could not save bio right now.',
      )
    } finally {
      setIsSavingBio(false)
    }
  }

  if (isLoadingCrew) {
    return (
      <section className="panel roster-section detail-page">
        <h2>Loading crewmate...</h2>
        <p>Fetching details from Supabase.</p>
      </section>
    )
  }

  if (!crewmate) {
    return (
      <section className="panel roster-section detail-page">
        <h2>Crewmate not found</h2>
        <p>That crewmate may have been deleted or the URL is incorrect.</p>
        <Link className="edit-button" to="/summary">
          Back to Summary
        </Link>
      </section>
    )
  }

  const nation = nations.find((entry) => entry.id === crewmate.nation)
  const bending = bendingStyles.find((entry) => entry.id === crewmate.bending)

  return (
    <section className="panel roster-section detail-page">
      <div className="panel-heading">
        <h2>{crewmate.name}</h2>
      </div>

      <article className="preview-card detail-card">
        <p className="preview-detail">
          <span className="preview-label">Category:</span>
          {category ? category.label : 'Uncategorized'}
        </p>
        <p className="preview-detail">
          <span className="preview-label">Nation:</span>
          {nation ? (
            <>
              <img className="preview-nation-icon" src={nation.icon} alt="" />
              {nation.label}
            </>
          ) : (
            'Unknown nation'
          )}
        </p>
        <p className="preview-detail">
          <span className="preview-label">Bending Style:</span>
          {bending ? bending.label : 'Unknown bending'}
        </p>
        <p className="preview-detail">
          <span className="preview-label">Created At:</span>
          {formatCreatedAt(crewmate.createdAt)}
        </p>
      </article>

      <article className="preview-card detail-card">
        <p className="preview-label">Details about this Character</p>
        {apiDetails.loading ? <p className="preview-detail">Loading character intel...</p> : null}
        {apiDetails.error ? <p className="preview-detail">{apiDetails.error}</p> : null}
        {apiDetails.character ? (
          <>
            <p className="preview-detail">
              <span className="preview-label">Affiliation:</span>
              {apiDetails.character.affiliation || 'Unknown'}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Allies:</span>
              {apiDetails.character.allies?.length
                ? apiDetails.character.allies.slice(0, 4).join(', ')
                : 'No allies listed'}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Enemies:</span>
              {apiDetails.character.enemies?.length
                ? apiDetails.character.enemies.slice(0, 4).join(', ')
                : 'No enemies listed'}
            </p>
          </>
        ) : null}
      </article>

      <article className="preview-card detail-card">
        <p className="preview-label">Custom Bio Notes</p>
        <textarea
          className="bio-input"
          value={customBio}
          onChange={(event) => setCustomBio(event.target.value)}
          placeholder="Add custom details about this crewmate's bending, history, and personality..."
        />
        <button
          type="button"
          className="secondary-button detail-save"
          onClick={saveCustomBio}
          disabled={isSavingBio}
        >
          {isSavingBio ? 'Saving Bio...' : 'Save Bio'}
        </button>
        {bioStatus ? <p className="preview-detail">{bioStatus}</p> : null}
      </article>

      <div className="crew-card__actions">
        <button
          type="button"
          className="edit-button"
          onClick={() => onStartEdit(crewmate.id)}
        >
          Edit This Crewmate
        </button>
        <Link className="secondary-button detail-back" to="/summary">
          Back to Summary
        </Link>
      </div>
    </section>
  )
}

export default CrewmateDetailPage
