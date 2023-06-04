const expenseMap: Record<
  string,
  {
    displayString: string;
    chartBackgroundColor: string;
    chartBorderColor: string;
  }
> = {
  FOOD: {
    displayString: "Food",
    chartBackgroundColor: "rgba(255, 99, 132, 0.25)",
    chartBorderColor: "rgba(255, 99, 132, 1)",
  },
  HOUSING: {
    displayString: "Housing",
    chartBackgroundColor: "rgba(54, 162, 235, 0.25)",
    chartBorderColor: "rgba(54, 162, 235, 1)",
  },
  TRANSPORTATION: {
    displayString: "Transportation",
    chartBackgroundColor: "rgba(255, 205, 86, 0.25)",
    chartBorderColor: "rgba(255, 205, 86, 1)",
  },
  ENTERTAINMENT: {
    displayString: "Entertainment",
    chartBackgroundColor: "rgba(75, 192, 192, 0.25)",
    chartBorderColor: "rgba(75, 192, 192, 1)",
  },
  EDUCATION: {
    displayString: "Education",
    chartBackgroundColor: "rgba(153, 102, 255, 0.25)",
    chartBorderColor: "rgba(153, 102, 255, 1)",
  },
  HEALTHCARE: {
    displayString: "Healthcare",
    chartBackgroundColor: "rgba(255, 159, 64, 0.25)",
    chartBorderColor: "rgba(255, 159, 64, 1)",
  },
  UTILITIES: {
    displayString: "Utilities",
    chartBackgroundColor: "rgba(255, 99, 0, 0.25)",
    chartBorderColor: "rgba(255, 99, 0, 1)",
  },
  CLOTHING: {
    displayString: "Clothing",
    chartBackgroundColor: "rgba(0, 255, 0, 0.25)",
    chartBorderColor: "rgba(0, 255, 0, 1)",
  },
  PHONE: {
    displayString: "Phone",
    chartBackgroundColor: "rgba(255, 0, 0, 0.25)",
    chartBorderColor: "rgba(255, 0, 0, 1)",
  },
  PERSONAL_CARE: {
    displayString: "Personal Care",
    chartBackgroundColor: "rgba(0, 0, 255, 0.25)",
    chartBorderColor: "rgba(0, 0, 255, 1)",
  },
  PET_CARE: {
    displayString: "Pet Care",
    chartBackgroundColor: "rgba(192, 192, 192, 0.25)",
    chartBorderColor: "rgba(192, 192, 192, 1)",
  },
  CHILD_CARE: {
    displayString: "Child Care",
    chartBackgroundColor: "rgba(128, 0, 128, 0.25)",
    chartBorderColor: "rgba(128, 0, 128, 1)",
  },
  MEMBERSHIPS_AND_SUBSCRIPTIONS: {
    displayString: "Memberships and Subscriptions",
    chartBackgroundColor: "rgba(255, 255, 0, 0.25)",
    chartBorderColor: "rgba(255, 255, 0, 1)",
  },
  GIFTS: {
    displayString: "Gifts",
    chartBackgroundColor: "rgba(128, 128, 0, 0.25)",
    chartBorderColor: "rgba(128, 128, 0, 1)",
  },
  TRAVEL: {
    displayString: "Travel",
    chartBackgroundColor: "rgba(0, 255, 255, 0.25)",
    chartBorderColor: "rgba(0, 255, 255, 1)",
  },
  DEBT_REPAYMENT: {
    displayString: "Debt Repayment",
    chartBackgroundColor: "rgba(255, 0, 128, 0.25)",
    chartBorderColor: "rgba(255, 0, 128, 1)",
  },
  SAVINGS: {
    displayString: "Savings",
    chartBackgroundColor: "rgba(0, 128, 0, 0.25)",
    chartBorderColor: "rgba(0, 128, 0, 1)",
  },
  INVESTMENTS: {
    displayString: "Investments",
    chartBackgroundColor: "rgba(0, 0, 128, 0.25)",
    chartBorderColor: "rgba(0, 0, 128, 1)",
  },
  EMERGENCY_FUND: {
    displayString: "Emergency Fund",
    chartBackgroundColor: "rgba(255, 128, 0, 0.25)",
    chartBorderColor: "rgba(255, 128, 0, 1)",
  },
  LARGE_PURCHASES: {
    displayString: "Large Purchases",
    chartBackgroundColor: "rgba(0, 255, 0, 0.25)",
    chartBorderColor: "rgba(0, 255, 0, 1)",
  },
  LEGAL: {
    displayString: "Legal",
    chartBackgroundColor: "rgba(128, 0, 255, 0.25)",
    chartBorderColor: "rgba(128, 0, 255, 1)",
  },
  TAXES: {
    displayString: "Taxes",
    chartBackgroundColor: "rgba(0, 255, 128, 0.25)",
    chartBorderColor: "rgba(0, 255, 128, 1)",
  },
  OTHER: {
    displayString: "Other",
    chartBackgroundColor: "rgba(0, 128, 0, 0.25)",
    chartBorderColor: "rgba(0, 128, 0, 1)",
  },
};

export default expenseMap;
