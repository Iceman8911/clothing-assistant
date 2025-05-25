import { Accessor, Setter } from "solid-js";

export interface SignalProps {
  stateAccessor: Accessor<boolean>;
  stateSetter: Setter<boolean>;
}

export type UUID = ReturnType<typeof crypto.randomUUID>;
