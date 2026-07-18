import "./style.css";
import Realm, { Shadow } from "@guifendjy/shadow-realm";

// directive
import sEffectFocusPlugin from "./directives/s-effect-focus";
import sHoverPlugin from "./directives/s-hover";

// stores
import BillStore from "./stores/bills";
import ToastStore from "./stores/toast";
import SelectedBillStore from "./stores/selectedBill";
import BudgetStore from "./stores/budget";
import HelpersStore from "./stores/helpers";
import OpenPanelStore from "./stores/openPanel";
import userStore from "./stores/userStore";
// states
import HeaderState from "./states/header";
import FieldEditState from "./states/fieldEdit";

// register store
Shadow.store("UserStore", userStore);

Shadow.store("BillStore", BillStore);
Shadow.store("ToastStore", ToastStore);
Shadow.store("SelectedBillStore", SelectedBillStore);
Shadow.store("BudgetStore", BudgetStore);

Shadow.store("HelpersStore", HelpersStore);
Shadow.store("OpenPanelStore", OpenPanelStore);

// register states
Shadow.state("HeaderState", HeaderState);
Shadow.state("FieldEditState", FieldEditState);

// register directives
Shadow.directive("s-effect-focus", sEffectFocusPlugin);
Shadow.directive("s-hover", sHoverPlugin);

const AppRoot = new Realm();
AppRoot.initialize();
