import { createAsync } from "@solidjs/router";
import DownloadIcon from "lucide-solid/icons/download-cloud";
import TrashIcon from "lucide-solid/icons/trash-2";
import UploadIcon from "lucide-solid/icons/upload-cloud";
import { For, Match, Show, Suspense, Switch } from "solid-js";
import { produce, type SetStoreFunction } from "solid-js/store";
import PlaceholderImage from "~/assets/images/placeholder.webp";
import { ClothingItem } from "~/code/classes/clothing";
import { gEnumClothingConflictReason } from "~/code/enums";
import gFirebaseClientFunctions from "~/code/server/database/firebase-client";
import type { SignalProps, SyncIssueArray } from "~/code/types";
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
					{/* Destructuring here loses reactivity... */}
					{({ id, data }, index) => {
						const localClothing =
							data.reason !== gEnumClothingConflictReason.MISSING_ON_CLIENT
								? gClothingItemStore.items.get(id)
								: null;

						const localClothingImgData = localClothing
							? createAsync(
									() =>
										localClothing.base64() ?? Promise.resolve(PlaceholderImage),
								)
							: () => PlaceholderImage;

						return (
							<li class="list-row [&_img]:h-auto">
								{/* The client's image, if any */}
								<div class="avatar">
									<div class="mask mask-squircle w-16 h-16">
										<Suspense>
											<img
												src={localClothingImgData()}
												alt="Local Clothing"
												class="cursor-pointer aspect-square not-prose"
											/>
										</Suspense>
									</div>
								</div>

								<div class="*:text-center">
									{/* Descriptive text  */}
									<div class="font-bold">
										{data.reason !==
										gEnumClothingConflictReason.MISSING_ON_CLIENT
											? localClothing?.name
											: data.server.name}
									</div>

									<div class="text-xs uppercase font-semibold text-warning">
										<Switch fallback="Your local copy is newer than that on the server">
											<Match
												when={
													data.reason ===
													gEnumClothingConflictReason.MISSING_ON_CLIENT
												}
											>
												This clothing only exists on the server
											</Match>

											<Match
												when={
													data.reason ===
													gEnumClothingConflictReason.MISSING_ON_SERVER
												}
											>
												This clothing only exists on your device
											</Match>

											<Match
												when={
													data.reason ===
													gEnumClothingConflictReason.SERVER_HAS_NEWER
												}
											>
												The server's copy is newer than that on your device
											</Match>
										</Switch>
									</div>

									<div class="flex justify-center items-center">
										<Show
											when={!props.syncIssueArray[index()].isResolved}
											fallback={
												<span class="uppercase font-semibold text-success">
													Resolved
												</span>
											}
										>
											<button
												type="button"
												class="btn btn-circle btn-ghost"
												onClick={async (_) => {
													if (
														data.reason !==
															gEnumClothingConflictReason.MISSING_ON_CLIENT &&
														localClothing
													) {
														// Overwrite the data on the server
														gFirebaseClientFunctions.addClothing(
															gSettings.syncId,
															await localClothing.safeForServer(),
															// gClothingItemStore,
														);
													} else {
														// Remove the data from the server
														gFirebaseClientFunctions.removeClothing(
															gSettings.syncId,
															id,
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
														data.reason ===
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
												type="button"
												class="btn btn-circle btn-ghost"
												onClick={async (_) => {
													if (
														data.reason !==
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
														} = data.server;

														gClothingItemStore.addItem(
															await ClothingItem.create({
																id,
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
																imgFile: await (
																	await fetch(imgUrl)
																).arrayBuffer(),
															}),
															false,
														);
													} else {
														// Remove the data from the client
														gClothingItemStore.removeItem(id, false);
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
														data.reason ===
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
											alt="Server Clothing"
											src={
												data.reason !==
												gEnumClothingConflictReason.MISSING_ON_SERVER
													? data.server.imgUrl || PlaceholderImage
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
