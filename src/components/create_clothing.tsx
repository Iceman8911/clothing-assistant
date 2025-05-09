import Compressor from "compressorjs";
import { createEffect, createSignal, For, Setter } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { gClothingItems } from "~/code/shared";
import { ClothingItem } from "~/code/types";

export default function CreateClothingModal(prop: {
	openState: boolean;
	setOpenState: Setter<boolean>;
	clothIdToEdit?: string;
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
	let clothingImgInput!: HTMLInputElement;

	const [previewImg, setPreviewImg] = createSignal("");

	function fileToDataURL(file: File) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	/**
	 * The actual cloth data
	 */
	const [clothingItem, setClothingItem] = createStore<ClothingItem>({
		id: "0",
		name: "",
		description: "",
		color: "",
		gender: "Unisex",
		quantity: 1,
		category: "Tops",
		subCategory: "Shirt",
		brand: "",
		condition: "New",
		costPrice: 1000,
		sellingPrice: 1000,
		dateBought: new Date(),
		material: "Cotton",
		occasion: { casual: false, activeWear: false, formal: false },
		season: { fall: false, spring: false, summer: false, winter: false },
		size: "M",
		img: new File([], ""),
	});

	const isEditMode = () => (prop.clothIdToEdit ? true : false);

	// Alter some things depending on if we're creating or editing
	createEffect(async () => {
		if (isEditMode()) {
			setClothingItem(gClothingItems.get(prop.clothIdToEdit!)!);
		}

		if (prop.openState && clothingItem.img.name) {
			setPreviewImg(`url(${await fileToDataURL(clothingItem.img)})`);
			// Also set the file input's value
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(clothingItem.img);
			clothingImgInput.files = dataTransfer.files;
		}
	});

	return (
		<dialog
			class="modal modal-bottom sm:modal-middle"
			open={prop.openState}
			onClose={() => prop.setOpenState(false)}
		>
			<div class="modal-box">
				<form method="dialog">
					<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
						✕
					</button>
				</form>

				{/* The main form */}
				<div>
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
								ref={clothingImgInput}
								onChange={async (e) => {
									const input = e.target as HTMLInputElement;
									const file = input.files?.[0];

									if (!file) return;

									new Compressor(file, {
										quality: 0.75,
										retainExif: true,
										async success(result) {
											const newFile = new File([result], file.name, {
												type: file.type,
											});
											setClothingItem("img", newFile);

											setPreviewImg(`url(${await fileToDataURL(newFile)})`);
										},
										error(err) {
											console.log(err.message);
										},
									});
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
								value={isEditMode() ? clothingItem.name : ""}
								required
								// value={clothingItem.name}
								onChange={({ target }) => {
									setClothingItem("name", target.value);
								}}
							/>
						</fieldset>

						<fieldset class="fieldset col-start-4 col-span-3">
							<legend class="fieldset-legend">Description</legend>
							<textarea
								class="textarea h-24"
								placeholder="A short description about the cloth"
								value={clothingItem.description}
								onChange={({ target }) => {
									setClothingItem("description", target.value);
								}}
							></textarea>
							<div class="label">Optional</div>
						</fieldset>

						<fieldset class="fieldset col-span-2">
							<legend class="fieldset-legend">Size</legend>
							<select
								class="select"
								onChange={({ target }) => {
									setClothingItem("size", target.value as ClothingItem["size"]);
								}}
							>
								<For each={clothingSizes}>
									{(size) => (
										<option selected={size === clothingItem.size}>
											{size}
										</option>
									)}
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
									onChange={({ target }) => {
										setClothingItem("costPrice", parseInt(target.value));
									}}
									value={clothingItem.costPrice}
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
									onChange={({ target }) => {
										setClothingItem("sellingPrice", parseInt(target.value));
									}}
									value={clothingItem.sellingPrice}
								/>
							</label>
						</fieldset>

						<fieldset class="fieldset col-span-3 md:col-span-2">
							<legend class="fieldset-legend">Category:</legend>
							<select
								class="select"
								required
								onChange={({ target }) => {
									setClothingItem(
										"category",
										target.value as (typeof clothingItem)["category"]
									);
								}}
							>
								<For
									each={
										[
											"Tops",
											"Bottoms",
											"Inner Wear",
											"Outer Wear",
										] as ClothingItem["category"][]
									}
								>
									{(category) => (
										<option selected={category === clothingItem.category}>
											{category}
										</option>
									)}
								</For>
							</select>
						</fieldset>

						<fieldset class="fieldset col-span-3 md:col-span-2">
							<legend class="fieldset-legend">Sub Category:</legend>
							<input
								type="text"
								class="input"
								placeholder="Shirt"
								required
								onChange={({ target }) => {
									setClothingItem(
										"subCategory",
										target.value as (typeof clothingItem)["subCategory"]
									);
								}}
								value={clothingItem.subCategory}
							/>
						</fieldset>

						<fieldset class="fieldset col-span-3 md:col-span-2">
							<legend class="fieldset-legend">Condition</legend>
							<select
								class="select"
								onChange={({ target }) => {
									setClothingItem(
										"condition",
										target.value as (typeof clothingItem)["condition"]
									);
								}}
							>
								<For each={clothingCondition}>
									{(condition) => (
										<option selected={condition === clothingItem.condition}>
											{condition}
										</option>
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
								onChange={({ target }) => {
									setClothingItem(
										"material",
										target.value as (typeof clothingItem)["material"]
									);
								}}
								value={clothingItem.material}
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
								onChange={({ target }) => {
									setClothingItem(
										"color",
										target.value as (typeof clothingItem)["color"]
									);
								}}
								value={clothingItem.color}
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
											onChange={({ target }) => {
												const isSeasonChecked =
													clothingItem.season[
														season.toLowerCase() as keyof (typeof clothingItem)["season"]
													];
												setClothingItem(
													"season",
													season.toLowerCase() as keyof (typeof clothingItem)["season"],
													isSeasonChecked ? false : true
												);
											}}
											checked={
												clothingItem.season[
													season.toLowerCase() as keyof (typeof clothingItem)["season"]
												]
											}
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
											onChange={({ target }) => {
												if (occasion == "Active Wear") {
													setClothingItem(
														"occasion",
														"activeWear",
														clothingItem.occasion.activeWear ? false : true
													);
												} else {
													setClothingItem(
														"occasion",
														occasion.toLowerCase() as keyof (typeof clothingItem)["occasion"],
														clothingItem.occasion[
															occasion.toLowerCase() as keyof (typeof clothingItem)["occasion"]
														]
															? false
															: true
													);
												}
											}}
											checked={
												occasion == "Active Wear"
													? clothingItem.occasion.activeWear
													: clothingItem.occasion[
															occasion.toLowerCase() as keyof (typeof clothingItem)["occasion"]
													  ]
											}
										/>
										{occasion}
									</label>
								)}
							</For>
						</fieldset>

						{/* This would be moved up a bit to fit a blank space in the grid that's only visible on wider screens */}
						<fieldset class="fieldset col-span-2 md:col-start-5 md:row-start-6">
							<legend class="fieldset-legend">Brand:</legend>
							<input
								type="text"
								class="input"
								placeholder="NA"
								onChange={({ target }) => {
									setClothingItem("brand", target.value);
								}}
								value={clothingItem.brand}
							/>
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
								if (!isEditMode()) {
									setClothingItem("id", crypto.randomUUID());
									setClothingItem("dateBought", new Date());
								}

								if (clothingForm.reportValidity()) {
									gClothingItems.set(
										clothingItem.id,
										structuredClone(unwrap(clothingItem))
									);
									prop.setOpenState(false);
								}
							}}
						>
							{isEditMode() ? "Save" : "Create"}
						</button>
					</div>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	);
}
