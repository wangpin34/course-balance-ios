import { useEffect, useState } from 'react'

export default function useAsyncEffect(cb: (signal: AbortSignal, deps: any[]) => void, deps: any[] = []) {
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    Promise.resolve(cb(signal, [...deps]))
      .then(async (res) => {
        // Handle any possible cleanup
        //@ts-ignore
        if (res && typeof res === "function") {
          //@ts-ignore
          if (signal.aborted) res();
          signal.addEventListener("abort", res);
        }
      })
      .catch((error) => {
        // These errors are not really errors, it's just that JS handles aborting
        // a promise as an error. Thus, ignore them since they're a normal part
        // of the expected async workflow
        if (error.name === "AbortError") {
          return null;
        } else {
          // Real errors, buble it up since the CB is expected to handle the
          // errors by itself, so this is like a "fatal error" that should've
          // been handled by the devs
          throw error;
        }
      });
    return () => {
      if (signal.aborted) return;
      controller.abort();
    };
  }, deps);
}