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
    const copy = states.slice(0, index + 1);
    copy.push(value);
    setStates(copy);
    setIndex(copy.length - 1);
  };
  // Clear all state history
  const resetState = () => {
    setIndex(0);
    if (states.length) setStates([states[0]]);
  };

  const goBack = (steps = 1) => {
    setIndex(Math.max(0, Number(index) - (Number(steps) || 1)));
  };

  const goForward = (steps = 1) => {
    setIndex(Math.min(states.length - 1, Number(index) + (Number(steps) || 1)));
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
