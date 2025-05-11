import { createMutable } from "solid-js/store";
import { fileToDataURL } from "../utilities";
import { Accessor, createMemo } from "solid-js";

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
	imgFile: File;
}
export class ClothingItem implements MutableClassProps {
	/**
	 * Generated from `crypto.randomUUID()`
	 */
	readonly id: string;
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
	/**
	 * Base64 encoded string (with the mime type included)
	 */
	imgData!: string;
	imgFile: File;

	constructor(data: MutableClassProps | ClothingItem) {
		if (data instanceof ClothingItem) {
			this.id = data.id;
		} else {
			this.id = crypto.randomUUID();
		}

		this.name = data.name;
		this.description = data.description;
		this.brand = data.brand;
		this.gender = data.gender;
		this.color = data.color;
		this.category = data.category;
		this.subCategory = data.subCategory;
		this.material = data.material;
		this.season = data.season;
		this.occasion = data.occasion;
		this.condition = data.condition;
		this.costPrice = data.costPrice;
		this.sellingPrice = data.sellingPrice;
		this.quantity = data.quantity;
		this.size = data.size;
		this.dateBought = data.dateBought;
		this.imgData = data.imgData;
		this.imgFile = data.imgFile;

		return createMutable(this);
	}

	/**
	 * Same as `imgData` but the mime type is removed. Use this for APIs that expect a base64 string.
	 */
	get base64() {
		return this.imgData.replace(/^data:image\/\w+;base64,/, "");
	}

	async addImg(file: File) {
		this.imgFile = file;
		this.imgData = await fileToDataURL(file);
	}

	randomizeId() {
		//@ts-expect-error
		this.id = crypto.randomUUID();
	}
}
