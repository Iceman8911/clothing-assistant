import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { onMount, Suspense } from "solid-js";
import "./app.css";
import HomePage from "./routes";
import InventoryPage from "./routes/inventory";
import ReportPage from "./routes/reports";
import SettingsPage from "./routes/settings";
import NavBar from "~/components/navbar";
import { gEnumCustomRoute, gEnumReactiveMember } from "./code/enums";
import Dock from "./components/dock";
import { gClothingItemStore, gDefaultSettings } from "./code/variables";
import { gSetSettings, gSettings } from "./code/variables";
import { AlertToast } from "./components/shared/alert-toast";
import { ClothingItem } from "./code/classes/clothing";
import gFirebaseFunctions from "./code/database/firebase";

export default function App() {
  onMount(() => {
    // load all the clothing from storage
    gClothingItemStore.store.iterate<ClothingItem, void>((clothing) => {
      gClothingItemStore.items.set(clothing.id, new ClothingItem(clothing));
    });

    // set the accurate `lastEdited` timestamp
    gClothingItemStore.lastEdited =
      gClothingItemStore.storeLastEdited[gEnumReactiveMember.ACCESSOR]();

    // TODO: sync any pending clothing items `properly`
    gClothingItemStore.pendingSync[gEnumReactiveMember.ACCESSOR].forEach(
      (clothingId) => {
        const clothing = gClothingItemStore.items.get(clothingId)!;

        gFirebaseFunctions
          .getClothing(clothingId)
          .then((clothingDatabaseData) => {
            console.log(clothingDatabaseData);
            if (
              new Date(clothingDatabaseData.fields.dateEdited.timestampValue) <
              clothing.dateEdited
            ) {
              clothing.safeForServer.then((data) =>
                gFirebaseFunctions.addClothing(data),
              );
            }
          });
      },
    );
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
