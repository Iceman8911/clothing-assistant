import { For } from "solid-js";

interface TableProps<TTableRowStructure extends Record<string, string>> {
	header: TTableRowStructure;
	data: TTableRowStructure[];
}

interface ClothData extends Record<string, string> {
	cloth: string;
	color: string;
	size: string;
	type: string;
	price: string;
	quantity: string;
}

export default function Table<T extends Record<string, string>>() {
	// props?: TableProps<T>
	// FIXME: Get rid of this once the API is ready
	const dummyTableData: TableProps<ClothData> = {
		header: {
			cloth: "Cloth",
			color: "Color",
			size: "Size",
			type: "Type",
			price: "Price",
			quantity: "Quantity",
		},
		data: [
			{
				cloth: "T-Shirt",
				color: "Red",
				size: "L",
				type: "T-Shirt",
				price: "100",
				quantity: "10",
			},
			{
				cloth: "Jeans",
				color: "Blue",
				size: "M",
				type: "Jeans",
				price: "50",
				quantity: "20",
			},
			{
				cloth: "Jacket",
				color: "Black",
				size: "S",
				type: "Jacket",
				price: "150",
				quantity: "5",
			},
			{
				cloth: "Sweater",
				color: "White",
				size: "L",
				type: "Sweater",
				price: "120",
				quantity: "15",
			},
			{
				cloth: "Dress",
				color: "Red",
				size: "M",
				type: "Dress",
				price: "80",
				quantity: "25",
			},
			{
				cloth: "Gloves",
				color: "Black",
				size: "M",
				type: "Gloves",
				price: "20",
				quantity: "30",
			},
		],
	};
	console;
	// const { header, data } = props;
	const { header, data } = dummyTableData;
	const headerValues = Object.values(header);
	const dataValues = data.map((item) => Object.values(item));

	return (
		<div class="overflow-x-auto">
			<table class="table table-zebra">
				{/* head */}
				<thead>
					<tr>
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<For each={headerValues}>
							{(value) => <th class="text-center">{value}</th>}
						</For>
					</tr>
				</thead>
				<tbody>
					<For each={dataValues}>
						{(value, index) => {
							return (
								<>
									<tr class="hover:bg-base-300">
										<th class="w-min">
											{/* {index() + 1}{" "} */}
											<label>
												<input type="checkbox" class="checkbox" />
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
