import UpArrowIcon from "lucide-solid/icons/chevron-up";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Match,
	on,
	Switch,
} from "solid-js";

interface TableProps<
	TTableRowStructure extends Record<string, string | number>
> {
	/**
	 * Note that the value of each member is used as the actual header, so `{color:"Color", size:"Size"}` will produce headers "Color" and "Size"
	 */
	header: Record<keyof TTableRowStructure, string>;
	/**
	 * Only the contents of shared properties between `header` and this are shown
	 */
	rows: TTableRowStructure[];
}

export default function Table<T extends Record<string, string | number>>(
	props: TableProps<T>
) {
	const headerKeys = Object.keys(props.header) as string[];

	const [selectedHeader, setSelectedHeader] = createSignal(headerKeys[0]);
	const [selectionDirection, setSelectionDirection] = createSignal<
		"asc" | "desc"
	>("asc");

	const processedRows = createMemo(() => {
		return props.rows
			.sort((a, b) => {
				if (selectionDirection() == "asc") {
					return a[selectedHeader()] < b[selectedHeader()] ? -1 : 1;
				} else {
					return a[selectedHeader()] > b[selectedHeader()] ? -1 : 1;
				}
			})
			.map((val) => Object.values(val));
	});

	const tableCheckboxIdentifierClass =
		`checkbox-${crypto.randomUUID()}` as const;
	const [checkboxes, setCheckboxes] = createSignal<HTMLInputElement[]>([]);

	return (
		<div class="overflow-x-auto max-h-[80vh]">
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
									{props.header[key]}
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
													onClick={(e) => {
														e.stopPropagation();
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
