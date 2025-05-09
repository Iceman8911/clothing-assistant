import UpArrowIcon from "lucide-solid/icons/chevron-up";
import { createSignal, For } from "solid-js";

interface TableProps<
	TTableRowStructure extends Record<string, string | number>
> {
	/**
	 * Note that the value of each member is used as the actual header, so `{color:"Color", size:"Size"}` will produce headers "Color" and "Size"
	 */
	header: Partial<Record<keyof TTableRowStructure, string>>;
	/**
	 * Only the contents of shared properties between `header` and this are shown
	 */
	data: TTableRowStructure[];
}

export default function Table<T extends Record<string, any>>(
	props: TableProps<T>
) {
	const { header, data } = props;
	const headerValues = Object.values(header) as string[];
	const headerKeys = Object.keys(header);

	const [dataValues, setDataValues] = createSignal(
		data.map((item) => headerKeys.map((key) => item[key]))
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
					a[headerKeys.indexOf(headerToSortBy ?? selectedHeader())];
				const rowItemB =
					b[headerKeys.indexOf(headerToSortBy ?? selectedHeader())];

				if (selectionDirection() == "asc") {
					return rowItemA > rowItemB ? 1 : -1;
				} else {
					return rowItemB > rowItemA ? 1 : -1;
				}
			});
		});
	};

	return (
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
