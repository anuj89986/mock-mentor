'use client'
import { SessionProvider, useSession } from 'next-auth/react'
import React from 'react'


const page = () => {
    // <SessionProvider>
    //     const {user} = useSession()
    // </SessionProvider>
  return (
    <div>page user</div>
  )
}

export default page