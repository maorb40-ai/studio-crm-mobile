/**
 * @format
 */
import { AppRegistry, I18nManager } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// כל האפליקציה בעברית - כופים RTL תמיד, בדיוק כמו כל שאר המערכת (האתר גם
// כן RTL). זה חייב לקרות כאן, לפני עליית הקומפוננטות, כי React Native קורא
// את הערך הזה פעם אחת בהפעלה - forceRTL אחרי טעינת המסך הראשון לא ישפיע
// עד להפעלה מחדש של האפליקציה, ולכן זה נכתב עוד לפני ה-import של App.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

AppRegistry.registerComponent(appName, () => App);
