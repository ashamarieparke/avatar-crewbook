import { Link } from 'react-router-dom'

// Utility functions for calculating and formatting crew stats
const formatPercent = (value, total) => {
  if (!total) {
    return '0%'
  }

  return `${Math.round((value / total) * 100)}%`
}
// Counts the occurrences of values in an array based on a provided function to extract the value
const countBy = (items, getValue) =>
  items.reduce((counts, item) => {
    const value = getValue(item) || 'Unknown'
    counts.set(value, (counts.get(value) ?? 0) + 1)
    return counts
  }, new Map())

  // Gets the entry with the highest count from a Map of counts, and returns its label and count.
  //  If no entries, returns a fallback label.
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
// Determines the success tier based on the crew's success score, 
// categorizing it into 'legendary', 'strong', 'steady', or 'strained'.
const getSuccessTier = (score) => {
  if (score >= 85) {
    return 'legendary'
  }

  if (score >= 65) {
    return 'strong'
  }

  if (score >= 45) {
    return 'steady'
  }

  return 'strained'
}

// Provides a title and note describing the crew's boarding success chance based on their success score
const getSuccessCopy = (score) => {
  if (score >= 85) {
    return {
      title: 'Legendary takeover chance',
      note: 'This crew could probably commandeer a galley before the lookout finishes shouting.',
    }
  }

  if (score >= 65) {
    return {
      title: 'Strong boarding chance',
      note: 'This crew looks organized enough to win a hard-fought ship takeover.',
    }
  }

  if (score >= 45) {
    return {
      title: 'Balanced boarding chance',
      note: 'There is potential here, but the crew still needs sharper coordination.',
    }
  }

  return {
    title: 'Rough boarding chance',
    note: 'This crew still needs a better mix of leadership, tactics, and support.',
  }
}

// Calculates a success score for the crew based on various factors such as total crew size,
//  category distribution, nation diversity, and bending style diversity. The score is capped at 100
const getCrewSuccessScore = ({ totalCrew, categoryCounts, nationCounts, bendingCounts }) => {
  let score = Math.min(totalCrew * 7, 28)

  if (categoryCounts.get('leader')) {
    score += 18
  }

  if (categoryCounts.get('strategist')) {
    score += 14
  }

  if (categoryCounts.get('guardian')) {
    score += 10
  }

  if (categoryCounts.get('scout')) {
    score += 8
  }

  if (nationCounts.size >= 4) {
    score += 18
  } else if (nationCounts.size === 3) {
    score += 12
  } else if (nationCounts.size === 2) {
    score += 6
  }

  if (bendingCounts.get('nonbender')) {
    score += 8
  }

  if (bendingCounts.get('air') && bendingCounts.get('water')) {
    score += 6
  }

  if (bendingCounts.get('earth') && bendingCounts.get('fire')) {
    score += 6
  }

  return Math.min(score, 100)
}

// The SummaryPage component displays an overview of the user's crew,
// including total crew size, most common category/nation/bending style, and a success metric 
// based on crew composition. It also lists all crewmates with links to their detail pages and options to
// edit them.
function SummaryPage({
  orderedCrewmates,
  isLoadingCrew,
  crewCategories,
  nations,
  bendingStyles,
  getCrewmateSlug,
  onStartEdit,
})
 {
  const totalCrew = orderedCrewmates.length
  const categoryCounts = countBy(orderedCrewmates, (crewmate) => crewmate.category)
  const nationCounts = countBy(orderedCrewmates, (crewmate) => crewmate.nation)
  const bendingCounts = countBy(orderedCrewmates, (crewmate) => crewmate.bending)
  const successScore = getCrewSuccessScore({
    totalCrew,
    categoryCounts,
    nationCounts,
    bendingCounts,
  })
  const successTier = getSuccessTier(successScore)
  const successCopy = getSuccessCopy(successScore)
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

          <article className={`crew-success ${successTier}`}>
            <div className="crew-success__heading">
              <div>
                <p className="crew-card__label">Success metric</p>
                <h4>{successCopy.title}</h4>
              </div>
              <strong>{successScore}%</strong>
            </div>
            <div className="crew-success__bar" aria-hidden="true">
              <span style={{ width: `${successScore}%` }} />
            </div>
            <p>{successCopy.note}</p>
          </article>

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
        <div className={`crew-grid crew-grid--${successTier}`}>
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
                    <Link className="crewmate-link" to={`/crewmate/${getCrewmateSlug(crewmate)}`}>
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
                  <Link className="edit-button" to={`/crewmate/${getCrewmateSlug(crewmate)}`}>
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
