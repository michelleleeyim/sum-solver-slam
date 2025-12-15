export type Operation =
  | { type: "get"; index: number }
  | { type: "addAtHead"; val: number }
  | { type: "addAtTail"; val: number }
  | { type: "addAtIndex"; index: number; val: number }
  | { type: "deleteAtIndex"; index: number };

export type DesignLLState = {
  list: number[];
  operations: Operation[];
  currentOpIndex: number;
  selectedIndex: number | null;
  phase: "ready" | "operating" | "done";
  score: number;
  mistakes: number;
  feedback: { type: "correct" | "wrong"; message: string } | null;
  expectedResult: number[] | number | null;
  startTime: number;
  endTime: number | null;
};

export type DesignLLAction =
  | { type: "START" }
  | { type: "SELECT_INDEX"; index: number }
  | { type: "CONFIRM_GET"; index: number }
  | { type: "CONFIRM_ADD_HEAD"; val: number }
  | { type: "CONFIRM_ADD_TAIL"; val: number }
  | { type: "CONFIRM_ADD_AT_INDEX"; index: number; val: number }
  | { type: "CONFIRM_DELETE"; index: number }
  | { type: "NEXT_OP" }
  | { type: "RESTART" }
  | { type: "NEW_SET" };

function generateRandomOperations(listLength: number = 0): { operations: Operation[]; initialList: number[] } {
  const initialList: number[] = [];
  const operations: Operation[] = [];
  let currentList = [...initialList];

  // Generate 8-12 operations
  const numOps = Math.floor(Math.random() * 5) + 8;

  for (let i = 0; i < numOps; i++) {
    const opType = Math.floor(Math.random() * 5);
    const val = Math.floor(Math.random() * 99) + 1;

    if (currentList.length === 0) {
      // If list is empty, only allow addAtHead or addAtTail
      if (Math.random() < 0.5) {
        operations.push({ type: "addAtHead", val });
        currentList.unshift(val);
      } else {
        operations.push({ type: "addAtTail", val });
        currentList.push(val);
      }
    } else {
      switch (opType) {
        case 0: // get
          const getIdx = Math.floor(Math.random() * currentList.length);
          operations.push({ type: "get", index: getIdx });
          break;
        case 1: // addAtHead
          operations.push({ type: "addAtHead", val });
          currentList.unshift(val);
          break;
        case 2: // addAtTail
          operations.push({ type: "addAtTail", val });
          currentList.push(val);
          break;
        case 3: // addAtIndex
          const addIdx = Math.floor(Math.random() * (currentList.length + 1));
          operations.push({ type: "addAtIndex", index: addIdx, val });
          currentList.splice(addIdx, 0, val);
          break;
        case 4: // deleteAtIndex
          if (currentList.length > 0) {
            const delIdx = Math.floor(Math.random() * currentList.length);
            operations.push({ type: "deleteAtIndex", index: delIdx });
            currentList.splice(delIdx, 1);
          } else {
            // Fallback to addAtHead if list would be empty
            operations.push({ type: "addAtHead", val });
            currentList.unshift(val);
          }
          break;
      }
    }
  }

  return { operations, initialList };
}

export function initDesignLinkedList(): DesignLLState {
  const { operations, initialList } = generateRandomOperations();
  return {
    list: initialList,
    operations,
    currentOpIndex: 0,
    selectedIndex: null,
    phase: "ready",
    score: 0,
    mistakes: 0,
    feedback: null,
    expectedResult: null,
    startTime: Date.now(),
    endTime: null,
  };
}

function applyOperation(list: number[], op: Operation): number[] {
  const newList = [...list];
  switch (op.type) {
    case "get":
      return newList; // No change
    case "addAtHead":
      newList.unshift(op.val);
      return newList;
    case "addAtTail":
      newList.push(op.val);
      return newList;
    case "addAtIndex":
      if (op.index >= 0 && op.index <= newList.length) {
        newList.splice(op.index, 0, op.val);
      }
      return newList;
    case "deleteAtIndex":
      if (op.index >= 0 && op.index < newList.length) {
        newList.splice(op.index, 1);
      }
      return newList;
  }
}

function getExpectedResult(list: number[], op: Operation): number[] | number {
  switch (op.type) {
    case "get":
      return list[op.index] ?? -1;
    default:
      return applyOperation(list, op);
  }
}

export function reducer(state: DesignLLState, action: DesignLLAction): DesignLLState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        phase: "operating",
        expectedResult: getExpectedResult(state.list, state.operations[0]),
      };

    case "SELECT_INDEX":
      return {
        ...state,
        selectedIndex: action.index,
      };

    case "CONFIRM_GET": {
      const currentOp = state.operations[state.currentOpIndex];
      if (currentOp.type !== "get") return state;

      const isCorrect = action.index === currentOp.index;
      const expectedValue = state.list[currentOp.index] ?? -1;

      return {
        ...state,
        feedback: isCorrect
          ? { type: "correct", message: `Correct! Value at index ${currentOp.index} is ${expectedValue}` }
          : { type: "wrong", message: `Wrong index. Expected index ${currentOp.index}` },
        score: isCorrect ? state.score + 1 : state.score,
        mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
        selectedIndex: null,
      };
    }

    case "CONFIRM_ADD_HEAD": {
      const currentOp = state.operations[state.currentOpIndex];
      if (currentOp.type !== "addAtHead") return state;

      const isCorrect = action.val === currentOp.val;
      const newList = [...state.list];
      if (isCorrect) newList.unshift(currentOp.val);

      return {
        ...state,
        list: isCorrect ? newList : state.list,
        feedback: isCorrect
          ? { type: "correct", message: `Added ${currentOp.val} at head!` }
          : { type: "wrong", message: `Wrong value. Expected ${currentOp.val}` },
        score: isCorrect ? state.score + 1 : state.score,
        mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
      };
    }

    case "CONFIRM_ADD_TAIL": {
      const currentOp = state.operations[state.currentOpIndex];
      if (currentOp.type !== "addAtTail") return state;

      const isCorrect = action.val === currentOp.val;
      const newList = [...state.list];
      if (isCorrect) newList.push(currentOp.val);

      return {
        ...state,
        list: isCorrect ? newList : state.list,
        feedback: isCorrect
          ? { type: "correct", message: `Added ${currentOp.val} at tail!` }
          : { type: "wrong", message: `Wrong value. Expected ${currentOp.val}` },
        score: isCorrect ? state.score + 1 : state.score,
        mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
      };
    }

    case "CONFIRM_ADD_AT_INDEX": {
      const currentOp = state.operations[state.currentOpIndex];
      if (currentOp.type !== "addAtIndex") return state;

      const isCorrect = action.index === currentOp.index && action.val === currentOp.val;
      const newList = [...state.list];
      if (isCorrect) newList.splice(currentOp.index, 0, currentOp.val);

      return {
        ...state,
        list: isCorrect ? newList : state.list,
        feedback: isCorrect
          ? { type: "correct", message: `Inserted ${currentOp.val} at index ${currentOp.index}!` }
          : { type: "wrong", message: `Wrong position. Expected index ${currentOp.index}` },
        score: isCorrect ? state.score + 1 : state.score,
        mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
      };
    }

    case "CONFIRM_DELETE": {
      const currentOp = state.operations[state.currentOpIndex];
      if (currentOp.type !== "deleteAtIndex") return state;

      const isCorrect = action.index === currentOp.index;
      const newList = [...state.list];
      if (isCorrect) newList.splice(currentOp.index, 1);

      return {
        ...state,
        list: isCorrect ? newList : state.list,
        feedback: isCorrect
          ? { type: "correct", message: `Deleted node at index ${currentOp.index}!` }
          : { type: "wrong", message: `Wrong index. Expected ${currentOp.index}` },
        score: isCorrect ? state.score + 1 : state.score,
        mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
      };
    }

    case "NEXT_OP": {
      const nextIndex = state.currentOpIndex + 1;
      if (nextIndex >= state.operations.length) {
        return {
          ...state,
          phase: "done",
          feedback: null,
          endTime: Date.now(),
        };
      }

      return {
        ...state,
        currentOpIndex: nextIndex,
        feedback: null,
        selectedIndex: null,
        expectedResult: getExpectedResult(state.list, state.operations[nextIndex]),
      };
    }

    case "RESTART":
      return {
        ...initDesignLinkedList(),
        operations: state.operations,
        startTime: Date.now(),
      };

    case "NEW_SET":
      return initDesignLinkedList();

    default:
      return state;
  }
}

export function isFinished(state: DesignLLState): boolean {
  return state.phase === "done";
}

export function getTimeElapsed(state: DesignLLState): number {
  if (state.endTime) {
    return Math.floor((state.endTime - state.startTime) / 1000);
  }
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function calculateBonus(state: DesignLLState): number {
  let bonus = 0;
  const time = getTimeElapsed(state);

  // Perfect run bonus (no mistakes)
  if (state.mistakes === 0) {
    bonus += 3;
  }

  // Speed bonus
  if (time < 30) {
    bonus += 3;
  } else if (time < 60) {
    bonus += 1;
  }

  return bonus;
}

export function getCurrentOperation(state: DesignLLState): Operation | null {
  if (state.currentOpIndex >= state.operations.length) return null;
  return state.operations[state.currentOpIndex];
}

export function formatOperation(op: Operation): string {
  switch (op.type) {
    case "get":
      return `get(${op.index})`;
    case "addAtHead":
      return `addAtHead(${op.val})`;
    case "addAtTail":
      return `addAtTail(${op.val})`;
    case "addAtIndex":
      return `addAtIndex(${op.index}, ${op.val})`;
    case "deleteAtIndex":
      return `deleteAtIndex(${op.index})`;
  }
}
