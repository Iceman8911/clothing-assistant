interface ClothingBase {
	/**
	 * Generated from `crypto.randomUUID()`
	 */
	id: string;
	name: string;
	description: string;
	brand: string;
	gender: Capitalize<"male" | "female" | "unisex">;
	/** Too varied for a more specific type */
	color: string;
	material: string;
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
	img: File;
}

interface ClothingTop extends ClothingBase {
	category: "tops";
	type: "shirt" | "blouse" | "sweater";
}

interface ClothingBottom extends ClothingBase {
	category: "bottoms";
	type: "pants" | "shorts" | "skirt";
}

interface ClothingInnerWear extends ClothingBase {
	category: "innerWear";
	type: "underwear" | "socks";
}

interface ClothingOuterwear extends ClothingBase {
	category: "outerWear";
	type: "jacket" | "coat" | "hat";
}

export type ClothingItem =
	| ClothingTop
	| ClothingBottom
	| ClothingInnerWear
	| ClothingOuterwear;
