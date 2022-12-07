import selectDefaults from "./filters.select";
import bs5Defaults from "./filters.bs5";

const defaults: { [key: string]: AttrSpecs } = {
  select: selectDefaults,
  bs5: bs5Defaults,
};

export function render(opt: RenderOptions): void | Promise<void> {
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

  const type = opt.type || "select";

  // Convert all field/value values into field name -> { spec }
  const fieldSpec = getSpecs(Object.keys(opt.data), defaults[type].fields, opt.fields, opt.field);
  const valueSpec = getSpecs(Object.keys(opt.data), defaults[type].values, opt.values, opt.value);

  for (const [name, values] of Object.entries(opt.data)) {
    let render: Function, field: { [key: string]: Function }, value: { [key: string]: Function };
    ({ render, ...field } = fieldSpec[name]);
    const fieldData: FieldSpec = { name: name, values: values };
    for (const [attr, func] of Object.entries(field)) fieldData[attr] = func(fieldData);
    let el = root.querySelector(fieldData.selector as string);
    if (!el) {
      root.insertAdjacentHTML("beforeend", render(fieldData));
      el = root.querySelector(fieldData.selector as string);
    }
    if (!el) throw new Error(`Cannot update filter ${name} on missing "${fieldData.selector}"`);

    ({ render, ...value } = valueSpec[name]);
    // Insert default value if required and missing
    const rows =
      typeof fieldData.default == "undefined" || values.includes(fieldData.default)
        ? values
        : [fieldData.default, ...values];
    el.innerHTML = rows
      .map((row) => {
        const valueData = typeof row == "object" ? row : { value: row };
        for (const [attr, func] of Object.entries(value)) valueData[attr] = func(valueData);
        return render(valueData, fieldData);
      })
      .join("");
  }
}

const functor = (v: any) => (typeof v === "function" ? v : () => v);

// TODO: Document this like crazy. It's complicated.
// maps: .attr = value | .attr.name = value
// map: .name.attr = value
// attrMap = .name.attr = value
function getSpecs(names: string[], defaults: AttrSpec, maps: AttrSpec, map: AttrSpecs) {
  const specs: AttrSpecs = {};
  for (const [attr, value] of Object.entries(Object.assign({}, defaults, maps)))
    if (typeof value == "object")
      for (const [name, val] of Object.entries(value)) (specs[name] ??= {})[attr] = functor(val);
    else for (const name of names) (specs[name] ??= {})[attr] = functor(value);
  for (const [name, attrs] of Object.entries(map || {}))
    for (const [attr, value] of Object.entries(attrs)) (specs[name] ??= {})[attr] = functor(value);
  return specs;
}

export function attrMap(attrs: AttrSpec): string {
  /** Convert attributes object to string of HTML attributes */
  const html: string[] = [];
  for (let [key, value] of Object.entries(attrs))
    html.push(`${key}="${value.replaceAll('"', "&quot;")}"`);
  return html.join(" ");
}

export type AttrSpec = { [key: string]: any };
type AttrSpecs = { [key: string]: AttrSpec };
type FieldSpec = {
  render?: Function;
  selector?: string | ((...args: any[]) => string);
  default?: string | Function;
  multiple?: string | Function;
  value?: string | Function;
} & AttrSpec;

// TODO: Rename RenderOptions to FilterOptions
interface RenderOptions {
  type: "select" | "bs5" | "bootstrap-select" | "select2" | "selectize";
  element: string | Element;
  url?: RequestInfo | URL;
  data?: { [key: string]: (object | string)[] };
  fields: FieldSpec;
  field: { [key: string]: FieldSpec };
  values: AttrSpec;
  value: AttrSpecs;
}
