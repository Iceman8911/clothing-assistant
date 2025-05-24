import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { onMount, Suspense } from "solid-js";
import "./app.css";
import HomePage from "./routes";
import InventoryPage from "./routes/inventory";
import ReportPage from "./routes/reports";
import SettingsPage from "./routes/settings";
import NavBar from "~/components/navbar";
import { gCustomRouteEnum } from "./code/enums";
import Dock from "./components/dock";
import {
  gClothingItemPersistentStore,
  gClothingItems,
  gDefaultSettings,
  gPendingClothingToSync,
} from "./code/variables";
import { gSetSettings, gSettings } from "./code/variables";
import { AlertToast } from "./components/shared/alert-toast";
import { ClothingItem } from "./code/classes/clothing";
import {
  gAddClothingItemToServer,
  gGetClothingItemFromDatabase,
} from "./code/database/firebase";

export default function App() {
  onMount(() => {
    // load all the clothing from storage
    gClothingItemPersistentStore.iterate<ClothingItem, void>((clothing) => {
      gClothingItems.set(clothing.id, new ClothingItem(clothing));
    });

    // TODO: sync any pending clothing items `properly`
    gPendingClothingToSync.forEach((clothingId) => {
      const clothing = gClothingItems.get(clothingId)!;

      gGetClothingItemFromDatabase(clothingId).then((clothingDatabaseData) => {
        if (
          new Date(clothingDatabaseData.fields.dateEdited.timestampValue) <
          clothing.dateEdited
        ) {
          clothing.safeForServer.then((data) => gAddClothingItemToServer(data));
        }
      });
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
        <Route path={gCustomRouteEnum.HOME} component={HomePage} />
        <Route path={gCustomRouteEnum.STOCK} component={InventoryPage} />
        <Route path={gCustomRouteEnum.REPORTS} component={ReportPage} />
        <Route path={gCustomRouteEnum.SETTINGS} component={SettingsPage} />
      </Router>
    </>
  );
}
