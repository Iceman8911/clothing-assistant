import { createMemo, createSignal } from "solid-js";
import { gClothingItems } from "~/code/shared";
import CreateClothingModal from "~/components/create_clothing";
import ClothingTable from "~/components/ui/table";

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

	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [idOfClothingItemToEdit, setIdOfClothingItemToEdit] = createSignal<
		string | undefined
	>();

	return (
		<>
			<ClothingTable
				rows={filteredRowData()}
				header={{
					name: "Name",
					color: "Color",
					size: "Size",
					category: "Category",
					sellingPrice: "Price",
					quantity: "Quantity",
				}}
				onRowClick={({ id }) => {
					setIdOfClothingItemToEdit(id);
					setIsModalOpen(true);
				}}
			>
			</ClothingTable>

			<CreateClothingModal
				openState={isModalOpen}
				setOpenState={setIsModalOpen}
				clothIdToEdit={idOfClothingItemToEdit()}
			/>
		</>
	);
}
