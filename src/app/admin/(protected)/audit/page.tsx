import { prisma } from "@/lib/prisma"

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Entity ID</th>
              <th className="p-3">Tenant</th>
              <th className="p-3">User</th>
              <th className="p-3">Old</th>
              <th className="p-3">New</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t align-top">
                <td className="p-3 whitespace-nowrap">
                  {log.createdAt.toLocaleString()}
                </td>

                <td className="p-3 font-medium">
                  {log.action}
                </td>

                <td className="p-3">
                  {log.entity}
                </td>

                <td className="p-3">
                  {log.entityId}
                </td>

                <td className="p-3">
                  {log.tenantId}
                </td>

                <td className="p-3">
                  {log.userId}
                </td>

                <td className="p-3">
                  <pre className="text-xs bg-gray-50 p-2 rounded">
                    {log.oldValue
                      ? JSON.stringify(log.oldValue, null, 2)
                      : "-"}
                  </pre>
                </td>

                <td className="p-3">
                  <pre className="text-xs bg-gray-50 p-2 rounded">
                    {log.newValue
                      ? JSON.stringify(log.newValue, null, 2)
                      : "-"}
                  </pre>
                </td>

                <td className="p-3 text-xs">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}