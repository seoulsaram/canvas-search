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
    // undo를 할 때 -index가 되지 않도록 Math.max로 0과 돌아갈 step을 비교하여
    // 더 큰 값을 선택하도록 한다.
    // 이렇게 하면 만약 index - steps가 -1이 되어도 0으로 돌아가게 된다.
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
