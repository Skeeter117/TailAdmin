import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import AddWorkOrderModal from './AddWorkOrderModal'
import FileUpload from './FileUpload'

export default function AssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [workOrders, setWorkOrders] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddWorkOrderOpen, setIsAddWorkOrderOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  useEffect(() => {
    fetchAssetDetails()
  }, [id])

  const fetchAssetDetails = async () => {
    try {
      setLoading(true)

      const [
        { data: assetData },
        { data: workOrdersData },
        { data: attachmentsData }
      ] = await Promise.all([
        supabase.from('assets').select('*, asset_types(name)').eq('id', id).single(),
        supabase.from('work_orders').select('*').eq('asset_id', id).order('created_at', { ascending: false }),
        supabase.from('attachments').select('*').eq('asset_id', id).order('uploaded_at', { ascending: false })
      ])

      setAsset(assetData)
      setWorkOrders(workOrdersData || [])
      setAttachments(attachmentsData || [])
    } catch (error) {
      console.error('Error fetching asset details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateWorkOrderStatus = async (workOrderId, newStatus) => {
    try {
      const updateData = { status: newStatus, updated_at: new Date().toISOString() }
      if (newStatus === 'Completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId)

      if (error) throw error
      await fetchAssetDetails()
    } catch (error) {
      console.error('Error updating work order:', error)
    }
  }

  const pendingApprovals = workOrders.filter(wo => wo.status === 'Pending Approval')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Asset not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{asset.asset_number}</h1>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {asset.asset_types?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {asset.location}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      asset.status === 'Active'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {asset.status}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload File
              </button>
              <button
                onClick={() => setIsAddWorkOrderOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Work Order
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pending Customer Repair Approvals</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                pendingApprovals.length > 0
                  ? 'bg-error-100 text-error-800'
                  : 'bg-success-100 text-success-800'
              }`}
            >
              {pendingApprovals.length} {pendingApprovals.length === 1 ? 'approval' : 'approvals'}
            </span>
          </div>
          <div className="p-6">
            {pendingApprovals.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((wo) => (
                  <div
                    key={wo.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{wo.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{wo.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Priority: <span className="font-medium">{wo.priority}</span></span>
                          <span>Created: {format(new Date(wo.created_at), 'MM/dd/yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleUpdateWorkOrderStatus(wo.id, 'Approved')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-success-600 rounded hover:bg-success-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateWorkOrderStatus(wo.id, 'Declined')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-error-600 rounded hover:bg-error-700 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Work Order History</h2>
          </div>
          <div className="p-6">
            {workOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No work orders</p>
            ) : (
              <div className="space-y-4">
                {workOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{wo.title}</h3>
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              wo.status === 'Completed'
                                ? 'bg-success-100 text-success-800'
                                : wo.status === 'Approved'
                                ? 'bg-blue-100 text-blue-800'
                                : wo.status === 'Pending Approval'
                                ? 'bg-warning-100 text-warning-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {wo.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{wo.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Priority: <span className="font-medium">{wo.priority}</span></span>
                          <span>Created: {format(new Date(wo.created_at), 'MM/dd/yyyy')}</span>
                          {wo.completed_at && (
                            <span>Completed: {format(new Date(wo.completed_at), 'MM/dd/yyyy')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Documents & Attachments</h2>
          </div>
          <div className="p-6">
            {attachments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attachments</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{attachment.file_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{attachment.category}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(attachment.uploaded_at), 'MM/dd/yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddWorkOrderOpen && (
        <AddWorkOrderModal
          assetId={id}
          onClose={() => setIsAddWorkOrderOpen(false)}
          onSuccess={() => {
            setIsAddWorkOrderOpen(false)
            fetchAssetDetails()
          }}
        />
      )}

      {isUploadOpen && (
        <FileUpload
          assetId={id}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            setIsUploadOpen(false)
            fetchAssetDetails()
          }}
        />
      )}
    </>
  )
}
