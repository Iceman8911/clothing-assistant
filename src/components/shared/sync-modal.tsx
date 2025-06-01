import DownloadIcon from "lucide-solid/icons/download-cloud";
import TrashIcon from "lucide-solid/icons/trash-2";
import UploadIcon from "lucide-solid/icons/upload-cloud";
import { For, Match, Show, Switch } from "solid-js";
import { produce, SetStoreFunction } from "solid-js/store";
import PlaceholderImage from "~/assets/images/placeholder.webp";
import { ClothingItem } from "~/code/classes/clothing";
import gFirebaseFunctions from "~/code/database/firebase";
import { gEnumClothingConflictReason } from "~/code/enums";
import { SignalProps, SyncIssueArray } from "~/code/types";
import { gClothingItemStore, gSettings } from "~/code/variables";
import GenericModal from "./modal";

export default function SyncModal(
  props: SignalProps & {
    syncIssueArray: SyncIssueArray;
    setSyncIssueArray: SetStoreFunction<SyncIssueArray>;
  },
) {
  return (
    <GenericModal
      stateAccessor={props.stateAccessor}
      stateSetter={props.stateSetter}
    >
      <Show
        when={props.syncIssueArray.length}
        fallback={<h3>No sync conflicts</h3>}
      >
        <h3>Sync Conflicts Detected</h3>
      </Show>

      <ul class="list bg-base-100 rounded-box shadow-md">
        {/* <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
        Pls resolve :3
      </li> */}

        <For each={props.syncIssueArray}>
          {(val, index) => {
            return (
              <li class="list-row [&_img]:h-auto">
                {/* The client's image, if any */}
                <div class="avatar">
                  <div class="mask mask-squircle w-16 h-16">
                    <img
                      src={
                        val.data.reason !=
                        gEnumClothingConflictReason.MISSING_ON_CLIENT
                          ? val.data.client.imgUrl || PlaceholderImage
                          : PlaceholderImage
                      }
                      class="cursor-pointer aspect-square not-prose"
                    />
                  </div>
                </div>

                <div class="*:text-center">
                  {/* Descriptive text  */}
                  <div class="font-bold">
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

                          props.setSyncIssueArray(
                            produce((state) => {
                              state[index()].isResolved = true;
                            }),
                          );
                        }}
                      >
                        <Show
                          fallback={
                            <div
                              class="tooltip text-info"
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
                            class="tooltip text-error"
                            data-tip="Delete from the server"
                          >
                            <TrashIcon />
                          </div>
                        </Show>
                      </button>

                      <button
                        class="btn btn-circle btn-ghost"
                        onClick={async (_) => {
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
                              await ClothingItem.create({
                                id: val.id,
                                brand: brand.stringValue,
                                category: category.stringValue,
                                color: color.stringValue,
                                condition: condition.stringValue,
                                costPrice: parseFloat(costPrice.integerValue),
                                dateBought: new Date(dateBought.timestampValue),
                                dateEdited: new Date(dateEdited.timestampValue),
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
                                imgFile: undefined,
                              }),
                              false,
                            );
                          } else {
                            // Remove the data from the client
                            gClothingItemStore.removeItem(val.id, false);
                          }

                          props.setSyncIssueArray(
                            produce((state) => {
                              state[index()].isResolved = true;
                            }),
                          );
                        }}
                      >
                        <Show
                          fallback={
                            <div
                              class="tooltip text-info"
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
                            class="tooltip text-error"
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
                  <div class="mask mask-squircle w-16 h-16">
                    <img
                      src={
                        val.data.reason !=
                        gEnumClothingConflictReason.MISSING_ON_SERVER
                          ? val.data.server.fields.imgUrl?.stringValue ||
                            PlaceholderImage
                          : PlaceholderImage
                      }
                      class="cursor-pointer aspect-square not-prose"
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
  );
}
