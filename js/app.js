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

const showInitalInfo = (exchangeRate) => {
  const getOptions = (selectedOption) =>
    Object.keys(exchangeRate.conversion_rates)
      .map(
        (currency) => /*html*/ `
        <option ${currency === selectedOption ? "selected" : ""}>
        ${currency}
        </option>`
      )
      .join("");

  $currencyOne.innerHTML = getOptions("USD");
  $currencyTwo.innerHTML = getOptions("BRL");

  $convertedValue.textContent = exchangeRate.conversion_rates.BRL.toFixed(2);
  $valuePrecision.textContent = `1 USD = ${exchangeRate.conversion_rates.BRL}`;
};

const init = async () => {
  // internalExchangeRate = { ...(await fetchExchangeRate(getUrl('USD'))) };
  const exchangeRate = state.setExchangeRate(
    await fetchExchangeRate(getUrl("USD"))
  );
  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitalInfo(exchangeRate);
  }
};

const showUpdateRates = (exchangeRate) => {
  $convertedValue.textContent = (
    $currencyOnTimes.value *
    exchangeRate.conversion_rates[$currencyTwo.value]
  ).toFixed(2);
  $valuePrecision.textContent = `1 ${$currencyOne.value} = ${
    1 * exchangeRate.conversion_rates[$currencyTwo.value]
  } ${$currencyTwo.value}`;
};

$currencyOnTimes.addEventListener("input", (event) => {
  const exchangeRate = state.getExchangeRate()
  $convertedValue.textContent = (
    event.target.value *
    exchangeRate.conversion_rates[$currencyTwo.value]
  ).toFixed(2);
});

$currencyTwo.addEventListener("input", () => {
  const exchangeRate = state.getExchangeRate()
  showUpdateRates(exchangeRate)
});

$currencyOne.addEventListener("input", async (event) => {
  const exchangeRate = state.setExchangeRate(await fetchExchangeRate(getUrl(event.target.value)))
  console.log(exchangeRate)
  showUpdateRates(exchangeRate);
});

init();
