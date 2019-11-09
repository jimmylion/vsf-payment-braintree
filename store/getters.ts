import { BraintreeState } from '../types/BraintreeState'
import { GetterTree } from 'vuex';

export const getters: GetterTree<BraintreeState, any> = {
  getNonce: state => state.nonce
}