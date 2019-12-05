export function beforeRegistration(Vue, config, store, isServer) {
    const CURRENT_METHOD_CODE = 'braintree'

    store.dispatch('payment/addMethod', {
        'title': 'Braintree',
        'code': CURRENT_METHOD_CODE,
        'cost': 0,
        'costInclTax': 0,
        'default': true,
        'offline': false
    })

    if (!isServer) {
        const invokePlaceOrder = () => {
            if (store.state.checkout.paymentDetails.paymentMethod.includes('CURRENT_METHOD_CODE')) {
                Vue.prototype.$bus.$emit('checkout-do-placeOrder', {
                    payment_method_nonce: store.state['braintree'].nonce
                })
            }
        }
        Vue.prototype.$bus.$on('checkout-before-placeOrder', invokePlaceOrder)
    }
}