import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IRow } from "../pages/table";
import { useAllReceiptsByUserLazyQuery } from "../graphql/generated/graphql";
import { useAuth } from "./useAuth";

export default function queryReceiptData(
  setRows: Dispatch<SetStateAction<IRow[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>
) {
  const router = useRouter();
  const { logout } = useAuth();
  const [nextPage, setNextPage] = useState<Boolean | null>(null);
  const [cursor, setCursor] = useState("");
  const [getReceipts] = useAllReceiptsByUserLazyQuery();

  useEffect(() => {
    getReceipts({
      variables: {
        first: 2,
      },
      onCompleted: (data) => {
        if (data.allReceiptsByUser?.edges) {
          const receipts = data.allReceiptsByUser.edges.map(
            (edge) => edge?.node
          );
          setRows((prevRows) => {
            return [...prevRows, ...(receipts as IRow[])];
          });
          setLoading(false);
        }

        if (data.allReceiptsByUser?.pageInfo.hasNextPage) {
          setNextPage(true);
          setCursor(data.allReceiptsByUser?.pageInfo.endCursor!);
        } else {
          setNextPage(false);
        }
      },
      onError: (error) => {
        console.log(error);
        logout();
        router.push("/");
      },
      fetchPolicy: "cache-and-network",
    });
  }, []);

  useEffect(() => {
    if (nextPage) {
      getReceipts({
        variables: {
          first: 2,
          after: cursor,
        },
        onCompleted: (data) => {
          if (data.allReceiptsByUser?.edges) {
            const receipts = data.allReceiptsByUser.edges.map(
              (edge) => edge?.node
            );
            setRows((prevRows) => {
              return [...prevRows, ...(receipts as IRow[])];
            });
          }

          if (data.allReceiptsByUser?.pageInfo.hasNextPage) {
            setNextPage(true);
            setCursor(data.allReceiptsByUser?.pageInfo.endCursor!);
          } else {
            setNextPage(false);
          }
        },
        onError: (error) => {
          console.log(error);
          logout();
          router.push("/");
        },
        fetchPolicy: "cache-and-network",
      });
    }
  }, [nextPage, cursor]);
}
