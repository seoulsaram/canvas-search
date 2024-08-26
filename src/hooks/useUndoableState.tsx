import { isEqual } from 'lodash';
import { useMemo, useState } from 'react';

export default function useUndoableState<T>() {
  const [states, setStates] = useState<Array<T>>([]);
  const [index, setIndex] = useState(0);
  const state = useMemo(() => states[index], [states, index]); // Current state

  const setState = (value: T) => {
    if (isEqual(state, value)) {
      return;
    }

    const newVal = states.concat(value);
    setStates(newVal);
    setIndex(newVal.length - 1);
  };

  const resetState = () => {
    setIndex(0);
    if (states.length) setStates([states[0]]);
  };

  const goBack = (steps = 1) => {
    setIndex(Math.max(0, Math.max(0, index - steps)));
  };

  const goForward = (steps = 1) => {
    setIndex(Math.min(states.length - 1, index + steps));
  };

  return {
    state,
    setState,
    resetState,
    index,
    lastIndex: states.length - 1,
    goBack,
    goForward,
  };
}
