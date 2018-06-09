import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    decision: ''
  },
  mutations: {
    decide (state, decision) {
      state.decision = decision
    }
  },
  actions: {

  }
})
