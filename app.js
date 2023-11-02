// selectors
const form = document.querySelector("form");
let formFields = Array.from(form.querySelectorAll(".form__control"));
const confirmation = document.querySelector(".confirmation");
const resetBtn = document.querySelector(".btn--reset");

const formatCreditCard = (inputValue) => {
  const values = [];

  for (i = 0; i < inputValue.length; i++) {
    if (i % 4 === 0 && i !== 0) {
      values.push(" ");
    }
    values.push(inputValue[i]);
  }
  return values.join("");
};

const defaultFormatter = (inputValue) => {
  return inputValue.replace(/\s/g, "");
};

const formatFields = (
  field,
  reflector = null,
  defaultFormat = null,
  formatter = defaultFormatter
) => {
  // if formatter exists, format input value and then pass through regex
  // if there's no formatter, pass the value to regex directly
  let inputValue = formatter ? field.value.replace(/\s/g, "") : field.value;
  let formattedValue = formatter ? formatter(inputValue) : inputValue;

  reflector.textContent = defaultFormat
    ? defaultFormat.replace(
        defaultFormat.substring(0, formattedValue.length),
        formattedValue
      )
    : formattedValue;
  field.value = formattedValue;
};

const fieldsData = {
  "card-number": {
    regex: /^\d{4} \d{4} \d{4} \d{4}$/,
    defaultFormat: "0000 0000 0000 0000",
    formatter: formatCreditCard,
    errorFormat: "e.g 1234 5678 9123 0000",
  },
  "card-name": {
    regex: /^[A-Z]{1}[a-z]+\s[A-Z]{1}[a-z]+$/,
    defaultFormat: "",
    formatter: null,
    errorFormat: "e.g Jane Doe. With no space after names",
  },
  cvc: {
    regex: /^\d{3}$/,
    defaultFormat: "000",
    formatter: null,
    errorFormat: "e.g 123",
  },
  month: {
    regex: /^(0?[1-9]|1[0-2])$/,
    defaultFormat: "00",
    formatter: null,
    errorFormat: "e.g two digits. Must be less than 12. Leading 0 is optional",
  },
  year: {
    regex: /^\d{2}$/,
    defaultFormat: "00",
    formatter: null,
    errorFormat: "e.g 21",
  },
};

const validate = (field, regex) => {
  if (!regex.test(field.value)) {
    field.classList.add("has--error");
  } else {
    field.classList.remove("has--error");
  }

  return {
    errorMsg:
      field.value.replace(/\s/g, "").length < 1
        ? "Can't be blank"
        : regex.test(field.value) === false
        ? `Wrong format. ${fieldsData[field.name].errorFormat}`
        : null,
  };
};

/* event listeners */

// reset button
resetBtn.addEventListener("click", () => {
  form.classList.remove("hidden");
  confirmation.classList.add("hidden");

  // reset feedback fields
  formFields.map((field) => {
    let feedbackField = document.querySelector(`[data-input="${field.name}"]`);
    feedbackField.textContent = fieldsData[field.name].defaultFormat;
  });
});

form.addEventListener("input", (e) => {
  let input = e.target;
  let feedbackField = document.querySelector(`[data-input="${input.name}"]`);

  formatFields(
    input,
    feedbackField,
    fieldsData[input.name].defaultFormat,
    fieldsData[input.name].formatter
  );
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // check for fields with invalid inputs
  formFields.map((input) => {
    const { errorMsg } = validate(input, fieldsData[input.name].regex);

    // grab the element related with input that displays error
    let errorField = form.querySelector(`[data-errorFor="${input.name}"]`);
    let accessibleErrorField = form.querySelector(`[data-for="${input.name}"]`);

    if (input.classList.contains("has--error")) {
      accessibleErrorField.setAttribute("aria-hidden", false);
      errorField.textContent = errorMsg;
      errorField.classList.add("open");
    } else {
      accessibleErrorField.setAttribute("aria-hidden", true);
      errorField.classList.remove("open");
    }
  });

  // check to see if any field has an error field and focus the first occurrence. If not, do nothing
  formFields.some((field) => field.classList.contains("has--error"))
    ? formFields.find((input) => input.classList.contains("has--error")).focus()
    : "";

  let formFilled = formFields.every(
    (input) => !input.classList.contains("has--error")
  );

  // show appreciation message at this point if formFilled variable returns true
  if (formFilled) {
    confirmation.classList.remove("hidden");
    form.classList.add("hidden");
    form.reset();
  }
});
