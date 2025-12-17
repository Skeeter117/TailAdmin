import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PMSummaryStatus from './PMSummaryStatus'
import AnnualSchedule from './AnnualSchedule'
import AssetsList from './AssetsList'

export default function Dashboard() {
  const [pmSummaries, setPmSummaries] = useState([])
  const [assetTypes, setAssetTypes] = useState([])
  const [assets, setAssets] = useState([])
  const [schedules, setSchedules] = useState([])
  const [pendingRepairCounts, setPendingRepairCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [currentYear, setCurrentYear] = useState(2026)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [
        { data: typesData },
        { data: summariesData },
        { data: assetsData },
        { data: schedulesData },
        { data: workOrdersData }
      ] = await Promise.all([
        supabase.from('asset_types').select('*').order('name'),
        supabase.from('pm_summary').select('*, asset_types(name)'),
        supabase.from('assets').select('*, asset_types(name)').order('asset_number'),
        supabase.from('pm_schedules').select('*').eq('year', currentYear),
        supabase.from('work_orders').select('*, assets(asset_type_id)').eq('status', 'Pending Approval')
      ])

      setAssetTypes(typesData || [])
      setPmSummaries(summariesData || [])
      setAssets(assetsData || [])
      setSchedules(schedulesData || [])

      const counts = {}
      typesData.forEach(type => {
        counts[type.id] = workOrdersData?.filter(wo => wo.assets?.asset_type_id === type.id).length || 0
      })
      setPendingRepairCounts(counts)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSummary = async (id, field, value) => {
    try {
      const { error } = await supabase
        .from('pm_summary')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error('Error updating summary:', error)
    }
  }

  const handleUpdateSchedule = async (assetTypeId, month, status) => {
    try {
      const existing = schedules.find(
        s => s.asset_type_id === assetTypeId && s.month === month && s.year === currentYear
      )

      if (existing) {
        const { error } = await supabase
          .from('pm_schedules')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pm_schedules')
          .insert({ asset_type_id: assetTypeId, year: currentYear, month, status })

        if (error) throw error
      }

      await fetchData()
    } catch (error) {
      console.error('Error updating schedule:', error)
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.asset_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || asset.asset_types?.name === filterType

    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">PM Dashboard</h1>
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Asset Types</option>
            {assetTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <PMSummaryStatus
        summaries={pmSummaries}
        assetTypes={assetTypes}
        pendingRepairCounts={pendingRepairCounts}
        onUpdate={handleUpdateSummary}
      />

      <AnnualSchedule
        assetTypes={assetTypes}
        schedules={schedules}
        currentYear={currentYear}
        onUpdateSchedule={handleUpdateSchedule}
        onYearChange={setCurrentYear}
      />

      <AssetsList
        assets={filteredAssets}
        onRefresh={fetchData}
      />
    </div>
  )
}
