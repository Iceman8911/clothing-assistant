import Fuse from "fuse.js";
import { batch, createMemo, createSignal, For, Match, Switch } from "solid-js";
import { gClothingItems, generateRandomId, gSearchText } from "~/code/shared";
import CreateClothingModal from "~/components/create_clothing";
import UpArrowIcon from "lucide-solid/icons/chevron-up";

interface TableHeader {
	name: "Name";
	color: "Color";
	size: "Size";
	category: "Category";
	sellingPrice: "Price";
	quantity: "Quantity";
}

export default function InventoryPage() {
	// Filter out only the properties of the clothing that should be displayed
	const filteredRowData = createMemo(() => {
		return [...gClothingItems.values()].map((cloth) => {
			return {
				id: cloth.id,
				name: cloth.name,
				color: cloth.color,
				size: cloth.size,
				category: cloth.category,
				sellingPrice: cloth.sellingPrice,
				quantity: cloth.quantity,
			};
		});
	});

	const tableHeaders: TableHeader = {
		name: "Name",
		color: "Color",
		size: "Size",
		category: "Category",
		sellingPrice: "Price",
		quantity: "Quantity",
	};

	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [idOfClothingItemToEdit, setIdOfClothingItemToEdit] = createSignal<
		string | undefined
	>();

	const headerKeys = Object.keys(tableHeaders) as (keyof TableHeader)[];

	const [selectedHeader, setSelectedHeader] = createSignal(headerKeys[0]);
	const [selectionDirection, setSelectionDirection] = createSignal<
		"asc" | "desc"
	>("asc");

	const processedRows = createMemo(() => {
		let rowsToReturn = filteredRowData();

		if (filteredRowData()[0] && gSearchText()) {
			const searchRowKeys = headerKeys.filter((key) => {
				const type = typeof filteredRowData()[0][key];
				return type == "string" || type == "number";
			});

			const fuseSearch = new Fuse(rowsToReturn, {
				keys: searchRowKeys,
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
											class="hover:bg-base-300"
											onClick={() => {
												// Open the clothing creation modal
												setIdOfClothingItemToEdit(rowObject.id);
												setIsModalOpen(true);
											}}
										>
											<th class="w-min">
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
											</th>
											<For
												each={
													Object.entries(rowObject) as (
														| ["name", string]
														| ["id", string | number]
														| [string, string | number]
													)[]
												}
											>
												{([key, val], i) => {
													return (
														<Switch>
															{/* Don't display the id */}
															<Match when={key != "id"}>
																<td
																	classList={{
																		"flex flex-col md:flex-row items-center justify-center gap-2":
																			key == "name",
																	}}
																>
																	{/* Display a small thumbnail */}
																	<Switch>
																		<Match
																			when={
																				key == "name" &&
																				Object.keys(rowObject).includes("id")
																			}
																		>
																			<div class="avatar">
																				<div class="mask mask-squircle w-16">
																					<img
																						src={
																							gClothingItems.get(
																								rowObject["id"] as string
																							)!.imgData
																						}
																					/>
																				</div>
																			</div>
																		</Match>
																	</Switch>
																	<div
																		class="w-min"
																		classList={{
																			"mr-auto ml-auto": key != "name",
																		}}
																	>
																		{val}
																	</div>
																</td>
															</Match>
														</Switch>
													);
												}}
											</For>
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
