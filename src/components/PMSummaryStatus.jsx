import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

export default function PMSummaryStatus({ summaries, assetTypes, pendingRepairCounts, onUpdate }) {
  const { canEdit } = useAuth()
  const handleDateChange = (id, value) => {
    onUpdate(id, 'next_service_due', value)
  }

  const handleComplianceChange = (id, value) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onUpdate(id, 'compliance_percentage', numValue)
    }
  }

  const handleFrequencyChange = (id, value) => {
    onUpdate(id, 'service_frequency', value)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">PM Summary Status</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Units Serviced
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Service Due
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repairs Pending
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.map((summary) => {
              const pendingCount = pendingRepairCounts[summary.asset_type_id] || 0
              return (
                <tr key={summary.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {summary.asset_types?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canEdit() ? (
                      <select
                        value={summary.service_frequency}
                        onChange={(e) => handleFrequencyChange(summary.id, e.target.value)}
                        className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900">{summary.service_frequency}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{summary.total_units_serviced}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canEdit() ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={summary.compliance_percentage}
                          onChange={(e) => handleComplianceChange(summary.id, e.target.value)}
                          className="w-20 text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="ml-1 text-sm text-gray-500">%</span>
                      </>
                    ) : (
                      <div className="text-sm text-gray-900">{summary.compliance_percentage}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canEdit() ? (
                      <input
                        type="date"
                        value={summary.next_service_due || ''}
                        onChange={(e) => handleDateChange(summary.id, e.target.value)}
                        className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {summary.next_service_due ? format(new Date(summary.next_service_due), 'MM/dd/yyyy') : '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          pendingCount > 0
                            ? 'bg-error-100 text-error-800'
                            : 'bg-success-100 text-success-800'
                        }`}
                      >
                        {pendingCount}
                      </span>
                      <span className="text-xs text-gray-500">
                        {pendingCount === 1 ? 'approval' : 'approvals'}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
