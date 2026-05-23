import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPaymentDashboardByScope } from '../api/financeAPI'
import { useFinanceCenterFilter } from '../contexts/FinanceCenterFilterContext'
import { toast } from '../utils/toast'

export function useFinanceDashboard(courseFilter = 'all', monthFilter = 'all') {
  const { apiParams } = useFinanceCenterFilter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const initialLoad = useRef(true)

  const filterKey = `${apiParams.scope}|${apiParams.centerIds || ''}|${apiParams.centerNames || ''}|${courseFilter}|${monthFilter}`

  const load = useCallback(async () => {
    const isInitial = initialLoad.current
    if (isInitial) setLoading(true)
    else setRefreshing(true)

    try {
      const res = await fetchPaymentDashboardByScope({
        ...apiParams,
        course: courseFilter,
        month: monthFilter,
      })
      setData(res)
    } catch {
      toast.error('Failed to load payment dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
      initialLoad.current = false
    }
  }, [filterKey, apiParams, courseFilter, monthFilter])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [load])

  return { data, loading, refreshing, reload: load }
}
