"use client"

import { useState } from "react"

export default function TestPanel() {

  const [result,setResult] = useState("")

  const createJob = async () => {

    const res = await fetch("/api/jobs/test",{
      headers:{
        "x-tenant":"a"
      }
    })

    const data = await res.json()

    setResult(JSON.stringify(data,null,2))
  }

  return (

    <div style={{padding:40,fontFamily:"monospace"}}>

      <h1>DemandCore Test Panel</h1>

      <button
        onClick={createJob}
        style={{
          padding:"10px 20px",
          fontSize:16,
          cursor:"pointer"
        }}
      >
        Create Test Job
      </button>

      <pre>
        {result}
      </pre>

    </div>

  )

}
