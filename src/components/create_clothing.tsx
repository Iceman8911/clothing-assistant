import { createSignal, For } from "solid-js";
import { ClothingItem } from "~/code/types";

export default function CreateClothingModal(props: {
	dialogParent: HTMLDialogElement;
}) {
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

	const MIN_PRICE_INPUT = 0;
	const MAX_PRICE_INPUT = 999999999;
	const sanitisePriceInput = (e: FocusEvent) => {
		const target = e.target as HTMLInputElement;

		// Remove invalid things like "e12121" or "121-121"
		if (!target.value) {
			target.value = `${MIN_PRICE_INPUT}`;
			return;
		}

		const targetValue = parseInt(target.value);
		targetValue > MAX_PRICE_INPUT
			? (target.value = `${MAX_PRICE_INPUT}`)
			: targetValue < MIN_PRICE_INPUT
			? (target.value = `${MIN_PRICE_INPUT}`)
			: target.value;
	};

	const clothingFormId = crypto.randomUUID();

	let clothingDisplay!: HTMLDivElement;
	let clothingForm!: HTMLFormElement;

	const [previewImg, setPreviewImg] = createSignal("");

	/**
	 * The actual cloth data
	 */
	const clothingItem: ClothingItem = {
		id: crypto.randomUUID(),
		name: "Shirt",
		description: "Shirt",
		color: "Red",
		gender: "Unisex",
		quantity: 1,
		category: "tops",
		type: "shirt",
		brand: "Louise",
		condition: "New",
		costPrice: 1000,
		sellingPrice: 1000,
		dateBought: new Date(),
		material: "Cotton",
		occasion: { casual: false, activeWear: false, formal: false },
		season: { fall: false, spring: false, summer: false, winter: false },
		size: "M",
		img: new File([], ""),
	};
	return (
		<>
			<form
				class="grid grid-cols-6 gap-3"
				id={clothingFormId}
				ref={clothingForm}
			>
				{/* <h3 class="font-bold text-lg">Test Clothing Modal</h3>
			<p class="py-4">Press ESC key or click outside to close</p> */}

				<div
					class="glass border rounded-box col-start-1 col-span-3 row-start-1 row-span-2 bg-contain bg-no-repeat bg-center"
					ref={clothingDisplay}
					style={{ "background-image": previewImg() }}
				></div>

				<fieldset class="fieldset row-start-3 col-span-4">
					<legend class="fieldset-legend">Select an Image</legend>
					<input
						type="file"
						class="file-input"
						required
						onChange={async (e) => {
							const input = e.target as HTMLInputElement;
							const file = input.files?.[0];

							function fileToDataURL(file: File) {
								return new Promise((resolve, reject) => {
									const reader = new FileReader();
									reader.onload = (e) => resolve(reader.result);
									reader.onerror = reject;
									reader.readAsDataURL(file);
								});
							}

							if (!file) return;

							setPreviewImg(`url(${await fileToDataURL(file)})`);
						}}
					/>
					<label class="label">Max size 10MB</label>
				</fieldset>

				<fieldset class="fieldset col-span-3">
					<legend class="fieldset-legend">Name:</legend>
					<input
						type="text"
						class="input"
						placeholder="Da Vinci's Leather Vest"
						required
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

				<fieldset class="fieldset col-span-3">
					<legend class="fieldset-legend">Cost Price:</legend>
					<label class="input">
						₦
						<input
							type="number"
							class="grow validator"
							placeholder="1000"
							required
							min={MIN_PRICE_INPUT}
							max={MAX_PRICE_INPUT}
							onfocusout={sanitisePriceInput}
						/>
					</label>
				</fieldset>

				<fieldset class="fieldset col-span-3">
					<legend class="fieldset-legend">Selling Price:</legend>
					<label class="input">
						₦
						<input
							type="number"
							class="grow validator"
							placeholder="1000"
							required
							min={MIN_PRICE_INPUT}
							max={MAX_PRICE_INPUT}
							onfocusout={sanitisePriceInput}
						/>
					</label>
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

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Brand:</legend>
					<input type="text" class="input" placeholder="NA" />
					<div class="label">Optional</div>
				</fieldset>
			</form>

			<div class="mt-4 flex gap-4">
				<button
					type="button"
					class="btn btn-secondary btn-soft ml-auto"
					form={clothingFormId}
					onClick={(_) => {
						clothingForm.reset();
						setPreviewImg("");
					}}
				>
					Reset
				</button>

				<button
					type="button"
					class="btn btn-primary btn-soft "
					form={clothingFormId}
					onClick={(_) => {
						if (clothingForm.reportValidity()) props.dialogParent.close();
					}}
				>
					Create
				</button>
			</div>
		</>
	);
}
