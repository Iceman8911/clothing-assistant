import { useNavigate } from "@solidjs/router";
import SyncIcon from "lucide-solid/icons/folder-sync";
import ListFilterIcon from "lucide-solid/icons/list-filter";
import SearchIcon from "lucide-solid/icons/search";
import SettingsIcon from "lucide-solid/icons/settings";
import ShirtIcon from "lucide-solid/icons/shirt";
import UploadIcon from "lucide-solid/icons/upload-cloud";
import DownloadIcon from "lucide-solid/icons/download-cloud";
import TrashIcon from "lucide-solid/icons/trash-2";
import PlaceholderImage from "~/assets/images/placeholder.webp";
import { createSignal, Show } from "solid-js";
import {
  ClothingItem,
  SerializableClothingDatabaseItem,
} from "~/code/classes/clothing";
import gFirebaseFunctions, { ClothingConflict } from "~/code/database/firebase";
import { gEnumClothingConflictReason, gEnumCustomRoute } from "~/code/enums";
import {
  gClothingItemStore,
  gSearchText,
  gSetSearchText,
  gSettings,
} from "~/code/variables";
import GenericModal from "./shared/modal";
import { ReactiveMap } from "@solid-primitives/map";
import { For } from "solid-js";
import { UUID } from "~/code/types";
import { createStore, produce } from "solid-js/store";
import { Switch } from "solid-js";
import { Match } from "solid-js";
export default function NavBar() {
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = createSignal(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = createSignal(false);
  const [syncIssueArray, setSyncIssueArray] = createStore<
    Array<{ id: UUID; data: ClothingConflict; isResolved: boolean }>
  >([]);

  let searchBar!: HTMLInputElement;

  return (
    <>
      <div class="navbar bg-base-100 shadow-sm">
        <div class="navbar-start">
          <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <ListFilterIcon />
            </div>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a>Lorem</a>
              </li>
              <li>
                <a>Ispum</a>
              </li>
              <li>
                <a>Dolomet</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="navbar-center">
          {/* <a class="btn btn-ghost text-xl">daisyUI</a> */}
          <ShirtIcon class="mr-1" />
          Cloventh
        </div>

        <div class="navbar-end">
          {/* Search Dropdown */}
          <div
            class="dropdown"
            onClick={() => {
              searchBar.focus();
            }}
          >
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              {/* Display an indicator so the user knows that a search term / text is active */}
              <Show
                when={gSearchText()}
                fallback={<SearchIcon class="w-5 h-5" />}
              >
                <div class="indicator">
                  <span class="indicator-item status status-warning "></span>
                  <SearchIcon class="w-5 h-5" />
                </div>
              </Show>
            </div>

            <label class="input input-primary dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm -right-15 md:-right-10 -bottom-10">
              <SearchIcon class="w-4 h-4 mt-auto mb-auto" />
              <input
                type="search"
                required
                placeholder="Search"
                class="max-w-[90%]"
                oninput={(e) => gSetSearchText(e.currentTarget.value)}
                ref={searchBar}
              />
            </label>
          </div>

          <button
            class="btn btn-ghost btn-circle"
            onClick={async (_) => {
              if (isSyncing()) return;

              setIsSyncing(true);

              const serverReadyClothingStore = gClothingItemStore.items
                .entries()
                .map(([id, val]) => [id, val.safeForServer()]);

              gFirebaseFunctions
                .getClothingUpdates(
                  gSettings.syncId,
                  // gClothingItemStore.lastEdited.toISOString(),
                  //@ts-expect-error
                  new Map(serverReadyClothingStore),
                )
                .then((data) => {
                  console.log("Updates are: ", data);
                  setSyncIssueArray(
                    Array.from(
                      data.entries().map(([id, val]) => {
                        return { id, data: val, isResolved: false };
                      }),
                    ),
                  );
                  setIsSyncModalOpen(true);
                })
                .finally(() => {
                  setIsSyncing(false);
                });
            }}
          >
            <div class="indicator">
              <Show
                when={!isSyncing()}
                fallback={<span class="loading loading-spinner"></span>}
              >
                <SyncIcon />
              </Show>
            </div>
          </button>

          <button
            class="btn btn-ghost btn-circle"
            onclick={(_) => navigate(gEnumCustomRoute.SETTINGS)}
          >
            <div class="indicator">
              <SettingsIcon />
              {/* <span class="badge badge-xs badge-primary indicator-item"></span> */}
            </div>
          </button>
        </div>
      </div>

      {/* Sync modal */}
      <GenericModal
        stateAccessor={isSyncModalOpen}
        stateSetter={setIsSyncModalOpen}
      >
        <Show
          when={syncIssueArray.length}
          fallback={<h3>No sync conflicts</h3>}
        >
          <h3>Sync Conflicts Detected</h3>
        </Show>

        <ul class="list bg-base-100 rounded-box shadow-md">
          {/* <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
            Pls resolve :3
          </li> */}

          <For each={syncIssueArray}>
            {(val, index) => {
              console.log(val);

              return (
                <li class="list-row [&_img]:h-auto">
                  {/* The client's image, if any */}
                  <div class="avatar">
                    <div class="mask mask-squircle w-16">
                      <img
                        src={
                          val.data.reason !=
                          gEnumClothingConflictReason.MISSING_ON_CLIENT
                            ? val.data.client.imgUrl || PlaceholderImage
                            : PlaceholderImage
                        }
                        class="cursor-pointer"
                      />
                      Img here
                    </div>
                  </div>

                  <div class="*:text-center">
                    {/* Descriptive text  */}
                    <div class="font-bold whitespace-nowrap">
                      {val.data.reason !=
                      gEnumClothingConflictReason.MISSING_ON_CLIENT
                        ? val.data.client.name
                        : val.data.server.fields.name.stringValue}
                    </div>

                    <div class="text-xs uppercase font-semibold text-warning">
                      <Switch fallback="Your local copy is newer than that on the server">
                        <Match
                          when={
                            val.data.reason ==
                            gEnumClothingConflictReason.MISSING_ON_CLIENT
                          }
                        >
                          This clothing only exists on the server
                        </Match>

                        <Match
                          when={
                            val.data.reason ==
                            gEnumClothingConflictReason.MISSING_ON_SERVER
                          }
                        >
                          This clothing only exists on your device
                        </Match>

                        <Match
                          when={
                            val.data.reason ==
                            gEnumClothingConflictReason.SERVER_HAS_NEWER
                          }
                        >
                          The server's copy is newer than that on your device
                        </Match>
                      </Switch>
                    </div>

                    <div class="flex justify-center items-center">
                      <Show
                        when={!val.isResolved}
                        fallback={
                          <span class="uppercase font-semibold text-success">
                            Resolved
                          </span>
                        }
                      >
                        <button
                          class="btn btn-circle btn-ghost"
                          onClick={(_) => {
                            if (
                              val.data.reason !=
                              gEnumClothingConflictReason.MISSING_ON_CLIENT
                            ) {
                              // Overwrite the data on the server
                              gFirebaseFunctions.addClothing(
                                gSettings.syncId,
                                val.data.client,
                                gClothingItemStore,
                              );
                            } else {
                              // Remove the data from the server
                              gFirebaseFunctions.removeClothing(
                                gSettings.syncId,
                                val.id,
                              );
                            }

                            setSyncIssueArray(
                              produce((state) => {
                                state[index()].isResolved = true;
                              }),
                            );
                          }}
                        >
                          <Show
                            fallback={
                              <div
                                class="tooltip"
                                data-tip="Overwrite using your local copy"
                              >
                                <UploadIcon />
                              </div>
                            }
                            when={
                              val.data.reason ==
                              gEnumClothingConflictReason.MISSING_ON_CLIENT
                            }
                          >
                            <div
                              class="tooltip"
                              data-tip="Delete from the server"
                            >
                              <TrashIcon />
                            </div>
                          </Show>
                        </button>

                        <button
                          class="btn btn-circle btn-ghost"
                          onClick={(_) => {
                            if (
                              val.data.reason !=
                              gEnumClothingConflictReason.MISSING_ON_SERVER
                            ) {
                              // Overwrite the data on the client
                              const {
                                brand,
                                category,
                                color,
                                condition,
                                costPrice,
                                dateBought,
                                dateEdited,
                                description,
                                gender,
                                material,
                                name,
                                occasion,
                                quantity,
                                season,
                                sellingPrice,
                                size,
                                subCategory,
                                imgUrl,
                              } = val.data.server.fields;

                              const { activeWear, casual, formal } =
                                occasion.mapValue.fields;
                              const { fall, spring, summer, winter } =
                                season.mapValue.fields;

                              gClothingItemStore.addItem(
                                new ClothingItem({
                                  id: val.id,
                                  brand: brand.stringValue,
                                  category: category.stringValue,
                                  color: color.stringValue,
                                  condition: condition.stringValue,
                                  costPrice: parseFloat(costPrice.integerValue),
                                  dateBought: new Date(
                                    dateBought.timestampValue,
                                  ),
                                  dateEdited: new Date(
                                    dateEdited.timestampValue,
                                  ),
                                  description: description.stringValue,
                                  gender: gender.stringValue,
                                  material: material.stringValue,
                                  name: name.stringValue,
                                  occasion: {
                                    activeWear: activeWear.booleanValue,
                                    casual: casual.booleanValue,
                                    formal: formal.booleanValue,
                                  },
                                  imgUrl: imgUrl?.stringValue ?? "",
                                  quantity: parseInt(quantity.integerValue),
                                  season: {
                                    fall: fall.booleanValue,
                                    spring: spring.booleanValue,
                                    summer: summer.booleanValue,
                                    winter: winter.booleanValue,
                                  },
                                  sellingPrice: parseFloat(
                                    sellingPrice.integerValue,
                                  ),
                                  size: size.stringValue,
                                  subCategory: subCategory.stringValue,
                                }),
                              );
                            } else {
                              // Remove the data from the client
                              gClothingItemStore.removeItem(val.id);
                            }

                            setSyncIssueArray(
                              produce((state) => {
                                state[index()].isResolved = true;
                              }),
                            );
                          }}
                        >
                          <Show
                            fallback={
                              <div
                                class="tooltip"
                                data-tip="Overwrite using the server's copy"
                              >
                                <DownloadIcon />
                              </div>
                            }
                            when={
                              val.data.reason ==
                              gEnumClothingConflictReason.MISSING_ON_SERVER
                            }
                          >
                            <div
                              class="tooltip"
                              data-tip="Delete from your device"
                            >
                              <TrashIcon />
                            </div>
                          </Show>
                        </button>
                      </Show>
                    </div>
                  </div>

                  {/* The server's image, if any */}
                  <div class="avatar">
                    <div class="mask mask-squircle w-16">
                      <img
                        src={
                          val.data.reason !=
                          gEnumClothingConflictReason.MISSING_ON_SERVER
                            ? val.data.server.fields.imgUrl?.stringValue ||
                              PlaceholderImage
                            : PlaceholderImage
                        }
                        class="cursor-pointer"
                      />
                      Img here
                    </div>
                  </div>
                </li>
              );
            }}
          </For>
        </ul>
      </GenericModal>
    </>
  );
}
