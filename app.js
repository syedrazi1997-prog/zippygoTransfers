const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');

const elements = stripe.elements();

const cardElement = elements.create('card', {
  style: {
    base: {
      color: '#1e293b',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '14px',
      '::placeholder': {
        color: '#94a3b8'
      }
    }
  }
});

cardElement.mount('#stripe-card-element-mount-point');

/* ========================================= DOM ELEMENTS ========================================= */

const currencySelector = document.getElementById('globalCurrencySelector');
const airIn = document.getElementById('airportLookupIn');
const destIn = document.getElementById('destinationLookupIn');
const searchBtn = document.getElementById('triggerSearchActionBtn');

const checkoutModal = document.getElementById('checkoutModalOverlay');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');

let activeCurrencySymbol = '£';
let activeExchangeRate = 1.0;

let selectedVehicleTitle = '';
let selectedVehiclePrice = '';

/* ========================================= CURRENCY ========================================= */

currencySelector.addEventListener('change', function () {
  const option = this.options[this.selectedIndex];

  activeCurrencySymbol = option.getAttribute('data-symbol');

  activeExchangeRate = parseFloat(
    option.getAttribute('data-rate')
  );
});

/* ========================================= SEARCH ========================================= */

searchBtn.addEventListener('click', renderCatalogOptions);

async function renderCatalogOptions() {
  const tripType =
    document.querySelector(
      'input[name="tripType"]:checked'
    ).value;

  const passengers =
    document.getElementById('passengerSelect').value;

  const target =
    document.getElementById('resultsInjectTarget');

  const section =
    document.getElementById('searchResultsSection');

  section.classList.remove('hidden');

  target.innerHTML =
    '<div class="text-center py-6">Loading transfer rates...</div>';

  try {
    const response = await fetch(
      '/api/search-transfers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          airport: airIn.value,
          destination: destIn.value,
          tripType,
          passengers
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    renderOptions(data.options);

  } catch (err) {
    console.error(err);

    target.innerHTML =
      '<div class="text-red-500">Failed loading transfer options.</div>';
  }
}

/* ========================================= RENDER OPTIONS ========================================= */

function renderOptions(options) {
  const target =
    document.getElementById('resultsInjectTarget');

  target.innerHTML = '';

  options.forEach((deal) => {
    const convertedPrice = (
      parseFloat(deal.priceGbp) *
      activeExchangeRate
    ).toFixed(2);

    const card = document.createElement('div');

    card.className =
      'bg-white rounded-xl border p-6 flex justify-between items-center';

    card.innerHTML = `
      <div>
        <h3 class="text-xl font-bold">${deal.vehicle}</h3>
      </div>

      <div class="text-right">
        <p class="text-3xl font-black">
          ${activeCurrencySymbol}${convertedPrice}
        </p>

        <button
          class="book-transfer-action-trigger bg-emerald-500 text-white px-4 py-2 rounded-xl mt-2"
          data-title="${deal.vehicle}"
          data-price="${convertedPrice}"
        >
          Book Now
        </button>
      </div>
    `;

    target.appendChild(card);
  });

  bindBookingButtons();
}

/* ========================================= BOOKING BUTTONS ========================================= */

function bindBookingButtons() {
  document
    .querySelectorAll('.book-transfer-action-trigger')
    .forEach((btn) => {
      btn.addEventListener('click', function () {
        selectedVehicleTitle =
          this.getAttribute('data-title');

        selectedVehiclePrice =
          this.getAttribute('data-price');

        document.getElementById(
          'checkoutTargetVehicleSummary'
        ).textContent = selectedVehicleTitle;

        document.getElementById(
          'checkoutTargetFinalPrice'
        ).textContent =
          activeCurrencySymbol + selectedVehiclePrice;

        checkoutModal.classList.remove('hidden');
      });
    });
}

/* ========================================= CLOSE CHECKOUT ========================================= */

closeCheckoutBtn.addEventListener('click', () => {
  checkoutModal.classList.add('hidden');
});

/* ========================================= PAYMENT ========================================= */

document
  .getElementById('checkoutCombinedForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const payBtn =
      document.getElementById('paySubmitBtn');

    payBtn.disabled = true;

    payBtn.textContent = 'Processing...';

    try {
      const bookingData = {
        id:
          'GT-' +
          Math.floor(
            100000 + Math.random() * 900000
          ),

        firstName:
          document
            .getElementById('custFirstName')
            .value.trim(),

        lastName:
          document
            .getElementById('custLastName')
            .value.trim(),

        email:
          document
            .getElementById('custEmail')
            .value.trim(),

        phone:
          document
            .getElementById('custPhone')
            .value.trim(),

        flight:
          document
            .getElementById('flightNo')
            .value.trim(),

        vehicle: selectedVehicleTitle,

        from: airIn.value,

        to: destIn.value
      };

      const response = await fetch(
        '/api/create-stripe-payment-intent',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            amount: parseFloat(
              selectedVehiclePrice
            ),

            currency:
              currencySelector.value,

            bookingData
          })
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const result =
        await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: cardElement,

              billing_details: {
                name:
                  bookingData.firstName +
                  ' ' +
                  bookingData.lastName,

                email: bookingData.email,

                phone: bookingData.phone
              }
            }
          }
        );

      if (result.error) {
        throw new Error(result.error.message);
      }

      alert('Payment successful!');

      window.location.reload();

    } catch (err) {
      console.error(err);

      alert(err.message);

    } finally {
      payBtn.disabled = false;

      payBtn.textContent =
        'Pay & Complete Reservation →';
    }
  });
```
