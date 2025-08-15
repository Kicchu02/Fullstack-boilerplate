import type { Instance } from "mobx-state-tree";
import { createContext } from "react";
import type { RootStore } from "./RootStore";

export const RootStoreContext = createContext<Instance<
  typeof RootStore
> | null>(null);
