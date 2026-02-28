'use client'

const mockUsers = [
  { id: 'U001', name: 'Juan Dela Cruz', role: 'Student', department: 'Computer Science' },
  { id: 'U002', name: 'Maria Santos', role: 'Faculty', department: 'Mathematics' },
  { id: 'U003', name: 'Leo Garcia', role: 'Registrar', department: 'Academic Affairs' },
]

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Users</h1>
      <p className="text-gray-600 mb-6">Manage user accounts once authentication is active.</p>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">ID</th>
                <th className="table-cell">Name</th>
                <th className="table-cell">Role</th>
                <th className="table-cell">Department</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} className="table-row">
                  <td className="table-cell font-medium">{user.id}</td>
                  <td className="table-cell">{user.name}</td>
                  <td className="table-cell">{user.role}</td>
                  <td className="table-cell">{user.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
