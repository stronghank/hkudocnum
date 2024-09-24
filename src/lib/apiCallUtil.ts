import axios from 'axios';

export async function axoisGetRequest(header: any, url: string) {
  try {
    console.log("Making GET request to:", url);
    console.log("With headers:", header);
    const response = await axios.get(url, { 
      headers: header,
      timeout: 10000
    });
    console.log("Response received:", response.status);
    return {
      status: response.status,
      data: response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Response data:", error.response?.data);
      return {
        status: error.response?.status || 500,
        data: error.response?.data || 'An error occurred'
      };
    }
    console.error("Non-Axios error:", error);
    throw error;
  }
}