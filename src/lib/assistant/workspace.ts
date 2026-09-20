import { createClient } from "@/lib/supabase/server"

export type Property = {
  id: string
  name: string
  address: string | null
  city: string | null
  total_units: number | null
  status: string | null
}

export type Unit = {
  id: string
  property_id: string
  status: string | null
}

export type Tenant = {
  id: string
  unit_id: string | null
  status: string | null
}

export type Payment = {
  amount: number | null
  paid_date: string | null
  status: string | null
}

export type Maintenance = {
  id: string
  property_id: string
  title: string
  description: string | null
  priority: string | null
  status: string | null
}

export type WorkspaceData = {
  properties: Property[]
  units: Unit[]
  tenants: Tenant[]
  payments: Payment[]
  maintenance: Maintenance[]
}

export async function getWorkspaceData(): Promise<WorkspaceData> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    throw new Error("Unauthorized")
  }

  // -----------------------------
  // PROPERTIES
  // -----------------------------

  const {
    data: properties,
    error: propertiesError,
  } = await supabase
    .from("properties")
    .select(
      "id, name, address, city, total_units, status"
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })

  if (propertiesError) {
    console.error(
      "Assistant properties error:",
      propertiesError
    )
  }

  const propertyData =
    (properties || []) as Property[]

  const propertyIds =
    propertyData.map(
      (property) => property.id
    )

  // -----------------------------
  // UNITS
  // -----------------------------

  let units: Unit[] = []

  if (propertyIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("units")
      .select(
        "id, property_id, status"
      )
      .in(
        "property_id",
        propertyIds
      )

    if (error) {
      console.error(
        "Assistant units error:",
        error
      )
    } else {
      units =
        (data || []) as Unit[]
    }
  }

  // -----------------------------
  // TENANTS
  // -----------------------------

  const {
    data: tenants,
    error: tenantsError,
  } = await supabase
    .from("tenants")
    .select(
      "id, unit_id, status"
    )
    .eq("user_id", user.id)

  if (tenantsError) {
    console.error(
      "Assistant tenants error:",
      tenantsError
    )
  }

  const tenantData =
    (tenants || []) as Tenant[]

  const tenantIds =
    tenantData.map(
      (tenant) => tenant.id
    )

  // -----------------------------
  // PAYMENTS
  // -----------------------------

  let payments: Payment[] = []

  if (tenantIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("payments")
      .select(
        "amount, paid_date, status"
      )
      .in(
        "tenant_id",
        tenantIds
      )
      .order("paid_date", {
        ascending: false,
      })

    if (error) {
      console.error(
        "Assistant payments error:",
        error
      )
    } else {
      payments =
        (data || []) as Payment[]
    }
  }

  // -----------------------------
  // MAINTENANCE
  // -----------------------------

  let maintenance: Maintenance[] =
    []

  if (propertyIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("maintenance_requests")
      .select(
        "id, property_id, title, description, priority, status"
      )
      .in(
        "property_id",
        propertyIds
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(100)

    if (error) {
      console.error(
        "Assistant maintenance error:",
        error
      )
    } else {
      maintenance =
        (data || []) as Maintenance[]
    }
  }

  return {
    properties: propertyData,
    units,
    tenants: tenantData,
    payments,
    maintenance,
  }
}