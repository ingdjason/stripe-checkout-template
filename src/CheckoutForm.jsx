import {
  PaymentElement, useElements, useStripe
} from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let styleSheet = document.styleSheets[0];
  let keyFrames = `@keyframes loading {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  
  @media only screen and (max-width: 600px) {
    form {
      width: 80vw;
      min-width: initial;
    }
  }`;
   
  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
    styleSheet.insertRule(keyFrames, styleSheet.cssRules.length);
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:3000",
        receipt_email: email,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (<div style={style.bodyCard}>
      <form id="payment-form" style={style.form} onSubmit={handleSubmit}>
        <input
          id="email"
          type="text"
          style={style.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
        />
        <PaymentElement id="payment-element" style={style.paymentElement} />
        <button style={style.button} disabled={isLoading || !stripe || !elements} id="submit">
          <span id="button-text">
            {isLoading ? <div style={style.spinner}className="spinner" id="spinner"></div> : "Pay now"}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && <div style={style.paymentMessage} id="payment-message">{message}</div>}
      </form>
    </div>
  );
}


const style = {
  bodyCard: {
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',    
    fontSize: '16px',
    WebkitFontSmoothing: 'antialiased',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },
  button: {
    background: '#6f0909',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    borderRadius: '4px',
    border: 0,
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'block',
    transition: 'all 0.2s ease',
    boxShadow: '0px 4px 5.5px 0px rgba(0, 0, 0, 0.07)',
    marginTop: '10px',
    width: '100%',
    "&:hover": { filter: 'contrast(115%)' },
    "&:disabled": {
      opacity: '0.5',
      cursor: 'default',
    }
  },
  spinner: {
    color: '#ffffff',
    fontSize: '22px',
    textIndent: '-99999px',
    margin: '0px auto',
    position: 'relative',
    width: '20px',
    height: '20px',
    boxShadow: 'inset 0 0 0 2px',
    WebkitTransform: 'translateZ(0)',
    msTransform: 'translateZ(0)',
    transform: 'translateZ(0)',
    borderRadius: '50%',
    "&before": { 
      width: '10.4px',
      height: '20.4px',
      background: '#6f0909',
      borderRadius: '20.4px 0 0 20.4px',
      top: '-0.2px',
      left: '-0.2px',
      webkitTransformOrigin: '10.4px 10.2px',
      transformOrigin: '10.4px 10.2px',
      webkitAnimation: 'loading 2s infinite ease 1.5s',
      animation: 'loading 2s infinite ease 1.5s',
     },
    "&after": { 
      width: '10.4px',
      height: '20.4px',
      background: '#6f0909',
      borderRadius: '0 10.2px 10.2px 0',
      top: '-0.1px',
      left: '10.2px',
      webkitTransformOrigin: '0px 10.2px',
      transformOrigin: '0px 10.2px',
      webkitAnimation: 'loading 2s infinite ease',
      animation: 'loading 2s infinite ease',
    },
  },
  form: {
    alignSelf: 'center',
    boxShadow: '0px 0px 0px 0.5px rgba(50, 50, 93, 0.1), 0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07)',
    borderRadius: '7px',
    padding: '15px',
  },
  paymentMessage: {
    color: 'rgb(105, 115, 134)',
    fontSize: '16px',
    lineHeight: '20px',
    paddingTop: '12px',
    textAlign: 'center'
  },
  paymentElement: {
    marginBottom: '24px'
  },
  email: {
    borderRadius: '6px',
    marginBottom: '16px',
    marginTop: '16px',
    padding: '12px',
    border: '1px solid rgba(50, 50, 93, 0.1)',
    maxHeight: '44px',
    fontSize: '16px',
    width: '100%',
    background: 'white',
    boxShadow: '0px 0px 0px 0.5px rgba(50, 50, 93, 0.1), 0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07)',
    boxSizing: 'border-box',
  }
}