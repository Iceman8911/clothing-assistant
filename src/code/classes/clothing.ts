import { createMutable } from "solid-js/store";
import { fileToDataURL } from "../utilities";
import { Accessor, createMemo } from "solid-js";
import { generateRandomId } from "../functions";

interface MutableClassProps {
  name: string;
  description: string;
  brand: string;
  gender: Capitalize<"male" | "female" | "unisex">;
  /** Too varied for a more specific type */
  color: string;
  material: string;
  category: "Tops" | "Bottoms" | "Outer Wear" | "Inner Wear";
  subCategory: string;
  season: {
    spring: boolean;
    summer: boolean;
    fall: boolean;
    winter: boolean;
  };
  occasion: {
    formal: boolean;
    casual: boolean;
    activeWear: boolean;
  };
  condition: Capitalize<"new" | "used" | "refurbished">;

  costPrice: number;
  sellingPrice: number;
  quantity: number;
  size: "XS" | "S" | "M" | "L" | "XL";
  dateBought: Date;
  imgData: string;
  // imgFile: () => Promise<File>;
}
export class ClothingItem implements MutableClassProps {
  /**
   * Generated from `crypto.randomUUID()`
   */
  readonly id!: string;
  name!: string;
  description!: string;
  brand!: string;
  gender!: Capitalize<"male" | "female" | "unisex">;
  /** Too varied for a more specific type */
  color!: string;
  material!: string;
  category!: "Tops" | "Bottoms" | "Outer Wear" | "Inner Wear";
  subCategory!: string;
  season!: {
    spring: boolean;
    summer: boolean;
    fall: boolean;
    winter: boolean;
  };
  occasion!: {
    formal: boolean;
    casual: boolean;
    activeWear: boolean;
  };
  condition!: Capitalize<"new" | "used" | "refurbished">;

  costPrice!: number;
  sellingPrice!: number;
  quantity!: number;
  size!: "XS" | "S" | "M" | "L" | "XL";
  dateBought!: Date;
  /**
   * Base64 encoded string (with the mime type included)
   */
  imgData!: string;

  constructor(data: MutableClassProps | ClothingItem) {
    for (const prop in data) {
      //@ts-expect-error
      this[prop] = data[prop];
    }
    if (!(data instanceof ClothingItem)) {
      this.id = generateRandomId();
    }

    return createMutable(this);
  }

  /**
   * Same as `imgData` but the mime type is removed. Use this for APIs that expect a base64 string.
   */
  get base64() {
    return this.imgData.replace(/^data:image\/\w+;base64,/, "");
  }

  async addImg(file: File) {
    this.imgData = await fileToDataURL(file);
  }

  /**
   *   Take care when calling this since it may be expensive
   */
  async imgFile() {
    await null;

    function base64ToBlob(base64: string, mimeType: string): Blob {
      const byteChars = atob(base64.split(",")[1]);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    }

    return new File([base64ToBlob(this.imgData, "image/png")], "img.png", {
      type: "image/png",
      lastModified: Date.now(),
    });
  }

  randomizeId() {
    //@ts-expect-error
    this.id = generateRandomId();
  }

  clone() {}
}
