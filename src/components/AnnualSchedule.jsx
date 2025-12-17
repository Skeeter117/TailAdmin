import { useAuth } from '../contexts/AuthContext'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_OPTIONS = ['Completed', 'Scheduled', 'Customer Delayed', 'In Progress']

const STATUS_COLORS = {
  'Completed': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Customer Delayed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'In Progress': 'bg-purple-500/10 text-purple-400 border-purple-500/20'
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
    <div className="card">
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="section-header mb-0">Annual Schedule</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onYearChange(currentYear - 1)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-slate-100 min-w-[80px] text-center">
            {currentYear}
          </span>
          <button
            onClick={() => onYearChange(currentYear + 1)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-slate-800/70">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-800/70 backdrop-blur-sm">
                Asset Type
              </th>
              {MONTHS.map((month) => (
                <th
                  key={month}
                  className="px-3 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {month.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assetTypes.map((assetType) => (
              <tr key={assetType.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-slate-800/50 backdrop-blur-sm">
                  <div className="text-sm font-medium text-slate-100">{assetType.name}</div>
                </td>
                {MONTHS.map((month, monthIndex) => {
                  const status = getScheduleStatus(assetType.id, monthIndex)
                  return (
                    <td key={month} className="px-2 py-4">
                      {canEdit() ? (
                        <button
                          onClick={() => handleStatusClick(assetType.id, monthIndex)}
                          className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border transition-all hover:shadow-md hover:scale-105 ${STATUS_COLORS[status]}`}
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
      <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
        <div className="flex flex-wrap gap-4 text-xs">
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-lg border ${STATUS_COLORS[status]}`}>
                {status === 'Completed' && '✓'}
                {status === 'Scheduled' && '○'}
                {status === 'Customer Delayed' && '⊗'}
                {status === 'In Progress' && '◐'}
              </span>
              <span className="text-slate-400">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
