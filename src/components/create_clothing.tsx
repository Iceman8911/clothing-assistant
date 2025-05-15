import { compressImage } from "simple-image-compressor";
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  Match,
  on,
  onMount,
  Setter,
  Switch,
} from "solid-js";
import { createMutable, createStore, produce, unwrap } from "solid-js/store";
import {
  AiJsonResponse,
  understandImageWithGemini,
} from "./../code/image-recognition/ai-api";
import {
  gClothingItems,
  generateRandomId,
  gIsUserConnectedToInternet,
  gSettings,
  SignalProps,
} from "~/code/shared";
import { fileToDataURL } from "~/code/utilities";
import { ClothingItem } from "~/code/classes/clothing";
import { formatDiagnostic } from "typescript";
import Sparkles from "lucide-solid/icons/sparkles";
import { gTriggerAlert } from "./shared/alert-toast";
import GenericModal from "./shared/modal";
import DeleteModal from "./shared/delete-modal";

export default function CreateClothingModal(
  prop: SignalProps & {
    clothIdToEdit?: string;
  },
) {
  const clothingSizes: ClothingItem["size"][] = ["XS", "S", "M", "L", "XL"];
  const clothingCondition: ClothingItem["condition"][] = [
    "New",
    "Used",
    "Refurbished",
  ];
  const clothingColors = [
    "Black",
    "Beige",
    "Blue",
    "Brown",
    "Burgundy",
    "Charcoal",
    "Gray",
    "Green",
    "Khaki",
    "Maroon",
    "Navy",
    "Neon",
    "Orange",
    "Pink",
    "Purple",
    "Red",
    "Tan",
    "Teal",
    "Turquoise",
    "White",
    "Yellow",
    "Multi-color",
    "Printed",
    "Plaid",
    "Striped",
  ] as const;
  const defaultClothingColor = clothingColors[0];
  const clothingMaterials = [
    "Cotton",
    "Acetate",
    "Acrylic",
    "Bamboo",
    "Cashmere",
    "Denim",
    "Faux Fur",
    "Faux Leather",
    "Fleece",
    "Fur",
    "Linen",
    "Mesh",
    "Microfibre",
    "Nylon",
    "Polyester",
    "Rayon",
    "Silk",
    "Spandex",
    "Suede",
    "Velour",
    "Velvet",
    "Viscose",
    "Wool",
  ] as const;
  const defaultClothingMaterial = clothingMaterials[0];
  const clothingColorListId = generateRandomId();
  const clothingMaterialListId = generateRandomId();

  const MIN_NUMBER_INPUT = 0;
  const MAX_NUMBER_INPUT = 999999999;
  const sanitiseNumberInput = (e: FocusEvent) => {
    const target = e.target as HTMLInputElement;

    // Remove invalid things like "e12121" or "121-121"
    if (!target.value) {
      target.value = `${MIN_NUMBER_INPUT}`;
      return;
    }

    const targetValue = parseInt(target.value);
    targetValue > MAX_NUMBER_INPUT
      ? (target.value = `${MAX_NUMBER_INPUT}`)
      : targetValue < MIN_NUMBER_INPUT
        ? (target.value = `${MIN_NUMBER_INPUT}`)
        : target.value;
  };

  const clothingFormId = generateRandomId();

  let clothingDisplay!: HTMLDivElement;
  let clothingForm!: HTMLFormElement;
  let clothingImgInput!: HTMLInputElement;

  /**
   * The actual cloth data
   */
  let clothingItem = new ClothingItem({
    name: "",
    description: "",
    color: "",
    gender: "Unisex",
    quantity: 1,
    category: "Tops",
    subCategory: "Shirt",
    brand: "",
    condition: "New",
    costPrice: 1000,
    sellingPrice: 1000,
    dateBought: new Date(),
    material: "Cotton",
    occasion: { casual: false, activeWear: false, formal: false },
    season: { fall: false, spring: false, summer: false, winter: false },
    size: "M",
    imgData: "",
    imgFile: new File([], ""),
  });

  const isEditMode = () => (prop.clothIdToEdit ? true : false);

  const [isAiGeneratingData, setIsAiGeneratingData] = createSignal(false);
  type FormInputs = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  const formInputElements: FormInputs[] = [];
  onMount(() => {
    // Get all input elements in the form and cache them in an array
    formInputElements.push(
      ...(clothingForm.querySelectorAll(
        "input, select, textarea",
      ) as NodeListOf<FormInputs>),
    );
  });
  createEffect(() => {
    // Disable all inputs when the AI is generating data (so the user wouldn't be tempted to change anything)
    for (const element of formInputElements) {
      element.disabled = isAiGeneratingData();
    }
  });

  // Alter some things depending on if we're creating or editing
  createEffect(
    on([isEditMode, prop.stateAccessor], async () => {
      if (isEditMode()) {
        // clothingItem = new ClothingItem(
        // 	gClothingItems.get(prop.clothIdToEdit!)!
        // );
        const clothingData = gClothingItems.get(prop.clothIdToEdit!)!;
        for (const k in clothingData) {
          if (Object.prototype.hasOwnProperty.call(clothingData, k)) {
            const key = k as keyof ClothingItem;
            //@ts-expect-error
            clothingItem[key] = clothingData[key];
          }
        }
      }

      if (prop.stateAccessor() && clothingItem.imgData) {
        // Also set the file input's value
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(clothingItem.imgFile);
        clothingImgInput.files = dataTransfer.files;
      }
    }),
  );

  const [isConfirmingDelete, setIsConfirmingDelete] = createSignal(false);

  return (
    <>
      <GenericModal
        stateAccessor={prop.stateAccessor}
        stateSetter={prop.stateSetter}
      >
        <div>
          <form
            class="grid grid-cols-6 gap-3"
            id={clothingFormId}
            ref={clothingForm}
          >
            <div
              class={
                "glass border rounded-box col-start-1 col-span-3 row-start-1 row-span-2 bg-contain bg-no-repeat bg-center flex justify-center items-center " +
                (isAiGeneratingData() ? "opacity-50 cursor-not-allowed" : "")
              }
              ref={clothingDisplay}
              style={{
                "background-image": `url(${clothingItem.imgData})`,
              }}
              onClick={() => {
                if (!isAiGeneratingData()) {
                  clothingImgInput.click();
                }
              }}
            >
              <Switch>
                <Match when={clothingItem.imgData}>
                  <button
                    type="button"
                    class={
                      "btn btn-primary btn-soft flex justify-center items-center opacity-75 max-w-full " +
                      (isAiGeneratingData()
                        ? "cursor-not-allowed opacity-50 pointer-events-none"
                        : "cursor-pointer")
                    }
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (
                        isAiGeneratingData() ||
                        !(await gIsUserConnectedToInternet())
                      ) {
                        gTriggerAlert(
                          "error",
                          "Could not connect to a model. Please check your connection and try again later.",
                        );
                        return;
                      }

                      try {
                        setIsAiGeneratingData(true);

                        let aiJsonTextResponse =
                          (await understandImageWithGemini(clothingItem.base64))
                            .text ?? "";

                        // Cleanup the opening and closing braces
                        aiJsonTextResponse = aiJsonTextResponse
                          .replace("```", "")
                          .replace("json", "")
                          .replace("```", "");

                        const aiJsonResponse: AiJsonResponse =
                          JSON.parse(aiJsonTextResponse);

                        // Fill up the appropriate fields
                        for (const i in aiJsonResponse) {
                          if (
                            Object.prototype.hasOwnProperty.call(
                              aiJsonResponse,
                              i,
                            )
                          ) {
                            const key = i as keyof AiJsonResponse;
                            const value = aiJsonResponse[key];

                            const state = clothingItem;
                            switch (key) {
                              case "Name":
                              case "Description":
                              case "Category":
                              case "Material":
                              case "Condition":
                              case "Gender":
                              case "Brand":
                              case "Size":
                                state[
                                  //@ts-expect-error
                                  key.toLowerCase() as keyof ClothingItem
                                ] = value;
                                break;
                              case "Color":
                                state.color = (value as string[]).join(", ");
                                break;
                              case "Season":
                                // Just reset it at first
                                state.season = {
                                  fall: false,
                                  spring: false,
                                  summer: false,
                                  winter: false,
                                };

                                (value as AiJsonResponse["Season"]).forEach(
                                  (val) => {
                                    state.season[
                                      val.toLowerCase() as keyof ClothingItem["season"]
                                    ] = true;
                                  },
                                );
                                break;
                              case "Occasion":
                                // Just reset it at first
                                state.occasion = {
                                  formal: false,
                                  casual: false,
                                  activeWear: false,
                                };

                                (value as AiJsonResponse["Occasion"]).forEach(
                                  (val) => {
                                    if (val == "Active Wear") {
                                      state.occasion.activeWear = true;
                                    } else {
                                      state.occasion[
                                        val.toLowerCase() as keyof ClothingItem["occasion"]
                                      ] = true;
                                    }
                                  },
                                );
                                break;
                              case "Subcategory":
                                state.subCategory =
                                  value as ClothingItem["subCategory"];
                                break;
                            }
                          }
                        }

                        gTriggerAlert(
                          "success",
                          "Data generated successfully!",
                        );
                      } catch (e) {
                        const error = e as Error;

                        gTriggerAlert("error", error.message);
                      }
                      setIsAiGeneratingData(false);
                    }}
                  >
                    <Switch
                      fallback={
                        <p>
                          Generate Data (AI <Sparkles class="inline-block" />)
                        </p>
                      }
                    >
                      <Match when={isAiGeneratingData()}>
                        <span class="loading loading-spinner"></span>
                      </Match>
                    </Switch>
                  </button>
                </Match>
              </Switch>
            </div>

            <fieldset class="fieldset row-start-3 col-span-4">
              <legend class="fieldset-legend">Select an Image</legend>
              <input
                type="file"
                class="file-input"
                required
                ref={clothingImgInput}
                onChange={async (e) => {
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0];

                  if (!file) return;

                  async function compressFile(file: File) {
                    const res = await compressImage(file, {
                      quality: 0.75,
                      type: "image/webp",
                    });
                    return new File([res], file.name, {
                      type: "image/webp",
                    });
                  }

                  clothingItem.addImg(await compressFile(file));
                }}
              />
              <label class="label">Max size 10MB</label>
            </fieldset>

            <fieldset class="fieldset col-span-3">
              <legend class="fieldset-legend">Name:</legend>
              <input
                type="text"
                class="input"
                placeholder="Da Vinci's Leather Vest"
                value={clothingItem.name}
                required
                // value={clothingItem.name}
                onChange={({ target }) => {
                  clothingItem.name = target.value;
                }}
              />
            </fieldset>

            <fieldset class="fieldset col-start-4 col-span-3">
              <legend class="fieldset-legend">Description</legend>
              <textarea
                class="textarea h-24"
                placeholder="A short description about the cloth"
                value={clothingItem.description}
                onChange={({ target }) => {
                  clothingItem.description = target.value;
                }}
              ></textarea>
              <div class="label">Optional</div>
            </fieldset>

            <fieldset class="fieldset col-span-2">
              <legend class="fieldset-legend">Size</legend>
              <select
                class="select"
                onChange={({ target }) => {
                  clothingItem.size = target.value as ClothingItem["size"];
                }}
              >
                <For each={clothingSizes}>
                  {(size) => (
                    <option selected={size === clothingItem.size}>
                      {size}
                    </option>
                  )}
                </For>
              </select>
            </fieldset>

            <fieldset class="fieldset col-span-3">
              <legend class="fieldset-legend">Cost Price:</legend>
              <label class="input">
                ₦
                <input
                  type="number"
                  class="grow validator"
                  placeholder="1000"
                  required
                  min={MIN_NUMBER_INPUT}
                  max={MAX_NUMBER_INPUT}
                  onfocusout={sanitiseNumberInput}
                  onChange={({ target }) => {
                    clothingItem.costPrice = parseInt(target.value);
                  }}
                  value={clothingItem.costPrice}
                />
              </label>
            </fieldset>

            <fieldset class="fieldset col-span-3">
              <legend class="fieldset-legend">Selling Price:</legend>
              <label class="input">
                ₦
                <input
                  type="number"
                  class="grow validator"
                  placeholder="1000"
                  required
                  min={MIN_NUMBER_INPUT}
                  max={MAX_NUMBER_INPUT}
                  onfocusout={sanitiseNumberInput}
                  onChange={({ target }) => {
                    clothingItem.sellingPrice = parseInt(target.value);
                  }}
                  value={clothingItem.sellingPrice}
                />
              </label>
            </fieldset>

            <fieldset class="fieldset col-span-3">
              <legend class="fieldset-legend">Quantity:</legend>
              <label class="input">
                <input
                  type="number"
                  class="grow validator"
                  placeholder="1000"
                  required
                  min={MIN_NUMBER_INPUT}
                  max={MAX_NUMBER_INPUT}
                  onfocusout={sanitiseNumberInput}
                  onChange={({ target }) => {
                    clothingItem.quantity = parseInt(target.value);
                  }}
                  value={clothingItem.quantity}
                />
              </label>
            </fieldset>

            <fieldset class="fieldset col-span-3">
              <legend class="fieldset-legend">Gender:</legend>
              <select
                class="select"
                required
                onChange={({ target }) => {
                  clothingItem.gender = target.value as ClothingItem["gender"];
                }}
              >
                <For
                  each={
                    ["Male", "Female", "Unisex"] as ClothingItem["gender"][]
                  }
                >
                  {(gender) => (
                    <option selected={gender === clothingItem.gender}>
                      {gender}
                    </option>
                  )}
                </For>
              </select>
            </fieldset>

            <fieldset class="fieldset col-span-3 md:col-span-2">
              <legend class="fieldset-legend">Category:</legend>
              <select
                class="select"
                required
                onChange={({ target }) => {
                  clothingItem.category =
                    target.value as ClothingItem["category"];
                }}
              >
                <For
                  each={
                    [
                      "Tops",
                      "Bottoms",
                      "Inner Wear",
                      "Outer Wear",
                    ] as ClothingItem["category"][]
                  }
                >
                  {(category) => (
                    <option selected={category === clothingItem.category}>
                      {category}
                    </option>
                  )}
                </For>
              </select>
            </fieldset>

            <fieldset class="fieldset col-span-3 md:col-span-2">
              <legend class="fieldset-legend">Sub Category:</legend>
              <input
                type="text"
                class="input"
                placeholder="Shirt"
                required
                onChange={({ target }) => {
                  clothingItem.subCategory =
                    target.value as (typeof clothingItem)["subCategory"];
                }}
                value={clothingItem.subCategory}
              />
            </fieldset>

            <fieldset class="fieldset col-span-3 md:col-span-2">
              <legend class="fieldset-legend">Condition</legend>
              <select
                class="select"
                onChange={({ target }) => {
                  clothingItem.condition =
                    target.value as (typeof clothingItem)["condition"];
                }}
              >
                <For each={clothingCondition}>
                  {(condition) => (
                    <option selected={condition === clothingItem.condition}>
                      {condition}
                    </option>
                  )}
                </For>
              </select>
            </fieldset>

            <fieldset class="fieldset col-span-3 md:col-span-2">
              <legend class="fieldset-legend">Material:</legend>
              <input
                type="text"
                class="input"
                placeholder={defaultClothingMaterial}
                list={clothingMaterialListId}
                onChange={({ target }) => {
                  clothingItem.material = target.value;
                }}
                value={clothingItem.material}
              />
              <datalist id={clothingMaterialListId}>
                <For each={clothingMaterials}>
                  {(material) => <option value={material}></option>}
                </For>
              </datalist>
            </fieldset>

            <fieldset class="fieldset col-span-2">
              <legend class="fieldset-legend">Color:</legend>
              <input
                type="text"
                class="input"
                placeholder={defaultClothingColor}
                list={clothingColorListId}
                onChange={({ target }) => {
                  clothingItem.color = target.value;
                }}
                value={clothingItem.color}
              />
              <datalist id={clothingColorListId}>
                <For each={clothingColors}>
                  {(color) => <option value={color}></option>}
                </For>
              </datalist>
            </fieldset>

            <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4 grid grid-cols-2 col-span-4 md:col-span-3 max-w-[100%]">
              <legend class="fieldset-legend">Season</legend>
              <For each={["Spring", "Summer", "Fall", "Winter"] as const}>
                {(season) => (
                  <label class="label">
                    <input
                      type="checkbox"
                      class="checkbox"
                      onChange={(_) => {
                        const key =
                          season.toLowerCase() as keyof (typeof clothingItem)["season"];
                        const isSeasonChecked = clothingItem.season[key];

                        clothingItem.season[key] = !isSeasonChecked;
                      }}
                      checked={
                        clothingItem.season[
                          season.toLowerCase() as keyof (typeof clothingItem)["season"]
                        ]
                      }
                    />
                    {season}
                  </label>
                )}
              </For>
            </fieldset>

            <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4 grid grid-cols-2 col-span-4 md:col-span-3 max-w-[100%]">
              <legend class="fieldset-legend">Occasion</legend>
              <For each={["Casual", "Formal", "Active Wear"] as const}>
                {(occasion) => (
                  <label class="label">
                    <input
                      type="checkbox"
                      class="checkbox"
                      onChange={({ target }) => {
                        if (occasion == "Active Wear") {
                          clothingItem.occasion.activeWear =
                            !clothingItem.occasion.activeWear;
                        } else {
                          const key =
                            occasion.toLowerCase() as keyof (typeof clothingItem)["occasion"];

                          clothingItem.occasion[key] =
                            !clothingItem.occasion[key];
                        }
                      }}
                      checked={
                        occasion == "Active Wear"
                          ? clothingItem.occasion.activeWear
                          : clothingItem.occasion[
                              occasion.toLowerCase() as keyof (typeof clothingItem)["occasion"]
                            ]
                      }
                    />
                    {occasion}
                  </label>
                )}
              </For>
            </fieldset>

            {/* This would be moved up a bit to fit a blank space in the grid that's only visible on wider screens */}
            <fieldset class="fieldset col-span-2 md:col-start-5 md:row-start-7">
              <legend class="fieldset-legend">Brand:</legend>
              <input
                type="text"
                class="input"
                placeholder="NA"
                onChange={({ target }) => {
                  clothingItem.brand = target.value;
                }}
                value={clothingItem.brand}
              />
              <div class="label">Optional</div>
            </fieldset>
          </form>

          <div class="mt-4 flex gap-4">
            <button
              type="button"
              class="btn btn-soft ml-auto"
              classList={{
                "btn-secondary": !isEditMode(),
                "btn-error": isEditMode(),
              }}
              form={clothingFormId}
              onClick={(_) => {
                if (isEditMode()) {
                  setIsConfirmingDelete(true);
                } else {
                  clothingForm.reset();
                }
              }}
            >
              {isEditMode() ? "Delete" : "Reset"}
            </button>

            <button
              type="button"
              class="btn btn-primary btn-soft "
              form={clothingFormId}
              onClick={(_) => {
                if (!isEditMode()) {
                  clothingItem.randomizeId();
                  clothingItem.dateBought = new Date();
                }

                if (clothingForm.reportValidity()) {
                  gClothingItems.set(
                    clothingItem.id,
                    structuredClone(unwrap(clothingItem)),
                  );
                  prop.stateSetter(false);
                }
              }}
            >
              {isEditMode() ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </GenericModal>

      <DeleteModal
        stateAccessor={isConfirmingDelete}
        stateSetter={setIsConfirmingDelete}
        onDelete={() => {
          prop.stateSetter(false);
          gClothingItems.delete(clothingItem.id);
        }}
      ></DeleteModal>
    </>
  );
}
