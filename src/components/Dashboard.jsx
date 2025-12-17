import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PMSummaryStatus from './PMSummaryStatus'
import AnnualSchedule from './AnnualSchedule'

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalAssets: 0,
    pmDue: 0,
    openWorkOrders: 0,
    pendingApprovals: 0
  })
  const [pmSummaries, setPmSummaries] = useState([])
  const [assetTypes, setAssetTypes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [pendingRepairCounts, setPendingRepairCounts] = useState({})
  const [loading, setLoading] = useState(true)
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
        { data: workOrdersData },
        { data: pendingApprovalsData }
      ] = await Promise.all([
        supabase.from('asset_types').select('*').order('name'),
        supabase.from('pm_summary').select('*, asset_types(name)'),
        supabase.from('assets').select('id'),
        supabase.from('pm_schedules').select('*').eq('year', currentYear),
        supabase.from('work_orders').select('id, status').in('status', ['Pending Approval', 'Approved']),
        supabase.from('work_orders').select('*, assets(asset_type_id)').eq('requires_customer_approval', true).eq('customer_approval_status', 'pending')
      ])

      setAssetTypes(typesData || [])
      setPmSummaries(summariesData || [])
      setSchedules(schedulesData || [])

      const counts = {}
      typesData.forEach(type => {
        counts[type.id] = pendingApprovalsData?.filter(wo => wo.assets?.asset_type_id === type.id).length || 0
      })
      setPendingRepairCounts(counts)

      const pmDueCount = summariesData?.filter(s => {
        if (!s.next_service_due) return false
        const dueDate = new Date(s.next_service_due)
        const today = new Date()
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(today.getDate() + 30)
        return dueDate <= thirtyDaysFromNow
      }).length || 0

      setStats({
        totalAssets: assetsData?.length || 0,
        pmDue: pmDueCount,
        openWorkOrders: workOrdersData?.length || 0,
        pendingApprovals: pendingApprovalsData?.length || 0
      })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1e293b] border-t-[#3b82f6]"></div>
          <p className="text-[#94a3b8]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Maintenance Dashboard</h1>
          <p className="page-subtitle">Facility Overview & Schedules</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => navigate('/assets')}
            className="btn btn-primary"
          >
            + Add Asset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card card-hover cursor-pointer" onClick={() => navigate('/assets')}>
          <div className="kpi-label">Total Assets</div>
          <div className="kpi-value">{stats.totalAssets}</div>
          <div className="kpi-subtitle">
            All managed assets
          </div>
        </div>

        <div className="kpi-card card-hover">
          <div className="kpi-label">PM Services Due</div>
          <div className="kpi-value text-[#f59e0b]">{stats.pmDue}</div>
          <div className="kpi-subtitle">
            Within 30 days
          </div>
        </div>

        <div className="kpi-card card-hover cursor-pointer" onClick={() => isAdmin() && navigate('/work-orders')}>
          <div className="kpi-label">Work Orders</div>
          <div className="kpi-value text-[#60a5fa]">{stats.openWorkOrders}</div>
          <div className="kpi-subtitle">
            Active & pending
          </div>
        </div>

        <div className="kpi-card card-hover cursor-pointer" onClick={() => navigate('/pending-approvals')}>
          <div className="kpi-label">Pending Approvals</div>
          <div className="kpi-value text-[#ef4444]">{stats.pendingApprovals}</div>
          <div className="kpi-subtitle">
            Awaiting response
          </div>
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
    </div>
  )
}
