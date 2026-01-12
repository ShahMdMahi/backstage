"use server";

export async function euroToUsd(
  euro: number,
  date: Date
): Promise<{
  success: boolean;
  message: string;
  usd: number;
  errors: unknown;
}> {
  try {
    const formattedDate = date.toISOString().split("T")[0];
    const res = await fetch(
      `https://api.frankfurter.app/${formattedDate}?from=EUR&to=USD`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      return {
        success: false,
        message: "Failed to fetch exchange rate",
        usd: 0,
        errors: null,
      };
    }
    const json = await res.json();
    const rate = json.rates.USD;
    return {
      success: true,
      message: "Conversion successful",
      usd: euro * rate,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return {
      success: false,
      message: "Failed to convert EUR to USD",
      usd: 0,
      errors: error,
    };
  }
}

export async function usdToEuro(
  usd: number,
  date: Date
): Promise<{
  success: boolean;
  message: string;
  euro: number;
  errors: unknown;
}> {
  try {
    const formattedDate = date.toISOString().split("T")[0];
    const res = await fetch(
      `https://api.frankfurter.app/${formattedDate}?from=USD&to=EUR`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      return {
        success: false,
        message: "Failed to fetch exchange rate",
        euro: 0,
        errors: null,
      };
    }
    const json = await res.json();
    const rate = json.rates.EUR;
    return {
      success: true,
      message: "Conversion successful",
      euro: usd * rate,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return {
      success: false,
      message: "Failed to convert USD to EUR",
      euro: 0,
      errors: error,
    };
  }
}

export async function euroToBdt(
  euro: number,
  date: Date
): Promise<{
  success: boolean;
  message: string;
  bdt: number;
  errors: unknown;
}> {
  try {
    const formattedDate = date.toISOString().split("T")[0];
    const res = await fetch(
      `https://api.frankfurter.app/${formattedDate}?from=EUR&to=BDT`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      return {
        success: false,
        message: "Failed to fetch exchange rate",
        bdt: 0,
        errors: null,
      };
    }
    const json = await res.json();
    const rate = json.rates.BDT;
    return {
      success: true,
      message: "Conversion successful",
      bdt: euro * rate,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return {
      success: false,
      message: "Failed to convert EUR to BDT",
      bdt: 0,
      errors: error,
    };
  }
}

export async function usdToBdt(
  usd: number,
  date: Date
): Promise<{
  success: boolean;
  message: string;
  bdt: number;
  errors: unknown;
}> {
  try {
    const formattedDate = date.toISOString().split("T")[0];
    const res = await fetch(
      `https://api.frankfurter.app/${formattedDate}?from=USD&to=BDT`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      return {
        success: false,
        message: "Failed to fetch exchange rate",
        bdt: 0,
        errors: null,
      };
    }
    const json = await res.json();
    const rate = json.rates.BDT;
    return {
      success: true,
      message: "Conversion successful",
      bdt: usd * rate,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return {
      success: false,
      message: "Failed to convert USD to BDT",
      bdt: 0,
      errors: error,
    };
  }
}

export async function bdtToEuro(
  bdt: number,
  date: Date
): Promise<{
  success: boolean;
  message: string;
  euro: number;
  errors: unknown;
}> {
  try {
    const formattedDate = date.toISOString().split("T")[0];
    const res = await fetch(
      `https://api.frankfurter.app/${formattedDate}?from=BDT&to=EUR`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      return {
        success: false,
        message: "Failed to fetch exchange rate",
        euro: 0,
        errors: null,
      };
    }
    const json = await res.json();
    const rate = json.rates.EUR;
    return {
      success: true,
      message: "Conversion successful",
      euro: bdt * rate,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return {
      success: false,
      message: "Failed to convert BDT to EUR",
      euro: 0,
      errors: error,
    };
  }
}

export async function bdtToUsd(
  bdt: number,
  date: Date
): Promise<{
  success: boolean;
  message: string;
  usd: number;
  errors: unknown;
}> {
  try {
    const formattedDate = date.toISOString().split("T")[0];
    const res = await fetch(
      `https://api.frankfurter.app/${formattedDate}?from=BDT&to=USD`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) {
      return {
        success: false,
        message: "Failed to fetch exchange rate",
        usd: 0,
        errors: null,
      };
    }
    const json = await res.json();
    const rate = json.rates.USD;
    return {
      success: true,
      message: "Conversion successful",
      usd: bdt * rate,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return {
      success: false,
      message: "Failed to convert BDT to USD",
      usd: 0,
      errors: error,
    };
  }
}
