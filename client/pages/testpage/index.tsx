import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { Box, Button, Chip, Typography } from "@mui/material";
interface expenseOption {
  expenseLabel: string;
  expenseValue: string;
}

const expenseOptions: expenseOption[] = [
  { expenseLabel: "Child Care", expenseValue: "CHILD_CARE" },
  { expenseLabel: "Clothing", expenseValue: "CLOTHING" },
  { expenseLabel: "Debt Repayment", expenseValue: "DEBT_REPAYMENT" },
  { expenseLabel: "Education", expenseValue: "EDUCATION" },
  { expenseLabel: "Emergency Fund", expenseValue: "EMERGENCY_FUND" },
  { expenseLabel: "Entertainment", expenseValue: "ENTERTAINMENT" },
  { expenseLabel: "Food", expenseValue: "FOOD" },
  { expenseLabel: "Gifts", expenseValue: "GIFTS" },
  { expenseLabel: "Healthcare", expenseValue: "HEALTHCARE" },
  { expenseLabel: "Housing", expenseValue: "HOUSING" },
  { expenseLabel: "Investments", expenseValue: "INVESTMENTS" },
  { expenseLabel: "Large Purchases", expenseValue: "LARGE_PURCHASES" },
  { expenseLabel: "Legal", expenseValue: "LEGAL" },
  {
    expenseLabel: "Memberships and Subscriptions",
    expenseValue: "MEMBERSHIPS_AND_SUBSCRIPTIONS",
  },
  { expenseLabel: "Other", expenseValue: "OTHER" },
  { expenseLabel: "Personal Care", expenseValue: "PERSONAL_CARE" },
  { expenseLabel: "Pet Care", expenseValue: "PET_CARE" },
  { expenseLabel: "Phone", expenseValue: "PHONE" },
  { expenseLabel: "Savings", expenseValue: "SAVINGS" },
  { expenseLabel: "Taxes", expenseValue: "TAXES" },
  { expenseLabel: "Transportation", expenseValue: "TRANSPORTATION" },
  { expenseLabel: "Travel", expenseValue: "TRAVEL" },
  { expenseLabel: "Utilities", expenseValue: "UTILITIES" },
];

const tagOptions = [
  "Green",
  "Blue",
  "Red",
  "Orange",
  "Yellow",
  "Brown",
  "Gray",
  "Black",
  "White",
  "Purple",
];

const filter = createFilterOptions<string>();

function TestPage() {
  const [expense, setExpense] = useState<expenseOption | null>(null);
  const [expenseError, setExpenseError] = useState("");
  const [tags, setTags] = useState<string[]>(["Green", "Red"]);

  useEffect(() => {
    if (!expense) {
      console.log("No expense currently selected");
    } else {
      console.log(
        "Expense option changed to:",
        expense ? expense.expenseLabel : "null"
      );
    }
  }, [expense]);

  useEffect(() => {
    console.log("Current tags:", tags.length ? tags : "none");
  }, [tags]);

  const submitHandler = () => {
    if (!expense) {
      setExpenseError("Please select an expense.");
    } else {
      window.alert(
        `Expense: ${expense.expenseValue}    Tags: ["${tags.join(`", "`)}"]`
      );
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box id="singleSelect">
        <Autocomplete
          disableClearable
          handleHomeEndKeys
          options={expenseOptions}
          defaultValue={undefined}
          // options={expenseOptions.sort((a, b) =>
          //   -a.expenseLabel.localeCompare(b.expenseLabel)
          // )}
          // defaultValue={
          //   {
          //       expenseLabel: "Housing",
          //       expenseValue: "HOUSING",
          //   }
          // }
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Expense" />}
          getOptionLabel={(option) => option.expenseLabel}
          onChange={(event, option) => {
            setExpenseError("");
            setExpense(option);
          }}
        />
        {expenseError && <Typography color="red">{expenseError}</Typography>}
      </Box>
      <Box id="multiSelect">
        <Autocomplete
          multiple
          freeSolo
          autoHighlight
          handleHomeEndKeys
          clearOnBlur
          options={tagOptions.sort((a, b) => a.localeCompare(b))}
          sx={{ width: 300, mt: 2 }}
          value={tags}
          renderInput={(params) => <TextField {...params} label="Tags" />}
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => {
              const label = option.startsWith("Add ")
                ? option.substring(4)
                : option;
              return (
                <Chip
                  variant="outlined"
                  label={label}
                  {...getTagProps({ index })}
                />
              );
            })
          }
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            const { inputValue } = params;
            const isExisting = options.some((option) => inputValue === option);

            if (inputValue !== "" && !isExisting) {
              filtered.push(`Add ${inputValue}`);
            }

            return filtered;
          }}
          onChange={(event, values) => {
            console.log(values);

            const updatedValues = values.map((value) =>
              value.startsWith("Add ") ? value.substring(4) : value
            );
            setTags(updatedValues);

            const currentValue = values.slice(-1)[0];

            if (currentValue && currentValue.startsWith("Add ")) {
              const temporaryTag = currentValue.substring(4);
              if (temporaryTag) {
                tagOptions.push(temporaryTag);
              }
            } else if (currentValue && !tagOptions.includes(currentValue)) {
              tagOptions.push(currentValue);
            }
          }}
        />
      </Box>
      <Button sx={{ my: 2 }} onClick={submitHandler}>
        Fake Submit
      </Button>
    </Box>
  );
}

export default TestPage;