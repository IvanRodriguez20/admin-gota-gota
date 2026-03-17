'use client'
import { createContext, useContext } from 'react'

export const TenantContext = createContext<string | undefined>(undefined)
export const useTenant = () => useContext(TenantContext)
