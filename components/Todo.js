import { Notification, Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import moment from "moment/moment";

export default function Todo({ todo }) {
  const supabase = useSupabaseClient();
  const [isLoading, setisLoading] = useState(false);

  const handleComplete = async () => {
    setisLoading(true);
    const { error } = await supabase
      .from("todos")
      .update({
        isComplete: true,
      })
      .eq("id", todo?.id);

    if (error) {
      showNotification({
        title: "Error!",
        message: "Could not perform this operation at the time",
      });
    }

    setisLoading(false);
  };

  return (
    <div>
      <Notification
        color={todo?.isComplete ? "green" : "red"}
        title={
          <h2 className="font-semibold tracking-tight text-[1.2rem]">
            {todo?.title}
          </h2>
        }
        disallowClose
      >
        {todo?.description}
        <div className="flex flex-row-reverse">
          <p className="text-gray-500 text-[0.7rem]">
            Created{" "}
            {moment(new Date(todo?.insertedat)).startOf("minute").fromNow()}
          </p>
        </div>
        {!todo?.isComplete && (
          <Button
            className="mt-6"
            fullWidth
            color="red"
            loading={isLoading}
            onClick={handleComplete}
          >
            Mark complete
          </Button>
        )}
      </Notification>
    </div>
  );
}
