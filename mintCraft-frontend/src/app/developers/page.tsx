'use client'
import React from 'react'
import CreateModel from '../components/createModel'
import { trpc } from '../clients/trpc'

function page() {
  return (
    <div>
      <CreateModel/>
      </div>
  )
}

export default trpc.withTRPC(page)
//royalty,api_endpoint,description,name