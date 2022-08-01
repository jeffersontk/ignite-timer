import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { Cycle, cycleReducer } from '../reducers/cycles/reducer'
import {
  addNewCycleAction,
  interruptedCycleAction,
  markCurrentCycleAsFinishedAction,
} from '../reducers/cycles/actions'
import { differenceInSeconds } from 'date-fns'

interface CreateCycleData {
  task: string
  minutesAmount: number
}

interface CycleContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  CreateNewCycle: (data: CreateCycleData) => void
  InterruptCurrentCycle: () => void
  markCycleAsFinished: () => void
  setSecondsPassed: (seconds: number) => void
}

export const CyclesContext = createContext({} as CycleContextType)

interface CyclesContextProviderPros {
  children: ReactNode
}

export function CyclesContextProvider({ children }: CyclesContextProviderPros) {
  const [cyclesState, dispatch] = useReducer(
    cycleReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    () => {
      const storedStateAsJSON = localStorage.getItem(
        '@ignite-timer:cyclesState',
      )
      if (storedStateAsJSON) {
        return JSON.parse(storedStateAsJSON)
      }
    },
  )

  useEffect(() => {
    const stateJSON = JSON.stringify(cyclesState)

    localStorage.setItem('@ignite-timer:cyclesState', stateJSON)
  }, [cyclesState])

  const { activeCycleId, cycles } = cyclesState

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startCycle))
    }

    return 0
  })

  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function CreateNewCycle(data: CreateCycleData) {
    const newCycle: Cycle = {
      id: String(new Date().getTime()),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startCycle: new Date(),
    }
    dispatch(addNewCycleAction(newCycle))
    setAmountSecondsPassed(0)
  }

  function InterruptCurrentCycle() {
    dispatch(interruptedCycleAction())
  }

  function markCycleAsFinished() {
    dispatch(markCurrentCycleAsFinishedAction())
  }

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        CreateNewCycle,
        InterruptCurrentCycle,
        markCycleAsFinished,
        amountSecondsPassed,
        setSecondsPassed,
      }}
    >
      {children}
    </CyclesContext.Provider>
  )
}
