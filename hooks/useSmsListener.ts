import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { parseSmsApi } from "@/services/api";

export const useSmsListener = () => {
  const lastSmsRef = useRef<string>("");
  const lastSmsTimeRef = useRef<number>(0);

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
            // sms sometimes comes as a real array [sender, message], and
            // sometimes as a stringified "[sender, message]" — handle both.
            let smsText = "";

            if (Array.isArray(sms)) {
              smsText = (sms[1] || "").toString().trim();
            } else if (typeof sms === "string") {
              const trimmed = sms.trim();

              if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                const inner = trimmed.slice(1, -1);
                const commaIndex = inner.indexOf(",");
                smsText =
                  commaIndex !== -1
                    ? inner.slice(commaIndex + 1).trim()
                    : inner.trim();
              } else {
                smsText = trimmed;
              }
            }

            console.log("📩 CLEAN SMS:", smsText);

            // ===============================
            // ✅ FIX 4: Ignore truncated multi-part SMS
            // ===============================
            // Long SMS arrives across multiple parts on Android; the
            // trailing/leading fragments are too short to be a real
            // bank SMS, so skip them instead of sending to the API.
            const MIN_SMS_LENGTH = 20;

            if (smsText.length < MIN_SMS_LENGTH) {
              console.log(
                "⏭️ Skipping short/truncated SMS part:",
                smsText
              );
              return;
            }

            // ===============================
            // ✅ FIX 5: Duplicate SMS dedup
            // ===============================
            // The native listener sometimes fires the same SMS multiple
            // times in quick succession — skip repeats within 5 seconds.
            const now = Date.now();
            if (
              smsText === lastSmsRef.current &&
              now - lastSmsTimeRef.current < 5000
            ) {
              console.log("⏭️ Duplicate SMS skipped");
              return;
            }
            lastSmsRef.current = smsText;
            lastSmsTimeRef.current = now;

            if (smsText && smsText.length > 0) {
              parseSmsApi(smsText)
                .then((response) => {
                  if (response?.error) {
                    if (response.error === "not a bank SMS") return;
                    console.log("❌ Parse error:", response.error);
                    return;
                  }
                  console.log("SMS processed:", response);
                })
                .catch((err) => {
                  if (err?.response?.data?.error === "not a bank SMS") return;
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