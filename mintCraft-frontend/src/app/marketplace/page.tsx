'use client'
import React from 'react'
import MarketplacePage from '../components/marketplace'
import { trpc } from '../clients/trpc'
function page() {
  return (
    <div><MarketplacePage/></div>
  )
}

export default trpc.withTRPC(page)