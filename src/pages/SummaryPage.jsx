import { Link } from 'react-router-dom'

const formatPercent = (value, total) => {
  if (!total) {
    return '0%'
  }

  return `${Math.round((value / total) * 100)}%`
}

const countBy = (items, getValue) =>
  items.reduce((counts, item) => {
    const value = getValue(item) || 'Unknown'
    counts.set(value, (counts.get(value) ?? 0) + 1)
    return counts
  }, new Map())

const getTopEntry = (counts, entries, fallbackLabel) => {
  let bestId = ''
  let bestCount = 0

  counts.forEach((count, key) => {
    if (count > bestCount) {
      bestCount = count
      bestId = key
    }
  })

  if (!bestId) {
    return { label: fallbackLabel, count: 0 }
  }

  const match = entries.find((entry) => entry.id === bestId)

  return {
    label: match ? match.label : bestId,
    count: bestCount,
  }
}

function SummaryPage({
  orderedCrewmates,
  isLoadingCrew,
  crewCategories,
  nations,
  bendingStyles,
  onStartEdit,
}) {
  const totalCrew = orderedCrewmates.length
  const categoryCounts = countBy(orderedCrewmates, (crewmate) => crewmate.category)
  const nationCounts = countBy(orderedCrewmates, (crewmate) => crewmate.nation)
  const bendingCounts = countBy(orderedCrewmates, (crewmate) => crewmate.bending)
  const topCategory = getTopEntry(categoryCounts, crewCategories, 'Uncategorized')
  const topNation = getTopEntry(nationCounts, nations, 'Unknown nation')
  const topBending = getTopEntry(bendingCounts, bendingStyles, 'Unknown bending')

  return (
    <section className="panel roster-section">
      <div className="panel-heading">
        <h2>Crew Summary</h2>
        <p>This page shows all crewmates, newest at the top.</p>
      </div>

      {orderedCrewmates.length > 0 ? (
        <section className="crew-stats-panel" aria-label="Crew statistics">
          <div className="crew-stats__intro">
            <p className="crew-card__label">Crew stats</p>
            <h3>Your crew at a glance</h3>
            <p>
              Quick percentages for the crew you’ve built so far. The nation breakdown shows
              how much of your roster belongs to each nation.
            </p>
          </div>

          <div className="crew-stats__grid">
            <article className="crew-stat">
              <span>Total crew</span>
              <strong>{totalCrew}</strong>
              <small>crewmates in the roster</small>
            </article>

            <article className="crew-stat">
              <span>Most common category</span>
              <strong>{topCategory.label}</strong>
              <small>
                {topCategory.count ? `${formatPercent(topCategory.count, totalCrew)} of the crew` : 'No categories yet'}
              </small>
            </article>

            <article className="crew-stat">
              <span>Most common bending</span>
              <strong>{topBending.label}</strong>
              <small>
                {topBending.count ? `${formatPercent(topBending.count, totalCrew)} of the crew` : 'No bending styles yet'}
              </small>
            </article>
          </div>

          <div className="crew-stats-breakdown">
            {nations.map((nation) => {
              const count = nationCounts.get(nation.id) ?? 0

              return (
                <div className="crew-stats-row" key={nation.id}>
                  <div className="crew-stats-row__label">
                    <span>{nation.label}</span>
                    <span>{formatPercent(count, totalCrew)}</span>
                  </div>
                  <div className="crew-stats-row__bar" aria-hidden="true">
                    <span style={{ width: `${totalCrew ? (count / totalCrew) * 100 : 0}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <p className="crew-stats__footer">
            {topNation.count
              ? `${topNation.label} is currently the most common nation, with ${formatPercent(topNation.count, totalCrew)} of the crew.`
              : 'Add crewmates to see crew composition stats here.'}
          </p>
        </section>
      ) : null}

      {orderedCrewmates.length > 0 ? (
        <div className="crew-grid">
          {orderedCrewmates.map((crewmate) => {
            const category = crewCategories.find((entry) => entry.id === crewmate.category)
            const nation = nations.find((entry) => entry.id === crewmate.nation)
            const bending = bendingStyles.find(
              (entry) => entry.id === crewmate.bending,
            )

            return (
              <article className="crew-card" key={crewmate.id}>
                <div>
                  <p className="crew-card__label">Crewmate</p>
                  <h3>
                    <Link className="crewmate-link" to={`/crewmate/${crewmate.id}`}>
                      {crewmate.name}
                    </Link>
                  </h3>
                </div>

                <div className="crew-card__stats">
                  <span>{category ? category.label : 'Uncategorized'}</span>
                  <span>{nation ? nation.label : 'Unknown nation'}</span>
                  <span>{bending ? `Bending Style: ${bending.label}` : 'Unknown bending'}</span>
                </div>

                <div className="crew-card__actions">
                  <Link className="edit-button" to={`/crewmate/${crewmate.id}`}>
                    View Details
                  </Link>
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => onStartEdit(crewmate)}
                  >
                    Edit
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : isLoadingCrew ? (
        <article className="empty-state">
          <h3>Loading crew...</h3>
          <p>Fetching your crewmates.</p>
        </article>
      ) : (
        <article className="empty-state">
          <h3>No crewmates yet</h3>
          <p>Go back to Create and add your first Avatar-themed crewmate.</p>
        </article>
      )}
    </section>
  )
}

export default SummaryPage
