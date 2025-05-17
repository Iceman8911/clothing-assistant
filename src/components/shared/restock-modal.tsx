import { ClothingItem } from "~/code/classes/clothing";
import { gSettings } from "~/code/variables";
import { SignalProps } from "~/code/types";
import GenericModal from "./modal";
import { createEffect, For, onMount } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { createMemo } from "solid-js";

export default function RestockModal(
	props: SignalProps & {
		items: (ClothingItem | undefined)[];
	}
) {
	/** This links each clothing item with some data for the restock stuff */
	const dataMap = new ReactiveMap<ClothingItem, number>();

	createEffect(() => {
		props.items.forEach((item) => {
			dataMap.set(item!, 1);
		});
	});

	return (
		<GenericModal
			stateAccessor={props.stateAccessor}
			stateSetter={props.stateSetter}
		>
			<h2>Restock</h2>
			<For each={props.items}>
				{(item) => (
					<>
						<p class="[&>span]:text-info font-semibold">
							You have <span>{item?.quantity ?? 0}</span>{" "}
							<span>{item?.name}</span> in stock worth{" "}
							<span>
								{gSettings.currency +
									(item?.costPrice ?? 0) * (item?.quantity ?? 0)}
							</span>
							. Adding <span>{dataMap.get(item!)!}</span> more will bring it up
							to <span>{dataMap.get(item!)! + (item?.quantity ?? 0)}</span>.
						</p>

						<fieldset class="fieldset w-fit inline-block *:inline-block *:w-40">
							<div class="mr-4">
								<legend class="fieldset-legend">Quantity to Add:</legend>
								<label class="input">
									<input
										type="number"
										class="grow validator"
										placeholder="1000"
										required
										min={0}
										onChange={({ target }) => {
											dataMap.set(item!, parseInt(target.value));
										}}
										value={dataMap.get(item!)}
									/>
								</label>
							</div>
							<div>
								<legend class="fieldset-legend">Price per Clothing:</legend>
								<label class="input">
									<input
										type="number"
										class="grow validator"
										placeholder="1000"
										required
										min={0}
										onChange={({ target }) => {
											// dataMap.set(item!, parseInt(target.value));
											// TODO: Add history support
											item!.costPrice = parseInt(target.value);
										}}
										value={item?.costPrice}
									/>
								</label>
							</div>
						</fieldset>

						<button
							class="btn btn-soft btn-primary ml-4"
							onClick={(_) => {
								item!.quantity = dataMap.get(item!)! + item!.quantity;
								props.stateSetter(false);
							}}
						>
							Update
						</button>
					</>
				)}
			</For>
		</GenericModal>
	);
}
