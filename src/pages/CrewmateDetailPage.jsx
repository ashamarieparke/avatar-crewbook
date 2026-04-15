import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const NATION_TITLES = {
  air: 'Air Nomad',
  water: 'Water Tribe',
  earth: 'Earth Kingdom',
  fire: 'Fire Nation',
}

const CATEGORY_ROLES = {
  leader: 'squad captain',
  guardian: 'frontline guardian',
  strategist: 'field strategist',
  scout: 'recon scout',
}

const SHOW_CONNECTIONS = {
  air: {
    allies: ['Air Acolytes', 'Monk Gyatso\'s old temple caretakers', 'Team Avatar'],
    enemies: ['Fire Nation occupation troops', 'Yuyan archers', 'Ozai loyalists'],
  },
  water: {
    allies: ['Northern Water Tribe healers', 'Southern Water Tribe warriors', 'Team Avatar'],
    enemies: ['Fire Nation raiding fleets', 'Hama\'s imitators', 'pirate raiders'],
  },
  earth: {
    allies: ['Kyoshi Warriors', 'Omashu resistance couriers', 'Order of the White Lotus'],
    enemies: ['Dai Li agents', 'Fire Nation drill battalions', 'rough rhino mercenaries'],
  },
  fire: {
    allies: ['Fire Nation reformists', 'Order of the White Lotus', 'Team Avatar'],
    enemies: ['Azula\'s loyal enforcers', 'war ministry hardliners', 'Agni Kai extremists'],
  },
  unknown: {
    allies: ['Team Avatar', 'Order of the White Lotus', 'Kyoshi Warriors'],
    enemies: ['Fire Nation warlords', 'Dai Li remnants', 'rogue bounty hunters'],
  },
}

const CATEGORY_CONNECTIONS = {
  leader: {
    allies: ['village council envoys', 'frontline captains'],
    enemies: ['enemy commanders', 'occupation governors'],
  },
  guardian: {
    allies: ['town watch units', 'traveling healers'],
    enemies: ['siege crews', 'highway bandits'],
  },
  strategist: {
    allies: ['scout messengers', 'mapmakers and logisticians'],
    enemies: ['spy rings', 'double agents'],
  },
  scout: {
    allies: ['falconry couriers', 'border outriders'],
    enemies: ['ambush hunters', 'tracking hounds'],
  },
}

const BENDING_STYLES = {
  air: {
    trait: 'swift, evasive footwork',
    enemy: 'combustion outpost scouts',
  },
  water: {
    trait: 'adaptive forms and defensive control',
    enemy: 'raiders threatening river villages',
  },
  earth: {
    trait: 'rooted stances and precise strikes',
    enemy: 'drill crews pushing into border towns',
  },
  fire: {
    trait: 'aggressive bursts and relentless pressure',
    enemy: 'elite duelists loyal to a rival commander',
  },
  nonbender: {
    trait: 'tactical timing and engineered gadgets',
    enemy: 'smuggling rings exploiting war shortages',
  },
}

function mergeUniqueLists(...lists) {
  const seen = new Set()
  const merged = []

  lists.flat().forEach((item) => {
    if (!item || typeof item !== 'string') {
      return
    }

    const key = item.trim().toLowerCase()

    if (!key || seen.has(key)) {
      return
    }

    seen.add(key)
    merged.push(item.trim())
  })

  return merged
}

function getShowConnections(nationId, categoryId) {
  const nationConnections = SHOW_CONNECTIONS[nationId] ?? SHOW_CONNECTIONS.unknown
  const categoryConnections = CATEGORY_CONNECTIONS[categoryId] ?? {
    allies: [],
    enemies: [],
  }

  return {
    allies: mergeUniqueLists(nationConnections.allies, categoryConnections.allies),
    enemies: mergeUniqueLists(nationConnections.enemies, categoryConnections.enemies),
  }
}

function buildOriginalLore({ crewmate, nation, bending, category }) {
  const firstName = crewmate.name.split(' ')[0]
  const nationTitle = nation ? NATION_TITLES[nation.id] : 'Four Nations'
  const role = category ? CATEGORY_ROLES[category.id] : 'independent specialist'
  const style = bending ? BENDING_STYLES[bending.id] : BENDING_STYLES.nonbender
  const showConnections = getShowConnections(nation?.id, category?.id)

  return {
    affiliation: `${nationTitle} Watch`,
    allies: mergeUniqueLists(
      [
        `${firstName}'s patrol unit`,
        `${nationTitle} healers and messengers`,
        'traveling merchants who share route intel',
      ],
      showConnections.allies,
    ),
    enemies: mergeUniqueLists(
      [
        style.enemy,
        'rogue bounty hunters targeting supply convoys',
        'bandits disrupting village safe zones',
      ],
      showConnections.enemies,
    ),
    background: `${crewmate.name} serves as a ${role}, known for ${style.trait}. Their missions focus on keeping nearby settlements safe while tensions rise across the nations.`,
  }
}

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
        const picked = exactMatch ?? null

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
  const showConnections = getShowConnections(nation?.id, category?.id)
  const canonAllies = mergeUniqueLists(
    apiDetails.character?.allies ?? [],
    showConnections.allies,
  )
  const canonEnemies = mergeUniqueLists(
    apiDetails.character?.enemies ?? [],
    showConnections.enemies,
  )
  const generatedLore = buildOriginalLore({
    crewmate,
    nation,
    bending,
    category,
  })

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
              <span className="preview-label">Canon Profile:</span>
              Found in Avatar show records.
            </p>
            <p className="preview-detail">
              <span className="preview-label">Affiliation:</span>
              {apiDetails.character.affiliation || 'Unknown'}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Allies:</span>
              {canonAllies.length
                ? canonAllies.slice(0, 8).join(', ')
                : 'No allies listed'}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Enemies:</span>
              {canonEnemies.length
                ? canonEnemies.slice(0, 8).join(', ')
                : 'No enemies listed'}
            </p>
          </>
        ) : !apiDetails.loading ? (
          <>
            <p className="preview-detail">
              <span className="preview-label">Original Character Lore:</span>
              Not found in canon records, so this profile is created to match the Avatar world.
            </p>
            <p className="preview-detail">
              <span className="preview-label">Affiliation:</span>
              {generatedLore.affiliation}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Allies:</span>
              {generatedLore.allies.join(', ')}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Enemies:</span>
              {generatedLore.enemies.join(', ')}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Background:</span>
              {generatedLore.background}
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
