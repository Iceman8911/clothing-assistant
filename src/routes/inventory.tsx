import { createMemo } from "solid-js";
import { gClothingItems } from "~/code/shared";
import Table from "~/components/ui/table";

export default function InventoryPage() {
	// Filter out only the properties of the clothing that should be displayed
	const filteredRowData = createMemo(() => {
		return [...gClothingItems.values()].map((cloth) => {
			return {
				name: cloth.name,
				color: cloth.color,
				size: cloth.size,
				category: cloth.category,
				sellingPrice: cloth.sellingPrice,
				quantity: cloth.quantity,
			};
		});
	});

	return (
		<>
			<Table
				rows={filteredRowData()}
				header={{
					name: "Name",
					color: "Color",
					size: "Size",
					category: "Category",
					sellingPrice: "Price",
					quantity: "Quantity",
				}}
			/>
		</>
	);
}
