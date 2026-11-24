import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validProduct } from "@/test/in-memory-product-repository";
import { createProductSchema, listProductsSchema } from "./schemas";

function fieldErrors(input: unknown) {
  const result = createProductSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("createProductSchema", () => {
  it("accepts valid data", () => {
    expect(createProductSchema.parse(validProduct)).toEqual(validProduct);
  });

  it("makes description and image optional", () => {
    const data = createProductSchema.parse({
      name: "Kettle",
      link: "https://shop.example.com/kettle",
    });
    expect(data.description).toBeUndefined();
    expect(data.image).toBeUndefined();
  });

  it("treats empty or null optional fields as not given", () => {
    const data = createProductSchema.parse({
      ...validProduct,
      description: "  ",
      image: null,
    });
    expect(data.description).toBeUndefined();
    expect(data.image).toBeUndefined();
  });

  it("trims the name and requires it", () => {
    expect(
      createProductSchema.parse({ ...validProduct, name: "  Kettle " }).name,
    ).toBe("Kettle");
    expect(fieldErrors({ ...validProduct, name: "   " }).name).toEqual([
      "Name is required",
    ]);
  });

  it("limits the name and description length", () => {
    const errors = fieldErrors({
      ...validProduct,
      name: "a".repeat(201),
      description: "a".repeat(2001),
    });
    expect(errors.name).toBeDefined();
    expect(errors.description).toBeDefined();
  });

  it("requires https for the image", () => {
    expect(
      fieldErrors({
        ...validProduct,
        image: "http://images.example.com/a.jpg",
      }).image,
    ).toEqual(["Image must be an absolute https:// URL"]);
    expect(
      fieldErrors({ ...validProduct, image: "/relative.jpg" }).image,
    ).toBeDefined();
  });

  it("requires an absolute http(s) external link", () => {
    expect(
      createProductSchema.safeParse({
        ...validProduct,
        link: "http://shop.example.com/a",
      }).success,
    ).toBe(true);
    for (const link of [
      undefined,
      "not a url",
      "ftp://shop.example.com/a",
      "javascript:alert(1)",
      // Scraped text glued to a base URL (a real n8n mistake): spaces, brackets.
      "https://www.amazon.com.br/[https://m.media-amazon.com/i.jpg]Crime no Copan42% off",
      "https://shop.example.com/a b",
      "https://shop.example.com/<script>",
    ]) {
      expect(fieldErrors({ ...validProduct, link }).link).toBeDefined();
    }
  });
});

describe("listProductsSchema", () => {
  it("defaults the limit to 12", () => {
    expect(listProductsSchema.parse({})).toEqual({ limit: 12 });
  });

  it("coerces a query-string limit and rejects one out of range", () => {
    expect(listProductsSchema.parse({ limit: "20" }).limit).toBe(20);
    expect(listProductsSchema.safeParse({ limit: "0" }).success).toBe(false);
    expect(listProductsSchema.safeParse({ limit: "51" }).success).toBe(false);
    expect(listProductsSchema.safeParse({ limit: "abc" }).success).toBe(false);
    expect(listProductsSchema.safeParse({ limit: "2.5" }).success).toBe(false);
  });
});
