'use client'

import { createContext, useContext, useMemo } from 'react'

import type { Area, AreaData, Goal, GoalData, ServiceFinal, Treatment, TreatmentData } from '@/components/services/service-navigator.types'

export type NavigatorData = {
  areas: AreaData[]
  goals: GoalData[]
  treatments: TreatmentData[]
  services: ServiceFinal[]
}

type NavigatorDataContextValue = {
  data: NavigatorData
  getAreas: () => AreaData[]
  getAreaById: (id?: Area) => AreaData | undefined
  getGoalsForArea: (areaId: Area) => GoalData[]
  getGoalById: (id?: Goal) => GoalData | undefined
  getTreatmentsForArea: (areaId: Area, goalId?: Goal) => TreatmentData[]
  getTreatmentById: (id?: Treatment) => TreatmentData | undefined
  getServicesForTreatment: (treatmentId: Treatment, goalId?: Goal) => ServiceFinal[]
  getServiceById: (id?: string) => ServiceFinal | undefined
}

const NavigatorDataContext = createContext<NavigatorDataContextValue | null>(null)

export function NavigatorDataProvider({ data, children }: { data: NavigatorData; children: React.ReactNode }) {
  const value = useMemo<NavigatorDataContextValue>(() => {
    const getAreas = () => data.areas

    const getAreaById = (id?: Area) => data.areas.find((area) => area.id === id)

    const getGoalsForArea = (areaId: Area) =>
      data.goals.filter((goal) => goal.areaId === areaId)

    const getGoalById = (id?: Goal) => data.goals.find((goal) => goal.id === id)

    const getTreatmentsForArea = (areaId: Area, goalId?: Goal) => {
      if (goalId) {
        return data.treatments.filter((treatment) => treatment.referenceIds.includes(goalId))
      }
      return data.treatments.filter((treatment) => treatment.referenceIds.includes(areaId))
    }

    const getTreatmentById = (id?: Treatment) => data.treatments.find((treatment) => treatment.id === id)

    const getServicesForTreatment = (treatmentId: Treatment) =>
      data.services.filter((service) => service.treatmentIds.includes(treatmentId))

    const getServiceById = (id?: string) => data.services.find((service) => service.id === id)

    return {
      data,
      getAreas,
      getAreaById,
      getGoalsForArea,
      getGoalById,
      getTreatmentsForArea,
      getTreatmentById,
      getServicesForTreatment,
      getServiceById,
    }
  }, [data])

  return <NavigatorDataContext.Provider value={value}>{children}</NavigatorDataContext.Provider>
}

export function useNavigatorData() {
  const ctx = useContext(NavigatorDataContext)
  if (!ctx) {
    throw new Error('useNavigatorData must be used within NavigatorDataProvider')
  }
  return ctx
}
