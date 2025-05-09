import UpArrowIcon from "lucide-solid/icons/chevron-up";
import {
	batch,
	createEffect,
	createMemo,
	createSignal,
	For,
	Match,
	on,
	Switch,
} from "solid-js";

interface BaseInterface {
	id: string | number;
	[key: string]: string | number;
}
interface TableProps<TTableRowStructure extends BaseInterface> {
	/**
	 * Note that the value of each member is used as the actual header, so `{color:"Color", size:"Size"}` will produce headers "Color" and "Size". No need to include an id name here since it wouldn't be displayed
	 */
	header: Record<Exclude<keyof TTableRowStructure, "id">, string>;
	/**
	 * Only the contents of shared properties between `header` and this are shown. `id` is not included and only used internally
	 */
	rows: TTableRowStructure[];
	/**
	 * Function to call when a row is clicked
	 */
	onRowClick?: (row: TTableRowStructure) => void;
}

export default function Table<T extends BaseInterface>(props: TableProps<T>) {
	const headerKeys = Object.keys(props.header) as string[];

	const [selectedHeader, setSelectedHeader] = createSignal(headerKeys[0]);
	const [selectionDirection, setSelectionDirection] = createSignal<
		"asc" | "desc"
	>("asc");

	const processedRows = createMemo(() => {
		return props.rows.toSorted((a, b) => {
			const header = selectedHeader();
			if (selectionDirection() == "asc") {
				return a[header] < b[header] ? -1 : 1;
			} else {
				return a[header] > b[header] ? -1 : 1;
			}
		});
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
						{(rowObject, index) => {
							return (
								<>
									<tr
										class="hover:bg-base-300"
										onClick={() => {
											if (props.onRowClick) {
												props.onRowClick(rowObject);
											}
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
										<For each={Object.entries(rowObject)}>
											{([key, val]) => {
												return (
													<Switch>
														<Match when={key != "id"}>
															<td class="text-center">{val}</td>
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
	);
}
