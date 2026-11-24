/**
 * Core User & Authentication Entity Types
 * Enterprise Data Contract for Users, Roles, Permissions, Companies, and Branches.
 */

export interface UserCompany {
  id: number
  name: string
  logo?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  tax_number?: string | null
  city?: string | null
  province?: string | null
  country?: string | null
}

export interface UserBranch {
  id: number
  name: string
  address?: string | null
}

export interface AccessibleBranch {
  id: number
  company_id?: number
  name: string
  code?: string
  is_main?: boolean
  is_active?: boolean
  phone?: string | null
  address?: string | null
  city?: string | null
}

export interface UserEmployee {
  id: number
  employee_number: string
  status?: string | null
}

export interface User {
  id: number
  name: string
  username?: string | null
  email: string
  phone?: string | null
  avatar?: string | null
  gender?: string
  address?: string
  city?: string
  province?: string
  country?: string
  is_active?: boolean
  status?: 'active' | 'inactive' | 'blocked' | 'suspended' | string
  company_id?: number
  branch_id?: number
  active_branch_id?: number | null
  active_company_id?: number | null
  accessible_branches?: AccessibleBranch[]
  roles: string[] | Array<{ name: string }> | any
  permissions: string[]
  company?: UserCompany | null
  branch?: UserBranch | null
  employee?: UserEmployee | null
  created_at?: string
  last_login?: string
  is_verified?: boolean
  two_factor?: boolean
}
