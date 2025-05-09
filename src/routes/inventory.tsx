import { ClothingItem } from "~/code/types";
import Table from "~/components/ui/table";
import { clothingItemSignal } from "./../code/shared";

export default function InventoryPage() {
	const headers: Partial<Record<keyof ClothingItem, any>> = {
		name: "Name",
		color: "Color",
		size: "Size",
		category: "Category",
		sellingPrice: "Price",
		quantity: "Quantity",
	};

	return (
		<>
			<Table data={clothingItemSignal()} header={headers} />
		</>
	);
}
