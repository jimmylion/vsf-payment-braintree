<template>
  <div>
    <div class="braintree" id="braintree" />
    <button-full
      @click.native="onReview"
      v-if="nonce === ''"
      :disabled="loader"
      ref="braintree-review"
    >{{ $t('Review') }}</button-full>
  </div>
</template>

<script>
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import ButtonFull from 'theme/components/base/ButtonFull/ButtonFull.vue';

export default {
  name: 'BraintreeDropin',

  components: {
    ButtonFull
  },

  data() {
    const storeView = currentStoreView();
    return {
      dropinInstance: null,
      loader: true,
      commit: true,
      nonce: '',
      currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale.replace('-', '_') // Convert to PayPal format of locale
    };
  },

  mounted() {
    this.configureBraintree();
  },

  computed: {
    grandTotal() {
      let cartTotals = this.$store.getters['cart/getTotals'];
      return cartTotals.find(seg => seg.code === 'grand_total').value;
    }
  },

  methods: {
    async onReview() {
      if (this.dropinInstance.isPaymentMethodRequestable()) {
        setTimeout(async () => {
          try {
            this.loader = true
            let payload = await this.dropinInstance.requestPaymentMethod({
              threeDSecure: {
                amount: this.grandTotal
              }
            });
            this.nonce = payload.nonce;
            this.$store.dispatch('payment-braintree/setNonce', this.nonce);
            this.$emit('success');
            this.loader = false
            // this.$bus.$emit('checkout-do-placeOrder', {
            //   payment_method_nonce: self.nonce
            // })
          } catch (err) {
            // No payment method is available.
            // An appropriate error will be shown in the UI.
            console.error(err);
          }
        }, 400);
      }
    },
    async configureBraintree() {
      try {
        let authorization = await this.$store.dispatch(
          'braintree/generateToken'
        );
        const dropin = await require('braintree-web-drop-in');
        const button = this.$refs['braintree-review'];

        this.dropinInstance = await dropin.create({
          authorization,
          container: '#braintree',
          threeDSecure: true
          // paypal: {
          //   flow: 'checkout',
          //   amount: this.getTransactions().amount.total,
          //   currency: this.getTransactions().amount.currency
          // }
        });

        this.loader = false;
      } catch (err) {
        console.error('[Braintree]', err);
      }
    },
    getTransactions() {
      return { amount: { total: this.grandTotal, currency: this.currency } };
    },
    getNonce() {
      return {
        nonce: this.nonce,
        total: this.grandTotal,
        currency: this.currency
      };
    },
    doPayment(data, actions) {
      return this.$store.dispatch('braintree/doPayment', this.getNonce());
    },
    onAuthorize(data, actions) {
      return true;
    },
    onCancel(data) {
      this.$emit('payment-braintree-cancelled', data);
    }
  }
};
</script>
