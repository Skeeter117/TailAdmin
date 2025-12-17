import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AddAssetModal from './AddAssetModal'

export default function AssetsList({ assets, onRefresh }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const navigate = useNavigate()
  const { canEdit } = useAuth()

  const handleExportCSV = () => {
    const headers = ['Asset Number', 'Asset Type', 'Location', 'Status']
    const rows = assets.map(asset => [
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

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Assets</h2>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export CSV
            </button>
            {canEdit() && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Asset
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No assets found. Add your first asset to get started.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.asset_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.asset_types?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          asset.status === 'Active'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/asset/${asset.id}`)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddAssetModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false)
            onRefresh()
          }}
        />
      )}
    </>
  )
}
