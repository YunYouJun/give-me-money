import { UserModule } from "~/types";
import { createStore } from "vuex";

export interface State {
  /**
   * 选择
   */
  decision: string;
}

// define injection key
// export const key: InjectionKey<Store<State>> = Symbol("");

export const store = createStore<State>({
  state: {
    decision: "",
  },
  mutations: {
    decide(state, decision) {
      state.decision = decision;
    },
  },
  actions: {},
});

export const install: UserModule = ({ app }) => {
  app.use(store);
};
