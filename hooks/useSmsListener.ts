import { useEffect } from "react";
import { Platform } from "react-native";
import { parseSmsApi } from "@/services/api";

export const useSmsListener = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const startListening = async () => {
      try {
        const SmsModule = require("@maniac-tech/react-native-expo-read-sms");
        console.log("SMS Module keys:", Object.keys(SmsModule));

        // ===============================
        // ✅ FIX 1: Proper permission check
        // ===============================
        let granted = false;

        if (SmsModule.checkIfHasSMSPermission) {
          granted = await SmsModule.checkIfHasSMSPermission();
        }

        if (!granted && SmsModule.requestReadSMSPermission) {
          granted = await SmsModule.requestReadSMSPermission();
        }

        console.log("📱 SMS Permission granted:", granted);

        if (!granted) {
          console.log("❌ SMS permission denied");
          return;
        }

        // ===============================
        // ✅ FIX 2: Listener
        // ===============================
        const listenFn =
          SmsModule.startReadSMS || SmsModule.default?.startReadSMS;

        if (listenFn) {
          console.log("✅ SMS Listener started!");

          listenFn((status: any, sms: any, sender: any) => {
            console.log("📩 Raw SMS data:", status, sms, sender);
            console.log("📩 Raw:", JSON.stringify({ status, sms, sender }));

            // ===============================
            // ✅ FIX 3: Clean SMS extraction
            // ===============================
            let smsText = "";

            if (Array.isArray(sms)) {
              smsText = sms[1] || "";
            } else if (typeof sms === "string") {
              smsText = sms;
            }

            console.log("📩 CLEAN SMS:", smsText);

            if (smsText && smsText.length > 0) {
              parseSmsApi(smsText)
                .then((result) => {
                  console.log("✅ Expense parsed:", result);
                })
                .catch((err) => {
                  console.log(
                    "❌ Parse error:",
                    err?.message || err,
                    err?.response?.data
                  );
                });
            }
          });
        } else {
          console.log("❌ startReadSMS not found");
        }
      } catch (err) {
        console.log("SMS Listener error:", err);
      }
    };

    startListening();
  }, []);
};