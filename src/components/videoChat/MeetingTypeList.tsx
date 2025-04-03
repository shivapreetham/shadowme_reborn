"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import HomeCard from "./HomeCard";
import Loader from "./Loader";
import MeetingModal from "./MeetingModal";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/app/hooks/use-toast";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { useCurrentUserContext } from "@/context/CurrentUserProvider";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  // Get current user from context
  const { currentUser } = useCurrentUserContext();
  const loadingUser = !currentUser;

  const createMeeting = async () => {
    if (!client || !currentUser) return;
    try {
      if (!values.dateTime) {
        toast({ title: "Please select a date and time" });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");

      const startsAt = values.dateTime.toISOString();
      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: { starts_at: startsAt, custom: { description, userId: currentUser.id } },
      });

      setCallDetail(call);
      if (!values.description) {
        router.push(`videoChat/meeting/${call.id}`);
      }
      toast({ title: "Meeting Created" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to create Meeting" });
    }
  };

  if (!client || loadingUser) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        icon={<i className="fa-solid fa-video text-blue-500 text-lg" />}
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
      />
      <HomeCard
        icon={<i className="fa-solid fa-sign-in-alt text-blue-400 text-lg" />}
        title="Join Meeting"
        description="via invitation link"
        className="bg-blue-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100"
        handleClick={() => setMeetingState("isJoiningMeeting")}
      />
      <HomeCard
        icon={<i className="fa-solid fa-calendar-plus text-indigo-500 text-lg" />}
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-indigo-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100"
        handleClick={() => setMeetingState("isScheduleMeeting")}
      />
      <HomeCard
        icon={<i className="fa-solid fa-film text-gray-600 text-lg" />}
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
        handleClick={() => router.push("/recordings")}
      />

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
          className="rounded-xl bg-white backdrop-filter backdrop-blur-md bg-opacity-90"
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-gray-700">Add a description</label>
            <Textarea
              className="border border-gray-200 rounded-lg bg-gray-50 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 text-sm"
              onChange={(e) => setValues({ ...values, description: e.target.value })}
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-sm font-medium text-gray-700">Select Date and Time</label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date: Date | null) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded-lg bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: "Link Copied" });
          }}
          icon={<i className="fa-solid fa-check-circle text-green-500 text-4xl" />}
          buttonIcon={<i className="fa-solid fa-copy text-white" />}
          className="text-center rounded-xl bg-white backdrop-filter backdrop-blur-md bg-opacity-90"
          buttonText="Copy Meeting Link"
          buttonClassName="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center rounded-xl bg-white backdrop-filter backdrop-blur-md bg-opacity-90"
        buttonText="Join Meeting"
        buttonClassName="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border border-gray-200 rounded-lg bg-gray-50 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 text-sm"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center rounded-xl bg-white backdrop-filter backdrop-blur-md bg-opacity-90"
        buttonText="Start Meeting"
        buttonClassName="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
