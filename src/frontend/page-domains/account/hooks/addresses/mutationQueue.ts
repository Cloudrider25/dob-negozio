export type MutationTask<T> = () => Promise<T>

export function createMutationQueue() {
  let chain: Promise<unknown> = Promise.resolve()

  return async <T>(task: MutationTask<T>) => {
    const run = chain.catch(() => undefined).then(task)
    chain = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }
}
