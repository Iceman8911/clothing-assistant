interface ClothingBase {
	/**
	 * Generated from `crypto.randomUUID()`
	 */
	id: string;
	name: string;
	description: string;
	// TODO
	brand: "NA" | "louise";
	gender: "male" | "female" | "unisex";
	/** Too varied for a more specific type */
	color: string;
	material: string;
	season: "spring" | "summer" | "fall" | "winter";
	occasion: "casual" | "formal" | "activewear";
	condition: "new" | "used" | "refurbished";

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
