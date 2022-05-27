import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

//Screens
import HomeScreen from './Screens/HomeScreen';

const AppStack = createNativeStackNavigator();

const createHomeStack = () =>
<AppStack.Navigator>
  <AppStack.Screen name="Home" component={HomeScreen} options={{headerShown:false}}/>
</AppStack.Navigator>

export default function App() {
  return (
    <NavigationContainer>
      <AppStack.Navigator>
        <AppStack.Screen name="HOME" children={createHomeStack} options={{headerShown:false}}/>
      </AppStack.Navigator>
    </NavigationContainer>
  );
}