const $currencyOne = document.querySelector('[data-js="currency-one"]');
const $currencyTwo = document.querySelector('[data-js="currency-two"]');
const $currenciesEl = document.querySelector('[data-js="currencies-container"]');
const $convertedValue = document.querySelector('[data-js="converted-value"]');
const $valuePrecision = document.querySelector('[data-js="conversion-precision"]');
const $currencyOnTimes = document.querySelector('[data-js="currency-one-times"]');

const showAlert = (error) => {
  const div = document.createElement("div");
  const button = document.createElement("button");

  div.classList.add(
    "alert",
    "alert-warning",
    "alert-dismissible",
    "fade",
    "show"
  );
  button.classList.add("btn-close");

  div.setAttribute("role", "alert");
  button.setAttribute("type", "button");
  button.setAttribute("aria-label", "Close");

  div.textContent = error.message;

  button.addEventListener("click", () => {
    div.remove();
  });

  div.appendChild(button);
  $currenciesEl.insertAdjacentElement("afterend", div);
};

const state = (() => {
  let exchangeRate = {};
  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: (newExchangeRate) => {
      if (!newExchangeRate.conversion_rates) {
        showAlert({ message: "Eita que essa porra vai subir de vida" });
        return;
      }
      exchangeRate = newExchangeRate;
      return exchangeRate;
    },
  };
})();

const getUrl = (currency) => {
  return `https://v6.exchangerate-api.com/v6/98de2e981fb2323e3d5890fd/latest/${currency}`;
};

const getErrormessage = (errorType) =>
  ({
    "unsupported-code":
      "Não foi possível encontrar está moeda no nosso banco de dados.",
    "malformed-request": "A sua solicitção não foi bem requerida.",
    "invalid-key": "A chave que você inseriu é inválida.",
    "inactive-account": "Sua conta está desativada! por favor ativar.",
    "quota-reached": "Seu limite de request foi atingido.",
  }[errorType]);

const fetchExchangeRate = async (url) => {
  try {
    const response = await fetch(url);
    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error(
        "Não foi possível concluir sua solitação, verifique sua coneção."
      );
    }

    if (responseJson.result === "error") {
      throw new Error(getErrormessage(responseJson["error-type"]));
    }

    return responseJson;
  } catch (error) {
    showAlert(error);
  }
};

const getOptions = (selectedOption, conversion_rates) => {
  const setSelected = (currency) => {currency === selectedOption ? "selected" : "";} 
  return Object.keys(conversion_rates)
  .map((currency) => /*html*/ `<option ${setSelected(currency)}>${currency}</option>`)
  .join("");
}

const showInitalInfo = ({ conversion_rates }) => {
  $currencyOne.innerHTML = getOptions("USD", conversion_rates);
  $currencyTwo.innerHTML = getOptions("BRL", conversion_rates);

  $convertedValue.textContent = conversion_rates.BRL.toFixed(2);
  $valuePrecision.textContent = `1 USD = ${conversion_rates.BRL}`;
};

const init = async () => {
  const url = getUrl("USD")
  const exchangeRateFromApi = await fetchExchangeRate(url)
  const exchangeRate = state.setExchangeRate(exchangeRateFromApi);
  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitalInfo(exchangeRate);
  }
};

const getMultpliedExchangeRates = (conversion_rates) => {
  const currencyTwo = conversion_rates[$currencyTwo.value]
  return  ($currencyOnTimes.value * currencyTwo).toFixed(2);
}

const getNotRoundedExchangeRates = (conversion_rates) => {
  const currencyTwo = conversion_rates[$currencyTwo.value]
  return `1 ${$currencyOne.value} = ${1 * currencyTwo} ${$currencyTwo.value}`;
}

const showUpdateRates = ({ conversion_rates }) => {
  $convertedValue.textContent = getMultpliedExchangeRates(conversion_rates)
  $valuePrecision.textContent = getNotRoundedExchangeRates(conversion_rates)
};

$currencyOnTimes.addEventListener("input", () => {
  const { conversion_rates } = state.getExchangeRate();
  $convertedValue.textContent = getMultpliedExchangeRates(conversion_rates)
});

$currencyTwo.addEventListener("input", () => {
  const exchangeRate = state.getExchangeRate();
  showUpdateRates(exchangeRate);
});

$currencyOne.addEventListener("input", async (event) => {
  const url = getUrl(event.target.value)
  const newExchangeRate =  await fetchExchangeRate(url)
  const exchangeRate = state.setExchangeRate(newExchangeRate);

  showUpdateRates(exchangeRate);
});

init();
