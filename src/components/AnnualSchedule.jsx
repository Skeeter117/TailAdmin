import { useAuth } from '../contexts/AuthContext'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_OPTIONS = ['Completed', 'Scheduled', 'Customer Delayed', 'In Progress']

const STATUS_COLORS = {
  'Completed': 'bg-success-100 text-success-800 border-success-300',
  'Scheduled': 'bg-blue-100 text-blue-800 border-blue-300',
  'Customer Delayed': 'bg-warning-100 text-warning-800 border-warning-300',
  'In Progress': 'bg-primary-100 text-primary-800 border-primary-300'
}

export default function AnnualSchedule({ assetTypes, schedules, currentYear, onUpdateSchedule, onYearChange }) {
  const { canEdit } = useAuth()
  const getScheduleStatus = (assetTypeId, month) => {
    const schedule = schedules.find(
      s => s.asset_type_id === assetTypeId && s.month === month + 1 && s.year === currentYear
    )
    return schedule?.status || 'Scheduled'
  }

  const handleStatusClick = (assetTypeId, month) => {
    const currentStatus = getScheduleStatus(assetTypeId, month)
    const currentIndex = STATUS_OPTIONS.indexOf(currentStatus)
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length
    const nextStatus = STATUS_OPTIONS[nextIndex]
    onUpdateSchedule(assetTypeId, month + 1, nextStatus)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Annual Schedule</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onYearChange(currentYear - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-gray-900 min-w-[80px] text-center">
            {currentYear}
          </span>
          <button
            onClick={() => onYearChange(currentYear + 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                Asset Type
              </th>
              {MONTHS.map((month) => (
                <th
                  key={month}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {month.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assetTypes.map((assetType) => (
              <tr key={assetType.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white">
                  <div className="text-sm font-medium text-gray-900">{assetType.name}</div>
                </td>
                {MONTHS.map((month, monthIndex) => {
                  const status = getScheduleStatus(assetType.id, monthIndex)
                  return (
                    <td key={month} className="px-2 py-4">
                      {canEdit() ? (
                        <button
                          onClick={() => handleStatusClick(assetType.id, monthIndex)}
                          className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border transition-all hover:shadow-md ${STATUS_COLORS[status]}`}
                          title={`Click to change status (Current: ${status})`}
                        >
                          {status === 'Completed' && '✓'}
                          {status === 'Scheduled' && '○'}
                          {status === 'Customer Delayed' && '⊗'}
                          {status === 'In Progress' && '◐'}
                        </button>
                      ) : (
                        <div className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border text-center ${STATUS_COLORS[status]}`}>
                          {status === 'Completed' && '✓'}
                          {status === 'Scheduled' && '○'}
                          {status === 'Customer Delayed' && '⊗'}
                          {status === 'In Progress' && '◐'}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${STATUS_COLORS[status]}`}>
                {status === 'Completed' && '✓'}
                {status === 'Scheduled' && '○'}
                {status === 'Customer Delayed' && '⊗'}
                {status === 'In Progress' && '◐'}
              </span>
              <span className="text-gray-600">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
