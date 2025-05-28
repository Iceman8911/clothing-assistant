import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { onCleanup, onMount, Suspense } from "solid-js";
import "./app.css";
import HomePage from "./routes";
import InventoryPage from "./routes/inventory";
import ReportPage from "./routes/reports";
import SettingsPage from "./routes/settings";
import NavBar from "~/components/navbar";
import {
  gEnumCustomRoute,
  gEnumReactiveMember,
  gEnumStatus,
} from "./code/enums";
import Dock from "./components/dock";
import { gClothingItemStore, gDefaultSettings } from "./code/variables";
import { gSetSettings, gSettings } from "./code/variables";
import { AlertToast, gTriggerAlert } from "./components/shared/alert-toast";
import { ClothingItem } from "./code/classes/clothing";
import gFirebaseFunctions from "./code/database/firebase";
import { gIsUserConnectedToInternet } from "./code/functions";

export default function App() {
  onMount(() => {
    // load all the clothing from storage
    gClothingItemStore.store.iterate<ClothingItem, void>((clothing) => {
      gClothingItemStore.items.set(clothing.id, new ClothingItem(clothing));
    });

    // set the accurate `lastEdited` timestamp
    gClothingItemStore.lastEdited =
      gClothingItemStore.storeLastEdited[gEnumReactiveMember.ACCESSOR]();

    const uploadPendingClothing = () => {
      // Use map to create an array of promises
      const uploadPromises = gClothingItemStore.pendingUpload[
        gEnumReactiveMember.ACCESSOR
      ].map((clothingId, index) => {
        const clothing = gClothingItemStore.items.get(clothingId)!;

        // Return the promise chain for each item
        return gFirebaseFunctions
          .getClothing(gSettings.syncId, clothingId)
          .then((clothingDatabaseData) => {
            if (
              new Date(clothingDatabaseData.fields.dateEdited.timestampValue) <
              clothing.dateEdited
            ) {
              // Return the promise from the nested action if the condition is met
              return clothing.safeForServer().then((data) => {
                gFirebaseFunctions.addClothing(
                  gSettings.syncId,
                  data,
                  gClothingItemStore,
                );
              });
            }
            // If the condition is not met, the outer .then() will implicitly return undefined,
            // which Promise.all handles gracefully. You could also return Promise.resolve() explicitly.
          })
          .catch((error) => {
            // Optional: Handle errors for individual item processing here
            gTriggerAlert(
              gEnumStatus.ERROR,
              `Error processing clothing item ${clothingId}: ${error?.message}`,
            );

            // Re-throw the error so Promise.all's catch block is triggered
            throw error;
          });
      });

      // Use Promise.all to wait for all promises to complete
      Promise.all(uploadPromises).finally(() => {
        // Once all the promises are done, empty the original array.
        gClothingItemStore.pendingUpload[gEnumReactiveMember.SETTER]([]);
      });
      // .then(() => {
      //   // This block will execute only after ALL promises in uploadPromises have resolved
      //   console.log('All pending clothing uploads and checks completed.');
      //   // Perform your action here
      // })
      // .catch((error) => {
      //   // This block will execute if ANY of the promises in uploadPromises reject
      //   console.error('One or more pending clothing uploads failed:', error);
      //   // Handle the error
      // });
    };

    // TODO: sync any pending clothing items `properly`
    uploadPendingClothing();

    // Create an event listener for uploading pending clothing data whenever internet is back
    window.addEventListener("online", async (_) => {
      if (await gIsUserConnectedToInternet()) {
        uploadPendingClothing();
      }
    });
  });
  return (
    <>
      <Router
        root={(props) => (
          <>
            <NavBar />
            <AlertToast />
            <div class="h-[80vh] overflow-y-auto">
              <Suspense>{props.children}</Suspense>
            </div>
            <Dock></Dock>
          </>
        )}
      >
        <Route path={gEnumCustomRoute.HOME} component={HomePage} />
        <Route path={gEnumCustomRoute.STOCK} component={InventoryPage} />
        <Route path={gEnumCustomRoute.REPORTS} component={ReportPage} />
        <Route path={gEnumCustomRoute.SETTINGS} component={SettingsPage} />
      </Router>
    </>
  );
}
