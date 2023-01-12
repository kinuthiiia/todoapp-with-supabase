import { useState } from "react";

import {
  Box,
  Button,
  Input,
  PasswordInput,
  Text,
  Card,
  Space,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";

import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SignIn() {
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const [unconfirmed, setUnconfirmed] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (/^\S+@\S+$/.test(email) == false) {
      showNotification({
        title: "Invalid email",
        message: "Your email seems invalid, please verify.",
        autoClose: 3000,
        color: "red",
      });
      setLoading(false);
      return;
    }

    if (!email || !password) {
      showNotification({
        title: "Supply credentials",
        message: "One or both your credentials missing.",
        autoClose: 3000,
        color: "red",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showNotification({
        title: "Password too short",
        message:
          "Your password's too short, attackers can easily get hold of your account.",
        autoClose: 3000,
        color: "red",
      });

      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (
        !data?.user &&
        !data?.session &&
        error.message == "Invalid login credentials"
      ) {
        // No user. Check from existing user from DB
        const { data, error } = await supabase
          .from("accounts")
          .select()
          .eq("email", email);

        console.log(data, error);

        if (data?.length > 0) {
          // User exists. Password incorrect
          showNotification({
            title: "Invalid credentials",
            message:
              "Incorrect password entered. Try another password or request a new one",
            color: "orange",
            autoClose: 3000,
          });
        } else {
          // Sign up user
          showNotification({
            title: "Signing you up",
            message:
              "We couldn't find an account with these credentials, so we're signing you up",
            autoClose: 3000,
            color: "green",
          });

          const { data: data_signUp, error: error_signUp } =
            await supabase.auth.signUp({
              email,
              password,
            });

          console.log(data_signUp, error_signUp);

          if (error_signUp) {
            // Failed sign up
            showNotification({
              title: "Unexpected error",
              message:
                "Something occured while trying to sign you up. Try again after a while",
              autoClose: 3000,
              color: "red",
            });
          } else {
            // Signed up. Adding user to account table
            const { data, error } = await supabase
              .from("accounts")
              .insert({ email })
              .select();

            console.log(data, error);

            // Display confrim
            if (data?.length > 0) {
              setUnconfirmed(true);
            }
          }
        }
      } else if (
        !data?.user &&
        !data?.session &&
        error.message == "Email not confirmed"
      ) {
        // Unconfirmed user
        setUnconfirmed(true);
      }
    } catch (error) {
      // Failed sign in
      showNotification({
        title: "Unexpected error",
        message:
          "Something occured while trying to sign you in. Try signing in after a while",
        autoClose: 3000,
        color: "red",
      });
    } finally {
      setLoading(false);
      return;
    }
  };

  return (
    <div className="mt-[20%] lg:mt-[5%] ">
      <Box className="space-y-12" sx={{ maxWidth: 300 }} mx="auto">
        <h1 className="font-semibold tracking-tighter">Sign in.</h1>
        {!unconfirmed ? (
          <div className="space-y-6 ">
            <Input
              className="text-black"
              type="email"
              size="lg"
              variant="filled"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              value={password}
              placeholder="Password"
              variant="filled"
              size="lg"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              loaderPosition="right"
              loading={loading}
              color="dark"
              w="100%"
              h={48}
              onClick={handleSubmit}
            >
              Sign In
            </Button>

            <p className="text-gray-400 w-full text-center text-sm">
              Not a member yet? We&apos;ll sign you up.
            </p>
          </div>
        ) : (
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Text weight={500}>Confirm email</Text>
            <Space h={12} />
            <Text size="sm" color="dimmed">
              We signed you up and also sent a confirmation link to your
              mailbox. Check it out , click on the link and you are done
              creating an account.
            </Text>
          </Card>
        )}
      </Box>
    </div>
  );
}
