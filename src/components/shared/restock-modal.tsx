import { createMemo, createSignal, Show } from "solid-js";
import { ClothingItem } from "~/code/classes/clothing";
import { SignalProps } from "~/code/types";
import { gClothingItemStore, gSettings } from "~/code/variables";
import GenericModal from "./modal";

export default function RestockModal(
  props: SignalProps & {
    item: ClothingItem;
  },
) {
  const DEFAULT_AMOUNT_TO_ADD = 1;

  const clothing = createMemo(() => props.item);
  const [amountToAdd, setAmountToAdd] = createSignal(DEFAULT_AMOUNT_TO_ADD);

  return (
    <GenericModal
      stateAccessor={props.stateAccessor}
      stateSetter={props.stateSetter}
    >
      <h2>Restock - {clothing().name}</h2>

      <>
        <p class="[&>span]:text-info font-semibold">
          You have <span>{clothing().quantity}</span>{" "}
          <span>{clothing().name}</span> in stock worth{" "}
          <span>
            {gSettings.currency + clothing().costPrice * clothing().quantity}
          </span>
          .{" "}
          <Show when={amountToAdd()}>
            Adding <span>{amountToAdd()}</span> more will bring it up to{" "}
            <span>{amountToAdd() + clothing().quantity}</span>.
          </Show>
        </p>

        <fieldset class="fieldset w-fit inline-block *:inline-block">
          <div class="mr-4 w-28 md:w-40">
            <legend class="fieldset-legend">Quantity to Add:</legend>
            <label class="input">
              <input
                type="number"
                class="grow validator"
                placeholder="1000"
                required
                min={0}
                onChange={({ target }) => {
                  setAmountToAdd(parseInt(target.value));
                }}
                value={amountToAdd()}
              />
            </label>
          </div>
          <div class="w-28 md:w-40">
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
                  clothing().costPrice = parseInt(target.value);
                }}
                value={clothing().costPrice}
              />
            </label>
          </div>
        </fieldset>

        <button
          class="btn btn-soft btn-primary ml-4"
          onClick={(_) => {
            clothing().quantity = amountToAdd() + clothing().quantity;
            gClothingItemStore.addItem(clothing());
            setAmountToAdd(DEFAULT_AMOUNT_TO_ADD);
            props.stateSetter(false);
          }}
        >
          Update
        </button>
      </>
    </GenericModal>
  );
}
