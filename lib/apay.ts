import axios from "axios";

export async function checkAPayDepositStatus(orderCode: string) {
  try {
    const apikey = "9a364faa03333a71899a53306b7e7fd9";
    const projectId = "0409923";
    const baseUrl = "https://pay-crm.com";

    const response = await axios.get(
      `${baseUrl}/Remotes/deposit-info?project_id=${projectId}&custom_transaction_id=${orderCode}`,
      {
        headers: {
          apikey: apikey,
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    const status = data?.status || data?.data?.status;

    if (status && (status.toLowerCase() === "success" || status.toLowerCase() === "completed")) {
      return { isPaid: true };
    }

    return { isPaid: false };
  } catch (error: any) {
    return { isPaid: false };
  }
}
