import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import AddWorkOrderModal from './AddWorkOrderModal'

export default function AssetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canEdit } = useAuth()
  const [asset, setAsset] = useState(null)
  const [workOrders, setWorkOrders] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddWorkOrderOpen, setIsAddWorkOrderOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('timeline')

  useEffect(() => {
    if (id) {
      fetchAssetData()
    }
  }, [id])

  const fetchAssetData = async () => {
    try {
      setLoading(true)
      const [
        { data: assetData },
        { data: workOrdersData },
        { data: attachmentsData }
      ] = await Promise.all([
        supabase.from('assets').select('*, asset_types(name)').eq('id', id).maybeSingle(),
        supabase.from('work_orders').select('*').eq('asset_id', id).order('created_at', { ascending: false }),
        supabase.from('attachments').select('*').eq('asset_id', id).order('uploaded_at', { ascending: false })
      ])

      setAsset(assetData)
      setWorkOrders(workOrdersData || [])
      setAttachments(attachmentsData || [])
    } catch (error) {
      console.error('Error fetching asset data:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <p className="text-slate-400">Loading asset details...</p>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Asset Not Found</h2>
        <p className="text-slate-400 mb-6">The asset you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/assets')} className="btn btn-primary">
          Back to Assets
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/assets')}
          className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span>←</span>
          <span>Back to Assets</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="page-header mb-0">Asset #{asset.asset_number}</h1>
              <span className={`badge ${asset.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                {asset.status}
              </span>
            </div>
            <p className="page-subtitle mb-0">{asset.asset_types?.name} • {asset.location}</p>
          </div>
          {canEdit() && (
            <button
              onClick={() => setIsAddWorkOrderOpen(true)}
              className="btn btn-primary"
            >
              + Create Work Order
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="border-b border-slate-700/50 px-6 py-4">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'timeline'
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('attachments')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'attachments'
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Attachments ({attachments.length})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {workOrders.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        No work orders yet. Create one to get started.
                      </div>
                    ) : (
                      workOrders.map((wo) => (
                        <div key={wo.id} className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full mt-1.5 ${
                              wo.status === 'Completed' ? 'bg-green-500' :
                              wo.status === 'Approved' ? 'bg-blue-500' :
                              wo.status === 'Pending Approval' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`} />
                          </div>
                          <div className="flex-1 pb-8 border-l-2 border-slate-700/50 pl-6 ml-1.5">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-100">{wo.title}</h3>
                                <p className="text-sm text-slate-400">
                                  {format(new Date(wo.created_at), 'MMM dd, yyyy • h:mm a')}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`badge ${getPriorityBadge(wo.priority)}`}>
                                  {wo.priority}
                                </span>
                                <span className={`badge ${getStatusBadge(wo.status)}`}>
                                  {wo.status}
                                </span>
                              </div>
                            </div>
                            {wo.description && (
                              <p className="text-slate-300 mb-3">{wo.description}</p>
                            )}
                            {wo.requires_customer_approval && (
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
                                <span className="text-amber-400 font-medium">⚠ Requires Customer Approval</span>
                                <span className="text-slate-400 ml-2">Status: {wo.customer_approval_status}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'attachments' && (
                  <div className="space-y-3">
                    {attachments.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        No attachments yet.
                      </div>
                    ) : (
                      attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                              <span className="text-blue-400 text-lg">📄</span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">{attachment.file_name}</div>
                              <div className="text-xs text-slate-400">
                                {attachment.category} • {format(new Date(attachment.uploaded_at), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            Download
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="section-header text-lg mb-4">Asset Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Asset Number</div>
                  <div className="text-slate-100 font-medium">{asset.asset_number}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Asset Type</div>
                  <div className="text-slate-100 font-medium">{asset.asset_types?.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Location</div>
                  <div className="text-slate-100 font-medium">{asset.location}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Status</div>
                  <span className={`badge ${asset.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                    {asset.status}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Created</div>
                  <div className="text-slate-100">{format(new Date(asset.created_at), 'MMM dd, yyyy')}</div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="section-header text-lg mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Work Orders</span>
                  <span className="text-2xl font-bold text-slate-100">{workOrders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-2xl font-bold text-green-400">
                    {workOrders.filter(wo => wo.status === 'Completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pending</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {workOrders.filter(wo => wo.status === 'Pending Approval').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Attachments</span>
                  <span className="text-2xl font-bold text-blue-400">{attachments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddWorkOrderOpen && (
        <AddWorkOrderModal
          assetId={id}
          onClose={() => setIsAddWorkOrderOpen(false)}
          onSuccess={() => {
            setIsAddWorkOrderOpen(false)
            fetchAssetData()
          }}
        />
      )}
    </>
  )
}
