import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin } = useAuth()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/pending-approvals', label: 'Pending Approvals', icon: <ApprovalIcon /> }
  ]

  return (
    <div className="w-64 bg-[#0f1419] border-r border-[#1e293b] flex flex-col h-full">
      <div className="p-6 border-b border-[#1e293b]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center font-bold text-white">
            PRS
          </div>
          <div>
            <div className="text-[#f8fafc] font-semibold">PRS Industrial</div>
            <div className="text-xs text-[#94a3b8]">Maintenance Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
              isActive(item.path)
                ? 'bg-[#3b82f6] text-white'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1f2e]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1e293b]">
        <div className="text-xs text-[#64748b] px-4">
          {isAdmin() ? 'PRS Staff Access' : 'Customer Portal'}
        </div>
      </div>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ApprovalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
