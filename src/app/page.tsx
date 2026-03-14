export default function Home() {
  return (
    <main style={{fontFamily:"sans-serif",padding:"80px",maxWidth:1100,margin:"auto"}}>

      <h1 style={{fontSize:48,fontWeight:700}}>
        DemandCore
      </h1>

      <p style={{fontSize:20,color:"#666"}}>
        Real-time dispatch infrastructure for on-demand platforms
      </p>

      <hr style={{margin:"40px 0"}}/>

      <h2>About</h2>

      <p>
        DemandCore is a scalable backend engine designed to power
        real-time service platforms such as logistics, transportation
        and field service applications.
      </p>

      <p>
        It provides job lifecycle management, driver matching,
        dispatch automation and realtime event streaming.
      </p>

      <hr style={{margin:"40px 0"}}/>

      <h2>Core Modules</h2>

      <ul>
        <li>Geo Engine – driver radius search</li>
        <li>Dispatch Engine – job to driver assignment</li>
        <li>Offer Engine – broadcast job offers</li>
        <li>Job Lifecycle – state machine</li>
        <li>Realtime Engine – SSE event streaming</li>
        <li>Multi-Tenant System</li>
      </ul>

      <hr style={{margin:"40px 0"}}/>

      <h2>Platforms Powered by DemandCore</h2>

      <ul>
        <li>ServiRoad</li>
        <li>TeleTaksi</li>
        <li>ValeHattı</li>
        <li>KuryeHattı</li>
      </ul>

      <hr style={{margin:"40px 0"}}/>

      <h2>Architecture</h2>

      <pre style={{
        background:"#111",
        color:"#0f0",
        padding:20,
        borderRadius:10,
        overflow:"auto"
      }}>
{`
Client Apps
   │
   ▼
DemandCore Engine
   │
   ├ Job Core
   ├ Dispatch Engine
   ├ Offer Engine
   ├ Realtime Engine
   └ Geo Engine
   │
   ▼
PostgreSQL
`}
      </pre>

      <p style={{marginTop:40,color:"#888"}}>
        © DemandCore Infrastructure Engine
      </p>

    </main>
  )
}
