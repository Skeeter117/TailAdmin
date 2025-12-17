import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AddAssetModal from './AddAssetModal'

export default function AssetsListPage() {
  const navigate = useNavigate()
  const { canEdit } = useAuth()
  const [assets, setAssets] = useState([])
  const [assetTypes, setAssetTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [
        { data: assetsData },
        { data: typesData }
      ] = await Promise.all([
        supabase.from('assets').select('*, asset_types(name)').order('asset_number'),
        supabase.from('asset_types').select('*').order('name')
      ])

      setAssets(assetsData || [])
      setAssetTypes(typesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.asset_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_types?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || asset.asset_types?.name === filterType
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleExportCSV = () => {
    const headers = ['Asset Number', 'Asset Type', 'Location', 'Status']
    const rows = filteredAssets.map(asset => [
      asset.asset_number,
      asset.asset_types?.name || '',
      asset.location,
      asset.status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
          <p className="text-slate-400">Loading assets...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Assets</h1>
            <p className="page-subtitle">{filteredAssets.length} total assets</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
            >
              📥 Export CSV
            </button>
            {canEdit() && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary"
              >
                + Add Asset
              </button>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by asset number, type, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input md:w-48"
            >
              <option value="all">All Types</option>
              {assetTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input md:w-48"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset Number</th>
                  <th>Asset Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">
                      {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                        ? 'No assets match your filters'
                        : 'No assets found. Add your first asset to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <div className="font-semibold text-slate-100">{asset.asset_number}</div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span>🏗️</span>
                          <span>{asset.asset_types?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span>📍</span>
                          <span>{asset.location}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            asset.status === 'Active'
                              ? 'badge-success'
                              : asset.status === 'Maintenance'
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/asset/${asset.id}`)}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddAssetModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false)
            fetchData()
          }}
        />
      )}
    </>
  )
}
