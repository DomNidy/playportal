"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { OperationTransferSimple } from "@/definitions/MigrationService";
import { Button } from "@/components/ui/button";
import { formatRelativeDateFromEpoch } from "@/lib/utility/FormatDate";
import { fetchOperationTransfers } from "@/lib/fetching/FetchOperations";
import { AuthContext } from "@/lib/contexts/AuthContext";

export default function HistoryPage() {
  const authContext = useContext(AuthContext);

  // The operation transfer data we receieved from api
  const [operationTransferData, setOperationTransferData] =
    useState<OperationTransferSimple[]>();

  // Current page of transfers history we are on
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // The amount of items per transfers page
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // If there is another page in the data table
  const [isNextPage, setIsNextPage] = useState<boolean>(true);

  // If we are loading operation data
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // The time (in seconds, when the operations data was last updated)
  const [lastUpdated, setLastUpdated] = useState<number>();
  // State used to cause re-renders when interval effect runs
  const [rerenderCount, setRerenderCount] = useState<number>(0);

  // If there is a previous page in the data table
  const [isPreviousPage, setIsPreviousPage] = useState<boolean>(false);

  // Rerender page every 62 seconds to update data table
  useEffect(() => {
    const interval = setInterval(() => {
      setRerenderCount((past) => past + 1);
    }, 62000);
    return () => clearInterval(interval);
  }, [rerenderCount]);

  // Fetch operation data
  useEffect(() => {
    fetchAndSetOperationTransferData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rerenderCount]);

  // If we are on page zero, disable the previous page button
  useEffect(() => {
    if (
      operationTransferData &&
      operationTransferData.length < (currentPageIndex + 1) * itemsPerPage
    ) {
      setIsNextPage(false);
    } else {
      setIsNextPage(true);
    }

    if (currentPageIndex === 0) {
      setIsPreviousPage(false);
    } else {
      setIsPreviousPage(true);
    }
  }, [currentPageIndex, itemsPerPage, operationTransferData]);

  async function fetchAndSetOperationTransferData() {
    if (authContext?.currentUser) {
      if (operationTransferData?.length === 0) {
        setIsLoading(true);
      }

      // Fetch operations
      fetchOperationTransfers(authContext).then((operationData) => {
        console.log(`New data: ${operationData?.length}`);
        if (operationData) {
          setOperationTransferData(
            (prior: OperationTransferSimple[] | undefined) => {
              // Create a copy of existing data
              const newData = [...(prior || [])];

              console.log(newData);
              operationData.forEach((newObj) => {
                // Make sure operationID is not undefined
                if (newObj.info && newObj.info.operationID !== undefined) {
                  // Find index of a duplicate item (if it exists)
                  const duplicateItemIndex = newData.findIndex(
                    (oldObj) =>
                      oldObj.info.operationID === newObj.info.operationID
                  );

                  // If the item is not a duplicate, add it to newData
                  if (duplicateItemIndex === -1) {
                    newData.push(newObj);
                  } else {
                    console.log(
                      "Found duplicate item!",
                      `The new item: ${JSON.stringify(newObj.info.operationID)}`
                    );
                  }
                } else {
                  console.log("Skipping item with undefined operationID");
                }
              });
              return newData;
            }
          );
        }
        setLastUpdated(Date.now() / 1000);
        setIsLoading(false);
      });
    }
  }
  return (
    <div className="min-h-screen w-full">
      <div className="xs:w-[400px] sm:w-[560px] md:w-[760px] lg:w-[900px] xl:w-[1050px]  p-8 text-center m-auto ">
        <section className="flex justify-between items-center m-auto">
          <h2 className="text-lg md:text-3xl font-semibold tracking-tight ">
            Your Transfers
          </h2>
          <Button
            className="w-fit"
            onClick={() => {
              if (authContext?.currentUser) {
                fetchAndSetOperationTransferData();
              }
            }}
          >
            Refresh
          </Button>
          <div className="flex gap-2">
            <p className="text-muted-foreground sm:text-sm md:text-base">
              Last Updated:{" "}
              {lastUpdated ? formatRelativeDateFromEpoch(lastUpdated) : ""}
            </p>
            {isLoading ? (
              <svg
                aria-hidden="true"
                className="w-6 h-6  text-gray-200 animate-spin dark:text-gray-600 fill-blue-400"
                viewBox="0 0 100 101"
                fill="none"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            ) : (
              ""
            )}
          </div>
        </section>
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={
            operationTransferData?.slice(
              currentPageIndex * itemsPerPage,
              currentPageIndex * itemsPerPage + itemsPerPage
            ) || []
          }
        />
        <div className="flex w-full flex-none justify-between pt-2 flex-col">
          <div
            className={
              "flex w-1/2 justify-evenly items-center self-center pt-2"
            }
          >
            <Button
              className={`px-4 ${
                isPreviousPage
                  ? ""
                  : "bg-muted-foreground hover:bg-muted-foreground cursor-default"
              }`}
              onClick={() => {
                if (!isPreviousPage) {
                  return;
                }

                // If decrimenting the current page index by 1 would cause it to be negative, set it to 0
                setCurrentPageIndex(
                  currentPageIndex - 1 >= 0 ? currentPageIndex - 1 : 0
                );
              }}
            >
              Prev
            </Button>
            <h1 className="text-lg text-muted-foreground">
              {currentPageIndex}
            </h1>
            <Button
              className={`px-4 ${
                isNextPage
                  ? ""
                  : "bg-muted-foreground hover:bg-muted-foreground cursor-default"
              }`}
              onClick={() => {
                // If we have less items on the current table than our limit, we should not increment (as we have fetched all items)
                if (!isNextPage) {
                  return;
                }

                setCurrentPageIndex(currentPageIndex + 1);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
