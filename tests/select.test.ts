import { promises as fs } from "fs";

export const mapText = (els: Element[]) => els.map((el: Element) => el.textContent);
export const mapAttrs = (els: Element[]) =>
  els.map((el: Element) => {
    const attrs = {};
    for (const attr of el.attributes) attrs[attr.name] = attr.value;
    return attrs;
  });

export const setupPage = async (prefix: string) => {
  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.goto(`http://127.0.0.1:4444/tests/${prefix}.test.html`);
  await page.waitForFunction("window.renderComplete");

  return {
    cities: JSON.parse(await fs.readFile("tests/data-cities.json", { encoding: "utf8" })),
    sales: JSON.parse(await fs.readFile("tests/data-sales.json", { encoding: "utf8" })),
  };
};

describe("test update()", () => {
  let cities: any;
  let sales: any;

  beforeAll(async () => ({ cities, sales } = await setupPage("select")));

  test("#basic-usage creates and adds <select>s and <option>s", async () => {
    await expect(
      page.$$eval("#basic-usage option", (els) =>
        els.map((el) => `${el?.parentElement?.getAttribute("name")} ${el.value}`)
      )
    ).resolves.toEqual([
      "product Alpha",
      "product Beta",
      "product Gamma",
      "city London",
      "city Oslo",
      "city Paris",
      "channel Direct",
      "channel Indirect",
    ]);
  });

  test("#plain-select adds options to <select>", async () => {
    await expect(
      page.$$eval("#plain-select option", (els) => els.map((el) => el.textContent))
    ).resolves.toEqual(cities);
  });

  test("#filters-defined-as-name update multiple <select>s by name", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(
        page.$$eval(`#filters-defined-as-name [name="${key}"] option`, mapText)
      ).resolves.toEqual(values);
    }
  });
  test("#filters-defined-as-id update multiple <select>s by id", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(page.$$eval(`#filters-defined-as-id #${key} option`, mapText)).resolves.toEqual(
        values
      );
    }
  });
  test("#filters-with-global-defaults add default to all fields with a single default", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(
        page.$$eval(`#filters-with-global-defaults [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
    }
  });
  test("#filters-with-field-defaults add field-specific defaults", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(
        page.$$eval(`#filters-with-field-defaults [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
    }
  });
  test("#filters-with-url fetch data from URL", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(
        page.$$eval(`#filters-with-url [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
    }
  });
  test("#filters-without-elements creates <select> as required", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(
        page.$$eval(`#filters-without-elements [name="${key}"]`, mapAttrs)
      ).resolves.toEqual([{ name: key, class: "form-control" }]);
      await expect(
        page.$$eval(`#filters-without-elements [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
    }
  });
  test("#filters-without-elements-multiple creates <select multiple> as required", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(
        page.$$eval(`#filters-without-elements-multiple [name="${key}"]`, mapAttrs)
      ).resolves.toEqual([{ name: key, multiple: "" }]);
      await expect(
        page.$$eval(`#filters-without-elements-multiple [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
    }
  });
  test("#filters-with-attrs preserves <select> attributes", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(page.$$eval(`#filters-with-attrs [name="${key}"]`, mapAttrs)).resolves.toEqual([
        { name: key, multiple: "", required: "", size: "3" },
      ]);
      await expect(
        page.$$eval(`#filters-with-attrs [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
    }
  });
  test("#filters-selected selects the right options", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(
        page.$$eval(`#filters-selected [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
      await expect(
        page.$$eval(`#filters-selected [name="${key}"] option[selected]`, mapAttrs)
      ).resolves.toEqual([{ selected: "", value: (values as string[])[1] }]);
    }
  });
  test("#filters-update calls update({el, name, ...})", async () => {
    for (const [key, values] of Object.entries(sales)) {
      await expect(page.$$eval(`#filters-update [name="${key}"]`, mapAttrs)).resolves.toEqual([
        { name: key, "data-update": key },
      ]);
    }
  });
});

// TODO
// - Test what happens if column names contain invalid ID characters, e.g. |, :, comma, etc.
