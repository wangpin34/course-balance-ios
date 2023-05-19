import { useEffect, useState, useCallback } from 'react'
import useAsyncEffect from './useAsyncEffect'

export enum Status {
  INITIAL = 'initial',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

export default function useAsyncData<T>(cb: (signal: AbortSignal, ...deps: any[]) => Promise<T> , deps = [], options?: {default?: T}) {
  const [ticker, setTicker] = useState<number>(0)
  const [result, setResult] = useState<T>(options?.default);
  const [status, setStatus] = useState(Status.INITIAL);
  const [err, setErr] = useState<Error | null>()
  useAsyncEffect(async (signal) => {
    // Update _only_ if the prev state is not "LOADING"
    setStatus(Status.LOADING);
    setErr(null)
    try {
      const data = await cb(signal, ...deps);
      if (signal.aborted) return;
      setStatus(Status.READY);
      setResult(data)
    } catch (error) {
      if (signal.aborted) return;
      setStatus(Status.ERROR);
      setErr(err)
    }
  }, [...deps, ticker]);
  const reload = useCallback(() => {
    setTicker(t => ++t)
  }, [])
  return [result, {reload, status, err}] as [T, {reload: typeof reload, status: Status, err: Error | null}] ;
}
