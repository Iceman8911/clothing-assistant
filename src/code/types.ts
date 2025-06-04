import { Accessor, Setter } from "solid-js";
import { ClothingConflict } from "./server/database/firebase";

export interface SignalProps {
  stateAccessor: Accessor<boolean>;
  stateSetter: Setter<boolean>;
}

export type UUID = ReturnType<typeof crypto.randomUUID>;
export type SyncIssueArray = Array<{
  id: UUID;
  data: ClothingConflict;
  isResolved: boolean;
}>;
