import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function WorkOrdersPage() {
  const navigate = useNavigate()
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, assets(asset_number, asset_types(name))')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkOrders(data || [])
    } catch (error) {
      console.error('Error fetching work orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      if (newStatus === 'Completed') {
        updates.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchWorkOrders()
    } catch (error) {
      console.error('Error updating work order:', error)
    }
  }

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch =
      wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.assets?.asset_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus
    const matchesPriority = filterPriority === 'all' || wo.priority === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status) => {
    const classes = {
      'Pending Approval': 'badge-warning',
      'Approved': 'badge-info',
      'Completed': 'badge-success',
      'Declined': 'badge-error'
    }
    return classes[status] || 'badge-neutral'
  }

  const getPriorityBadge = (priority) => {
    const classes = {
      'Low': 'badge-neutral',
      'Medium': 'badge-info',
      'High': 'badge-warning',
      'Critical': 'badge-error'
    }
    return classes[priority] || 'badge-neutral'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
          <p className="text-slate-400">Loading work orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Work Orders</h1>
          <p className="page-subtitle">{filteredWorkOrders.length} total work orders</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">All Status</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Declined">Declined</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredWorkOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'No work orders match your filters'
                : 'No work orders yet.'}
            </div>
          ) : (
            filteredWorkOrders.map((wo) => (
              <div
                key={wo.id}
                className="card p-6 card-hover cursor-pointer"
                onClick={() => navigate(`/asset/${wo.asset_id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-100 mb-1">{wo.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-2">
                          <span className="flex items-center space-x-1">
                            <span>🏗️</span>
                            <span>{wo.assets?.asset_types?.name}</span>
                          </span>
                          <span>•</span>
                          <span>Asset #{wo.assets?.asset_number}</span>
                          <span>•</span>
                          <span>{format(new Date(wo.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    {wo.description && (
                      <p className="text-slate-300 mb-3 line-clamp-2">{wo.description}</p>
                    )}
                    {wo.requires_customer_approval && wo.customer_approval_status === 'pending' && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm inline-flex items-center space-x-2">
                        <span className="text-amber-400 font-medium">⚠ Awaiting Customer Approval</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${getPriorityBadge(wo.priority)}`}>
                        {wo.priority}
                      </span>
                      <span className={`badge ${getStatusBadge(wo.status)}`}>
                        {wo.status}
                      </span>
                    </div>

                    {wo.status !== 'Completed' && wo.status !== 'Declined' && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {wo.status === 'Pending Approval' && (
                          <button
                            onClick={() => handleStatusUpdate(wo.id, 'Approved')}
                            className="btn btn-success btn-sm"
                          >
                            Approve
                          </button>
                        )}
                        {wo.status === 'Approved' && (
                          <button
                            onClick={() => handleStatusUpdate(wo.id, 'Completed')}
                            className="btn btn-primary btn-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
