import { describe, expect, it } from "vitest";
import {
  product,
  validateProductContent,
  type ProductContentCandidate,
} from "../../src/content/product";

describe("product content contract", () => {
  it("accepts the source-backed product content", () => {
    expect(validateProductContent(product)).toEqual([]);
    expect(product.name).toBe("Git Fanta");
    expect(product.tagline).toBe("The highly caffeinated Git GUI");
  });

  it("records source metadata for every approved claim", () => {
    expect(product.claims).toHaveLength(4);
    expect(
      product.claims.every(
        (claim) =>
          claim.sourceRepository === "hermes-agent-ak/git-fanta" &&
          claim.sourcePath.length > 0 &&
          claim.sourceSection.length > 0 &&
          claim.status === "approved",
      ),
    ).toBe(true);
  });

  it("rejects a claim with missing source path", () => {
    const candidate: ProductContentCandidate = {
      ...product,
      claims: [{ ...product.claims[0], sourcePath: "" }],
    };

    expect(validateProductContent(candidate)).toContain(
      'claim "tagline": missing source path',
    );
  });

  it("rejects claims from an unknown repository", () => {
    const candidate: ProductContentCandidate = {
      ...product,
      claims: [
        { ...product.claims[0], sourceRepository: "example.invalid/repo" },
      ],
    };

    expect(validateProductContent(candidate)).toContain(
      'claim "tagline": wrong source repository',
    );
  });

  it("rejects missing text and invalid status deterministically", () => {
    const candidate: ProductContentCandidate = {
      ...product,
      claims: [
        {
          ...product.claims[0],
          text: "",
          status: "draft",
        },
      ],
    };

    expect(validateProductContent(candidate)).toEqual([
      'claim "tagline": missing claim text',
      'claim "tagline": invalid status',
    ]);
  });
});
