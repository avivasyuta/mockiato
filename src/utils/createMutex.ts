export const createMutex = () => {
  let tail: Promise<unknown> = Promise.resolve();

  return <T,>(task: () => Promise<T> | T): Promise<T> => {
    const result = tail.then(task, task);
    tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
};
