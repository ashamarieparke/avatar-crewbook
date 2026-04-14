import { useState } from 'react'

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

function CrewmateFormPage({
  nations,
  bendingStyles,
  crewCategories,
  allowedNations,
  allowedBendingStyles,
  gaangPresets,
  formData,
  selectedCategory,
  selectedNation,
  selectedBending,
  editingCrewmateId,
  isSaving,
  formError,
  onApplyPreset,
  onFieldChange,
  onSubmit,
  onResetForm,
  onDeleteCrewmate,
}) {
  return (
    <>
      <section className="panel presets-panel">
        <div className="panel-heading">
          <h2>Preset Inspiration</h2>
          <p>Tap any Gaang preset to auto-fill the form.</p>
        </div>
        <div className="preset-grid">
          {gaangPresets.map((preset) => {
            const nation = nations.find((entry) => entry.id === preset.nation)

            return (
              <button
                key={preset.name}
                type="button"
                className={`preset-card preset-card--${preset.nation}`}
                onClick={() => onApplyPreset(preset)}
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
        <form className="panel form-panel" onSubmit={onSubmit}>
          <div className="panel-heading">
            <h2>{editingCrewmateId ? 'Edit a crewmate' : 'Create a crewmate'}</h2>
            <p>Build an Avatar-inspired team member for your crew.</p>
          </div>

          <label className="field-group" htmlFor="crewmate-name">
            <span>Name</span>
            <input
              id="crewmate-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              placeholder="Aang, Katara, Toph..."
            />
          </label>

          <fieldset className="field-group">
            <legend>Category</legend>
            <p className="field-note">
              Pick a category first. It unlocks only the matching nation and bending choices.
            </p>
            <div className="button-grid button-grid--categories">
              {crewCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`choice-button choice-button--category ${formData.category === category.id ? 'is-selected' : ''}`}
                  onClick={() => onFieldChange('category', category.id)}
                >
                  <span>{category.label}</span>
                  <small>{category.note}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field-group">
            <legend>Nation</legend>
            <p className="field-note">
              {selectedCategory ? `Available for ${selectedCategory.label}.` : 'Choose a category to unlock nation options.'}
            </p>
            <div className="button-grid">
              {nations.map((nation) => {
                const isAllowed = allowedNations.some((entry) => entry.id === nation.id)

                return (
                <button
                  key={nation.id}
                  type="button"
                  className={`choice-button choice-button--${nation.id} ${formData.nation === nation.id ? 'is-selected' : ''}`}
                  disabled={!selectedCategory || !isAllowed}
                  onClick={() => onFieldChange('nation', nation.id)}
                >
                  <span className={`choice-symbol choice-symbol--${nation.id}`} aria-hidden="true">
                    <img src={nation.icon} alt="" />
                  </span>
                  <span>{nation.label}</span>
                </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="field-group">
            <legend>Bending style</legend>
            <p className="field-note">
              {selectedCategory ? `Available for ${selectedCategory.label}.` : 'Choose a category to unlock bending options.'}
            </p>
            <div className="button-grid button-grid--stacked">
              {bendingStyles.map((style) => {
                const isAllowed = allowedBendingStyles.some((entry) => entry.id === style.id)

                return (
                <button
                  key={style.id}
                  type="button"
                  className={`choice-button choice-button--stacked ${formData.bending === style.id ? 'is-selected' : ''}`}
                  disabled={!selectedCategory || !isAllowed}
                  onClick={() => onFieldChange('bending', style.id)}
                >
                  <span>{style.label}</span>
                  <small>{style.note}</small>
                </button>
                )
              })}
            </div>
          </fieldset>

          <button className="submit-button" type="submit">
            {isSaving
              ? editingCrewmateId
                ? 'Updating crewmate...'
                : 'Saving crewmate...'
              : editingCrewmateId
                ? 'Update crewmate'
                : 'Add crewmate'}
          </button>

          {editingCrewmateId ? (
            <button className="secondary-button" type="button" onClick={onResetForm}>
              Cancel Edit
            </button>
          ) : null}

          {editingCrewmateId ? (
            <button
              className="destructive-button"
              type="button"
              onClick={onDeleteCrewmate}
            >
              Delete crewmate
            </button>
          ) : null}

          {formError ? <p className="form-error">{formError}</p> : null}
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
              <span className="preview-label">Category:</span>
              {selectedCategory ? selectedCategory.label : 'Choose a category'}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Nation:</span>
              {selectedNation ? (
                <>
                  <img className="preview-nation-icon" src={selectedNation.icon} alt="" />
                  {selectedNation.label}
                </>
              ) : (
                'Choose a nation'
              )}
            </p>
            <p className="preview-detail">
              <span className="preview-label">Bending Style:</span>
              {selectedBending ? selectedBending.label : 'Choose a bending style'}
            </p>
          </article>
        </aside>
      </section>
    </>
  )
}

export default CrewmateFormPage
