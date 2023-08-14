import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "The playportal dashboard.",
};

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-background p-12 text-center flex justify-center">
      <div className="max-w-[500px] flex flex-col items-center">
        <h1 className=" text-5xl font-bold tracking-tighter dark:text-zinc-200 pb-4">
          Welcome
        </h1>
        <p className="text-muted-foreground  leading-6 text-center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo, non!
          Nihil labore ipsam, necessitatibus itaque molestias modi aperiam ex,
          excepturi exercitationem aliquam delectus quis quas voluptas
          doloremque reiciendis molestiae neque?
        </p>
      </div>
    </div>
  );
}
