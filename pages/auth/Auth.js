import Login from "./Login";
import SignUp from "./SignUp";
import Verify from "./Verify";
import ChangePass from "./ChangePass";
import BottomTab from "../bottomTab/BottomTab";
import EnterEmail from "./EnterEmail";
import { header } from "../../utils/common";
import SuccessPage from "../SuccessPage";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function Auth() {
  return (
    <>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={header({ title: "Sign Up" })}
      />
      <Stack.Screen
        name="Verify"
        component={Verify}
        options={header({ title: "Verify" })}
      />
      <Stack.Screen
        name="SuccessPage"
        component={SuccessPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EnterEmail"
        component={EnterEmail}
        options={header({ title: "Enter Email" })}
      />
      <Stack.Screen
        name="ChangePass"
        component={ChangePass}
        options={header({ title: "Forget Password" })}
      />
    </>
  );
}
