export default function LoadingCard() {
  return (
    <div className="w-[85%] lg:w-[50%] items-center animate-pulse min-h-[5rem]">
      <div className="dark:bg-[#0c0c0d] bg-secondary rounded-t-lg p-1 gap-2 text-muted-foreground  flex w-full"></div>
      <div className="w-full min-h-[4rem] items-center shadow-lg bg-primary-foreground p-2 transition-all hover:cursor-pointer rounded-b-lg flex justify-evenly">
        {" "}
      </div>
    </div>
  );
}
