import { For } from "solid-js";
import { ClothingItem } from "~/code/types";

export default function CreateClothingModal() {
	const clothingSizes: ClothingItem["size"][] = ["XS", "S", "M", "L", "XL"];
	const clothingCondition: ClothingItem["condition"][] = [
		"New",
		"Used",
		"Refurbished",
	];
	const clothingColors = [
		"Black",
		"Beige",
		"Blue",
		"Brown",
		"Burgundy",
		"Charcoal",
		"Gray",
		"Green",
		"Khaki",
		"Maroon",
		"Navy",
		"Neon",
		"Orange",
		"Pink",
		"Purple",
		"Red",
		"Tan",
		"Teal",
		"Turquoise",
		"White",
		"Yellow",
		"Multi-color",
		"Printed",
		"Plaid",
		"Striped",
	] as const;
	const defaultClothingColor = clothingColors[0];
	const clothingMaterials = [
		"Cotton",
		"Acetate",
		"Acrylic",
		"Bamboo",
		"Cashmere",
		"Denim",
		"Faux Fur",
		"Faux Leather",
		"Fleece",
		"Fur",
		"Linen",
		"Mesh",
		"Microfibre",
		"Nylon",
		"Polyester",
		"Rayon",
		"Silk",
		"Spandex",
		"Suede",
		"Velour",
		"Velvet",
		"Viscose",
		"Wool",
	] as const;
	const defaultClothingMaterial = clothingMaterials[0];

	const clothingColorListId = crypto.randomUUID();
	const clothingMaterialListId = crypto.randomUUID();

	let clothingDisplay!: HTMLDivElement;
	return (
		<form class="grid grid-cols-6 gap-3">
			{/* <h3 class="font-bold text-lg">Test Clothing Modal</h3>
			<p class="py-4">Press ESC key or click outside to close</p> */}

			<div
				class="glass border rounded-box col-start-1 col-span-3 row-start-1 row-span-2"
				ref={clothingDisplay}
			></div>

			<fieldset class="fieldset row-start-3 col-span-4">
				<legend class="fieldset-legend">Select an Image</legend>
				<input type="file" class="file-input" />
				<label class="label">Max size 10MB</label>
			</fieldset>

			<fieldset class="fieldset col-span-3">
				<legend class="fieldset-legend">Name:</legend>
				<input
					type="text"
					class="input"
					placeholder="Da Vinci's Leather Vest"
				/>
			</fieldset>

			<fieldset class="fieldset col-start-4 col-span-3">
				<legend class="fieldset-legend">Description</legend>
				<textarea
					class="textarea h-24"
					placeholder="A short description about the cloth"
				></textarea>
				<div class="label">Optional</div>
			</fieldset>

			<fieldset class="fieldset col-span-2">
				<legend class="fieldset-legend">Size</legend>
				<select class="select">
					<For each={clothingSizes}>
						{(size) => <option selected={size === "M"}>{size}</option>}
					</For>
				</select>
			</fieldset>

			<fieldset class="fieldset col-span-3 md:col-span-2">
				<legend class="fieldset-legend">Condition</legend>
				<select class="select">
					<For each={clothingCondition}>
						{(condition) => (
							<option selected={condition === "New"}>{condition}</option>
						)}
					</For>
				</select>
			</fieldset>

			<fieldset class="fieldset col-span-3 md:col-span-2">
				<legend class="fieldset-legend">Material:</legend>
				<input
					type="text"
					class="input"
					placeholder={defaultClothingMaterial}
					list={clothingMaterialListId}
				/>
				<datalist id={clothingMaterialListId}>
					<For each={clothingMaterials}>
						{(material) => <option value={material}></option>}
					</For>
				</datalist>
			</fieldset>

			<fieldset class="fieldset col-span-2">
				<legend class="fieldset-legend">Color:</legend>
				<input
					type="text"
					class="input"
					placeholder={defaultClothingColor}
					list={clothingColorListId}
				/>
				<datalist id={clothingColorListId}>
					<For each={clothingColors}>
						{(color) => <option value={color}></option>}
					</For>
				</datalist>
			</fieldset>

			<fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4 grid grid-cols-2 col-span-4 md:col-span-3 max-w-[100%]">
				<legend class="fieldset-legend">Season</legend>
				<For each={["Spring", "Summer", "Fall", "Winter"] as const}>
					{(season) => (
						<label class="label">
							<input
								type="checkbox"
								class="checkbox"
								checked={season == "Spring" || season == "Summer"}
							/>
							{season}
						</label>
					)}
				</For>
			</fieldset>

			<fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4 grid grid-cols-2 col-span-4 md:col-span-3 max-w-[100%]">
				<legend class="fieldset-legend">Occasion</legend>
				<For each={["Casual", "Formal", "Active Wear"] as const}>
					{(occasion) => (
						<label class="label">
							<input
								type="checkbox"
								class="checkbox"
								checked={occasion == "Casual"}
							/>
							{occasion}
						</label>
					)}
				</For>
			</fieldset>
		</form>
	);
}
