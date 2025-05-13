import Fuse from "fuse.js";
import { batch, createMemo, createSignal, For, Match, Switch } from "solid-js";
import { gClothingItems, generateRandomId, gSearchText } from "~/code/shared";
import CreateClothingModal from "~/components/create_clothing";
import UpArrowIcon from "lucide-solid/icons/chevron-up";

export default function InventoryPage() {
	// Filter out only the properties of the clothing that should be displayed
	const filteredRowData = createMemo(() => {
		return [...gClothingItems.values()];
	});

	const tableHeaders = {
		name: "Name",
		color: "Color",
		category: "Category",
		sellingPrice: "Price",
		size: "Size",
		quantity: "Quantity",
	} as const;

	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [idOfClothingItemToEdit, setIdOfClothingItemToEdit] = createSignal<
		string | undefined
	>();

	const headerKeys = Object.keys(tableHeaders) as (keyof typeof tableHeaders)[];

	const [selectedHeader, setSelectedHeader] = createSignal(headerKeys[0]);
	const [selectionDirection, setSelectionDirection] = createSignal<
		"asc" | "desc"
	>("asc");

	const processedRows = createMemo(() => {
		let rowsToReturn = filteredRowData();

		if (filteredRowData()[0] && gSearchText()) {
			const fuseSearch = new Fuse(rowsToReturn, {
				keys: [
					{ name: "name", weight: 2.5 },
					{ name: "color", weight: 2 },
					{ name: "material", weight: 2 },
					{ name: "category", weight: 1.5 },
					{ name: "subCategory", weight: 1.5 },
					{ name: "description", weight: 1.5 },
					"condition",
					"brand",
					"gender",
					"size",
					"costPrice",
					"sellingPrice",
				],
				ignoreLocation: true,
			});

			rowsToReturn = fuseSearch
				.search(gSearchText())
				.map((result) => result.item);
		}

		rowsToReturn = rowsToReturn.toSorted((a, b) => {
			const header = selectedHeader();
			if (selectionDirection() == "asc") {
				return a[header] < b[header] ? -1 : 1;
			} else {
				return a[header] > b[header] ? -1 : 1;
			}
		});

		return rowsToReturn;
	});

	const tableCheckboxIdentifierClass = `chbox-${generateRandomId()}` as const;
	const [checkboxes, setCheckboxes] = createSignal<HTMLInputElement[]>([]);

	return (
		<>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					{/* head */}
					<thead>
						<tr>
							<th>
								<label>
									<input
										type="checkbox"
										class="checkbox"
										value="test"
										// Check/uncheck every other appropriate checkbox
										onClick={(e) => {
											const target = e.target as HTMLInputElement;
											checkboxes().forEach((checkbox) => {
												checkbox.checked = target.checked;
											});
										}}
									/>
								</label>
							</th>
							<For each={headerKeys}>
								{(key) => (
									<th
										class="text-center cursor-pointer hover:bg-base-200"
										onClick={() => {
											batch(() => {
												setSelectionDirection(
													selectionDirection() == "asc" ? "desc" : "asc"
												);

												setSelectedHeader(key);
											});
										}}
									>
										{tableHeaders[key]}
										<Switch>
											<Match when={processedRows().length > 0}>
												<UpArrowIcon
													classList={{
														hidden: selectedHeader() != key,
														"rotate-180": selectionDirection() == "desc",
														"inline-block absolute w-5 h-5":
															selectedHeader() == key,
													}}
												/>
											</Match>
										</Switch>
									</th>
								)}
							</For>
						</tr>
					</thead>
					<tbody>
						<For each={processedRows()}>
							{(rowObject, index) => {
								return (
									<>
										<tr
											class="hover:bg-base-300 *:text-center"
											onClick={() => {
												// Open the clothing creation modal
												setIdOfClothingItemToEdit(rowObject.id);
												setIsModalOpen(true);
											}}
										>
											<td>
												{/* {index() + 1}{" "} */}
												<label>
													<input
														type="checkbox"
														class={"checkbox " + tableCheckboxIdentifierClass}
														// Store the checkbox element in the checkboxes array
														ref={(el) => {
															if (el) {
																setCheckboxes((prev) => [...prev, el]);
															}
														}}
														onClick={(e) => {
															e.stopPropagation();
														}}
													/>
												</label>
											</td>
											<td class="flex flex-col md:flex-row items-center justify-center gap-2">
												<div class="avatar">
													<div class="mask mask-squircle w-16">
														<img src={rowObject.imgData} />
													</div>
												</div>

												<div class="mr-auto ml-auto">{rowObject.name}</div>
											</td>
											<td>{rowObject.color}</td>
											<td>{rowObject.category}</td>
											<td>{rowObject.sellingPrice}</td>
											<td>{rowObject.size}</td>
											<td>{rowObject.quantity}</td>
										</tr>
									</>
								);
							}}
						</For>
					</tbody>
				</table>
			</div>

			<CreateClothingModal
				openState={isModalOpen}
				setOpenState={setIsModalOpen}
				clothIdToEdit={idOfClothingItemToEdit()}
			/>
		</>
	);
}
