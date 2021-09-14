import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import { Platform } from "react-native";

if(Platform.OS === 'android'){
  require('intl')
  require('intl/locale-data/jsonp/pt-BR')
}

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
