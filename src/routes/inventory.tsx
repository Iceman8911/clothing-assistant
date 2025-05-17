import Fuse, { type IFuseOptions } from "fuse.js";
import SquarePen from "lucide-solid/icons/square-pen";
import Trash2 from "lucide-solid/icons/trash-2";
import HandCoins from "lucide-solid/icons/hand-coins";
import Blocks from "lucide-solid/icons/blocks";
import UpArrowIcon from "lucide-solid/icons/chevron-up";
import HistoryIcon from "lucide-solid/icons/history";
import { batch, createMemo, createSignal, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Portal } from "solid-js/web";
import { type ClothingItem } from "~/code/classes/clothing";
import { gClothingItems, generateRandomId, gSearchText } from "~/code/shared";
import CreateClothingModal from "~/components/create_clothing";
import DeleteModal from "~/components/shared/delete-modal";
import GenericModal from "~/components/shared/modal";
import RestockModal from "~/components/shared/restock-modal";

export default function InventoryPage() {
  // Filter out only the properties of the clothing that should be displayed
  const filteredRowData = createMemo(() => {
    return [...gClothingItems.values()];
  });

  const tableHeaders = {
    name: "Name",
    color: "Color",
    category: "Category",
    sellingPrice: "Price",
    size: "Size",
    quantity: "Quantity",
  } as const;

  const [isClothingModalOpen, setIsClothingModalOpen] = createSignal(false);
  const [idOfClothingItemToEdit, setIdOfClothingItemToEdit] = createSignal<
    string | undefined
  >();
  const currentClothingItem = createMemo((_) =>
    gClothingItems.get(idOfClothingItemToEdit() ?? ""),
  );

  const headerKeys = Object.keys(tableHeaders) as (keyof typeof tableHeaders)[];

  const [selectedHeader, setSelectedHeader] = createSignal(headerKeys[0]);
  const [selectionDirection, setSelectionDirection] = createSignal<
    "asc" | "desc"
  >("asc");

  const processedRows = createMemo(() => {
    let rowsToReturn = filteredRowData();

    if (filteredRowData()[0] && gSearchText()) {
      const fuseOptions: IFuseOptions<ClothingItem> = {
        keys: [
          { name: "name", weight: 5 },
          { name: "color", weight: 4.5 },
          { name: "description", weight: 4.5 },
          { name: "gender", weight: 1.5 },
          { name: "material", weight: 2.5 },
          { name: "category", weight: 3.5 },
          { name: "subCategory", weight: 3.5 },
          "condition",
          "brand",
          "size",
          "costPrice",
          "sellingPrice",
        ],
        threshold: 0.4,
        ignoreLocation: true,
      };

      const fuseSearch = new Fuse(rowsToReturn, fuseOptions);
      let fuseSearchResult = fuseSearch
        .search(gSearchText().trim())
        .map((result) => result.item);

      if (fuseSearchResult.length / rowsToReturn.length <= 0.2) {
        // TODO: Display a text saying that the search algorithm expanded its threshold
        // Try again but with lower threshold
        fuseSearchResult = new Fuse(rowsToReturn, {
          ...fuseOptions,
          threshold: 0.53,
        })
          .search(gSearchText().trim())
          .map((result) => result.item);
      }

      rowsToReturn = fuseSearchResult;
    } else {
      rowsToReturn = rowsToReturn.toSorted((a, b) => {
        const header = selectedHeader();
        if (selectionDirection() == "asc") {
          return a[header] < b[header] ? -1 : 1;
        } else {
          return a[header] > b[header] ? -1 : 1;
        }
      });
    }

    return rowsToReturn;
  });

  const tableCheckboxIdentifierClass = `chbox-${generateRandomId()}` as const;
  const [checkboxes, setCheckboxes] = createSignal<HTMLInputElement[]>([]);

  let tableRowMenuElement!: HTMLUListElement;
  const [isTableRowMenuOpen, setIsTableRowMenuOpen] = createSignal(false);
  const [tableRowMenuData, setTableRowMenuData] = createStore<{
    x: number;
    y: number;
    /**
      The clothing item that the menu would affect
    */
    data: ClothingItem | null;
  }>({
    x: 0,
    y: 0,
    data: null,
  });

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    createSignal(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = createSignal(false);

  return (
    <>
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm md:table-md">
          {/* head */}
          <thead>
            <tr class="*:text-center">
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
                    class="cursor-pointer hover:bg-base-200"
                    onClick={() => {
                      batch(() => {
                        setSelectionDirection(
                          selectionDirection() == "asc" ? "desc" : "asc",
                        );

                        setSelectedHeader(key);
                      });
                    }}
                  >
                    {tableHeaders[key]}
                    <Show when={processedRows().length > 0}>
                      <UpArrowIcon
                        classList={{
                          hidden: selectedHeader() != key,
                          "rotate-180": selectionDirection() == "desc",
                          "inline-block absolute w-5 h-5":
                            selectedHeader() == key,
                        }}
                      />
                    </Show>
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
                      class="relative hover:bg-base-300 *:text-center"
                      onClick={(e) => {
                        // Open the table menu for each row
                        setIsTableRowMenuOpen(true);
                        setTableRowMenuData(
                          produce((state) => {
                            // So the menu doesn't clip out of the screen
                            state.x =
                              e.x + tableRowMenuElement.clientWidth <
                              window.innerWidth
                                ? e.x
                                : window.innerWidth -
                                  tableRowMenuElement.clientWidth;
                            state.y = e.y;
                            state.data = rowObject;
                          }),
                        );
                      }}
                    >
                      <td>
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
                      </td>
                      <td class="flex flex-col md:flex-row items-center justify-center gap-2">
                        <div class="avatar">
                          <div class="mask mask-squircle w-16">
                            <img src={rowObject.imgData} />
                          </div>
                        </div>

                        <div class="mr-auto ml-auto">{rowObject.name}</div>
                      </td>
                      <td>{rowObject.color}</td>
                      <td>{rowObject.category}</td>
                      <td>{rowObject.sellingPrice}</td>
                      <td>{rowObject.size}</td>
                      <td>{rowObject.quantity}</td>
                    </tr>
                  </>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>

      <Portal>
        <Show when={isTableRowMenuOpen()}>
          {/* Menu wrapper */}
          <div
            class="inset-0 absolute w-screen h-screen"
            onClick={() => setIsTableRowMenuOpen(false)}
          >
            <ul
              class="menu menu-sm menu-horizontal border border-neutral bg-base-200 rounded-box w-fit inset-0 absolute max-h-fit grid grid-cols-2 [&_a]:gap-1 [&_svg]:h-5 [&_svg]:w-5"
              style={{
                translate: `${tableRowMenuData.x}px ${tableRowMenuData.y}px`,
              }}
              ref={tableRowMenuElement}
              onClick={(_) => {
                setIdOfClothingItemToEdit(tableRowMenuData.data!.id);
              }}
            >
              <li
                onClick={(_) => {
                  // Open the clothing creation modal
                  setIsClothingModalOpen(true);
                }}
              >
                <a>
                  <SquarePen />
                  View/Edit
                </a>
              </li>
              <li>
                <a class="text-success">
                  <HandCoins />
                  Sell
                </a>
              </li>
              <li
                onClick={(_) => {
                  setIsRestockModalOpen(true);
                }}
              >
                <a>
                  <Blocks />
                  Restock
                </a>
              </li>
              <li
                onClick={(_) => {
                  // Open the delete confirmation modal
                  setIsConfirmDeleteModalOpen(true);
                }}
              >
                <a class="text-error">
                  <Trash2 />
                  Delete
                </a>
              </li>
              <li
                onClick={(_) => {
                  // setIsConfirmDeleteModalOpen(true);
                }}
              >
                <a class="text-info">
                  <HistoryIcon />
                  View History
                </a>
              </li>
            </ul>
          </div>
        </Show>
      </Portal>

      <CreateClothingModal
        stateAccessor={isClothingModalOpen}
        stateSetter={setIsClothingModalOpen}
        clothIdToEdit={idOfClothingItemToEdit()}
      />

      <DeleteModal
        stateAccessor={isConfirmDeleteModalOpen}
        stateSetter={setIsConfirmDeleteModalOpen}
        onDelete={() => {
          gClothingItems.delete(idOfClothingItemToEdit()!);
        }}
      ></DeleteModal>

      <RestockModal
        stateAccessor={isRestockModalOpen}
        stateSetter={setIsRestockModalOpen}
        items={[currentClothingItem()]}
      ></RestockModal>
    </>
  );
}
