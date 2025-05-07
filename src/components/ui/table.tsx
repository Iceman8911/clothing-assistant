import UpArrowIcon from "lucide-solid/icons/chevron-up";
import { createSignal, For } from "solid-js";

interface TableProps<
	TTableRowStructure extends Record<string, string | number>
> {
	header: (keyof TTableRowStructure)[];
	data: TTableRowStructure[];
}

interface ClothData extends Record<string, string | number> {
	cloth: string;
	color: string;
	size: string;
	type: string;
	price: number;
	quantity: number;
}

export default function Table<T extends Record<string, string | number>>() {
	// props?: TableProps<T>
	// FIXME: Get rid of this once the API is ready
	const dummyTableData: TableProps<ClothData> = {
		header: ["cloth", "color", "size", "type", "price", "quantity"],
		data: [
			{
				cloth: "T-Shirt",
				color: "Red",
				size: "L",
				type: "T-Shirt",
				price: 100,
				quantity: 10,
			},
			{
				cloth: "Jeans",
				color: "Blue",
				size: "M",
				type: "Jeans",
				price: 50,
				quantity: 20,
			},
			{
				cloth: "Jacket",
				color: "Black",
				size: "S",
				type: "Jacket",
				price: 150,
				quantity: 5,
			},
			{
				cloth: "Sweater",
				color: "White",
				size: "L",
				type: "Sweater",
				price: 120,
				quantity: 15,
			},
			{
				cloth: "Dress",
				color: "Red",
				size: "M",
				type: "Dress",
				price: 80,
				quantity: 25,
			},
			{
				cloth: "Gloves",
				color: "Black",
				size: "M",
				type: "Gloves",
				price: 20,
				quantity: 30,
			},
		],
	};
	console;
	// const { header, data } = props;
	const { header, data } = dummyTableData;
	const headerValues = (Object.values(header) as string[]).map(
		(val) => val[0].toUpperCase() + val.slice(1)
	);
	const [dataValues, setDataValues] = createSignal(
		data.map((item) => Object.values(item))
	);

	const [selectedHeader, setSelectedHeader] = createSignal(headerValues[0]);
	const [selectionDirection, setSelectionDirection] = createSignal<
		"asc" | "desc"
	>("asc");

	const tableCheckboxIdentifierClass =
		`checkbox-${crypto.randomUUID()}` as const;
	const [checkboxes, setCheckboxes] = createSignal<HTMLInputElement[]>([]);

	// TODO: Improve this so only the required elements are moved
	const setSelectedDirectionAndSort = (
		direction: "asc" | "desc",
		headerToSortBy?: string
	) => {
		setSelectionDirection(direction);

		setDataValues((val) => {
			return val.toSorted((a, b) => {
				const rowItemA =
					a[headerValues.indexOf(headerToSortBy ?? selectedHeader())];
				const rowItemB =
					b[headerValues.indexOf(headerToSortBy ?? selectedHeader())];

				if (selectionDirection() == "asc") {
					return rowItemA > rowItemB ? 1 : -1;
				} else {
					return rowItemB > rowItemA ? 1 : -1;
				}
			});
		});
	};

	let tableElement!: HTMLTableElement;

	return (
		<div class="overflow-x-auto">
			<table class="table table-zebra" ref={tableElement}>
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
						<For each={headerValues}>
							{(value) => (
								<th
									class="text-center cursor-pointer hover:bg-base-200"
									onClick={() => {
										if (selectedHeader() != value) {
											setSelectedDirectionAndSort("asc", value);
										} else {
											setSelectedDirectionAndSort(
												selectionDirection() == "asc" ? "desc" : "asc"
											);
										}

										setSelectedHeader(value);
									}}
								>
									{value}
									<UpArrowIcon
										classList={{
											hidden: selectedHeader() != value,
											"rotate-180": selectionDirection() == "desc",
											"inline-block absolute w-5 h-5":
												selectedHeader() == value,
										}}
									/>
								</th>
							)}
						</For>
					</tr>
				</thead>
				<tbody>
					<For each={dataValues()}>
						{(value, index) => {
							return (
								<>
									<tr class="hover:bg-base-300">
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
												/>
											</label>
										</th>
										<For each={value}>
											{(val) => <td class="text-center">{val}</td>}
										</For>
									</tr>
								</>
							);
						}}
					</For>
				</tbody>
			</table>
		</div>
	);
}
