import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51N0scKGy8WG1wDJ7AWk6pliqafAz1oTgOV07ULIXc4UuWjFzjz7o8Swt6H7ooF4SuLTecN08nT4EZFQDdOMskVJm00Nq5wSant'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
