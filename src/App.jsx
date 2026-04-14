import { useMemo, useState } from 'react'
import './App.css'

const nations = [
  {
    id: 'air',
    label: 'Air Nomads',
    icon: '/branding/nations/air.png',
  },
  {
    id: 'water',
    label: 'Water Tribes',
    icon: '/branding/nations/water.png',
  },
  {
    id: 'earth',
    label: 'Earth Kingdom',
    icon: '/branding/nations/earth.png',
  },
  {
    id: 'fire',
    label: 'Fire Nation',
    icon: '/branding/nations/fire.png',
  },
]

const bendingStyles = [
  { id: 'air', label: 'Air', note: 'Agile and calm' },
  { id: 'water', label: 'Water', note: 'Adaptable and balanced' },
  { id: 'earth', label: 'Earth', note: 'Steady and grounded' },
  { id: 'fire', label: 'Fire', note: 'Bold and driven' },
  { id: 'nonbender', label: 'Nonbender', note: 'Resourceful and creative' },
]

const initialFormState = {
  name: '',
  nation: '',
  bending: '',
}

const gaangPresets = [
  {
    name: 'Aang',
    nation: 'air',
    bending: 'air',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/a/ae/Aang_at_Jasmine_Dragon.png/revision/latest?cb=20130612174003',
  },
  {
    name: 'Katara',
    nation: 'water',
    bending: 'water',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/7/7a/Katara_smiles_at_coronation.png/revision/latest?cb=20150104171449',
  },
  {
    name: 'Sokka',
    nation: 'water',
    bending: 'nonbender',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/c/cc/Sokka.png/revision/latest?cb=20140905085428',
  },
  {
    name: 'Toph',
    nation: 'earth',
    bending: 'earth',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/4/46/Toph_Beifong.png/revision/latest?cb=20131230122047',
  },
  {
    name: 'Zuko',
    nation: 'fire',
    bending: 'fire',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/4/4b/Zuko.png/revision/latest?cb=20180630112142',
  },
  {
    name: 'Iroh',
    nation: 'fire',
    bending: 'fire',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/c/c1/Iroh_smiling.png/revision/latest?cb=20130626131914',
  },
  {
    name: 'Suki',
    nation: 'earth',
    bending: 'nonbender',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/1/14/Suki.png/revision/latest?cb=20130819094354',
  },
]

function CharacterPortrait({ name, photo }) {
  const [hasImageError, setHasImageError] = useState(false)

  if (hasImageError) {
    return <span className="preset-fallback">{name.slice(0, 1)}</span>
  }

  return (
    <img
      className="preset-photo"
      src={photo}
      alt={`${name} portrait`}
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  )
}

function App() {
  const [formData, setFormData] = useState(initialFormState)
  const [crewmates, setCrewmates] = useState([])

  const selectedNation = nations.find((nation) => nation.id === formData.nation)
  const selectedBending = bendingStyles.find(
    (style) => style.id === formData.bending,
  )

  const orderedCrewmates = useMemo(
    () => [...crewmates].sort((left, right) => right.createdAt - left.createdAt),
    [crewmates],
  )

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const applyPreset = (preset) => {
    setFormData({
      name: preset.name,
      nation: preset.nation,
      bending: preset.bending,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formData.name || !formData.nation || !formData.bending) {
      return
    }

    setCrewmates((current) => [
      {
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        nation: formData.nation,
        bending: formData.bending,
        createdAt: Date.now(),
      },
      ...current,
    ])

    setFormData(initialFormState)
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Avatar: The Last Airbender</p>
        <h1>The Gaang Builder</h1>
        <p className="hero-copy">
          Start from a preset hero or create your own. Choose each recruit's
          nation and bending path with clickable attribute symbols.
        </p>
      </section>

      <section className="panel presets-panel">
        <div className="panel-heading">
          <h2>Preset Inspiration</h2>
          <p>Tap any Gaang preset to auto-fill the form with API-sourced photos.</p>
        </div>
        <div className="preset-grid">
          {gaangPresets.map((preset) => {
            const nation = nations.find((entry) => entry.id === preset.nation)

            return (
              <button
                key={preset.name}
                type="button"
                className={`preset-card preset-card--${preset.nation}`}
                onClick={() => applyPreset(preset)}
              >
                <span className="preset-photo-wrap">
                  <CharacterPortrait name={preset.name} photo={preset.photo} />
                </span>
                <span className="preset-name">{preset.name}</span>
                <span className="preset-meta">
                  {nation ? (
                    <>
                      <img src={nation.icon} alt="" />
                      {nation.label}
                    </>
                  ) : (
                    'Unknown nation'
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <h2>Create a crewmate</h2>
            <p>Build an Avatar-inspired team member for your crew.</p>
          </div>

          <label className="field-group" htmlFor="crewmate-name">
            <span>Name</span>
            <input
              id="crewmate-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Aang, Katara, Toph..."
            />
          </label>

          <fieldset className="field-group">
            <legend>Nation</legend>
            <div className="button-grid">
              {nations.map((nation) => (
                <button
                  key={nation.id}
                  type="button"
                  className={`choice-button choice-button--${nation.id} ${formData.nation === nation.id ? 'is-selected' : ''}`}
                  onClick={() => updateField('nation', nation.id)}
                >
                  <span className={`choice-symbol choice-symbol--${nation.id}`} aria-hidden="true">
                    <img src={nation.icon} alt="" />
                  </span>
                  <span>{nation.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field-group">
            <legend>Bending style</legend>
            <div className="button-grid button-grid--stacked">
              {bendingStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={`choice-button choice-button--stacked ${formData.bending === style.id ? 'is-selected' : ''}`}
                  onClick={() => updateField('bending', style.id)}
                >
                  <span>{style.label}</span>
                  <small>{style.note}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <button className="submit-button" type="submit">
            Add crewmate
          </button>
        </form>

        <aside className="panel preview-panel">
          <div className="panel-heading">
            <h2>Live preview</h2>
            <p>See the crewmate card update as you make choices.</p>
          </div>

          <article className="preview-card">
            <span className="preview-tag">New recruit</span>
            <h3>{formData.name || 'Unnamed recruit'}</h3>
            <p className="preview-detail">
              {selectedNation
                ? (
                  <>
                    <img
                      className="preview-nation-icon"
                      src={selectedNation.icon}
                      alt=""
                    />
                    {selectedNation.label}
                  </>
                )
                : 'Choose a nation'}
            </p>
            <p className="preview-detail">
              {selectedBending ? selectedBending.label : 'Choose a bending style'}
            </p>
          </article>
        </aside>
      </section>

      <section className="roster-section">
        <div className="panel-heading">
          <h2>Recently forged crew</h2>
          <p>The newest crewmates appear first.</p>
        </div>

        {orderedCrewmates.length > 0 ? (
          <div className="crew-grid">
            {orderedCrewmates.map((crewmate) => {
              const nation = nations.find((entry) => entry.id === crewmate.nation)
              const bending = bendingStyles.find(
                (entry) => entry.id === crewmate.bending,
              )

              return (
                <article className="crew-card" key={crewmate.id}>
                  <div>
                    <p className="crew-card__label">Crewmate</p>
                    <h3>{crewmate.name}</h3>
                  </div>

                  <div className="crew-card__stats">
                    <span>{nation ? nation.label : 'Unknown nation'}</span>
                    <span>{bending ? bending.label : 'Unknown bending'}</span>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <article className="empty-state">
            <h3>No crewmates yet</h3>
            <p>Use the form above to add your first Avatar-themed crewmate.</p>
          </article>
        )}
      </section>
    </main>
  )
}

export default App
