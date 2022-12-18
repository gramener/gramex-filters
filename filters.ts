import selectDefaults from "./filters.select";
import bs5Defaults from "./filters.bs5";

const defaults: { [key: string]: AttrSpecs } = {
  select: selectDefaults,
  bs5: bs5Defaults,
};

export function render(opt: RenderOptions): void | Promise<any> {
  // If no .data, fetch from .url, else fail
  if (!opt.data)
    if (opt.url) {
      const url: RequestInfo | URL = opt.url;
      return new Promise((resolve) => {
        fetch(url)
          .then((r) => r.json())
          .then((data) => {
            render({ ...opt, data });
            resolve(data);
          });
      });
      // TODO: test error handling
    } else throw new Error(`filters: missing options {url , data}`);

  const root =
    opt.container instanceof Element
      ? opt.container
      : document.querySelector(opt.container);
  // TODO: test error handling
  if (!root) throw new Error(`filters: missing {container: ${opt.container}}`);

  const type = opt.type || "select";

  // Convert all field/value values into field name -> { spec }
  const fieldSpec = getSpecs(
    Object.keys(opt.data),
    defaults[type].fields,
    opt.fields,
    opt.field
  );
  const valueSpec = getSpecs(
    Object.keys(opt.data),
    defaults[type].values,
    opt.values,
    opt.value
  );

  for (const [name, values] of Object.entries(opt.data)) {
    let render: Function,
      field: { [key: string]: Function },
      value: { [key: string]: Function };
    ({ render, ...field } = fieldSpec[name]);
    const fieldData: FieldSpec = { name: name, values: values };
    for (const [attr, func] of Object.entries(field))
      fieldData[attr] = func(fieldData);
    let el = root.querySelector(fieldData.selector as string);
    if (!el) {
      root.insertAdjacentHTML("beforeend", render(fieldData));
      el = root.querySelector(fieldData.selector as string);
    }
    // TODO: test error handling
    if (!el)
      throw new Error(
        `filters: field ${name} missing {selector: ${fieldData.selector}}`
      );

    ({ render, ...value } = valueSpec[name]);
    // Insert default value if required and missing
    const rows =
      typeof fieldData.default == "undefined" ||
      values.includes(fieldData.default)
        ? values
        : [fieldData.default, ...values];
    el.innerHTML = rows
      .map((row) => {
        const valueData = typeof row == "object" ? row : { value: row };
        for (const [attr, func] of Object.entries(value))
          valueData[attr] = func(valueData);
        return render(valueData, fieldData);
      })
      .join("");
  }
}

const functor = (v: any) => (typeof v === "function" ? v : () => v);

// TODO: JSDoc this like crazy. It's complicated.
// maps: .attr = value | .attr.name = value
// map: .name.attr = value
// attrMap = .name.attr = value
function getSpecs(
  names: string[],
  defaults: AttrSpec,
  maps: AttrSpec,
  map: AttrSpecs
) {
  const specs: AttrSpecs = {};
  for (const [attr, value] of Object.entries(Object.assign({}, defaults, maps)))
    if (typeof value == "object")
      for (const [name, val] of Object.entries(value))
        (specs[name] ??= {})[attr] = functor(val);
    else for (const name of names) (specs[name] ??= {})[attr] = functor(value);
  for (const [name, attrs] of Object.entries(map || {}))
    for (const [attr, value] of Object.entries(attrs))
      (specs[name] ??= {})[attr] = functor(value);
  return specs;
}

export function attrMap(attrs: AttrSpec): string {
  /** Convert attributes object to string of HTML attributes */
  const html: string[] = [];
  for (let [key, value] of Object.entries(attrs))
    if (typeof value == "boolean") {
      if (value) html.push(key);
    } else {
      html.push(`${key}="${value.toString().replace(/"/g, "&quot;")}"`);
    }
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
  container: string | Element;
  url?: RequestInfo | URL;
  data?: { [key: string]: (object | string)[] };
  fields: FieldSpec;
  field: { [key: string]: FieldSpec };
  values: AttrSpec;
  value: AttrSpecs;
}
