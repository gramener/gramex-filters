const fs = require("fs");
const cities = JSON.parse(fs.readFileSync("tests/data-cities.json", { encoding: "utf8" }));
const sales = JSON.parse(fs.readFileSync("tests/data-sales.json", { encoding: "utf8" }));

describe("test update()", () => {
  beforeAll(async () => {
    page.on("console", (consoleObj) => console.log(consoleObj.text()));
    await page.goto("http://127.0.0.1:4444/tests/test.html");
    await page.waitForFunction("window.renderComplete");
  });

  const mapText = (els: Element[]) => els.map((el: Element) => el.textContent);

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
        page.$$eval(`#filters-without-elements [name="${key}"] option`, mapText)
      ).resolves.toEqual(["-", ...(values as string[])]);
    }
  });
});

// TODO
// - Test what happens if column names contain invalid ID characters, e.g. |, :, comma, etc.
