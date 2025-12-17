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
    <div className="card">
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h2 className="section-header mb-0">PM Summary Status</h2>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Asset Type</th>
              <th>Service Frequency</th>
              <th>Total Units Serviced</th>
              <th>Compliance %</th>
              <th>Next Service Due</th>
              <th>Pending Repairs</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => {
              const pendingCount = pendingRepairCounts[summary.asset_type_id] || 0
              return (
                <tr key={summary.id}>
                  <td>
                    <div className="font-semibold text-slate-100">
                      {summary.asset_types?.name}
                    </div>
                  </td>
                  <td>
                    {canEdit() ? (
                      <select
                        value={summary.service_frequency}
                        onChange={(e) => handleFrequencyChange(summary.id, e.target.value)}
                        className="input py-1.5 text-sm"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                      </select>
                    ) : (
                      <div>{summary.service_frequency}</div>
                    )}
                  </td>
                  <td>
                    <div>{summary.total_units_serviced}</div>
                  </td>
                  <td>
                    {canEdit() ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={summary.compliance_percentage}
                          onChange={(e) => handleComplianceChange(summary.id, e.target.value)}
                          className="input w-20 py-1.5 text-sm"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    ) : (
                      <div>
                        <span className={`badge ${
                          summary.compliance_percentage >= 90 ? 'badge-success' :
                          summary.compliance_percentage >= 70 ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {summary.compliance_percentage}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    {canEdit() ? (
                      <input
                        type="date"
                        value={summary.next_service_due || ''}
                        onChange={(e) => handleDateChange(summary.id, e.target.value)}
                        className="input py-1.5 text-sm"
                      />
                    ) : (
                      <div>
                        {summary.next_service_due ? format(new Date(summary.next_service_due), 'MM/dd/yyyy') : '-'}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      pendingCount > 0 ? 'badge-error' : 'badge-success'
                    }`}>
                      {pendingCount} {pendingCount === 1 ? 'repair' : 'repairs'}
                    </span>
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
