import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SK, {
    apiVersion: '2022-11-15',
});
export class StripePaymentProcessor {
    async createCustomer(customer: { email: string }) {
        const result = await stripe.customers.create({
            email: customer.email
        });
        return result;
    }

    // associates a card with a customer in Stripe.
    async attachPaymentMethodToCustomer(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod> {    
        const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId
        });
    
        return attachedPaymentMethod;
    }

    // We subscribe a customer to a particular Plan.  The plan is represented by a stripe "Price" object
    async subscribeCustomer(customerId: string, price: Stripe.Price | any, paymentMethodId) {
        await this.cancelAllSubscriptions(customerId);
		const subscription = await stripe.subscriptions.create({
		  customer: customerId,
		  items: [price],
          default_payment_method: paymentMethodId
		});
        return subscription;
    }

    async cancelAllSubscriptions(customerId: string) {
        const customer = await stripe.customers.retrieve(customerId);
        const subscriptions = await stripe.subscriptions.list({ customer: customer.id });

        for (let subscription of subscriptions.data) {
        await stripe.subscriptions.del(subscription.id);
        }
    }

    async getCustomerPaymentMethods(customerId: string) {
        const paymentMethods = await stripe.customers.listPaymentMethods(customerId);
        return paymentMethods;
    }

    async deletePaymentMethod(paymentMethodId: string) {
        await stripe.paymentMethods.detach(paymentMethodId);
    }
}