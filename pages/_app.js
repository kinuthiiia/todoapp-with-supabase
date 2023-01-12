import "../styles/globals.css";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

import { MantineProvider, createEmotionCache } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useEffect } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/signin");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          router.push("/");
        }
        if (event === "SIGNED_OUT") {
          router.push("/signin");
        }
      }
    );
  }, [supabase, router]);

  const myCache = createEmotionCache({
    key: "mantine",
    prepend: false,
  });

  return (
    <MantineProvider
      emotionCache={myCache}
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "light",
        fontFamily: "Prompt",
      }}
    >
      <NotificationsProvider>
        <SessionContextProvider
          supabaseClient={supabase}
          initialSession={pageProps.initialSession}
        >
          <Component {...pageProps} />
        </SessionContextProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default MyApp;
