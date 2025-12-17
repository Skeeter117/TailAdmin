import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

export default function PendingApprovalsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, assets(asset_number, asset_types(name), location)')
        .eq('requires_customer_approval', true)
        .eq('customer_approval_status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkOrders(data || [])
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (id, action, notes = '') => {
    try {
      setProcessingId(id)
      const { error } = await supabase
        .from('work_orders')
        .update({
          customer_approval_status: action,
          customer_approved_by: session?.user?.id,
          customer_approved_at: new Date().toISOString(),
          customer_approval_notes: notes,
          status: action === 'approved' ? 'Approved' : 'Declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      await fetchPendingApprovals()
    } catch (error) {
      console.error('Error updating approval:', error)
    } finally {
      setProcessingId(null)
    }
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
          <p className="text-slate-400">Loading pending approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Pending Approvals</h1>
          <p className="page-subtitle">
            {workOrders.length === 0
              ? 'No pending work orders'
              : `${workOrders.length} work order${workOrders.length !== 1 ? 's' : ''} awaiting your approval`}
          </p>
        </div>
      </div>

      {workOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No work orders are currently awaiting your approval.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {workOrders.map((wo) => (
            <div key={wo.id} className="card">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">⚠</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-100 mb-2">{wo.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-3">
                          <span className="flex items-center space-x-1">
                            <span>🏗️</span>
                            <span>{wo.assets?.asset_types?.name}</span>
                          </span>
                          <span>•</span>
                          <span>Asset #{wo.assets?.asset_number}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>{wo.assets?.location}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className={`badge ${getPriorityBadge(wo.priority)}`}>
                            {wo.priority} Priority
                          </span>
                          <span className="text-slate-400">
                            Requested on {format(new Date(wo.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                  Description of Work
                </h4>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  {wo.description || 'No description provided.'}
                </p>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-400 text-xl">ℹ</span>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-slate-200 mb-1">Review Required</h5>
                      <p className="text-sm text-slate-400">
                        This work order requires your approval before PRS Industrial can proceed with the repair or maintenance work.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleApproval(wo.id, 'approved')}
                    disabled={processingId === wo.id}
                    className="btn btn-success flex-1 sm:flex-none"
                  >
                    {processingId === wo.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>✓ Approve Work Order</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const notes = window.prompt('Optional: Provide a reason for declining this work order')
                      if (notes !== null) {
                        handleApproval(wo.id, 'declined', notes)
                      }
                    }}
                    disabled={processingId === wo.id}
                    className="btn btn-danger flex-1 sm:flex-none"
                  >
                    ✗ Decline
                  </button>
                  <button
                    onClick={() => navigate(`/asset/${wo.asset_id}`)}
                    className="btn btn-ghost flex-1 sm:flex-none"
                  >
                    View Asset Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
