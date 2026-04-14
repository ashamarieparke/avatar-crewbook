import { Link } from 'react-router-dom'

function SummaryPage({
  orderedCrewmates,
  isLoadingCrew,
  crewCategories,
  nations,
  bendingStyles,
  onStartEdit,
}) {
  return (
    <section className="panel roster-section">
      <div className="panel-heading">
        <h2>Crew Summary</h2>
        <p>This page shows all crewmates, newest at the top.</p>
      </div>

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
