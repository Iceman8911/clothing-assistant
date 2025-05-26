import { createMutable, unwrap } from "solid-js/store";
import { fileToDataURL } from "../utilities";
import { Accessor, createMemo } from "solid-js";
import { generateRandomId } from "../functions";
import { UUID } from "../types";

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
  /** Updated everytime the clothing item is added to `gClothingItem` via `gAddClothingItem`. Used for syncing purposes */
  dateEdited: Date;
  imgFile?: File;
}
interface ID {
  /**
   * Generated from `crypto.randomUUID()`
   */
  readonly id: UUID;
}

export class ClothingItem implements MutableClassProps, ID {
  readonly id!: UUID;
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
  dateEdited: Date;
  imgFile?: File;
  private _imgCache?: string;

  constructor(data: MutableClassProps | ClothingItem) {
    this.dateEdited = data.dateBought;

    for (const prop in data) {
      //@ts-expect-error
      this[prop] = data[prop];
    }

    //@ts-expect-error
    // If an id is passed, use it as is
    if (!data?.id) {
      this.id = generateRandomId();
    }

    // Clear private caches
    this._imgCache = undefined;

    return createMutable(this);
  }

  /** Caches and returns a base64 representation of a the image associated with the clothing */
  private async _cacheImg() {
    if (!this.imgFile) {
      return "";
    }

    this._imgCache = await fileToDataURL(this.imgFile);
    return this._imgCache;
  }

  async addImg(file: File) {
    this.imgFile = file;
    await this._cacheImg();
  }

  /**
   * Base64 encoded string of the image file (with or without the mime type included)
   */
  async base64(
    /** If true, the mime type at the beginning of the string will be removed. */
    trimMime = false,
  ) {
    const trim = (string: string) =>
      string.replace(/^data:image\/\w+;base64,/, "");

    // The cache is empty
    if (!this._imgCache || this._imgCache.endsWith("base64,")) {
      return trimMime ? trim(await this._cacheImg()) : this._cacheImg();
    } else {
      return trimMime ? trim(this._imgCache) : this._imgCache;
    }
  }

  randomizeId() {
    //@ts-expect-error
    this.id = generateRandomId();
  }

  clone(
    /** If `true`, the new clone will be unwrapped from it's SolidJS proxy */
    shouldUnwrap = false,
  ) {
    return shouldUnwrap
      ? unwrap(new ClothingItem(this))
      : new ClothingItem(this);
  }

  /** Returns a plain object copy that can be easily used in server side code. */
  get safeForServer(): Promise<SerializableClothingDatabaseItem> {
    const clone = this.clone();
    // TODO: Upload image file
    return Promise.resolve({ ...clone, imgUrl: "", imgFile: undefined });
  }
}

/** The serializable structure of the clothing data that will then be converted to a form the database will accept. Since the database code is ran on the server, we need to get rid of anything not easily serializable */
export interface SerializableClothingDatabaseItem
  extends MutableClassProps,
    ID {
  /** No longer exists since uploading / serializing a file isn't worth the space it takes up. Besides, Seroval can't serialize them :p */
  imgFile: undefined | never;
  /** The image will be uploaded to a seperate file host (i.e Firebase Storage)*/
  imgUrl: string;
}
