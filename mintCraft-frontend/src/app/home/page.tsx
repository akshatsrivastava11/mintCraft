'use client'
import React from 'react'
import HomePage from '../components/homePage'
import { trpc } from '../clients/trpc'
function page() {
  return (
    <div><HomePage/></div>
  )
}

export default trpc.withTRPC(page)