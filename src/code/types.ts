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
	imgUrl: string;
}

interface ClothingTop extends ClothingBase {
	category: "Tops";
	subCategory: Capitalize<"shirt" | "blouse" | "sweater">;
}

interface ClothingBottom extends ClothingBase {
	category: "Bottoms";
	subCategory: Capitalize<"pants" | "shorts" | "skirt">;
}

interface ClothingInnerWear extends ClothingBase {
	category: "Inner Wear";
	subCategory: Capitalize<"underwear" | "socks">;
}

interface ClothingOuterwear extends ClothingBase {
	category: "Outer Wear";
	subCategory: Capitalize<"jacket" | "coat" | "hat">;
}

export type ClothingItem =
	| ClothingTop
	| ClothingBottom
	| ClothingInnerWear
	| ClothingOuterwear;
