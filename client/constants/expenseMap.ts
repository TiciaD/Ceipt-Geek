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
    chartBackgroundColor: "rgba(65, 105, 225, 0.25)",
    chartBorderColor: "rgba(65, 105, 225, 1)",
  },
  HOUSING: {
    displayString: "Housing",
    chartBackgroundColor: "rgba(255, 218, 185, 0.25)",
    chartBorderColor: "rgba(255, 218, 185, 1)",
  },
  TRANSPORTATION: {
    displayString: "Transportation",
    chartBackgroundColor: "rgba(0, 139, 139, 0.25)",
    chartBorderColor: "rgba(0, 139, 139, 1)",
  },
  ENTERTAINMENT: {
    displayString: "Entertainment",
    chartBackgroundColor: "rgba(123, 104, 238, 0.25)",
    chartBorderColor: "rgba(123, 104, 238, 1)",
  },
  EDUCATION: {
    displayString: "Education",
    chartBackgroundColor: "rgba(50, 205, 50, 0.25)",
    chartBorderColor: "rgba(50, 205, 50, 1)",
  },
  HEALTHCARE: {
    displayString: "Healthcare",
    chartBackgroundColor: "rgba(0, 191, 255, 0.25)",
    chartBorderColor: "rgba(0, 191, 255, 1)",
  },
  UTILITIES: {
    displayString: "Utilities",
    chartBackgroundColor: "rgba(0, 255, 255, 0.25)",
    chartBorderColor: "rgba(0, 255, 255, 1)",
  },
  CLOTHING: {
    displayString: "Clothing",
    chartBackgroundColor: "rgba(220, 20, 60, 0.25)",
    chartBorderColor: "rgba(220, 20, 60, 1)",
  },
  PHONE: {
    displayString: "Phone",
    chartBackgroundColor: "rgba(255, 228, 225, 0.25)",
    chartBorderColor: "rgba(255, 228, 225, 1)",
  },
  PERSONAL_CARE: {
    displayString: "Personal Care",
    chartBackgroundColor: "rgba(0, 255, 255, 0.25)",
    chartBorderColor: "rgba(0, 255, 255, 1)",
  },
  PET_CARE: {
    displayString: "Pet Care",
    chartBackgroundColor: "rgba(139, 0, 0, 0.25)",
    chartBorderColor: "rgba(139, 0, 0, 1)",
  },
  CHILD_CARE: {
    displayString: "Child Care",
    chartBackgroundColor: "rgba(0, 128, 0, 0.25)",
    chartBorderColor: "rgba(0, 128, 0, 1)",
  },
  MEMBERSHIPS_AND_SUBSCRIPTIONS: {
    displayString: "Memberships and Subscriptions",
    chartBackgroundColor: "rgba(255, 105, 180, 0.25)",
    chartBorderColor: "rgba(255, 105, 180, 1)",
  },
  GIFTS: {
    displayString: "Gifts",
    chartBackgroundColor: "rgba(255, 20, 147, 0.25)",
    chartBorderColor: "rgba(255, 20, 147, 1)",
  },
  TRAVEL: {
    displayString: "Travel",
    chartBackgroundColor: "rgba(75, 0, 130, 0.25)",
    chartBorderColor: "rgba(75, 0, 130, 1)",
  },
  DEBT_REPAYMENT: {
    displayString: "Debt Repayment",
    chartBackgroundColor: "rgba(128, 0, 0, 0.25)",
    chartBorderColor: "rgba(128, 0, 0, 1)",
  },
  SAVINGS: {
    displayString: "Savings",
    chartBackgroundColor: "rgba(255, 215, 0, 0.25)",
    chartBorderColor: "rgba(255, 215, 0, 1)",
  },
  INVESTMENTS: {
    displayString: "Investments",
    chartBackgroundColor: "rgba(255, 255, 0, 0.25)",
    chartBorderColor: "rgba(255, 255, 0, 1)",
  },
  EMERGENCY_FUND: {
    displayString: "Emergency Fund",
    chartBackgroundColor: "rgba(128, 0, 128, 0.25)",
    chartBorderColor: "rgba(128, 0, 128, 1)",
  },
  LARGE_PURCHASES: {
    displayString: "Large Purchases",
    chartBackgroundColor: "rgba(139, 0, 139, 0.25)",
    chartBorderColor: "rgba(139, 0, 139, 1)",
  },
  LEGAL: {
    displayString: "Legal",
    chartBackgroundColor: "rgba(139, 69, 19, 0.25)",
    chartBorderColor: "rgba(139, 69, 19, 1)",
  },
  TAXES: {
    displayString: "Taxes",
    chartBackgroundColor: "rgba(0, 128, 128, 0.25)",
    chartBorderColor: "rgba(0, 128, 128, 1)",
  },
  OTHER: {
    displayString: "Other",
    chartBackgroundColor: "rgba(75, 0, 130, 0.25)",
    chartBorderColor: "rgba(75, 0, 130, 1)",
  },
};

export default expenseMap;
