import { Alert, Pressable, StyleSheet, View } from "react-native";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import { signupApi, saveTokens } from "@/services/api";

import * as Icon from "phosphor-react-native";

import Input from "@/components/input";
import { useRef, useState } from "react";
import Button from "@/components/Button";
import { useRouter } from "expo-router";

const Register = () => {
  const firstNameRef = useRef("");
  const lastNameRef = useRef("");
  const usernameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const phoneRef = useRef("");

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // handleSumit replace karo
  const handleSumit = async () => {
    if (
      !firstNameRef.current ||
      !lastNameRef.current ||
      !usernameRef.current ||
      !emailRef.current ||
      !passwordRef.current ||
      !phoneRef.current
    ) {
      Alert.alert("Sign Up", "Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await signupApi({
        firstName: firstNameRef.current,
        lastName: lastNameRef.current,
        username: usernameRef.current,
        email: emailRef.current,
        password: passwordRef.current,
        phoneNumber: Number(phoneRef.current), // ← string to number
      });

      // Token save karo
      await saveTokens(response.accessToken, response.token, response.userId);

      console.log("✅ Signup successful:", response);

      Alert.alert("Success", "Account created!", [
        { text: "OK", onPress: () => router.replace("/(tabs)" as any) },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg === "Already Exist") {
        Alert.alert("Sign Up Failed", "Username already taken. Try another.");
      } else {
        Alert.alert("Sign Up Failed", "Something went wrong. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={20} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"}>
            Lets,
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Get Started
          </Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            create an account now to manage all your expenses
          </Typo>

          {/* First Name */}
          <Input
            placeholder="Enter your first name"
            onChangeText={(value) => (firstNameRef.current = value)}
            icon={
              <Icon.User
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />

          {/* Last Name */}
          <Input
            placeholder="Enter your last name"
            onChangeText={(value) => (lastNameRef.current = value)}
            icon={
              <Icon.User
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />

          {/* Username */}
          <Input
            placeholder="Enter your username"
            onChangeText={(value) => (usernameRef.current = value)}
            icon={
              <Icon.UserCircle
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />

          {/* Email */}
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

          {/* Phone */}
          <Input
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            onChangeText={(value) => (phoneRef.current = value)}
            icon={
              <Icon.Phone
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />

          {/* Password */}
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

          <Button loading={isLoading} onPress={handleSumit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              Sign Up
            </Typo>
          </Button>
        </View>

        <View style={styles.footer}>
          <Typo size={15} color={colors.text} style={styles.footerText}>
            Already have an account?
          </Typo>
          <Pressable onPress={() => router.navigate("/(auth)/login")}>
            <Typo size={15} color={colors.primary} fontWeight={"700"}>
              Login
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Register;

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
