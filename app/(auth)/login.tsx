import { Alert, Pressable, StyleSheet, View } from "react-native";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper"; // ⚠️ ye missing ho sakta hai
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";

import * as Icon from "phosphor-react-native";

import Input from "@/components/input";
import { useRef, useState } from "react";
import Button from "@/components/Button";
import { useRouter } from "expo-router"

const Login = () => {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSumit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please enter both email and password");
      return;
    }
    console.log("Email:", emailRef.current);
    console.log("Password:", passwordRef.current);
    console.log("Good To Go");
  };
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={20} />
        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"}>
            Hey,
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Welcome back!
          </Typo>
        </View>
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Login Now To Track All Your Expenses
          </Typo>
          <Input
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
            icon={
              <Icon.At
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />
          <Input
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            icon={
              <Icon.Lock
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />
          <Typo size={15} color={colors.text} style={{ alignSelf: "flex-end" }}>
            Forgot Password?
          </Typo>

          <Button loading={isLoading} onPress={handleSumit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              Login
            </Typo>
          </Button>
        </View>
        <View style={styles.footer}>
          <Typo size={15} color={colors.text} style={styles.footerText}>
            Dont have an account?
          </Typo>
          <Pressable onPress={() => router.navigate("/(auth)/register")}>
            <Typo size={15} color={colors.primary} fontWeight={"700"}>
              Sign Up
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },

  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },

  form: {
    gap: spacingY._20,
  },

  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: colors.text,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },

  footerText: {
    textAlign: "center",
    color: colors.text,
    fontSize: verticalScale(15),
  },
});
