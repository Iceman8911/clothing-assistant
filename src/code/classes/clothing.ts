import { createMutable, unwrap } from "solid-js/store";
import { fileToDataURL } from "../utilities";
import PlaceholderImage from "~/assets/images/placeholder.webp";
import { generateRandomId } from "../functions";
import { UUID } from "../types";
import { query } from "@solidjs/router";
import gCloudinaryClientFunctions from "../server/file-hosting/cloudinary-client";

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
  readonly id: UUID;
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
  dateEdited: Date;
  imgFile?: File;
  private _imgCache?: string;

  constructor(
    data: MutableClassProps | ClothingItem | SerializableClothingDatabaseItem,
  ) {
    // Smth, I ain't touching this again
    this.dateEdited = data.dateEdited ?? data.dateBought;
    this.name = data.name;
    this.description = data.description;
    this.brand = data.brand;
    this.gender = data.gender;
    this.color = data.color;
    this.material = data.material;
    this.category = data.category;
    this.subCategory = data.subCategory;
    this.season = data.season;
    this.occasion = data.occasion;
    this.condition = data.condition;
    this.costPrice = data.costPrice;
    this.sellingPrice = data.sellingPrice;
    this.quantity = data.quantity;
    this.size = data.size;
    this.dateBought = data.dateBought;
    //@ts-expect-error
    // If an id is passed, use it as is
    if (!data?.id) {
      this.id = generateRandomId();
    } else {
      //@ts-expect-error
      this.id = data.id;
    }

    if (data.imgFile) {
      this.addImg(data.imgFile);
    }

    return createMutable(this);
  }

  /** Returns a new instance of the clothing item, but wrapped in a promise so stuff like fetching image data resolve on time.
   *
   * Use this when parsing data from the server
   */
  static async create(data: SerializableClothingDatabaseItem) {
    const clothing = new ClothingItem(data);

    if (data.imgUrl) {
      await clothing.addImg(
        new File(
          [await (await fetch(data.imgUrl)).blob()],
          `${clothing.id}.webp`,
        ),
      );

      return clothing;
    }

    return clothing;
  }

  /** Caches and returns a base64 representation of a the image associated with the clothing */
  private async _cacheImg() {
    if (!this.imgFile) {
      return "";
    }

    this._imgCache = await fileToDataURL(this.imgFile);
    return this._imgCache;
  }

  addImg(file: File) {
    this.imgFile = file;
    return this._cacheImg();
  }

  /**
   * Base64 encoded string of the image file (with or without the mime type included) or the URL to a placeholder img
   */
  async base64(
    /** If true, the mime type at the beginning of the string will be removed. */
    trimMime = false,
  ) {
    const trim = (string: string) => string.replace(/^data:.+;base64,/, "");

    if (!this.imgFile) return PlaceholderImage;

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

  /** Returns a clean object copy */
  async safeForServer(): Promise<ClothingItemNoClass> {
    const clone = this.store();

    // Destructuring turns it to a plain object
    return { ...clone };
    // const possibleBase64String = await this.base64();

    // const uploadedImgUrl = query(async (id: UUID) => {
    //   return possibleBase64String != PlaceholderImage
    //     ? gCloudinaryClientFunctions.uploadImg(
    //         possibleBase64String,
    //         id,
    //         this.name,
    //       )
    //     : "";
    // }, "data");

    // return {
    //   ...clone,
    //   imgUrl: await uploadedImgUrl(this.id),
    //   imgFile: undefined,
    // };
  }

  /** Returns a clone of the clothing item that is trimmed of unnecessary cache. For cases like storing in IndexedDB */
  store() {
    const clone = this.clone(true);

    // Remove cache
    clone._clearCache();

    // Dunno why I need to call unwrap twice :p
    return unwrap(clone);
  }

  private _clearCache() {
    this._imgCache = undefined;
  }
}

/** The serializable structure of the clothing data that will then be converted to a form the database will accept. Since the database code is ran on the server, we need to get rid of anything not easily serializable */
export interface SerializableClothingDatabaseItem
  extends MutableClassProps,
    ID {
  /** No longer exists since uploading / serializing a file isn't worth the space it takes up*/
  imgFile: undefined | never;
  /** The image will be uploaded to a seperate file host (i.e Firebase Storage)*/
  imgUrl: string;
}

export interface ClothingItemNoClass extends MutableClassProps, ID {}
