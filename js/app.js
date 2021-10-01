const $currencyOne = document.querySelector('[data-js="currency-one"]');
const $currencyTwo = document.querySelector('[data-js="currency-two"]');
const $currenciesEl = document.querySelector('[data-js="currencies-container"]');
const $convertedValue = document.querySelector('[data-js="converted-value"]');
const $valuePrecision = document.querySelector('[data-js="conversion-precision"]');
const $currencyOnTimes = document.querySelector('[data-js="currency-one-times"]');

let internalExchangeRate = {};

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
}

const getUrl = (currency) => {
  return `https://v6.exchangerate-api.com/v6/98de2e981fb2323e3d5890fd/latest/${currency}`;
}

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
    showAlert(error)
  }
};

const showInitalInfo = () => {
  const getOptions = (selectedOption) =>
  Object.keys(internalExchangeRate.conversion_rates)
    .map(
      (currency) => /*html*/ `
        <option ${currency === selectedOption ? "selected" : ""}>
        ${currency}
        </option>`
    )
    .join("");

  $currencyOne.innerHTML = getOptions("USD");
  $currencyTwo.innerHTML = getOptions("BRL");

  $convertedValue.textContent = internalExchangeRate.conversion_rates.BRL.toFixed(2);
  $valuePrecision.textContent = `1 USD = ${internalExchangeRate.conversion_rates.BRL}`;
}

const init = async () => {

  internalExchangeRate = { ...(await fetchExchangeRate(getUrl('USD'))) };

  if(internalExchangeRate.conversion_rates) {
    showInitalInfo()
  }
};

const showUpdateRates = () => {

}

$currencyOnTimes.addEventListener("input", (event) => {
  $convertedValue.textContent = (
    event.target.value *
    internalExchangeRate.conversion_rates[$currencyTwo.value]
  ).toFixed(2);
});

$currencyTwo.addEventListener("input", () => {
  const currencyTwoValue = internalExchangeRate.conversion_rates[$currencyTwo.value]

  $convertedValue.textContent = ($currencyOnTimes.value * currencyTwoValue).toFixed(2)
  $valuePrecision.textContent = `1 ${$currencyOne.value} = ${1 * internalExchangeRate.conversion_rates[$currencyTwo.value]} ${$currencyTwo.value}`
})

$currencyOne.addEventListener("input", async (event) => {
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl(event.target.value))) }
  $convertedValue.textContent = ($currencyOnTimes.value * internalExchangeRate.conversion_rates[$currencyTwo.value]).toFixed(2)
  $valuePrecision.textContent = `1 ${$currencyOne.value} = ${1 * internalExchangeRate.conversion_rates[$currencyTwo.value]} ${$currencyTwo.value}`
})

init();
