export default function DashboardPageHeader({
  headerText,
}: {
  headerText: string;
}) {
  return (
    <div className="pl-1 h-16 w-full  dark:bg-secondary/20 bg-secondary  text-4xl  text-primary  font-semibold flex items-center pointer-events-none p-0">
      {headerText}
    </div>
  );
}
