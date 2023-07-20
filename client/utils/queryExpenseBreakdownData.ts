import { useEffect, useState } from "react";
import { IReceiptExpenseData } from "../components/DoughnutGraph";
import getDates from "./getDates";
import { useExpenseDataByDateLazyQuery } from "../graphql/generated/graphql";

function queryMonthExpenseBreakdownData(
  setMonthLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setMonthData: React.Dispatch<React.SetStateAction<IReceiptExpenseData[]>>,
) {
  const [monthHasNextPage, setMonthHasNextPage] = useState(false);
  const [monthCursor, setMonthCursor] = useState("");

  const { formattedFirstDayOfMonth, formattedLastDayOfMonth } = getDates();

  const [getExpenseData] = useExpenseDataByDateLazyQuery();

  useEffect(() => {
    // Month data
    getExpenseData({
      variables: {
        first: 50,
        dateGte: formattedFirstDayOfMonth,
        dateLte: formattedLastDayOfMonth,
      },
      onCompleted: (data) => {
        if (data.filteredReceipts?.edges) {
          const expenseData = data.filteredReceipts.edges.map(
            (edge) => edge?.node
          );
          setMonthData(expenseData as IReceiptExpenseData[]);
          setMonthLoading(false);
        }

        if (data.filteredReceipts?.pageInfo.hasNextPage) {
          setMonthHasNextPage(true);
          setMonthCursor(data.filteredReceipts?.pageInfo.endCursor!);
        }
      },
      onError: (error) => {
        setMonthLoading(false);
      },
      fetchPolicy: "cache-and-network",
    });
  }, []);

  useEffect(() => {
    if (monthHasNextPage && monthCursor) {
      getExpenseData({
        variables: {
          first: 50,
          after: monthCursor,
          dateGte: formattedFirstDayOfMonth,
          dateLte: formattedLastDayOfMonth,
        },
        onCompleted: (data) => {
          if (data.filteredReceipts?.edges) {
            const expenseData = data.filteredReceipts.edges.map(
              (edge) => edge?.node
            );
            setMonthData((prevMonthData) => {
              return [
                ...prevMonthData,
                ...(expenseData as IReceiptExpenseData[]),
              ];
            });
          }

          if (data.filteredReceipts?.pageInfo.hasNextPage) {
            setMonthHasNextPage(true);
            setMonthCursor(data.filteredReceipts?.pageInfo.endCursor!);
          } else {
            setMonthHasNextPage(false);
          }
        },
        onError: (error) => {
          setMonthHasNextPage(false);
        },
        fetchPolicy: "cache-and-network",
      });
    }
  }, [monthHasNextPage, monthCursor]);
}

function queryYearExpenseBreakdownData(
  setYearLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setYearData: React.Dispatch<React.SetStateAction<IReceiptExpenseData[]>>
) {
  const [yearHasNextPage, setYearHasNextPage] = useState(false);

  const [yearCursor, setYearCursor] = useState("");
  const { formattedFirstDayOfYear, formattedLastDayOfYear } = getDates();

  const [getExpenseData] = useExpenseDataByDateLazyQuery();

  useEffect(() => {
    // Year data
    getExpenseData({
      variables: {
        first: 50,
        dateGte: formattedFirstDayOfYear,
        dateLte: formattedLastDayOfYear,
      },
      onCompleted: (data) => {
        if (data.filteredReceipts?.edges) {
          const expenseData = data.filteredReceipts.edges.map(
            (edge) => edge?.node
          );
          setYearData(expenseData as IReceiptExpenseData[]);
          setYearLoading(false);
        }

        if (data.filteredReceipts?.pageInfo.hasNextPage) {
          setYearHasNextPage(true);
          setYearCursor(data.filteredReceipts?.pageInfo.endCursor!);
        }
      },
      onError: (error) => {
        setYearLoading(false);
      },
      fetchPolicy: "cache-and-network",
    });
  }, []);

  useEffect(() => {
    if (yearHasNextPage && yearCursor) {
      getExpenseData({
        variables: {
          first: 50,
          after: yearCursor,
          dateGte: formattedFirstDayOfYear,
          dateLte: formattedLastDayOfYear,
        },
        onCompleted: (data) => {
          if (data.filteredReceipts?.edges) {
            const expenseData = data.filteredReceipts.edges.map(
              (edge) => edge?.node
            );
            setYearData((prevYearData) => {
              return [
                ...prevYearData,
                ...(expenseData as IReceiptExpenseData[]),
              ];
            });
          }

          if (data.filteredReceipts?.pageInfo.hasNextPage) {
            setYearHasNextPage(true);
            setYearCursor(data.filteredReceipts?.pageInfo.endCursor!);
          } else {
            setYearHasNextPage(false);
          }
        },
        onError: (error) => {
          setYearHasNextPage(false);
        },
        fetchPolicy: "cache-and-network",
      });
    }
  }, [yearHasNextPage, yearCursor]);
}

export { queryYearExpenseBreakdownData, queryMonthExpenseBreakdownData };
