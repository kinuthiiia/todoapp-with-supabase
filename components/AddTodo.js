import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Modal, TextInput, Textarea, Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";

export default function AddTodo({ isOpen, onClose }) {
  const supabase = useSupabaseClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddtodo = async () => {
    if (!title) {
      setError("Title cannot be empty");
      return;
    }
    setisLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("todos").insert({
      title,
      description,
      isComplete: false,
      user_id: user.id,
    });

    if (error) {
      console.log(user);
      console.log(error.message);
      showNotification({
        title: "Error!",
        message: "Sorry, we could not save your todo.",
        color: "red",
      });
      setisLoading(false);
    } else {
      setisLoading(false);
      showNotification({
        title: "Todo saved!",
        color: "green",
      });
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setDescription(null);
    setTitle(null);
    setisLoading(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleCloseModal}
      title={
        <h2 className="font-semibold tracking-tighter text-[1.7rem]">
          Add todo
        </h2>
      }
    >
      <div className="mt-6 space-y-6 mb-12">
        <TextInput
          label="Title"
          withAsterisk
          placeholder="ex. Go shopping"
          value={title}
          error={error}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
        />
        <Textarea
          label="Description"
          placeholder="Your description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="relative w-full flex flex-row-reverse">
        <Button loading={isLoading} onClick={handleAddtodo} color="dark">
          Save
        </Button>
      </div>
    </Modal>
  );
}
