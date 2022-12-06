const functor = (v: any) => (typeof v === "function" ? v : () => v);

type FieldSpec = { [key: string]: any };

// TODO: Rename RenderOptions to FilterOptions
interface RenderOptions {
  element: string | Element;
  url?: RequestInfo | URL;
  data?: { [key: string]: (object | string)[] };
  fields: FieldSpec;
  field: { [key: string]: FieldSpec };
  values: FieldSpec;
  value: { [key: string]: FieldSpec };
}

const defaults = {
  fields: {
    selector: ({ name }) => `[name="${name}"],#${name}`,
    render: ({ name, values, multiple = false, ...kwargs }): string =>
      `<select name="${name}" ${multiple ? "multiple" : ""}></select>`,
  },
  values: {
    render: ({ value, label, selected, ...kwargs }): string =>
      `<option ${selected ? "selected" : ""} value="${value || ""}">${
        label || value || ""
      }</option>`,
  },
};

export function render(opt: RenderOptions): void | Promise<void> {
  opt = Object.assign({ field: {}, fields: {}, value: {}, values: {} }, opt);

  // If no .data, fetch from .url, else fail
  if (!opt.data)
    if (opt.url) {
      const url: RequestInfo | URL = opt.url;
      return new Promise((resolve) => {
        fetch(url)
          .then((r) => r.json())
          .then((data) => {
            render({ ...opt, data });
            resolve();
          });
      });
    } else throw new Error(`Cannot update filters without .url or .data`);

  const root = opt.element instanceof Element ? opt.element : document.querySelector(opt.element);
  if (!root) throw new Error(`Cannot update filters on missing "${opt.element}"`);

  // Convert all field/value values into functors
  for (const [fieldName, attrs] of Object.entries(opt.field || {}))
    for (const [attr, value] of Object.entries(attrs)) opt.field[fieldName][attr] = functor(value);
  for (const [attr, value] of Object.entries(opt.fields)) opt.fields[attr] = functor(value);
  for (const [valueName, attrs] of Object.entries(opt.value))
    for (const [attr, value] of Object.entries(attrs)) opt.value[valueName][attr] = functor(value);
  for (const [attr, value] of Object.entries(opt.values)) opt.values[attr] = functor(value);

  for (const [name, values] of Object.entries(opt.data)) {
    let render: Function, field: { [key: string]: Function }, value: { [key: string]: Function };
    ({ render, ...field } = Object.assign({}, defaults.fields, opt.fields, opt.field[name] || {}));
    const fieldData: FieldSpec = { name: name, values: values };
    for (const [attr, func] of Object.entries(field)) fieldData[attr] = func(fieldData);
    let el = root.querySelector(fieldData.selector);
    if (!el) {
      root.insertAdjacentHTML("beforeend", render(fieldData));
      el = root.querySelector(fieldData.selector);
    }
    if (!el) throw new Error(`Cannot update filter ${name} on missing "${fieldData.selector}"`);

    ({ render, ...value } = Object.assign({}, defaults.values, opt.values, opt.value[name] || {}));
    const rows = typeof fieldData.default == "undefined" ? values : [fieldData.default, ...values];
    el.innerHTML = rows
      .map((row) => {
        const valueData = typeof row == "object" ? row : { value: row };
        for (const [attr, func] of Object.entries(value)) valueData[attr] = func(valueData);
        return render(valueData);
      })
      .join("");
  }
}
