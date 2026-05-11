import { useEffect, useMemo, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { isSupabaseConfigured, supabase, getSessionId } from './client'
import CrewmateFormPage from './pages/CrewmateFormPage'
import SummaryPage from './pages/SummaryPage'
import CrewmateDetailPage from './pages/CrewmateDetailPage'
import airNationIcon from './assets/nations/air.png'
import waterNationIcon from './assets/nations/water.png'
import earthNationIcon from './assets/nations/earth.png'
import fireNationIcon from './assets/nations/fire.png'

const nations = [
  {
    id: 'air',
    label: 'Air Nomads',
    icon: airNationIcon,
  },
  {
    id: 'water',
    label: 'Water Tribe',
    icon: waterNationIcon,
  },
  {
    id: 'earth',
    label: 'Earth Kingdom',
    icon: earthNationIcon,
  },
  {
    id: 'fire',
    label: 'Fire Nation',
    icon: fireNationIcon,
  },
]

const bendingStyles = [
  { id: 'air', label: 'Air', note: 'Agile and calm' },
  { id: 'water', label: 'Water', note: 'Adaptable and balanced' },
  { id: 'earth', label: 'Earth', note: 'Steady and grounded' },
  { id: 'fire', label: 'Fire', note: 'Bold and driven' },
  { id: 'nonbender', label: 'Nonbender', note: 'Resourceful and creative' },
]

const crewCategories = [
  {
    id: 'leader',
    label: 'Leader',
    note: 'Guides the team from the front line.',
    nations: ['air', 'fire'],
    bendings: ['air', 'fire', 'nonbender'],
  },
  {
    id: 'guardian',
    label: 'Guardian',
    note: 'Protective and steady under pressure.',
    nations: ['water', 'earth'],
    bendings: ['water', 'earth', 'nonbender'],
  },
  {
    id: 'strategist',
    label: 'Strategist',
    note: 'Plans carefully and reads the whole battlefield.',
    nations: ['air', 'water'],
    bendings: ['air', 'water', 'nonbender'],
  },
  {
    id: 'scout',
    label: 'Scout',
    note: 'Quick, observant, and hard to pin down.',
    nations: ['air', 'earth'],
    bendings: ['air', 'earth', 'nonbender'],
  },
]

const getCategoryConfig = (categoryId) =>
  crewCategories.find((category) => category.id === categoryId)

const inferCategory = (nation, bending) =>
  crewCategories.find(
    (category) => category.nations.includes(nation) && category.bendings.includes(bending),
  )?.id ?? ''

const initialFormState = {
  name: '',
  category: '',
  nation: '',
  bending: '',
}

const CREWMATES_TABLE = 'crewmates'

const normalizeCrewmate = (row) => ({
  id: row.id ?? crypto.randomUUID(),
  name: row.name ?? 'Unnamed recruit',
  category: row.category ?? inferCategory(row.nation ?? '', row.bending ?? ''),
  nation: row.nation ?? '',
  bending: row.bending ?? '',
  bio: row.bio ?? '',
  createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
})

const getSortTime = (value) => new Date(value).getTime() || 0

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const getCrewmateSlug = (crewmate) => {
  const base = toSlug(crewmate.name || 'unnamed-recruit') || 'unnamed-recruit'
  const suffix = String(crewmate.id || '').slice(0, 8)

  return suffix ? `${base}-${suffix}` : base
}

const gaangPresets = [
  {
    name: 'Aang',
    category: 'leader',
    nation: 'air',
    bending: 'air',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/a/ae/Aang_at_Jasmine_Dragon.png/revision/latest?cb=20130612174003',
  },
  {
    name: 'Katara',
    category: 'guardian',
    nation: 'water',
    bending: 'water',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/7/7a/Katara_smiles_at_coronation.png/revision/latest?cb=20150104171449',
  },
  {
    name: 'Sokka',
    category: 'strategist',
    nation: 'water',
    bending: 'nonbender',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/c/cc/Sokka.png/revision/latest?cb=20140905085428',
  },
  {
    name: 'Toph',
    category: 'guardian',
    nation: 'earth',
    bending: 'earth',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/4/46/Toph_Beifong.png/revision/latest?cb=20131230122047',
  },
  {
    name: 'Zuko',
    category: 'leader',
    nation: 'fire',
    bending: 'fire',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/4/4b/Zuko.png/revision/latest?cb=20180630112142',
  },
  {
    name: 'Suki',
    category: 'scout',
    nation: 'earth',
    bending: 'nonbender',
    photo:
      'https://vignette.wikia.nocookie.net/avatar/images/1/14/Suki.png/revision/latest?cb=20130819094354',
  },
]

function App() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormState)
  const [crewmates, setCrewmates] = useState([])
  const [editingCrewmateId, setEditingCrewmateId] = useState(null)
  const [isLoadingCrew, setIsLoadingCrew] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const selectedCategory = getCategoryConfig(formData.category)
  const selectedNation = nations.find((nation) => nation.id === formData.nation)
  const selectedBending = bendingStyles.find(
    (style) => style.id === formData.bending,
  )
  const allowedNations = selectedCategory
    ? nations.filter((nation) => selectedCategory.nations.includes(nation.id))
    : []
  const allowedBendingStyles = selectedCategory
    ? bendingStyles.filter((style) => selectedCategory.bendings.includes(style.id))
    : []

  const orderedCrewmates = useMemo(
    () =>
      [...crewmates].sort(
        (left, right) =>
          getSortTime(right.createdAt) - getSortTime(left.createdAt),
      ),
    [crewmates],
  )

  useEffect(() => {
    const loadCrewmates = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setIsLoadingCrew(false)
        setFormError(
          'We couldn’t save that crewmate right now. Please try again.',
        )
        return
      }

      const sessionId = getSessionId()
      const { data, error } = await supabase
        .from(CREWMATES_TABLE)
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) {
        setFormError(error.message)
        setIsLoadingCrew(false)
        return
      }

      setCrewmates((data ?? []).map(normalizeCrewmate))
      setIsLoadingCrew(false)
    }

    loadCrewmates()
  }, [])

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      ...(field === 'category'
        ? {
            category: value,
            nation: '',
            bending: '',
          }
        : field === 'nation' || field === 'bending'
          ? current.category
            ? { [field]: value }
            : {}
          : { [field]: value }),
    }))
  }

  const applyPreset = (preset) => {
    setFormData({
      name: preset.name,
      category: preset.category,
      nation: preset.nation,
      bending: preset.bending,
    })
  }

  const startEditingCrewmate = (crewmate) => {
    setFormData({
      name: crewmate.name,
      category: crewmate.category,
      nation: crewmate.nation,
      bending: crewmate.bending,
    })
    setEditingCrewmateId(crewmate.id)
    setFormError('')
    navigate('/create')
  }

  const startEditingCrewmateById = (crewmateId) => {
    const foundCrewmate = crewmates.find(
      (crewmate) => String(crewmate.id) === String(crewmateId),
    )

    if (!foundCrewmate) {
      setFormError('That crewmate could not be found.')
      return
    }

    startEditingCrewmate(foundCrewmate)
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setEditingCrewmateId(null)
    setFormError('')
  }

  const handleDeleteCrewmate = async () => {
    if (!editingCrewmateId) {
      return
    }

    if (!isSupabaseConfigured || !supabase) {
      setFormError(
        'We couldn’t save that crewmate right now. Please try again.',
      )
      return
    }

    setIsSaving(true)
    setFormError('')

    const { error } = await supabase
      .from(CREWMATES_TABLE)
      .delete()
      .eq('id', editingCrewmateId)

    if (error) {
      const isDeleteRlsIssue = /row-level security|permission denied/i.test(error.message)

      setFormError(
        isDeleteRlsIssue
          ? 'Deleting that crewmate didn’t work. Please try again.'
          : error.message,
      )
      setIsSaving(false)
      return
    }

    setCrewmates((current) =>
      current.filter((crewmate) => crewmate.id !== editingCrewmateId),
    )
    resetForm()
    navigate('/summary')
    setIsSaving(false)
  }

  const handleSaveBio = async (crewmateId, bio) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'We couldn’t save that bio right now. Please try again.',
      )
    }

    const { data, error } = await supabase
      .from(CREWMATES_TABLE)
      .update({ bio })
      .eq('id', crewmateId)
      .select('*')

    if (error) {
      const isUpdateRlsIssue = /row-level security|permission denied/i.test(error.message)

      throw new Error(
        isUpdateRlsIssue
          ? 'That bio could not be saved. Check your permissions and try again.'
          : error.message,
      )
    }

    const updatedCrewmate = Array.isArray(data) ? data[0] : data

    if (!updatedCrewmate) {
      throw new Error('That bio could not be saved. Please try again.')
    }

    setCrewmates((current) =>
      current.map((crewmate) =>
        String(crewmate.id) === String(crewmateId)
          ? normalizeCrewmate(updatedCrewmate)
          : crewmate,
      ),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name || !formData.category || !formData.nation || !formData.bending) {
      setFormError('Choose a category, nation, and bending style before saving.')
      return
    }

    if (!isSupabaseConfigured || !supabase) {
      setFormError(
        'We couldn’t save that crewmate right now. Please try again.',
      )
      return
    }

    setIsSaving(true)
    setFormError('')

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      nation: formData.nation,
      bending: formData.bending,
    }

    // Add session_id for new crewmates to isolate by browser
    if (!editingCrewmateId) {
      payload.session_id = getSessionId()
    }

    const request = editingCrewmateId
      ? supabase
          .from(CREWMATES_TABLE)
          .update(payload)
          .eq('id', editingCrewmateId)
        .select('*')
      : supabase
          .from(CREWMATES_TABLE)
          .insert(payload)
        .select('*')

    const { data, error } = await request

    if (error) {
      const isUpdateRlsIssue =
        editingCrewmateId && /row-level security|permission denied/i.test(error.message)

      setFormError(
        isUpdateRlsIssue
          ? 'That crewmate could not be updated. Check your connection or permissions.'
          : error.message,
      )
      setIsSaving(false)
      return
    }

    const returnedRows = Array.isArray(data) ? data : data ? [data] : []

    if (editingCrewmateId && returnedRows.length === 0) {
      setFormError(
        'That crewmate could not be updated. Check your connection or permissions.',
      )
      setIsSaving(false)
      return
    }

    const returnedCrewmate = returnedRows[0]
    const normalizedCrewmate = returnedCrewmate
      ? normalizeCrewmate(returnedCrewmate)
      : null

    setCrewmates((current) => {
      if (editingCrewmateId) {
        return current.map((crewmate) =>
          crewmate.id === editingCrewmateId
            ? normalizedCrewmate ?? { ...crewmate, ...payload }
            : crewmate,
        )
      }

      return normalizedCrewmate ? [normalizedCrewmate, ...current] : current
    })

    resetForm()
    navigate('/summary')
    setIsSaving(false)
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Avatar: The Last Airbender</p>
        <h1>The Gaang Builder</h1>
        <p className="hero-copy">
          Start from a preset hero or create your own. Choose each recruit's
          nation and bending path with nation symbols.
        </p>
      </section>

      <nav className="page-switch" aria-label="Page switcher">
        <NavLink
          to="/create"
          className={({ isActive }) =>
            `page-switch__button ${isActive ? 'is-active' : ''}`
          }
        >
          Create
        </NavLink>
        <NavLink
          to="/summary"
          className={({ isActive }) =>
            `page-switch__button ${isActive ? 'is-active' : ''}`
          }
        >
          Summary
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/create" replace />} />
        <Route
          path="/create"
          element={
            <CrewmateFormPage
              nations={nations}
              bendingStyles={bendingStyles}
              gaangPresets={gaangPresets}
              formData={formData}
              selectedCategory={selectedCategory}
              selectedNation={selectedNation}
              selectedBending={selectedBending}
              crewCategories={crewCategories}
              allowedNations={allowedNations}
              allowedBendingStyles={allowedBendingStyles}
              editingCrewmateId={editingCrewmateId}
              isSaving={isSaving}
              formError={formError}
              onApplyPreset={applyPreset}
              onFieldChange={updateField}
              onSubmit={handleSubmit}
              onResetForm={resetForm}
              onDeleteCrewmate={handleDeleteCrewmate}
            />
          }
        />
        <Route
          path="/summary"
          element={
            <SummaryPage
              orderedCrewmates={orderedCrewmates}
              isLoadingCrew={isLoadingCrew}
              crewCategories={crewCategories}
              nations={nations}
              bendingStyles={bendingStyles}
              getCrewmateSlug={getCrewmateSlug}
              onStartEdit={startEditingCrewmate}
            />
          }
        />
        <Route
          path="/crewmate/:slug"
          element={
            <CrewmateDetailPage
              crewmates={crewmates}
              isLoadingCrew={isLoadingCrew}
              crewCategories={crewCategories}
              nations={nations}
              bendingStyles={bendingStyles}
              getCrewmateSlug={getCrewmateSlug}
              onStartEdit={startEditingCrewmateById}
              onSaveBio={handleSaveBio}
            />
          }
        />
        <Route path="*" element={<Navigate to="/create" replace />} />
      </Routes>
    </main>
  )
}

export default App
